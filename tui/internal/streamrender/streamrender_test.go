package streamrender

import (
	"math/rand"
	"strings"
	"testing"

	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/render"
)

func cell(lum float32, ch byte) render.Cell {
	return render.Cell{Lum: lum, Ch: ch}
}

func TestEncodeGroupsAdjacentSameColor(t *testing.T) {
	f := render.NewBlank(4, 1)
	// Build manually: two bright cells, one space, one dim cell.
	set := func(x int, c render.Cell) { f.SetCell(x, 0, c) }
	set(0, cell(0.9, '#'))
	set(1, cell(0.9, '#'))
	set(2, cell(0, ' '))
	set(3, cell(0.2, '.'))

	got := EncodeFrame(f)
	if strings.Count(got, "\x1b[38;5;") != 2 {
		t.Errorf("expected exactly 2 color runs, got %d in %q", strings.Count(got, "\x1b[38;5;"), got)
	}
	if !strings.Contains(got, "##") {
		t.Errorf("adjacent same-color glyphs should be grouped: %q", got)
	}
}

func TestEncodePadsRowsToWidth(t *testing.T) {
	f := render.NewBlank(10, 2)
	f.Fill(' ')
	got := EncodeFrame(f)
	lines := strings.Split(strings.TrimSuffix(got, "\n"), "\n")
	if len(lines) != 2 {
		t.Fatalf("got %d lines, want 2", len(lines))
	}
}

func TestPaletteCoversRamp(t *testing.T) {
	if len(Palette) != len(render.Ramp) {
		t.Fatalf("Palette %d entries, want %d (one per ramp glyph)", len(Palette), len(render.Ramp))
	}
	for i, p := range Palette {
		if i > 0 && p == "" {
			t.Errorf("Palette[%d] empty; only index 0 may be blank", i)
		}
	}
}

func TestBootFramesShape(t *testing.T) {
	frames := BootFrames(10, rand.New(rand.NewSource(1)))
	if len(frames) != 10 {
		t.Fatalf("got %d frames, want 10", len(frames))
	}
	last := frames[len(frames)-1].Body
	if !strings.Contains(last, "ready") {
		t.Errorf("final boot frame should show ready, got %q", last[:min(200, len(last))])
	}
	for i, f := range frames {
		if f.DelayMS != 66 {
			t.Errorf("frame %d delay %d, want 66", i, f.DelayMS)
		}
	}
}

func TestRotationFramesLoopable(t *testing.T) {
	pts := []model3d.Point{
		{Pos: [3]float32{-1, -0.5, 0}, Normal: [3]float32{0, 0.3, -0.95}},
		{Pos: [3]float32{1, 0.5, 0}, Normal: [3]float32{0, 0.3, -0.95}},
		{Pos: [3]float32{0, 0, -1}, Normal: [3]float32{0, 0.3, -0.95}},
	}
	frames, err := RotationFrames(pts, 8)
	if err != nil {
		t.Fatalf("RotationFrames() unexpected error: %v", err)
	}
	if len(frames) != 8 {
		t.Fatalf("got %d frames, want 8", len(frames))
	}
	nonEmpty := 0
	for _, fr := range frames {
		if strings.Count(fr.Body, "\x1b[38;5;") > 0 {
			nonEmpty++
		}
	}
	if nonEmpty == 0 {
		t.Error("no rotation frame contains colored glyphs")
	}
}

func TestRotationFramesEmptyPointsRejected(t *testing.T) {
	if _, err := RotationFrames(nil, 4); err == nil {
		t.Fatal("expected error for empty points")
	}
}

func TestCardFrameContainsCopy(t *testing.T) {
	fr := CardFrame("// specs", [][2]string{{"Layout", "2x3"}, {"USB-C", "yes"}}, "hexaboard.org")
	if !strings.Contains(fr.Body, "specs") || !strings.Contains(fr.Body, "Layout") {
		t.Errorf("card body missing copy: %q", fr.Body[:min(300, len(fr.Body))])
	}
	if !strings.Contains(fr.Body, "╭") {
		t.Error("card should have a rounded border")
	}
}
