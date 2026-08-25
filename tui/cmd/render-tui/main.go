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
	"math/rand"
	"os"
	"path/filepath"

	"hexaboard.org/tui/internal/bundle"
	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/streamrender"
)

const (
	sampleCount = 20000
	steps       = 90
	bootFrames  = 20
)

// grid is the one true TUI size: large enough to feel immersive on any
// modern terminal, small enough that rows never wrap on 80-col ones.
var grid = streamrender.Layout{W: 110, H: 32}

func main() {
	dir := flag.String("dir", filepath.Join("..", "public"), "output directory")
	cloudPath := flag.String("cloud", defaultCloud(), "cached point cloud path")
	objPath := flag.String("obj", "", "OBJ file to sample directly (overrides -cloud)")
	flag.Parse()

	points, err := loadPoints(*objPath, *cloudPath)
	fatalIf(err)
	fmt.Printf("loaded %d points\n", len(points))

	// The stream IS the product shot: nothing but the spinning board,
	// forever.
	frames, err := streamrender.RotationFrames(grid, points, steps)
	fatalIf(err)

	out := filepath.Join(*dir, "tui.bin")
	if err := bundle.Write(out, frames, 0); err != nil {
		fatalIf(err)
	}
	total := 0
	for _, f := range frames {
		total += len(f.Body)
	}
	fmt.Printf("wrote %s (%dx%d): %d frames, %.1f KB\n",
		out, grid.W, grid.H, len(frames), float64(total)/1024)
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

func fatalIf(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "render-tui:", err)
		os.Exit(1)
	}
}
