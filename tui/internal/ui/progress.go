package ui

import "fmt"

func fmtProgress(pct int) string { return fmt.Sprintf("%d%%", pct) }

func fmtBytes(n int64) string {
	switch b := float64(n); {
	case b > 1<<20:
		return fmt.Sprintf("%.1fMB", b/(1<<20))
	case b > 1<<10:
		return fmt.Sprintf("%.0fkB", b/(1<<10))
	default:
		return fmt.Sprintf("%dB", n)
	}
}
