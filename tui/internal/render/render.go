// Package render turns 3D point clouds into character frames using a
// z-buffered perspective projection and lambert shading.
package render

import (
	"math"
	"strings"

	"hexaboard.org/tui/internal/model3d"
)

// Ramp maps luminance [0,1] to glyphs, dark → bright.
const Ramp = " .:-=+*#%@"

// LightDir is the normalized light direction (from surface toward light).
var LightDir = normalize([3]float64{0.35, 0.6, -0.72})

// Params controls one rendered frame.
type Params struct {
	Width, Height int     // grid size in cells
	Yaw           float64 // rotation around vertical axis (radians)
	Pitch         float64 // tilt toward viewer (radians)
	Distance      float64 // camera distance; smaller = zoom in
	FOV           float64 // vertical field of view (radians); 0 → default
}

// Cell is one terminal character slot.
type Cell struct {
	Ch  byte
	Lum float32 // shaded luminance 0..1
}

// Frame is the rendered character grid.
type Frame struct {
	W, H  int
	cells []Cell
}

// CellAt returns the cell at column x, row y.
func (f *Frame) CellAt(x, y int) Cell { return f.cells[y*f.W+x] }

// SetCell overwrites one cell (used by tests and frame tooling).
func (f *Frame) SetCell(x, y int, c Cell) { f.cells[y*f.W+x] = c }

// Fill resets every cell to ch with zero luminance.
func (f *Frame) Fill(ch byte) {
	for i := range f.cells {
		f.cells[i].Ch = ch
		f.cells[i].Lum = 0
	}
}

// LumIndex maps luminance [0,1] onto a Ramp index.
func LumIndex(lum float32) int {
	n := len(Ramp)
	i := int(lum*float32(n-1) + 0.5)
	if i < 0 {
		return 0
	}
	if i > n-1 {
		return n - 1
	}
	return i
}

// AnyNonSpace returns the first non-space glyph.
func (f *Frame) AnyNonSpace() (byte, bool) {
	for _, c := range f.cells {
		if c.Ch != ' ' {
			return c.Ch, true
		}
	}
	return ' ', false
}

// CentroidCol returns the average column of non-space cells.
func (f *Frame) CentroidCol() int {
	sum, n := 0, 0
	for y := 0; y < f.H; y++ {
		for x := 0; x < f.W; x++ {
			if f.cells[y*f.W+x].Ch != ' ' {
				sum += x
				n++
			}
		}
	}
	if n == 0 {
		return f.W / 2
	}
	return sum / n
}

// Span returns the horizontal extent (max-min columns with content).
func (f *Frame) Span() int {
	minX, maxX := math.MaxInt, math.MinInt
	for y := 0; y < f.H; y++ {
		for x := 0; x < f.W; x++ {
			if f.cells[y*f.W+x].Ch != ' ' {
				minX = min(minX, x)
				maxX = max(maxX, x)
			}
		}
	}
	if minX > maxX {
		return 0
	}
	return maxX - minX + 1
}

// MaxLum returns the highest luminance on the frame.
func (f *Frame) MaxLum() float32 {
	var m float32
	for _, c := range f.cells {
		if c.Lum > m {
			m = c.Lum
		}
	}
	return m
}

// String renders the frame as plain ramp text.
func (f *Frame) String() string {
	var b strings.Builder
	b.Grow(f.H * (f.W + 1))
	for y := 0; y < f.H; y++ {
		row := f.cells[y*f.W : (y+1)*f.W]
		for _, c := range row {
			b.WriteByte(c.Ch)
		}
		b.WriteByte('\n')
	}
	return b.String()
}

// NewBlank returns an empty W×H frame filled with spaces.
func NewBlank(w, h int) *Frame {
	if w <= 0 || h <= 0 {
		w, h = 1, 1
	}
	f := &Frame{W: w, H: h, cells: make([]Cell, w*h)}
	f.Fill(' ')
	return f
}

// Render projects already-centered points into a W×H frame.
func Render(points []model3d.Point, p Params) *Frame {
	if p.Width <= 0 || p.Height <= 0 {
		p.Width, p.Height = 1, 1
	}
	if p.Distance <= 0 {
		p.Distance = 5
	}
	if p.FOV <= 0 {
		p.FOV = math.Pi / 4
	}

	f := &Frame{W: p.Width, H: p.Height, cells: make([]Cell, p.Width*p.Height)}
	f.Fill(' ')

	if len(points) == 0 {
		return f
	}

	cx, cy, cz := 0.0, 0.0, 0.0
	sy, cy_ := math.Sincos(p.Yaw)
	sp, cp := math.Sincos(p.Pitch)
	scaleY := float64(p.Height) / (2 * math.Tan(p.FOV/2))
	aspect := 2.0 // terminal cells are ~twice as tall as wide

	zbuf := make([]float64, p.Width*p.Height)
	for i := range zbuf {
		zbuf[i] = math.Inf(1)
	}

	for i := range points {
		x := float64(points[i].Pos[0]) - cx
		y := float64(points[i].Pos[1]) - cy
		z := float64(points[i].Pos[2]) - cz

		// Rotate around Y (yaw), then X (pitch).
		x, z = x*cy_+z*sy, -x*sy+z*cy_
		y, z = y*cp-z*sp, y*sp+z*cp

		zc := z + p.Distance
		if zc <= 0.1 {
			continue // behind camera
		}

		px := x/zc*scaleY*aspect + float64(p.Width)/2
		py := -y/zc*scaleY + float64(p.Height)/2
		ix, iy := int(math.Round(px)), int(math.Round(py))
		if ix < 0 || ix >= p.Width || iy < 0 || iy >= p.Height {
			continue
		}

		if zc < zbuf[iy*p.Width+ix] {
			zbuf[iy*p.Width+ix] = zc
			lum := lambert(points[i].Normal, p)
			idx := iy*p.Width + ix
			f.cells[idx].Lum = lum
			f.cells[idx].Ch = Ramp[LumIndex(lum)]
		}
	}
	return f
}

func lambert(normal [3]float32, _ Params) float32 {
	n := normalize3(normal)
	d := float64(n[0])*LightDir[0] + float64(n[1])*LightDir[1] + float64(n[2])*LightDir[2]
	// Wrap so back faces stay faintly visible instead of disappearing.
	l := 0.15 + 0.85*math.Max(d, 0)
	return float32(clampF(l, 0, 1))
}

func normalize(v [3]float64) [3]float64 {
	l := math.Sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
	if l == 0 {
		return v
	}
	return [3]float64{v[0] / l, v[1] / l, v[2] / l}
}

func normalize3(v [3]float32) [3]float32 {
	n := normalize([3]float64{float64(v[0]), float64(v[1]), float64(v[2])})
	return [3]float32{float32(n[0]), float32(n[1]), float32(n[2])}
}

func clamp(i, lo, hi int) int {
	if i < lo {
		return lo
	}
	if i > hi {
		return hi
	}
	return i
}

func clampF(f, lo, hi float64) float64 {
	return math.Max(lo, math.Min(hi, f))
}
