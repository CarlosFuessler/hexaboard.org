// Package streamrender bakes pre-rendered ANSI frames for the /tui
// streaming endpoint: matrix-rain boot, info cards and rotating point
// clouds, encoded with run-grouped 256-color escapes.
package streamrender

import (
	"fmt"
	"math"
	"strings"

	"hexaboard.org/tui/internal/bundle"
	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/render"
)

// Layout is the fixed frame size of one bundle variant. Frames are
// always exactly Layout.H rows tall so cursor-homed redraws never leave
// residue, regardless of what was on screen before.
type Layout struct {
	W, H int
}

// Palette maps render.Ramp index → 256-color code ("" = default/plain).
var Palette = []string{"", "22", "28", "34", "35", "41", "47", "48", "50", "158"}

// asciiRain keeps every glyph single-byte: cells are byte-addressed, and
// writing fragments of multibyte runes corrupts the frame.
const asciiRain = "01<>=+-*:.#ABCDEFXYZ$%?"

// EncodeFrame renders a Frame into a cursor-homed ANSI string. Every row
// is padded to exactly f.W visible characters; the output always spans
// exactly f.H lines.
func EncodeFrame(f *render.Frame) string {
	var b strings.Builder
	b.WriteString("\x1b[H")
	for y := 0; y < f.H; y++ {
		last := -1
		var run strings.Builder
		colored := false
		flush := func() {
			if run.Len() == 0 {
				return
			}
			if last > 0 {
				b.WriteString("\x1b[38;5;")
				b.WriteString(Palette[last])
				b.WriteByte('m')
				colored = true
			}
			b.WriteString(run.String())
			run.Reset()
		}
		for x := 0; x < f.W; x++ {
			c := f.CellAt(x, y)
			idx := render.LumIndex(c.Lum)
			if c.Ch == ' ' || idx == 0 {
				flush()
				last = -1
				b.WriteByte(' ')
				continue
			}
			if idx != last {
				flush()
				last = idx
			}
			run.WriteByte(c.Ch)
		}
		flush()
		if colored {
			b.WriteString("\x1b[0m")
		}
		if y < f.H-1 {
			b.WriteByte('\n')
		}
	}
	return b.String()
}

// RotationFrames bakes one seamless loop of the point cloud spinning
// around its vertical axis with a fixed camera tilt, mirroring the
// website's elevated OrbitControls view. Frames contain nothing but the
// model — zoomed out enough to read as a clean product shot.
func RotationFrames(l Layout, points []model3d.Point, steps int) ([]bundle.Frame, error) {
	if len(points) == 0 {
		return nil, fmt.Errorf("streamrender: no points to rotate")
	}

	const (
		dist  = 8.0
		pitch = -0.38 // camera looks down at the board, like the site viewer

		fillW = 0.58 // fraction of columns the board may span
		fillH = 0.52 // fraction of rows
	)
	bodyRows := l.H

	// The tilt foreshortens vertical extent; compensate via cos(pitch).
	fill := math.Cos(pitch)
	scaleY := float64(bodyRows) / (2 * math.Tan((math.Pi/4)/2))
	aspect := 2.0

	// World-space radii that project onto the target fractions.
	targetHalfW := (float64(l.W) / 2) * fillW
	wantRX := targetHalfW * dist / (scaleY * aspect)
	targetHalfH := (float64(bodyRows) / 2) * fillH / fill
	wantRY := targetHalfH * dist / scaleY

	scaleToFit(points, wantRX, wantRY)

	frames := make([]bundle.Frame, 0, steps)
	for s := 0; s < steps; s++ {
		yaw := 2 * math.Pi * float64(s) / float64(steps)
		f := render.Render(points, render.Params{
			Width:    l.W,
			Height:   bodyRows,
			Yaw:      yaw,
			Pitch:    pitch,
			Distance: dist,
		})
		frames = append(frames, bundle.Frame{DelayMS: 50, Body: EncodeFrame(f)})
	}
	return frames, nil
}

// scaleToFit centers points at origin and scales them uniformly so both
// horizontal and vertical extents fit the wanted world-space radii.
func scaleToFit(points []model3d.Point, wantRX, wantRY float64) {
	minX, maxX := math.Inf(1), math.Inf(-1)
	minY, maxY := math.Inf(1), math.Inf(-1)
	minZ, maxZ := math.Inf(1), math.Inf(-1)
	for i := range points {
		x, y, z := float64(points[i].Pos[0]), float64(points[i].Pos[1]), float64(points[i].Pos[2])
		minX, maxX = math.Min(minX, x), math.Max(maxX, x)
		minY, maxY = math.Min(minY, y), math.Max(maxY, y)
		minZ, maxZ = math.Min(minZ, z), math.Max(maxZ, z)
	}
	cx, cy, cz := (minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2
	rx := math.Max(maxX-minX, 1e-6) / 2
	ry := math.Max(maxY-minY, 1e-6) / 2
	rz := math.Max(maxZ-minZ, 1e-6) / 2

	// The board is flat; while spinning, its horizontal extent varies
	// between rx and rz, so fit the larger of the two.
	s := math.Min(wantRX/math.Max(math.Max(rx, rz), 1e-6), wantRY/math.Max(ry, 1e-6))
	for i := range points {
		points[i].Pos[0] = float32((float64(points[i].Pos[0]) - cx) * s)
		points[i].Pos[1] = float32((float64(points[i].Pos[1]) - cy) * s)
		points[i].Pos[2] = float32((float64(points[i].Pos[2]) - cz) * s)
	}
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
