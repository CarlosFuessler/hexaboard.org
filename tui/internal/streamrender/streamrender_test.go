package streamrender

import (
	"math"
	"math/rand"
	"strings"
	"testing"

	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/render"
)

var testLayout = Layout{W: 40, H: 14}

func cell(lum float32, ch byte) render.Cell {
	return render.Cell{Lum: lum, Ch: ch}
}

func TestEncodeGroupsAdjacentSameColor(t *testing.T) {
	f := render.NewBlank(4, 1)
	f.SetCell(0, 0, cell(0.9, '#'))
	f.SetCell(1, 0, cell(0.9, '#'))
	f.SetCell(2, 0, cell(0, ' '))
	f.SetCell(3, 0, cell(0.2, '.'))

	got := EncodeFrame(f)
	if strings.Count(got, "\x1b[38;5;") != 2 {
		t.Errorf("expected exactly 2 color runs, got %d in %q", strings.Count(got, "\x1b[38;5;"), got)
	}
	if !strings.Contains(got, "##") {
		t.Errorf("adjacent same-color glyphs should be grouped: %q", got)
	}
}

func TestEncodeAlwaysFullGrid(t *testing.T) {
	l := Layout{W: 30, H: 8}
	frames := BootFrames(l, 5, rand.New(rand.NewSource(1)))
	for i, fr := range frames {
		// H lines of exactly W visible characters each.
		body := strings.TrimSuffix(fr.Body, "\n")
		lines := strings.Split(body, "\n")
		if len(lines) != l.H {
			t.Errorf("frame %d has %d lines, want exactly %d (no residue)", i, len(lines), l.H)
		}
		for y, line := range lines {
			if w := visibleLen(line); w != l.W {
				t.Errorf("frame %d line %d width %d, want %d", i, y, w, l.W)
			}
		}
	}
}

func TestRotationFramesFillLayout(t *testing.T) {
	// A ring of points wide enough to project across the whole grid.
	var pts []model3d.Point
	for i := 0; i < 720; i++ {
		a := float64(i) / 720 * 2 * 3.14159
		pts = append(pts, model3d.Point{
			Pos:    [3]float32{float32(math.Cos(a)), float32(math.Sin(a) * 0.4), float32(math.Sin(a))},
			Normal: [3]float32{0, 0.3, -0.95},
		})
	}
	frames, err := RotationFrames(testLayout, pts, 6)
	if err != nil {
		t.Fatalf("RotationFrames() unexpected error: %v", err)
	}
	if len(frames) != 6 {
		t.Fatalf("got %d frames, want 6", len(frames))
	}

	bestSpan := 0
	for _, fr := range frames {
		for _, line := range strings.Split(strings.TrimSuffix(fr.Body, "\n"), "\n") {
			span := contentSpan(line)
			if span > bestSpan {
				bestSpan = span
			}
		}
	}
	if bestSpan < testLayout.W*45/100 {
		t.Errorf("widest rotation frame spans %d cols, want ≥45%% of %d (fill target 58%%)", bestSpan, testLayout.W)
	}
	if bestSpan > testLayout.W*70/100 {
		t.Errorf("widest rotation frame spans %d cols, want ≤70%% of %d — should stay zoomed out", bestSpan, testLayout.W)
	}
}

func TestCardFrameContainsCopy(t *testing.T) {
	fr := CardFrame(testLayout, "// specs",
		[]CardRow{{Label: "Layout", Value: "2x3"}, {Label: "USB-C", Value: "yes"}},
		"hexaboard.org", 4000)
	if !strings.Contains(fr.Body, "specs") || !strings.Contains(fr.Body, "Layout") {
		t.Errorf("card body missing copy")
	}
	if !strings.Contains(fr.Body, "+---") {
		t.Error("card should have an ascii border")
	}
}

func TestCardFrameFullHeight(t *testing.T) {
	fr := CardFrame(testLayout, "// t", []CardRow{{Label: "a", Value: "b"}}, "footer", 1000)
	lines := strings.Split(strings.TrimSuffix(fr.Body, "\n"), "\n")
	if len(lines) != testLayout.H {
		t.Errorf("card frame has %d lines, want %d", len(lines), testLayout.H)
	}
}

// --- helpers ---

func contentSpan(line string) int {
	// Strip CSI sequences, then measure first→last non-space column.
	var b strings.Builder
	i := 0
	for i < len(line) {
		if line[i] == '\x1b' && i+1 < len(line) && line[i+1] == '[' {
			i += 2
			for i < len(line) && !(line[i] >= 0x40 && line[i] <= 0x7e) {
				i++
			}
			i++
			continue
		}
		b.WriteByte(line[i])
		i++
	}
	stripped := b.String()
	first, last := -1, -1
	for j := 0; j < len(stripped); j++ {
		if stripped[j] != ' ' {
			if first < 0 {
				first = j
			}
			last = j
		}
	}
	if first < 0 {
		return 0
	}
	return last - first + 1
}

func visibleLen(s string) int {
	n := 0
	i := 0
	for i < len(s) {
		c := s[i]
		if c != '\x1b' {
			n++
			i++
			continue
		}
		// CSI sequence: ESC [ params final-byte (any letter @-~).
		if i+1 < len(s) && s[i+1] == '[' {
			i += 2
			for i < len(s) && !(s[i] >= 0x40 && s[i] <= 0x7e) {
				i++
			}
			i++ // consume final byte
			continue
		}
		i++ // lone escape
	}
	return n
}
