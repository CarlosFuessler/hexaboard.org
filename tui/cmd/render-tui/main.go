// Command render-tui bakes the pre-rendered ANSI frame bundle served by
// the website's /tui streaming endpoint.
//
// Usage:
//
//	go run ./cmd/render-tui -out ../public/tui-frames.bin \
//	    [-cloud model.bin | -obj model.obj] [-api https://hexaboard.org/api/tui]
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

const sampleCount = 20000

func main() {
	out := flag.String("out", filepath.Join("..", "public", "tui-frames.bin"), "output bundle path")
	cloudPath := flag.String("cloud", defaultCloud(), "cached point cloud path")
	objPath := flag.String("obj", "", "OBJ file to sample directly (overrides -cloud)")
	apiURL := flag.String("api", "https://hexaboard.org/api/tui", "content API URL")
	steps := flag.Int("steps", 72, "rotation frames per loop")
	flag.Parse()

	points, err := loadPoints(*objPath, *cloudPath)
	fatalIf(err)
	fmt.Printf("loaded %d points\n", len(points))

	c, err := fetchContent(*apiURL)
	fatalIf(err)
	fmt.Println("fetched site content")

	var frames []bundle.Frame
	rng := rand.New(rand.NewSource(42))
	frames = append(frames, streamrender.BootFrames(45, rng)...)
	frames = append(frames, buildCycle(c, points, *steps)...)

	if err := bundle.Write(*out, frames); err != nil {
		fatalIf(err)
	}
	total := 0
	for _, f := range frames {
		total += len(f.Body)
	}
	fmt.Printf("wrote %s: %d frames, %.1f KB\n", *out, len(frames), float64(total)/1024)
}

// buildCycle assembles the endlessly repeating sequence:
// rotation → hero → rotation → features → rotation → specs.
func buildCycle(c content.Content, points []model3d.Point, steps int) []bundle.Frame {
	rot, err := streamrender.RotationFrames(points, steps)
	fatalIf(err)

	var cycle []bundle.Frame
	cycle = append(cycle, heroCard(c))
	cycle = append(cycle, rot...)
	cycle = append(cycle, featuresCard(c))
	cycle = append(cycle, rot...)
	cycle = append(cycle, specsCard(c))
	cycle = append(cycle, rot...)
	return cycle
}

func heroCard(c content.Content) bundle.Frame {
	rows := [][2]string{
		{"", "\x1b[38;5;47m" + c.Hero.Title + "\x1b[0m"},
		{"", c.Hero.Tagline},
		{"", ""},
	}
	for _, l := range c.Hero.TypingLines {
		rows = append(rows, [2]string{"$ ", l})
	}
	for _, l := range c.Links {
		rows = append(rows, [2]string{"→ ", l.Label + ": " + l.URL})
	}
	return streamrender.CardFrame(c.Hero.Eyebrow, rows, "press ctrl-c to exit")
}

func featuresCard(c content.Content) bundle.Frame {
	rows := [][2]string{}
	for _, f := range c.Features {
		rows = append(rows, [2]string{"\x1b[38;5;47m" + f.Title + "\x1b[0m", ""})
		for _, line := range wrap(f.Description, 58) {
			rows = append(rows, [2]string{"", line})
		}
		rows = append(rows, [2]string{"", ""})
	}
	return streamrender.CardFrame("// features", rows, "built for everyone")
}

func specsCard(c content.Content) bundle.Frame {
	rows := make([][2]string, 0, len(c.Specs))
	for _, s := range c.Specs {
		rows = append(rows, [2]string{s.Label, s.Value})
	}
	return streamrender.CardFrame("// specifications", rows, "technical details")
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

func defaultCloud() string {
	base, err := os.UserCacheDir()
	if err != nil {
		return "model.bin"
	}
	return filepath.Join(base, "hexaboard", "model.bin")
}

func fatalIf(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "render-tui:", err)
		os.Exit(1)
	}
}
