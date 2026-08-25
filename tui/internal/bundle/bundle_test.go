package bundle

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

func TestWriterReaderRoundtrip(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "frames.bin")

	want := []Frame{
		{DelayMS: 66, Body: "\x1b[2J\x1b[H rain frame with unicode"},
		{DelayMS: 33, Body: "\x1b[H next frame"},
	}

	if err := Write(path, want, 1); err != nil {
		t.Fatalf("Write() unexpected error: %v", err)
	}
	got, boot, err := Read(path)
	if err != nil {
		t.Fatalf("Read() unexpected error: %v", err)
	}
	if boot != 1 {
		t.Errorf("boot count = %d, want 1", boot)
	}
	if len(got) != len(want) {
		t.Fatalf("Read() got %d frames, want %d", len(got), len(want))
	}
	for i := range want {
		if got[i].DelayMS != want[i].DelayMS || got[i].Body != want[i].Body {
			t.Errorf("frame %d = (%d, %q), want (%d, %q)",
				i, got[i].DelayMS, got[i].Body, want[i].DelayMS, want[i].Body)
		}
	}
}

func TestWriteEmptyFramesRejected(t *testing.T) {
	if err := Write(filepath.Join(t.TempDir(), "f.bin"), nil, 0); err == nil {
		t.Fatal("Write() expected error for empty frame list")
	}
}

func TestWriteBootOutOfRange(t *testing.T) {
	frames := []Frame{{DelayMS: 10, Body: "x"}}
	if err := Write(filepath.Join(t.TempDir(), "f.bin"), frames, 5); err == nil {
		t.Fatal("Write() expected error when boot count exceeds frames")
	}
}

func TestReadRejectsBadMagic(t *testing.T) {
	path := filepath.Join(t.TempDir(), "f.bin")
	if err := os.WriteFile(path, []byte("NOPE"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, _, err := Read(path); err == nil {
		t.Fatal("Read() expected error for bad magic")
	}
}

func TestReadRejectsTruncated(t *testing.T) {
	var buf bytes.Buffer
	frames := []Frame{{DelayMS: 10, Body: "0123456789"}}
	if err := writeBuf(&buf, frames, 0); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "f.bin")
	if err := os.WriteFile(path, buf.Bytes()[:buf.Len()-4], 0o644); err != nil {
		t.Fatal(err)
	}
	if _, _, err := Read(path); err == nil {
		t.Fatal("Read() expected error for truncated body")
	}
}
