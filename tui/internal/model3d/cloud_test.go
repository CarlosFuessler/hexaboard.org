package model3d

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

func TestCloudSaveLoadRoundtrip(t *testing.T) {
	want := []Point{
		{Pos: [3]float32{1.5, -2.25, 3.75}, Normal: [3]float32{0, 0.6, -0.8}},
		{Pos: [3]float32{-7, 8, 9}, Normal: [3]float32{1, 0, 0}},
	}
	dir := t.TempDir()
	path := filepath.Join(dir, "model.bin")

	if err := SaveCloud(path, want); err != nil {
		t.Fatalf("SaveCloud() unexpected error: %v", err)
	}
	got, err := LoadCloud(path)
	if err != nil {
		t.Fatalf("LoadCloud() unexpected error: %v", err)
	}
	if len(got) != len(want) {
		t.Fatalf("loaded %d points, want %d", len(got), len(want))
	}
	for i := range want {
		if got[i].Pos != want[i].Pos || got[i].Normal != want[i].Normal {
			t.Errorf("point %d = %+v, want %+v", i, got[i], want[i])
		}
	}
}

func TestLoadCloudRejectsBadMagic(t *testing.T) {
	path := filepath.Join(t.TempDir(), "model.bin")
	if err := os.WriteFile(path, bytes.Repeat([]byte{0}, 32), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := LoadCloud(path); err == nil {
		t.Fatal("LoadCloud() expected error for bad magic")
	}
}

func TestLoadCloudMissingFile(t *testing.T) {
	if _, err := LoadCloud(filepath.Join(t.TempDir(), "nope.bin")); err == nil {
		t.Fatal("LoadCloud() expected error for missing file")
	}
}
