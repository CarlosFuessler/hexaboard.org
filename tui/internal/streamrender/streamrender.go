// Package streamrender bakes pre-rendered ANSI frames for the /tui
// streaming endpoint: matrix-rain boot, info cards and rotating point
// clouds, encoded with run-grouped 256-color escapes.
package streamrender

import (
	"fmt"
	"math"
	"math/rand"
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

const logo = ` _  _ ____ _    ___  _  _ ___  ____ ____
 |__| |__| |    |__> |-:_ |__> |=== |___`

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

// BootFrames bakes the intro: rain with the HEXABOARD logo fading in and
// a status line that ends ready. The status row lives inside the grid,
// on the last line.
func BootFrames(l Layout, count int, rng *rand.Rand) []bundle.Frame {
	drops := make([]int, l.W/2)
	for i := range drops {
		drops[i] = -(rng.Intn(l.H + 10))
	}

	logoLines := strings.Split(logo, "\n")
	logoTop := maxInt(3, l.H/2-6)

	frames := make([]bundle.Frame, 0, count)
	for t := 0; t < count; t++ {
		advanceRain(drops, l.H, rng)
		grid := rainGrid(l, drops, rng)

		if t >= count/4 {
			for i, line := range logoLines {
				writeASCII(grid, logoTop+i, (l.W-len(line))/2, line, 0.9)
			}
		}

		status := "loading content..."
		switch {
		case t >= count-6:
			status = "[ok] ready -- enjoy"
		case t < count/4:
			status = "connecting..."
		}
		hint := "hexaboard.org · curl edition · ctrl-c exits"
		writeASCIIDim(grid, l.H-1, 2, status)
		writeASCIIDimRight(grid, l.H-1, hint)

		frames = append(frames, bundle.Frame{DelayMS: 66, Body: EncodeFrame(grid)})
	}
	return frames
}

// RotationFrames bakes one seamless loop of the point cloud spinning
// around its vertical axis. The cloud is scaled per-layout so its
// projection fills ~92% of the width and ~85% of the body height. The
// bottom two rows carry an integrated dim status line, keeping frames
// full-height.
func RotationFrames(l Layout, points []model3d.Point, steps int) ([]bundle.Frame, error) {
	if len(points) == 0 {
		return nil, fmt.Errorf("streamrender: no points to rotate")
	}

	const (
		dist  = 8.0
		pitch = -0.38 // camera looks down at the board, like the site viewer
	)
	bodyRows := l.H - 2 // last two rows reserved for status

	// The tilt foreshortens vertical extent; compensate so the board
	// still fills ~85% of the body height.
	fill := math.Cos(pitch)
	scaleY := float64(bodyRows) / (2 * math.Tan((math.Pi/4)/2))
	aspect := 2.0

	// World-space radii that project onto the target fractions.
	targetHalfW := (float64(l.W) / 2) * 0.92
	wantRX := targetHalfW * dist / (scaleY * aspect)
	targetHalfH := (float64(bodyRows) / 2) * 0.85 / fill
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
		full := render.NewBlank(l.W, l.H)
		blit(f, full, 0, 0)
		writeASCIIDim(full, l.H-2, 2, "rotating · hexaboard v3 display")
		writeASCIIDimRight(full, l.H-2, "ctrl-c exits")
		writeASCIIDimRight(full, l.H-1, "clickable version: curl -fsSL hexaboard.org/install.sh | sh")
		frames = append(frames, bundle.Frame{DelayMS: 50, Body: EncodeFrame(full)})
	}
	return frames, nil
}

// CardRow is one line inside an info card.
type CardRow struct {
	Label string // right-padded dim column (may be empty)
	Value string // main text
	Dim   bool   // render dimmer than normal values
}

