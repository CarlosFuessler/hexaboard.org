// Package ui implements the HexaTUI bubbletea application: a boot
// screen, tabbed site panes and an ASCII 3D viewer over a matrix-rain
// background.
package ui

import (
	"time"

	"hexaboard.org/tui/internal/content"
	"hexaboard.org/tui/internal/model3d"

	tea "github.com/charmbracelet/bubbletea"
)

// State is the top-level app state.
type State int

const (
	StateBoot State = iota
	StateMain
)

// Tab identifies a main-view pane.
type Tab int

const (
	TabHero Tab = iota
	TabFeatures
	TabViewer
	TabSpecs
	tabCount
)

// Zoom bounds mirror the website's OrbitControls limits.
const (
	MinDistance = 2.0
	MaxDistance = 12.0
)

// Message pacing.
const (
	rainInterval   = 66 * time.Millisecond // ~15 fps
	frameInterval  = 33 * time.Millisecond // ~30 fps
	typeInterval   = 90 * time.Millisecond // matches web typing card
	typePauseTicks = 16                    // hold completed line, then restart
)

type (
	contentLoadedMsg struct {
		content content.Content
		err     error
	}
	typeTickMsg      struct{}
	tickMsg          struct{}
	frameTickMsg     struct{}
	modelProgressMsg struct{ written, total int64 }
	modelReadyMsg    struct {
		points  []model3d.Point
		err     error
		offline bool
	}
)

// Config wires app-level side effects without coupling the model to IO.
type Config struct {
	// OnRefresh is invoked when the user presses 'r'.
	OnRefresh func()
	// OnModelRequest is invoked once when the user first opens the
	// viewer tab; the app should start the OBJ download.
	OnModelRequest func()
}

type viewerState struct {
	yaw       float64
	pitch     float64
	distance  float64
	paused    bool
	points    []model3d.Point
	requested bool
	loading   bool
	progress  string
	fallback  bool
}

// Model is the bubbletea application model.
type Model struct {
	cfg    Config
	state  State
	tab    Tab
	err    error
	data   *content.Content
	width  int
	height int

	typed          int
	featureCursor  int
	viewer         viewerState
	drops          []int
	modelRequested bool
}

// New builds the initial model.
func New(cfg Config) Model {
	return Model{
		cfg:    cfg,
		state:  StateBoot,
		width:  80,
		height: 24,
		viewer: viewerState{distance: 6},
	}
}

// Init starts the animation clocks.
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		tickCmd(rainInterval),
		frameTickCmd(),
		typeTickCmd(),
	)
}

func tickCmd(d time.Duration) tea.Cmd {
	return tea.Tick(d, func(time.Time) tea.Msg { return tickMsg{} })
}

func frameTickCmd() tea.Cmd {
	return tea.Tick(frameInterval, func(time.Time) tea.Msg { return frameTickMsg{} })
}

func typeTickCmd() tea.Cmd {
	return tea.Tick(typeInterval, func(time.Time) tea.Msg { return typeTickMsg{} })
}

// ContentLoaded injects fetched site content (called by main).
func ContentLoaded(c content.Content, err error) tea.Msg {
	return contentLoadedMsg{content: c, err: err}
}

// ModelReady injects the sampled point cloud (called by main).
func ModelReady(points []model3d.Point, err error, offline bool) tea.Msg {
	return modelReadyMsg{points: points, err: err, offline: offline}
}

// ModelProgress reports OBJ download progress (called by main).
func ModelProgress(written, total int64) tea.Msg {
	return modelProgressMsg{written: written, total: total}
}

func (m Model) typedLen() int { return m.typed }

// Update handles all messages.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		// Floor degenerate sizes (some ptys report 0x0).
		m.width = max(msg.Width, 40)
		m.height = max(msg.Height, 14)
		m.drops = nil
		return m, nil

	case tickMsg:
		m.advanceRain()
		return m, tickCmd(rainInterval)

	case typeTickMsg:
		if m.state == StateMain {
			m.typed++
		}
		return m, typeTickCmd()

	case frameTickMsg:
		if m.state == StateMain && m.tab == TabViewer && !m.viewer.paused {
			m.viewer.yaw += 0.05
		}
		return m, frameTickCmd()

	case contentLoadedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		c := msg.content
		m.data = &c
		m.state = StateMain
		m.tab = TabHero
		m.typed = 0
		m.drops = nil
		return m, nil

	case modelProgressMsg:
		m.viewer.loading = true
		m.viewer.progress = formatProgress(msg.written, msg.total)
		return m, nil

	case modelReadyMsg:
		m.viewer.loading = false
		m.viewer.progress = ""
		if msg.err != nil {
			m.viewer.fallback = true
			m.err = msg.err
			return m, nil
		}
		m.viewer.points = msg.points
		m.viewer.fallback = false
		return m, nil

	case tea.KeyMsg:
		return m.handleKey(msg)
	}
	return m, nil
}

func (m Model) handleKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c", "q":
		return m, tea.Quit

	case "r":
		if m.cfg.OnRefresh != nil {
			m.err = nil
			m.cfg.OnRefresh()
		}
		return m, nil

	case "left":
		if m.state == StateMain {
			m.tab = (m.tab + tabCount - 1) % tabCount
			m.enteredTab()
		}
		return m, nil

	case "right":
		if m.state == StateMain {
			m.tab = (m.tab + 1) % tabCount
			m.enteredTab()
		}
		return m, nil

	case "1", "2", "3", "4":
		if m.state == StateMain {
			m.tab = Tab(msg.String()[0] - '1')
			m.enteredTab()
		}
		return m, nil
	}

	if m.state != StateMain {
		return m, nil
	}

	switch m.tab {
	case TabFeatures:
		max := 0
		if m.data != nil {
			max = len(m.data.Features) - 1
		}
		switch msg.String() {
		case "j", "down":
			if m.featureCursor < max {
				m.featureCursor++
			}
		case "k", "up":
			if m.featureCursor > 0 {
				m.featureCursor--
			}
		}

	case TabViewer:
		switch msg.String() {
		case " ":
			m.viewer.paused = !m.viewer.paused
		case "+", "=":
			m.viewer.distance = maxF(MinDistance, m.viewer.distance-0.5)
		case "-":
			m.viewer.distance = minF(MaxDistance, m.viewer.distance+0.5)
		}
	}
	return m, nil
}

// enteredTab runs side effects whenever the active tab changes.
func (m *Model) enteredTab() {
	if m.tab == TabViewer && !m.modelRequested {
		m.modelRequested = true
		m.viewer.requested = true
		m.viewer.loading = true
		if m.cfg.OnModelRequest != nil {
			m.cfg.OnModelRequest()
		}
	}
}

func (m Model) advanceRain() {
	cols := m.width / 2
	if m.drops == nil {
		m.drops = make([]int, cols)
		for i := range m.drops {
			m.drops[i] = -((i * 7) % (m.height + 10))
		}
	}
	for i := range m.drops {
		m.drops[i]++
		if m.drops[i] > m.height+8 {
			m.drops[i] = -((i * 13) % 20)
		}
	}
}

func formatProgress(written, total int64) string {
	if total > 0 {
		pct := int(100 * written / total)
		if pct > 100 {
			pct = 100
		}
		return fmtProgress(pct)
	}
	return fmtBytes(written)
}

func maxF(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func minF(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
