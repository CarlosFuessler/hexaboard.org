package model3d

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"math"
	"os"
)

// cloudMagic identifies version 1 point-cloud cache files.
var cloudMagic = [4]byte{'H', 'X', 'P', 1}

// SaveCloud writes points to path in the compact binary cache format:
// magic (4B) | count (4B LE) | per point: pos[3]f32, normal[3]f32.
func SaveCloud(path string, points []Point) error {
	buf := make([]byte, 8+len(points)*24)
	copy(buf, cloudMagic[:])
	binary.LittleEndian.PutUint32(buf[4:], uint32(len(points)))

	off := 8
	for i := range points {
		for a := 0; a < 3; a++ {
			binary.LittleEndian.PutUint32(buf[off:], math.Float32bits(points[i].Pos[a]))
			off += 4
		}
		for a := 0; a < 3; a++ {
			binary.LittleEndian.PutUint32(buf[off:], math.Float32bits(points[i].Normal[a]))
			off += 4
		}
	}
	if err := os.WriteFile(path, buf, 0o644); err != nil {
		return fmt.Errorf("model3d: save cloud: %w", err)
	}
	return nil
}

// LoadCloud reads a cache file written by SaveCloud.
func LoadCloud(path string) ([]Point, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("model3d: load cloud: %w", err)
	}
	if len(data) < 8 || !bytes.Equal(data[:4], cloudMagic[:]) {
		return nil, fmt.Errorf("model3d: load cloud %s: bad file format", path)
	}
	n := binary.LittleEndian.Uint32(data[4:])
	if int(n)*24+8 != len(data) {
		return nil, fmt.Errorf("model3d: load cloud %s: truncated (%d points declared)", path, n)
	}

	points := make([]Point, n)
	off := 8
	for i := range points {
		for a := 0; a < 3; a++ {
			points[i].Pos[a] = math.Float32frombits(binary.LittleEndian.Uint32(data[off:]))
			off += 4
		}
		for a := 0; a < 3; a++ {
			points[i].Normal[a] = math.Float32frombits(binary.LittleEndian.Uint32(data[off:]))
			off += 4
		}
	}
	return points, nil
}
