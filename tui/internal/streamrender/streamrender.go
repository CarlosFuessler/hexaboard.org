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

// Grid is the fixed frame size; curl terminals vary, so the layout is
// self-contained.
const (
	GridW = 90
	GridH = 26
)

// Palette maps render.Ramp index → 256-color code ("" = default/plain).
var Palette = []string{"", "22", "28", "34", "35", "41", "47", "48", "50", "158"}

const logo = ` _  _ ____ _    ___  _  _ ___  ____ ____
 |__| |__| |    |__> |-:_ |__> |=== |___`

const rainCharset = "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789"

// EncodeFrame renders a Frame into a cursor-homed ANSI string. Every row
// is padded to exactly GridW visible characters so redraws leave no
// residue. Adjacent cells sharing a color are grouped into one escape run.
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
		b.WriteString("\x1b[0m")
		_ = colored
		b.WriteByte('\n')
	}
	return b.String()
}

// BootFrames bakes the intro: rain with the HEXABOARD logo fading in and
// a status line that ends ready.
func BootFrames(count int, rng *rand.Rand) []bundle.Frame {
	drops := make([]int, GridW/2)
	for i := range drops {
		drops[i] = -(rng.Intn(GridH + 10))
	}

	logoLines := strings.Split(logo, "\n")
	frames := make([]bundle.Frame, 0, count)
	for t := 0; t < count; t++ {
		advanceRain(drops, rng)
		grid := rainGrid(drops, rng)
		logoTop := 4
		if t >= count/4 {
			for i, line := range logoLines {
				overlayLine(grid, logoTop+i, (GridW-len(line))/2, line)
			}
		}
		status := "loading content..."
		if t >= count-6 {
			status = "[ok] ready -- enjoy"
		} else if t < count/4 {
			status = "connecting..." //nolint:dupl
		}
		overlayLine(grid, GridH-4, (GridW-len(status))/2, status)

		body := EncodeFrame(grid) +
			fmt.Sprintf("\x1b[%d;1H\x1b[38;5;242mhexaboard.org · curl edition · ctrl-c exits\x1b[0m", GridH+1)
		frames = append(frames, bundle.Frame{DelayMS: 66, Body: body})
	}
	return frames
}

// RotationFrames bakes one seamless loop of the point cloud spinning
// around its vertical axis.
func RotationFrames(points []model3d.Point, steps int) ([]bundle.Frame, error) {
	if len(points) == 0 {
		return nil, fmt.Errorf("streamrender: no points to rotate")
	}
	scaleToFit(points, 7.0, 5.0)

	frames := make([]bundle.Frame, 0, steps)
	for s := 0; s < steps; s++ {
		yaw := 2 * math.Pi * float64(s) / float64(steps)
		f := render.Render(points, render.Params{
			Width:    GridW,
			Height:   GridH - 3,
			Yaw:      yaw,
			Distance: 8,
		})
		body := EncodeFrame(f) +
			fmt.Sprintf("\x1b[%d;1H\x1b[38;5;242mrotating · hexaboard v3 · space would pause if this were interactive\x1b[0m", GridH+1)
		frames = append(frames, bundle.Frame{DelayMS: 50, Body: body})
	}
	return frames, nil
}

// CardFrame bakes a static info card centered on the grid.
func CardFrame(title string, rows [][2]string, footer string) bundle.Frame {
	f := render.NewBlank(GridW, GridH)

	inner := make([]string, 0, len(rows)+2)
	inner = append(inner, "\x1b[38;5;47m"+title+"\x1b[0m", "")
	for _, r := range rows {
		line := "\x1b[38;5;242m" + padTo(r[0], 16) + "\x1b[0m" + r[1]
		inner = append(inner, line)
	}

	boxW := 0
	for _, l := range inner {
		if w := visibleLen(l); w > boxW {
			boxW = w
		}
	}
	boxW += 4 // padding
	top := "╭" + strings.Repeat("─", boxW) + "╮"
	bot := "╰" + strings.Repeat("─", boxW) + "╯"

	topY := 5
	putCentered(f, topY, top)
	for i, l := range inner {
		pad := boxW - 2 - visibleLen(l)
		line := "│ " + l + strings.Repeat(" ", maxInt(pad, 0)) + " │"
		putCentered(f, topY+1+i, line)
	}
	putCentered(f, topY+1+len(inner), bot)
	putCenteredANSI(f, GridH-2, footer)

	return bundle.Frame{DelayMS: 4000, Body: EncodeFrame(f)}
}

