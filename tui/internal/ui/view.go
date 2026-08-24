package ui

import (
	"fmt"
	"math"
	"strings"

	"hexaboard.org/tui/internal/model3d"
	"hexaboard.org/tui/internal/render"

	"github.com/charmbracelet/lipgloss"
)

var (
	accent    = lipgloss.Color("#22c55e")
	dimText   = lipgloss.AdaptiveColor{Light: "#555555", Dark: "#666666"}
	faintText = lipgloss.AdaptiveColor{Light: "#888888", Dark: "#444444"}

	styleLogo    = lipgloss.NewStyle().Foreground(accent).Bold(true)
	styleAccent  = lipgloss.NewStyle().Foreground(accent)
	styleTitle   = lipgloss.NewStyle().Foreground(lipgloss.Color("#ffffff")).Bold(true)
	styleBody    = lipgloss.NewStyle().Foreground(lipgloss.Color("#cccccc"))
	styleDim     = lipgloss.NewStyle().Foreground(dimText)
	styleFaint   = lipgloss.NewStyle().Foreground(faintText)
	styleTabOn   = lipgloss.NewStyle().Foreground(lipgloss.Color("#000000")).Background(accent).Bold(true).Padding(0, 1)
	styleTabOff  = lipgloss.NewStyle().Foreground(dimText).Padding(0, 1)
	stylePane    = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(accent).Padding(1, 2)
	styleSelPane = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("#4ade80")).Padding(1, 2)
)

const logo = `
 _  _ ____ _    ___  _  _ ___  ____ ____
 |__| |__| |    |__> |-:_ |__> |=== |___
`

// View renders the current frame.
func (m Model) View() string {
	w := max(20, m.width)
	h := max(8, m.height)
	rain := renderRain(w, h, m.drops)

	var ui string
	if m.state == StateBoot {
		ui = m.bootView()
	} else {
		ui = m.mainView()
	}
	return overlay(rain, ui, w, h)
}

func (m Model) bootView() string {
	lines := []string{}
	for _, l := range strings.Split(strings.Trim(logo, "\n"), "\n") {
		lines = append(lines, styleLogo.Render(l))
	}
	lines = append(lines, "")

	switch {
	case m.err != nil:
		lines = append(lines,
			styleTitle.Render("connection failed"),
			styleDim.Render(errText(m.err)),
			styleAccent.Render("[r] retry"),
		)
	case m.data != nil:
		lines = append(lines, styleAccent.Render("ready"))
	default:
		lines = append(lines, styleDim.Render("loading content…"))
	}

	block := lipgloss.JoinVertical(lipgloss.Center, lines...)
	return lipgloss.Place(m.width, m.height, lipgloss.Center, lipgloss.Center, block)
}

func (m Model) mainView() string {
	tabs := make([]string, 0, int(tabCount))
	for i := TabHero; i < tabCount; i++ {
		label := []string{"1:Hero", "2:Features", "3:Viewer", "4:Specs"}[i]
		if i == m.tab {
			tabs = append(tabs, styleTabOn.Render(label))
		} else {
			tabs = append(tabs, styleTabOff.Render(label))
		}
	}

	header := lipgloss.JoinHorizontal(lipgloss.Center,
		styleLogo.Render(" HEXABOARD "),
		lipgloss.NewStyle().Width(m.width-24).Align(lipgloss.Right).Render(styleFaint.Render("⌘ hexaboard.org")),
	)

	body := m.paneView()
	footer := styleFaint.Render("↑↓ scroll · ←→ tab · r refresh · space pause · q quit")

	contentBlock := lipgloss.JoinVertical(lipgloss.Left,
		header,
		lipgloss.JoinHorizontal(lipgloss.Center, tabs...),
		body,
		footer,
	)
	return lipgloss.Place(m.width, m.height, lipgloss.Center, lipgloss.Center, contentBlock)
}

func (m Model) paneView() string {
	innerW := min(m.width-6, 100)
	innerH := min(m.height-9, 40)
	if innerW < 20 || innerH < 4 {
		return ""
	}

	var body string
	switch m.tab {
	case TabHero:
		body = m.heroPane(innerW)
	case TabFeatures:
		body = m.featuresPane(innerW)
	case TabViewer:
		body = m.viewerPane(innerW, innerH)
	case TabSpecs:
		body = m.specsPane(innerW)
	}
	return stylePane.Render(body)
}

func (m Model) heroPane(w int) string {
	c := m.data.Hero
	line := c.TypingLines[0]
	shown := line
	if m.typed < len(line) {
		shown = line[:m.typed] + "█"
	}
	typed := styleAccent.Render("> " + shown)

	var links []string
	for _, l := range m.data.Links {
		links = append(links, styleBody.Render("→ "+l.Label+": "+l.URL))
	}
	return lipgloss.JoinVertical(lipgloss.Left,
		styleAccent.Render(c.Eyebrow),
		"",
		styleTitle.Render(c.Title),
		styleBody.Render(c.Tagline),
		"",
		typed,
		"",
		strings.Join(links, "\n"),
	)
}

func (m Model) featuresPane(w int) string {
	var cards []string
	for i, f := range m.data.Features {
		title := styleTitle.Render(f.Title)
		desc := styleDim.Render(f.Description)
		card := title + "\n" + desc
		if i == m.featureCursor {
			cards = append(cards, styleSelPane.Render(card))
		} else {
			cards = append(cards, stylePane.Render(card))
		}
	}
	return strings.Join(cards, "\n")
}

