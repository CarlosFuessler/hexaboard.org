// HexaTUI — terminal client for hexaboard.org.
//
// Fetches site content and the 3D product model over curl and renders a
// matrix-rain TUI mirroring the website, including an animated ASCII
// point-cloud of the board.
package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"

	"hexaboard.org/tui/internal/content"
	"hexaboard.org/tui/internal/fetch"
	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/ui"

	tea "github.com/charmbracelet/bubbletea"
)

const (
	modelPath   = "/Hexaboard_v3_Display.obj"
	sampleCount = 20000
)

func main() {
	baseURL := flag.String("url", envOr("HEXABOARD_URL", "https://hexaboard.org"), "site base URL")
	cacheDir := flag.String("cache-dir", defaultCacheDir(), "cache directory")
	noCache := flag.Bool("no-cache", os.Getenv("HEXABOARD_NO_CACHE") != "", "bypass disk caches")
	flag.Parse()

	client := fetch.New()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var p *tea.Program
	p = tea.NewProgram(
		ui.New(ui.Config{
			OnRefresh: func() {
				go loadContent(ctx, p, client, *baseURL, *cacheDir, *noCache)
			},
			OnModelRequest: func() {
				go loadModel(ctx, p, client, *baseURL, *cacheDir, *noCache)
			},
		}),
		tea.WithAltScreen(),
	)

	go loadContent(ctx, p, client, *baseURL, *cacheDir, *noCache)

	if _, err := p.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "hexatui:", err)
		os.Exit(1)
	}
}

// loadContent fetches /api/tui, falling back to the disk cache offline.
func loadContent(ctx context.Context, p *tea.Program, client *fetch.Client, baseURL, cacheDir string, noCache bool) {
	data, err := client.Get(ctx, baseURL+"/api/tui")
	if err == nil {
		c, decErr := content.Decode(data)
		if decErr == nil {
			if !noCache {
				_ = os.WriteFile(filepath.Join(cacheDir, "content.json"), data, 0o644)
			}
			p.Send(ui.ContentLoaded(c, nil))
			return
		}
		err = decErr
	}

	// Offline: serve stale cache if present.
	if !noCache {
		if cached, readErr := os.ReadFile(filepath.Join(cacheDir, "content.json")); readErr == nil {
			if c, decErr := content.Decode(cached); decErr == nil {
				p.Send(ui.ContentLoaded(c, nil))
				return
			}
		}
	}
	p.Send(ui.ContentLoaded(content.Content{}, err))
}

// loadModel streams the OBJ, samples a point cloud and caches it.
func loadModel(ctx context.Context, p *tea.Program, client *fetch.Client, baseURL, cacheDir string, noCache bool) {
	cloudPath := filepath.Join(cacheDir, "model.bin")

	if !noCache {
		if pts, err := model3d.LoadCloud(cloudPath); err == nil && len(pts) > 0 {
			p.Send(ui.ModelReady(pts, nil, false))
			return
		}
	}

	if err := os.MkdirAll(cacheDir, 0o755); err != nil {
		p.Send(ui.ModelReady(nil, err, false))
		return
	}
	partPath := cloudPath + ".part"

	err := client.Download(ctx, baseURL+modelPath, partPath,
		func(written, total int64) { p.Send(ui.ModelProgress(written, total)) })
	if err != nil {
		p.Send(ui.ModelReady(nil, err, true))
		return
	}

	f, err := os.Open(partPath)
	if err != nil {
		p.Send(ui.ModelReady(nil, err, false))
		return
	}
	mesh, parseErr := model3d.Parse(f)
	f.Close()
	if parseErr != nil {
		p.Send(ui.ModelReady(nil, parseErr, false))
		return
	}

	points := model3d.Sample(mesh, sampleCount, rand.New(rand.NewSource(42)))
	if saveErr := model3d.SaveCloud(cloudPath, points); saveErr != nil {
		fmt.Fprintln(os.Stderr, "hexatui: cache write failed:", saveErr)
	}
	_ = os.Remove(partPath)

	p.Send(ui.ModelReady(points, nil, false))
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func defaultCacheDir() string {
	base, err := os.UserCacheDir()
	if err != nil {
		return ".hexatui-cache"
	}
	return filepath.Join(base, "hexaboard")
}
