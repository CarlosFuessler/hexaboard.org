package ui

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

func TestFullTabBarRendersAndViewerRequest(t *testing.T) {
	m := New(Config{})
	m, _ = step(m, tea.WindowSizeMsg{Width: 100, Height: 30})
	m, _ = step(m, contentLoadedMsg{content: sampleContent()})
	v := m.View()

	for _, want := range []string{"1:Hero", "2:Features", "3:Viewer", "4:Specs"} {
		if !strings.Contains(v, want) {
			t.Errorf("View() missing tab %q", want)
		}
	}

	m, _ = step(m, keyPress("3"))
	if m.tab != TabViewer {
		t.Fatalf("tab = %v, want TabViewer", m.tab)
	}
	if m.viewer.requested != true {
		t.Error("viewer.requested should be true after entering viewer")
	}
}
