package ui

import (
	"errors"
	"strings"
	"testing"

	"hexaboard.org/tui/internal/content"
	"hexaboard.org/tui/internal/model3d"

	tea "github.com/charmbracelet/bubbletea"
)

func sampleContent() content.Content {
	c, err := content.Decode([]byte(`{
		"version": 1,
		"hero": {"eyebrow": "// hi", "title": "Hexaboard", "tagline": "Tag.", "typingLines": ["abc"]},
		"features": [{"icon":"zap","title":"F1","description":"D1"},{"icon":"cpu","title":"F2","description":"D2"},{"icon":"wifi","title":"F3","description":"D3"}],
		"specs": [{"label":"L","value":"V"}],
		"links": [{"label":"GitHub","url":"https://x"}]
	}`))
	if err != nil {
		panic(err)
	}
	return c
}

func keyPress(k string) tea.KeyMsg {
	switch k {
	case "up":
		return tea.KeyMsg{Type: tea.KeyUp}
	case "down":
		return tea.KeyMsg{Type: tea.KeyDown}
	case "left":
		return tea.KeyMsg{Type: tea.KeyLeft}
	case "right":
		return tea.KeyMsg{Type: tea.KeyRight}
	default:
		return tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(k)}
	}
}

func TestStartsInBootState(t *testing.T) {
	m := New(Config{})
	if m.state != StateBoot {
		t.Errorf("state = %v, want StateBoot", m.state)
	}
	if v := m.View(); !strings.Contains(v, "loading") {
		t.Errorf("View() should show loading hint, got %q", v[:min(120, len(v))])
	}
}

func TestContentLoadedShowsHeroTab(t *testing.T) {
	m := New(Config{})
	m, _ = step(m, contentLoadedMsg{content: sampleContent()})
	if m.state != StateMain {
		t.Errorf("state = %v, want StateMain", m.state)
	}
	if m.tab != TabHero {
		t.Errorf("tab = %v, want TabHero", m.tab)
	}
}

func TestContentErrorStaysInBootWithError(t *testing.T) {
	m := New(Config{})
	m, _ = step(m, contentLoadedMsg{err: errors.New("connection refused")})
	if m.err == nil {
		t.Fatal("expected error retained")
	}
	if m.state != StateBoot {
		t.Errorf("state = %v, want still StateBoot", m.state)
	}
}

func TestNumberKeysSwitchTabs(t *testing.T) {
	m := loaded()
	for _, tc := range []struct {
		key  string
		want Tab
	}{{"1", TabHero}, {"2", TabFeatures}, {"3", TabViewer}, {"4", TabSpecs}} {
		got, _ := m.Update(keyPress(tc.key))
		m = got.(Model)
		if m.tab != tc.want {
			t.Errorf("key %s: tab = %v, want %v", tc.key, m.tab, tc.want)
		}
	}
}

func TestArrowKeysCycleTabs(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("left"))
	if m.tab != TabSpecs {
		t.Errorf("left from hero: tab = %v, want TabSpecs (wrap)", m.tab)
	}
	m, _ = step(m, keyPress("right"))
	if m.tab != TabHero {
		t.Errorf("right from specs: tab = %v, want wrap to TabHero", m.tab)
	}
}

func TestQuitKey(t *testing.T) {
	m := loaded()
	_, cmd := m.Update(keyPress("q"))
	if cmd == nil {
		t.Fatal("expected quit command")
	}
	if _, ok := cmd().(tea.QuitMsg); !ok {
		t.Error("command should produce tea.QuitMsg")
	}
}

func TestTypewriterAdvances(t *testing.T) {
	m := loaded()
	for i := 0; i < 5; i++ {
		m, _ = step(m, typeTickMsg{})
	}
	if got := m.typedLen(); got != 5 {
		t.Errorf("typedLen after 5 ticks = %d, want 5", got)
	}
}

func TestFrameTickRotatesWhenNotPaused(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("3")) // viewer tab
	y0 := m.viewer.yaw
	m, _ = step(m, frameTickMsg{})
	if m.viewer.yaw <= y0 {
		t.Errorf("yaw %v should advance past %v", m.viewer.yaw, y0)
	}

	m, _ = step(m, keyPress(" ")) // pause
	y1 := m.viewer.yaw
	m, _ = step(m, frameTickMsg{})
	if m.viewer.yaw != y1 {
		t.Error("paused viewer must not rotate")
	}
}

func TestZoomBounds(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("3"))
	for i := 0; i < 50; i++ {
		m, _ = step(m, keyPress("+"))
	}
	if m.viewer.distance < MinDistance {
		t.Errorf("distance %.2f below MinDistance %.2f", m.viewer.distance, MinDistance)
	}
	for i := 0; i < 100; i++ {
		m, _ = step(m, keyPress("-"))
	}
	if m.viewer.distance > MaxDistance {
		t.Errorf("distance %.2f above MaxDistance %.2f", m.viewer.distance, MaxDistance)
	}
}

func TestEnteringViewerRequestsModelOnce(t *testing.T) {
	requests := 0
	m := New(Config{OnModelRequest: func() { requests++ }})
	m, _ = step(m, contentLoadedMsg{content: sampleContent()})
	m, _ = step(m, keyPress("3"))
	if requests != 1 {
		t.Fatalf("model requested %d times, want 1", requests)
	}
	m, _ = step(m, keyPress("4"))
	m, _ = step(m, keyPress("3"))
	if requests != 1 {
		t.Errorf("model re-requested on revisit (%d), want cached", requests)
	}
}

func TestModelReadyRendersPoints(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("3"))
	m.modelRequested = true
	m, _ = step(m, modelReadyMsg{points: []model3d.Point{
		{Pos: [3]float32{-1, 0, 0}, Normal: [3]float32{0, 0, -1}},
		{Pos: [3]float32{1, 0, 0}, Normal: [3]float32{0, 0, -1}},
	}})
	if len(m.viewer.points) != 2 {
		t.Fatalf("points not stored")
	}
	if !strings.Contains(m.View(), "#") && !strings.Contains(m.View(), ":") && !strings.Contains(m.View(), "*") {
		t.Error("viewer view should contain shaded glyphs")
	}
}

func TestModelProgressFormatsPercent(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("3"))
	m, _ = step(m, modelProgressMsg{written: 32000000, total: 64000000})
	if m.viewer.progress != "50%" {
		t.Errorf("progress = %q, want %q", m.viewer.progress, "50%")
	}
	v := m.View()
	if !strings.Contains(v, "50%") {
		t.Error("View() should display progress percentage while loading")
	}
}

func TestFeatureCardNavigation(t *testing.T) {
	m := loaded()
	m, _ = step(m, keyPress("2"))
	if m.featureCursor != 0 {
		t.Fatalf("cursor starts at %d, want 0", m.featureCursor)
	}
	m, _ = step(m, keyPress("j"))
	if m.featureCursor != 1 {
		t.Errorf("cursor = %d, want 1 after j", m.featureCursor)
	}
	m, _ = step(m, keyPress("down"))
	m, _ = step(m, keyPress("down")) // clamp at last card (3 features → max 2)
	if m.featureCursor != 2 {
		t.Errorf("cursor = %d, want clamped to 2", m.featureCursor)
	}
}

// --- helpers ---

func step(m Model, msg tea.Msg) (Model, tea.Cmd) {
	nm, cmd := m.Update(msg)
	return nm.(Model), cmd
}

func loaded() Model {
	m := New(Config{})
	m, _ = step(m, contentLoadedMsg{content: sampleContent()})
	return m
}
