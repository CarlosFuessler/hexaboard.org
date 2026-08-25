// Package bundle writes and reads the pre-rendered TUI frame files
// served by the /tui streaming endpoint.
package bundle

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"os"
)

var magic = [5]byte{'H', 'X', 'T', 2, 1}

// Frame is one pre-rendered screen and how long it should be shown.
type Frame struct {
	DelayMS uint32
	Body    string
}

// Write encodes frames to path:
// magic (5B) | boot count (4B LE) | frame count (4B LE) |
// per frame: delay (4B LE), len (4B LE), body.
// The first bootCount frames play once; the rest loop forever.
func Write(path string, frames []Frame, bootCount int) error {
	if len(frames) == 0 {
		return fmt.Errorf("bundle: no frames to write")
	}
	if bootCount < 0 || bootCount > len(frames) {
		return fmt.Errorf("bundle: boot count %d out of range (%d frames)", bootCount, len(frames))
	}
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("bundle: create %s: %w", path, err)
	}
	defer f.Close()
	if err := writeBuf(f, frames, bootCount); err != nil {
		return fmt.Errorf("bundle: write %s: %w", path, err)
	}
	return nil
}

func writeBuf(w io.Writer, frames []Frame, bootCount int) error {
	if _, err := w.Write(magic[:]); err != nil {
		return err
	}
	var hdr [4]byte
	binary.LittleEndian.PutUint32(hdr[:], uint32(bootCount))
	if _, err := w.Write(hdr[:]); err != nil {
		return err
	}
	binary.LittleEndian.PutUint32(hdr[:], uint32(len(frames)))
	if _, err := w.Write(hdr[:]); err != nil {
		return err
	}
	for i := range frames {
		body := []byte(frames[i].Body)
		binary.LittleEndian.PutUint32(hdr[:], frames[i].DelayMS)
		if _, err := w.Write(hdr[:]); err != nil {
			return err
		}
		binary.LittleEndian.PutUint32(hdr[:], uint32(len(body)))
		if _, err := w.Write(hdr[:]); err != nil {
			return err
		}
		if _, err := w.Write(body); err != nil {
			return err
		}
	}
	return nil
}

// Read decodes a bundle file, returning its frames and boot count.
func Read(path string) ([]Frame, int, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, 0, fmt.Errorf("bundle: read %s: %w", path, err)
	}
	frames, boot, err := Decode(data)
	if err != nil {
		return nil, 0, fmt.Errorf("bundle: read %s: %w", path, err)
	}
	return frames, boot, nil
}

// Decode parses bundle bytes.
func Decode(data []byte) ([]Frame, int, error) {
	if len(data) < 13 || !bytes.Equal(data[:5], magic[:]) {
		return nil, 0, fmt.Errorf("bundle: bad magic")
	}
	boot := int(binary.LittleEndian.Uint32(data[5:9]))
	count := binary.LittleEndian.Uint32(data[9:13])
	pos := 13
	frames := make([]Frame, 0, count)
	for i := uint32(0); i < count; i++ {
		if pos+8 > len(data) {
			return nil, 0, fmt.Errorf("bundle: truncated frame %d header", i)
		}
		delay := binary.LittleEndian.Uint32(data[pos:])
		size := binary.LittleEndian.Uint32(data[pos+4:])
		pos += 8
		if pos+int(size) > len(data) {
			return nil, 0, fmt.Errorf("bundle: truncated frame %d body", i)
		}
		frames = append(frames, Frame{DelayMS: delay, Body: string(data[pos : pos+int(size)])})
		pos += int(size)
	}
	if boot > len(frames) {
		return nil, 0, fmt.Errorf("bundle: boot count %d exceeds %d frames", boot, len(frames))
	}
	return frames, boot, nil
}
