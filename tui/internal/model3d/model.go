// Package model3d parses OBJ geometry and samples surface point clouds
// for terminal rendering.
package model3d

import (
	"bufio"
	"fmt"
	"io"
	"math"
	"math/rand"
	"strconv"
	"strings"
)

// Mesh is triangle geometry with shared vertices.
type Mesh struct {
	Vertices [][3]float32
	Faces    [][3]int // indices into Vertices, always triangles
}

// Point is a position on the mesh surface plus its face normal.
type Point struct {
	Pos    [3]float32
	Normal [3]float32
}

// Parse reads Wavefront OBJ data from r, keeping only vertices (v) and
// faces (f). Quads and n-gons are fan-triangulated; negative indices are
// resolved relative to the current vertex count. All other records are
// skipped without allocation.
func Parse(r io.Reader) (Mesh, error) {
	var m Mesh
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 0, 1024*1024), 1024*1024)
	line := 0
	for sc.Scan() {
		line++
		text := strings.TrimSpace(sc.Text())
		if text == "" || text[0] == '#' {
			continue
		}
		fields := strings.Fields(text)
		switch fields[0] {
		case "v":
			if len(fields) < 4 {
				return m, fmt.Errorf("model3d: line %d: vertex needs 3 coords", line)
			}
			x, err := parseF32(fields[1])
			if err != nil {
				return m, fmt.Errorf("model3d: line %d: %w", line, err)
			}
			y, err := parseF32(fields[2])
			if err != nil {
				return m, fmt.Errorf("model3d: line %d: %w", line, err)
			}
			z, err := parseF32(fields[3])
			if err != nil {
				return m, fmt.Errorf("model3d: line %d: %w", line, err)
			}
			m.Vertices = append(m.Vertices, [3]float32{x, y, z})
		case "f":
			idx := make([]int, 0, len(fields)-1)
			for _, tok := range fields[1:] {
				i, err := parseIndex(tok, len(m.Vertices))
				if err != nil {
					return m, fmt.Errorf("model3d: line %d: %w", line, err)
				}
				idx = append(idx, i)
			}
			for k := 1; k+1 < len(idx); k++ {
				m.Faces = append(m.Faces, [3]int{idx[0], idx[k], idx[k+1]})
			}
		}
	}
	if err := sc.Err(); err != nil {
		return m, fmt.Errorf("model3d: read: %w", err)
	}
	return m, nil
}

func parseF32(s string) (float32, error) {
	f, err := strconv.ParseFloat(s, 32)
	if err != nil {
		return 0, fmt.Errorf("bad number %q", s)
	}
	return float32(f), nil
}

// parseIndex resolves an OBJ face token "v", "v/vt" or "v/vt/vn"
// (1-based, negative = relative) to a 0-based absolute index.
func parseIndex(tok string, vCount int) (int, error) {
	vStr := tok
	if slash := strings.IndexByte(tok, '/'); slash >= 0 {
		vStr = tok[:slash]
	}
	n, err := strconv.Atoi(vStr)
	if err != nil {
		return 0, fmt.Errorf("bad face index %q", tok)
	}
	if n < 0 {
		n += vCount + 1
	}
	if n < 1 || n > vCount {
		return 0, fmt.Errorf("face index %q out of range", tok)
	}
	return n - 1, nil
}

// Sample draws n points uniformly by area across the mesh surface,
// each carrying its triangle's geometric normal. A zero-area mesh or
// empty input yields no points. Uses the provided rng for determinism.
func Sample(m Mesh, n int, rng *rand.Rand) []Point {
	if len(m.Faces) == 0 || len(m.Vertices) == 0 || n <= 0 {
		return nil
	}

	cdf := make([]float64, len(m.Faces))
	var total float64
	for i, f := range m.Faces {
		total += triArea(m.Vertices[f[0]], m.Vertices[f[1]], m.Vertices[f[2]])
		cdf[i] = total
	}
	if total == 0 {
		return nil
	}

	points := make([]Point, 0, n)
	for len(points) < n {
		pick := rng.Float64() * total
		fi := binarySearchCDF(cdf, pick)
		f := m.Faces[fi]

		a, b, c := m.Vertices[f[0]], m.Vertices[f[1]], m.Vertices[f[2]]
		pos := barycentricPoint(a, b, c, rng)
		points = append(points, Point{
			Pos:    pos,
			Normal: triNormal(a, b, c),
		})
	}
	return points
}

func binarySearchCDF(cdf []float64, x float64) int {
	lo, hi := 0, len(cdf)-1
	for lo < hi {
		mid := (lo + hi) / 2
		if cdf[mid] < x {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

func barycentricPoint(a, b, c [3]float32, rng *rand.Rand) [3]float32 {
	u := rng.Float32()
	v := rng.Float32()
	if u+v > 1 {
		u, v = 1-u, 1-v
	}
	return [3]float32{
		a[0] + u*(b[0]-a[0]) + v*(c[0]-a[0]),
		a[1] + u*(b[1]-a[1]) + v*(c[1]-a[1]),
		a[2] + u*(b[2]-a[2]) + v*(c[2]-a[2]),
	}
}

func triArea(a, b, c [3]float32) float64 {
	e1 := sub(b, a)
	e2 := sub(c, a)
	cr := cross(e1, e2)
	return 0.5 * float64(norm(cr))
}

func triNormal(a, b, c [3]float32) [3]float32 {
	n := cross(sub(b, a), sub(c, a))
	l := norm(n)
	if l == 0 {
		return [3]float32{}
	}
	return scale(n, 1/l)
}

func sub(a, b [3]float32) [3]float32 {
	return [3]float32{a[0] - b[0], a[1] - b[1], a[2] - b[2]}
}

func cross(a, b [3]float32) [3]float32 {
	return [3]float32{
		a[1]*b[2] - a[2]*b[1],
		a[2]*b[0] - a[0]*b[2],
		a[0]*b[1] - a[1]*b[0],
	}
}

func norm(v [3]float32) float32 {
	return float32(math.Sqrt(float64(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])))
}

func scale(v [3]float32, s float32) [3]float32 {
	return [3]float32{v[0] * s, v[1] * s, v[2] * s}
}
