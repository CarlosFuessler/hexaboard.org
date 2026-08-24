package model3d

import (
	"math"
	"math/rand"
	"strings"
	"testing"
)

func TestParseOBJSimpleTriangles(t *testing.T) {
	r := strings.NewReader(`# comment
mtllib model.mtl
g Körper1
v 0 0 0
v 1 0 0
v 0 1 0
v 0 0 1
usemtl steel
f 1 2 3
f 1 3 4
`)
	m, err := Parse(r)
	if err != nil {
		t.Fatalf("Parse() unexpected error: %v", err)
	}
	if len(m.Vertices) != 4 {
		t.Fatalf("len(Vertices) = %d, want 4", len(m.Vertices))
	}
	want := [][3]int{{0, 1, 2}, {0, 2, 3}}
	if len(m.Faces) != 2 {
		t.Fatalf("len(Faces) = %d, want 2", len(m.Faces))
	}
	for i, f := range want {
		if m.Faces[i] != f {
			t.Errorf("Faces[%d] = %v, want %v", i, m.Faces[i], f)
		}
	}
}

func TestParseOBJQuadsSplitIntoTriangles(t *testing.T) {
	r := strings.NewReader("v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\n")
	m, err := Parse(r)
	if err != nil {
		t.Fatalf("Parse() unexpected error: %v", err)
	}
	if len(m.Faces) != 2 {
		t.Fatalf("len(Faces) = %d, want 2 after quad split", len(m.Faces))
	}
	if m.Faces[0] != [3]int{0, 1, 2} || m.Faces[1] != [3]int{0, 2, 3} {
		t.Errorf("Faces = %v, want fan {0,1,2}{0,2,3}", m.Faces)
	}
}

func TestParseOBJFormatsAndNegativeIndices(t *testing.T) {
	r := strings.NewReader("v 0 0 0\nv 1 0 0\nv 0 1 0\nf 3/-1/-1 1//1 2/1/1\nf -3 -2 -1\n")
	m, err := Parse(r)
	if err != nil {
		t.Fatalf("Parse() unexpected error: %v", err)
	}
	if m.Faces[0] != [3]int{2, 0, 1} {
		t.Errorf("textured face parsed as %v, want {2,0,1}", m.Faces[0])
	}
	if m.Faces[1] != [3]int{0, 1, 2} {
		t.Errorf("negative indices parsed as %v, want {0,1,2}", m.Faces[1])
	}
}

func TestSamplePointsLieOnSurface(t *testing.T) {
	// Right triangle in z=0 plane.
	m := Mesh{
		Vertices: [][3]float32{{0, 0, 0}, {4, 0, 0}, {0, 4, 0}},
		Faces:    [][3]int{{0, 1, 2}},
	}
	points := Sample(m, 500, rand.New(rand.NewSource(42)))
	if len(points) != 500 {
		t.Fatalf("len(points) = %d, want 500", len(points))
	}
	for i, p := range points {
		x, y := float64(p.Pos[0]), float64(p.Pos[1])
		if p.Pos[2] != 0 {
			t.Errorf("point %d has z=%v, want 0", i, p.Pos[2])
		}
		if x < -1e-6 || y < -1e-6 || x+y > 4+1e-6 {
			t.Errorf("point %d (%v,%v) outside triangle", i, x, y)
		}
		if p.Normal != [3]float32{0, 0, 1} {
			t.Errorf("point %d normal = %v, want +z", i, p.Normal)
		}
	}
}

func TestSampleAreaWeighted(t *testing.T) {
	// Two triangles sharing an edge: big one spans x∈[0,9], small one x∈[9,10].
	// Big is 9x the area, so ~90% of samples must land there.
	m := Mesh{
		Vertices: [][3]float32{
			{0, 0, 0}, {9, 0, 0}, {0, 1, 0},
			{9, 0, 0}, {10, 0, 0}, {9, 1, 0},
		},
		Faces: [][3]int{{0, 1, 2}, {3, 4, 5}},
	}
	points := Sample(m, 20000, rand.New(rand.NewSource(7)))
	big := 0
	for _, p := range points {
		if p.Pos[0] <= 9 {
			big++
		}
	}
	got := float64(big) / float64(len(points))
	want := bigArea / (bigArea + smallArea)
	if math.Abs(got-want) > 0.02 {
		t.Errorf("area fraction = %.3f, want ≈%.3f", got, want)
	}
}

const bigArea = 4.5  // ½·base 9 · height 1
const smallArea = .5 // ½·base 1 · height 1

func TestSampleEmptyMesh(t *testing.T) {
	if got := Sample(Mesh{}, 100, rand.New(rand.NewSource(1))); len(got) != 0 {
		t.Errorf("Sample(empty) = %d points, want 0", len(got))
	}
}
