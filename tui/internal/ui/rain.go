package ui

import "math/rand"

// rainCharset mirrors the site's MatrixRain glyph pool.
const rainCharset = "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789"

const rainTrail = 12

var rng = rand.New(rand.NewSource(1))

// renderRain draws the falling-glyph background onto a w×h grid.
// drops[i] is the head row of column i (<0 means not yet entered).
func renderRain(w, h int, drops []int) []string {
	grid := make([][]rune, h)
	for y := range grid {
		grid[y] = make([]rune, w)
		for x := range grid[y] {
			grid[y][x] = ' '
		}
	}
	if drops == nil {
		return runeGridToStrings(grid)
	}

	for col := 0; col < len(drops); col++ {
		head := drops[col]
		x := col * 2
		if x >= w {
			continue
		}
		for t := 0; t < rainTrail; t++ {
			y := head - t
			if y < 0 || y >= h {
				continue
			}
			ch := rune(rainCharset[rng.Intn(len(rainCharset))])
			grid[y][x] = ch
		}
	}
	return runeGridToStrings(grid)
}

func runeGridToStrings(grid [][]rune) []string {
	out := make([]string, len(grid))
	for i, row := range grid {
		out[i] = string(row)
	}
	return out
}