// --- helpers ---

func advanceRain(drops []int, rng *rand.Rand) {
	for i := range drops {
		drops[i]++
		if drops[i] > GridH+8 {
			drops[i] = -rng.Intn(20)
		}
	}
}

func rainGrid(drops []int, rng *rand.Rand) *render.Frame {
	f := render.NewBlank(GridW, GridH)
	const trail = 10
	for col, head := range drops {
		x := col * 2
		for t := 0; t < trail; t++ {
			y := head - t
			if y < 0 || y >= GridH || x >= GridW {
				continue
			}
			lum := 0.85 - float32(t)*0.08
			if lum < 0.15 {
				lum = 0.15
			}
			ch := rainCharset[rng.Intn(len(rainCharset))]
			f.SetCell(x, y, render.Cell{Ch: byte(ch), Lum: lum})
		}
	}
	return f
}

func overlayLine(f *render.Frame, y int, x int, text string) {
	for i := 0; i < len(text); i++ {
		if x+i < 0 || x+i >= GridW || y < 0 || y >= GridH {
			continue
		}
		f.SetCell(x+i, y, render.Cell{Ch: text[i], Lum: 0.9})
	}
}

func putCentered(f *render.Frame, y int, ansiLine string) {
	putCenteredAt(f, y, ansiLine, false)
}

func putCenteredANSI(f *render.Frame, y int, text string) {
	putCenteredAt(f, y, "\x1b[38;5;242m"+text+"\x1b[0m", true)
}

// putCenteredAt writes a possibly ANSI-styled line starting at column
// (GridW-visibleWidth)/2. Glyphs land as bright cells; escapes pass through.
func putCenteredAt(f *render.Frame, y int, line string, dim bool) {
	vw := visibleLen(line)
	x0 := (GridW - vw) / 2
	cx := x0
	inEsc := false
	var esc strings.Builder
	for i := 0; i < len(line); i++ {
		c := line[i]
		if c == '\x1b' {
			inEsc = true
			esc.Reset()
			esc.WriteByte(c)
			continue
		}
		if inEsc {
			esc.WriteByte(c)
			if c == 'm' {
				inEsc = false
			}
			continue
		}
		lum := float32(0.75)
		if dim {
			lum = 0.35
		}
		if cx >= 0 && cx < GridW && y >= 0 && y < GridH {
			f.SetCell(cx, y, render.Cell{Ch: c, Lum: lum})
		}
		cx++
	}
}

// scaleToFit centers points at origin and scales them to fit the given
// width/height extents in world units.
func scaleToFit(points []model3d.Point, wantXZ, wantY float64) {
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
	sx, sy, sz := maxX-minX, maxY-minY, maxZ-minZ
	fit := math.Min(wantXZ/math.Max(sx, 1e-6), wantXZ/math.Max(sz, 1e-6))
	fitY := wantY / math.Max(sy, 1e-6)
	s := math.Min(fit, fitY)
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

// visibleLen counts printable characters, skipping ANSI escape sequences.
func visibleLen(s string) int {
	n := 0
	inEsc := false
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '\x1b' {
			inEsc = true
			continue
		}
		if inEsc {
			if c == 'm' {
				inEsc = false
			}
			continue
		}
		n++
	}
	return n
}