// CardFrame bakes a static info card centered on the grid. The card is
// drawn full-height (border box vertically centered, status footer on
// the last row) so it can cleanly replace rotation frames.
func CardFrame(l Layout, title string, rows []CardRow, footer string, delayMS uint32) bundle.Frame {
	f := render.NewBlank(l.W, l.H)

	type line struct {
		text string
		lum  float32
	}
	var inner []line
	addLine := func(text string, lum float32) { inner = append(inner, line{text, lum}) }

	addLine(title, 0.95)
	addLine("", 0)
	for _, r := range rows {
		lum := float32(0.75)
		if r.Dim {
			lum = 0.45
		}
		text := r.Value
		if r.Label != "" {
			text = padTo(r.Label, 16) + text
		}
		addLine(text, lum)
	}

	boxW := 0
	for _, ln := range inner {
		if w := len(ln.text); w > boxW {
			boxW = w
		}
	}
	boxW += 4
	boxH := len(inner) + 2
	topY := maxInt(2, (l.H-2-boxH)/2)

	top := "+" + strings.Repeat("-", boxW) + "+"
	bottom := "+" + strings.Repeat("-", boxW) + "+"

	writeASCIIBright(f, topY, (l.W-boxW-2)/2, top)
	for i, ln := range inner {
		pad := boxW - 2 - len(ln.text)
		text := "| " + ln.text + strings.Repeat(" ", maxInt(pad, 0)) + " |"
		writeASCIILum(f, topY+1+i, (l.W-boxW-2)/2, text, ln.lum)
	}
	writeASCIIBright(f, topY+boxH-1, (l.W-boxW-2)/2, bottom)

	writeASCIIDim(f, l.H-1, 2, footer)
	writeASCIIDimRight(f, l.H-1, "hexaboard.org")

	return bundle.Frame{DelayMS: delayMS, Body: EncodeFrame(f)}
}

// --- helpers ---

func blit(src, dst *render.Frame, dx, dy int) {
	for y := 0; y < src.H; y++ {
		for x := 0; x < src.W; x++ {
			dst.SetCell(dx+x, dy+y, src.CellAt(x, y))
		}
	}
}

func advanceRain(drops []int, maxH int, rng *rand.Rand) {
	for i := range drops {
		drops[i]++
		if drops[i] > maxH+8 {
			drops[i] = -rng.Intn(20)
		}
	}
}

func rainGrid(l Layout, drops []int, rng *rand.Rand) *render.Frame {
	f := render.NewBlank(l.W, l.H)
	const trail = 10
	for col, head := range drops {
		x := col * 2
		for t := 0; t < trail; t++ {
			y := head - t
			if y < 0 || y >= l.H || x >= l.W {
				continue
			}
			lum := 0.85 - float32(t)*0.08
			if lum < 0.15 {
				lum = 0.15
			}
			ch := asciiRain[rng.Intn(len(asciiRain))]
			f.SetCell(x, y, render.Cell{Ch: ch, Lum: lum})
		}
	}
	return f
}

func writeASCII(f *render.Frame, y, x int, text string, lum float32) {
	writeASCIILum(f, y, x, text, lum)
}

func writeASCIIBright(f *render.Frame, y, x int, text string) {
	writeASCIILum(f, y, x, text, 0.95)
}

func writeASCIIDim(f *render.Frame, y, x int, text string) {
	writeASCIILum(f, y, x, text, 0.35)
}

func writeASCIILum(f *render.Frame, y, x int, text string, lum float32) {
	for i := 0; i < len(text); i++ {
		if x+i < 0 || x+i >= f.W || y < 0 || y >= f.H {
			continue
		}
		if text[i] != ' ' || lum == 0 {
			f.SetCell(x+i, y, render.Cell{Ch: text[i], Lum: lum})
		}
	}
}

func writeASCIIDimRight(f *render.Frame, y int, text string) {
	x := f.W - len(text) - 2
	writeASCIILum(f, y, x, text, 0.35)
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

func padTo(s string, n int) string {
	for len(s) < n {
		s += " "
	}
	return s
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
