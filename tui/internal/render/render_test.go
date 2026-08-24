package render

import (
	"strings"
	"testing"

	"hexaboard.org/tui/internal/model3d"
)

func TestRenderSinglePointAtCenter(t *testing.T) {
	pts := []model3d.Point{{Pos: [3]float32{0, 0, 0}, Normal: [3]float32{0, 0, -1}}}
	f := Render(pts, Params{Width: 40, Height: 20})
	if f.W != 40 || f.H != 20 {
		t.Fatalf("frame size = %dx%d, want 40x20", f.W, f.H)
	}
	ch, ok := f.AnyNonSpace()
	if !ok {
		t.Fatal("expected a rendered glyph for visible point")
	}
	if ch == ' ' {
		t.Fatal("glyph should not be a space")
	}
}

func TestYawRotatesPointAcrossScreen(t *testing.T) {
	pts := []model3d.Point{{Pos: [3]float32{2, 0, 0}, Normal: [3]float32{0, 0, -1}}}

	right := Render(pts, Params{Width: 60, Height: 30, Yaw: 0}).CentroidCol()
	left := Render(pts, Params{Width: 60, Height: 30, Yaw: 3.14159}).CentroidCol()

	if right <= 30 {
		t.Errorf("yaw=0: centroid col %d, expected right half (>30)", right)
	}
	if left >= 30 {
		t.Errorf("yaw=pi: centroid col %d, expected left half (<30)", left)
	}
}

func TestZoomSpreadsPointsWiderWhenCloser(t *testing.T) {
	pts := []model3d.Point{
		{Pos: [3]float32{-1, 0, 0}, Normal: [3]float32{0, 0, -1}},
		{Pos: [3]float32{1, 0, 0}, Normal: [3]float32{0, 0, -1}},
	}
	far := Render(pts, Params{Width: 60, Height: 30, Distance: 10}).Span()
	near := Render(pts, Params{Width: 60, Height: 30, Distance: 4}).Span()

	if near <= far {
		t.Errorf("span near=%d should exceed far=%d", near, far)
	}
}

func TestZBufferNearerPointWins(t *testing.T) {
	// Same projected cell; the near point faces away from the light (dim),
	// the far point faces it (bright). Whoever wins must be the near one.
	near := model3d.Point{Pos: [3]float32{0, 0, -1}, Normal: [3]float32{0, 0, 1}}
	far := model3d.Point{Pos: [3]float32{0, 0, 1}, Normal: [3]float32{0, 0, -1}}

	f := Render([]model3d.Point{far, near}, Params{Width: 40, Height: 20})

	cell := f.CellAt(f.W/2, f.H/2)
	if cell.Ch == ' ' {
		t.Fatal("expected glyph at center")
	}
	if cell.Lum > 0.35 {
		t.Errorf("near occluding point won z-buffer but lum=%.2f looks far/bright", cell.Lum)
	}
}

func TestShadingFacesTowardLightBrighter(t *testing.T) {
	toward := []model3d.Point{{Pos: [3]float32{0, 0, 0}, Normal: [3]float32{0, 0, -1}}}
	away := []model3d.Point{{Pos: [3]float32{0, 0, 0}, Normal: [3]float32{0, 0, 1}}}

	bright := Render(toward, Params{Width: 40, Height: 20}).MaxLum()
	dim := Render(away, Params{Width: 40, Height: 20}).MaxLum()

	if bright <= dim {
		t.Errorf("toward-light lum %.2f should exceed away %.2f", bright, dim)
	}
	if dim < 0 || dim > 1 {
		t.Errorf("luminance %.2f outside [0,1]", dim)
	}
}

func TestFrameStringDimensions(t *testing.T) {
	empty := Render(nil, Params{Width: 10, Height: 4})
	s := empty.String()
	lines := strings.Split(strings.TrimRight(s, "\n"), "\n")
	if len(lines) != 4 {
		t.Fatalf("got %d lines, want 4", len(lines))
	}
	for i, l := range lines {
		if len(l) != 10 {
			t.Errorf("line %d width %d, want 10", i, len(l))
		}
	}
	if strings.TrimSpace(s) != "" {
		t.Error("empty scene should render as whitespace")
	}
}

func TestRampCoversLuminanceRange(t *testing.T) {
	if Ramp[0] != ' ' {
		t.Errorf("Ramp must start with space for lum 0, got %q", Ramp[0])
	}
	if Ramp[len(Ramp)-1] != '@' {
		t.Errorf("Ramp must end with '@' for lum 1, got %q", Ramp[len(Ramp)-1])
	}
}
