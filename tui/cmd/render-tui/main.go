// Command render-tui bakes the pre-rendered ANSI frame bundles served by
// the website's /tui streaming endpoint.
//
// Usage:
//
//	go run ./cmd/render-tui [-dir ../public] \
//	    [-cloud model.bin | -obj model.obj] [-api https://hexaboard.org/api/tui]
//
// It writes one bundle per terminal size: tui-s.bin, tui-m.bin,
// tui-l.bin and tui-xl.bin.
package main

import (
	"flag"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"hexaboard.org/tui/internal/bundle"
	"hexaboard.org/tui/internal/content"
	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/streamrender"
)

const (
	sampleCount = 20000
	steps       = 72
	bootFrames  = 45
)

var sizes = []struct {
	name string
	l    streamrender.Layout
}{
	{"s", streamrender.Layout{W: 80, H: 24}},
	{"m", streamrender.Layout{W: 110, H: 32}},
	{"l", streamrender.Layout{W: 150, H: 42}},
	{"xl", streamrender.Layout{W: 200, H: 56}},
}

func main() {
	dir := flag.String("dir", filepath.Join("..", "public"), "output directory")
	cloudPath := flag.String("cloud", defaultCloud(), "cached point cloud path")
	objPath := flag.String("obj", "", "OBJ file to sample directly (overrides -cloud)")
	apiURL := flag.String("api", "https://hexaboard.org/api/tui", "content API URL")
	flag.Parse()

	points, err := loadPoints(*objPath, *cloudPath)
	fatalIf(err)
	fmt.Printf("loaded %d points\n", len(points))

	c, err := fetchContent(*apiURL)
	fatalIf(err)
	fmt.Println("fetched site content")

	rng := rand.New(rand.NewSource(42))
	for _, sz := range sizes {
		var frames []bundle.Frame
		frames = append(frames, streamrender.BootFrames(sz.l, bootFrames, rng)...)
		frames = append(frames, buildCycle(sz.l, c, points)...)

		out := filepath.Join(*dir, fmt.Sprintf("tui-%s.bin", sz.name))
		if err := bundle.Write(out, frames, bootFrames); err != nil {
			fatalIf(err)
		}
		total := 0
		for _, f := range frames {
			total += len(f.Body)
		}
		fmt.Printf("wrote %s (%dx%d): %d frames, %.1f KB\n",
			out, sz.l.W, sz.l.H, len(frames), float64(total)/1024)
	}
}

// buildCycle assembles the endlessly repeating sequence:
// hero → rotation → features → rotation → specs → rotation.
func buildCycle(l streamrender.Layout, c content.Content, points []model3d.Point) []bundle.Frame {
	rot, err := streamrender.RotationFrames(l, points, steps)
	fatalIf(err)

	var cycle []bundle.Frame
	cycle = append(cycle, heroCard(l, c))
	cycle = append(cycle, rot...)
	cycle = append(cycle, featuresCard(l, c))
	cycle = append(cycle, rot...)
	cycle = append(cycle, specsCard(l, c))
	cycle = append(cycle, rot...)
	return cycle
}

func heroCard(l streamrender.Layout, c content.Content) bundle.Frame {
	rows := []streamrender.CardRow{
		{Value: c.Hero.Title},
		{Value: c.Hero.Tagline},
		{},
	}
	for _, t := range c.Hero.TypingLines {
		rows = append(rows, streamrender.CardRow{Label: "$", Value: t})
	}
	rows = append(rows, streamrender.CardRow{})
	for _, l := range c.Links {
		rows = append(rows, streamrender.CardRow{Label: "→", Value: l.Label + ": " + l.URL})
	}
	return streamrender.CardFrame(l, c.Hero.Eyebrow, rows, "ctrl-c exits", 4000)
}

func featuresCard(l streamrender.Layout, c content.Content) bundle.Frame {
	var rows []streamrender.CardRow
	for _, f := range c.Features {
		rows = append(rows, streamrender.CardRow{Value: f.Title})
		for _, line := range wrap(f.Description, 58) {
			rows = append(rows, streamrender.CardRow{Value: line, Dim: true})
		}
		rows = append(rows, streamrender.CardRow{})
	}
	return streamrender.CardFrame(l, "// features", rows, "built for everyone", 4500)
}

func specsCard(l streamrender.Layout, c content.Content) bundle.Frame {
	rows := make([]streamrender.CardRow, 0, len(c.Specs))
	for _, s := range c.Specs {
		rows = append(rows, streamrender.CardRow{Label: s.Label, Value: s.Value})
	}
	return streamrender.CardFrame(l, "// specifications", rows, "technical details", 4500)
}

func defaultCloud() string {
	base, err := os.UserCacheDir()
	if err != nil {
		return "model.bin"
	}
	return filepath.Join(base, "hexaboard", "model.bin")
}

func loadPoints(objPath, cloudPath string) ([]model3d.Point, error) {
	if objPath != "" {
		f, err := os.Open(objPath)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		mesh, err := model3d.Parse(f)
		if err != nil {
			return nil, err
		}
		return model3d.Sample(mesh, sampleCount, rand.New(rand.NewSource(42))), nil
	}
	return model3d.LoadCloud(cloudPath)
}

func fetchContent(url string) (content.Content, error) {
	resp, err := http.Get(url) //nolint:gosec // URL comes from a flag
	if err != nil {
		return content.Content{}, err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return content.Content{}, err
	}
	return content.Decode(data)
}

// wrap wraps text to n visible columns without breaking words.
func wrap(text string, n int) []string {
	words := strings.Fields(text)
	var lines []string
	line := ""
	for _, w := range words {
		switch {
		case line == "":
			line = w
		case len(line)+1+len(w) <= n:
			line += " " + w
		default:
			lines = append(lines, line)
			line = w
		}
	}
	if line != "" {
		lines = append(lines, line)
	}
	return lines
}

func fatalIf(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "render-tui:", err)
		os.Exit(1)
	}
}