func (m Model) viewerPane(w, h int) string {
	head := "// 3d viewer"
	switch {
	case m.viewer.fallback:
		return styleAccent.Render(head) + "\n\n" +
			styleDim.Render(hexFallback(h)) + "\n" +
			styleFaint.Render("model unavailable — procedural fallback board")
	case m.viewer.loading:
		status := "downloading model…"
		if m.viewer.progress != "" {
			status += " " + m.viewer.progress
		}
		return styleAccent.Render(head) + "\n\n" + styleDim.Render(status)
	case len(m.viewer.points) > 0:
		frame := render.Render(m.viewer.points, render.Params{
			Width:    w - 4,
			Height:   h - 3,
			Yaw:      m.viewer.yaw,
			Pitch:    m.viewer.pitch,
			Distance: m.viewer.distance,
		})
		state := "rotating"
		if m.viewer.paused {
			state = "paused"
		}
		return styleAccent.Render(head) + "\n" +
			greenFrame(frame.String()) + "\n" +
			styleFaint.Render(state+fmt.Sprintf(" · dist %.1f · +/- zoom", m.viewer.distance))
	default:
		return styleAccent.Render(head) + "\n\n" + styleDim.Render("no geometry")
	}
}

// greenFrame tints every glyph with the accent color while preserving
// spacing (spaces stay unstyled so the rain shows through).
func greenFrame(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r == ' ' || r == '\n' {
			b.WriteRune(r)
			continue
		}
		b.WriteString(styleAccent.Render(string(r)))
	}
	return b.String()
}

func (m Model) specsPane(w int) string {
	rows := make([]string, 0, len(m.data.Specs)+1)
	rows = append(rows, styleTitle.Render("Technical Details"), "")
	for _, s := range m.data.Specs {
		label := styleDim.Render(pad(s.Label, 14))
		rows = append(rows, label+" "+styleBody.Render(s.Value))
	}
	return strings.Join(rows, "\n")
}

func pad(s string, n int) string {
	for len(s) < n {
		s += " "
	}
	return s
}

// errText shortens an error for one-line display.
func errText(err error) string {
	s := err.Error()
	if len(s) > 60 {
		s = s[:57] + "..."
	}
	return s
}

// hexFallback generates a small procedural point cloud shaped like the
// hexaboard outline for offline viewing.
func hexFallback(h int) string {
	pts := hexPoints()
	frame := render.Render(pts, render.Params{
		Width:    46,
		Height:   clampInt(h-4, 8, 30),
		Distance: 7,
	})
	return frame.String()
}

func hexPoints() []model3d.Point {
	var pts []model3d.Point
	norm := func(x, y, z float64) model3d.Point {
		return model3d.Point{
			Pos:    [3]float32{float32(x), float32(y), float32(z)},
			Normal: [3]float32{0, 0.3, -0.95},
		}
	}
	radius := 2.5
	for i := 0; i < 360; i += 2 {
		a := float64(i) * math.Pi / 180
		// Hexagon outline (two layers for depth).
		hr := math.Round(radius/0.9) * 0.9
		pts = append(pts, norm(hr*math.Cos(a), hr*math.Sin(a), -0.15), norm(hr*math.Cos(a), hr*math.Sin(a), 0.15))
	}
	for i := 0; i < 90; i++ {
		a := 2 * math.Pi * float64(i) / 90
		pts = append(pts, norm(0.35*math.Cos(a), 0.35*math.Sin(a), 0)) // center hub
	}
	return pts
}

func clampInt(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// overlay composites the UI block centered on top of the rain grid.
// Rows occupied by the UI replace rain rows entirely (panels read as
// solid glass); untouched rows keep the falling glyphs visible.
func overlay(bg []string, fg string, w, h int) string {
	fgLines := strings.Split(fg, "\n")
	if len(fgLines) > h {
		fgLines = fgLines[:h]
	}
	oy := (h - len(fgLines)) / 2

	out := make([]string, len(bg))
	copy(out, bg)

	for i, fl := range fgLines {
		y := oy + i
		if y < 0 || y >= len(out) || fl == "" {
			continue
		}
		fw := lipgloss.Width(fl)
		ox := max(0, (w-fw)/2)
		bgRow := out[y]
		bw := lipgloss.Width(bgRow)

		var row string
		switch {
		case ox > 0 && ox < bw:
			cut := min(ox+fw, bw)
			left := substringByWidth(bgRow, 0, ox)
			right := substringByWidth(bgRow, cut, bw-cut)
			row = left + fl + right
		case ox >= bw:
			padStr := strings.Repeat(" ", ox-bw)
			row = bgRow + padStr + fl
		default: // fg wider than screen at this offset
			row = substringByWidth(fl, 0, w)
		}
		out[y] = row
	}
	return strings.Join(out, "\n")
}

// substringByWidth returns the portion of s starting at visual column x,
// spanning up to n columns, ANSI-sequence aware via lipgloss width.
func substringByWidth(s string, x, n int) string {
	if x <= 0 && n >= lipgloss.Width(s) {
		return s
	}
	var b strings.Builder
	col := 0
	inEscape := false
	for _, r := range s {
		if inEscape {
			b.WriteRune(r)
			if r == 'm' {
				inEscape = false
			}
			continue
		}
		if r == '\x1b' {
			inEscape = true
			b.WriteRune(r)
			continue
		}
		rw := lipgloss.Width(string(r))
		if col >= x && col < x+n {
			b.WriteRune(r)
		}
		col += rw
		if col >= x+n {
			break
		}
	}
	return b.String()
}
