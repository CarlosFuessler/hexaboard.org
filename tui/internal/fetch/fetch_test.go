package fetch

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

const fakeCurl = `#!/bin/bash
# Emits fixture body for GETs, headers for -I HEAD requests.
for arg in "$@"; do
  if [ "$arg" = "-I" ] || [ "$arg" = "--head" ]; then
    printf 'HTTP/2 200\r\ncontent-length: 11\r\n\r\n'
    exit 0
  fi
done
if [ "$FAIL" = "1" ]; then
  echo "curl: (22) The requested URL returned error: 404" >&2
  exit 22
fi
printf 'HELLOWORLD'
`

func newTestClient(t *testing.T) *Client {
	t.Helper()
	dir := t.TempDir()
	script := filepath.Join(dir, "curl")
	if err := os.WriteFile(script, []byte(fakeCurl), 0o755); err != nil {
		t.Fatal(err)
	}
	return &Client{CurlPath: script}
}

const fakeCurlChunked = `#!/bin/bash
# Emits fixture body for GETs, headers for -I HEAD requests.
for arg in "$@"; do
  if [ "$arg" = "-I" ] || [ "$arg" = "--head" ]; then
    printf 'HTTP/2 200\r\ncontent-length: 10\r\n\r\n'
    exit 0
  fi
done
for i in 1 2 3 4 5; do
  printf 'AB'
  sleep 0.05
done
`

func TestDownloadProgressIsCumulative(t *testing.T) {
	dir := t.TempDir()
	script := filepath.Join(dir, "curl")
	if err := os.WriteFile(script, []byte(fakeCurlChunked), 0o755); err != nil {
		t.Fatal(err)
	}
	c := &Client{CurlPath: script}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dest := filepath.Join(dir, "model.bin")
	var seen []int64
	err := c.Download(ctx, "http://example.test/m", dest, func(written, _ int64) {
		seen = append(seen, written)
	})
	if err != nil {
		t.Fatalf("Download() unexpected error: %v", err)
	}

	// Intermediates must be cumulative (2,4,6,8), not per-chunk sizes,
	// and the final report must equal the file size.
	if len(seen) < 3 {
		t.Fatalf("only %d progress calls, want several intermediates", len(seen))
	}
	mid := seen[:len(seen)-1]
	for i := 1; i < len(mid); i++ {
		if mid[i] <= mid[i-1] {
			t.Errorf("progress not monotonically increasing: %v", seen)
			break
		}
	}
	if maxMid := mid[len(mid)-1]; maxMid < 4 {
		t.Errorf("intermediate progress never accumulated (max %d), value receiver bug?", maxMid)
	}
	if last := seen[len(seen)-1]; last != 10 {
		t.Errorf("final progress = %d, want 10", last)
	}
}

func TestGetReturnsBody(t *testing.T) {
	c := newTestClient(t)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	got, err := c.Get(ctx, "http://example.test/api/tui")
	if err != nil {
		t.Fatalf("Get() unexpected error: %v", err)
	}
	if string(got) != "HELLOWORLD" {
		t.Errorf("Get() = %q, want %q", got, "HELLOWORLD")
	}
}

func TestGetSurfacesExitCodeAndStderr(t *testing.T) {
	c := newTestClient(t)
	c.Env = []string{"FAIL=1"}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := c.Get(ctx, "http://example.test/api/tui")
	var ferr *Error
	if !errors.As(err, &ferr) {
		t.Fatalf("Get() error = %v, want *fetch.Error", err)
	}
	if ferr.ExitCode != 22 {
		t.Errorf("ExitCode = %d, want 22", ferr.ExitCode)
	}
	if !strings.Contains(ferr.Stderr, "404") {
		t.Errorf("Stderr = %q, want mention of 404", ferr.Stderr)
	}
}

func TestDownloadWritesFileAndReportsProgress(t *testing.T) {
	c := newTestClient(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dest := filepath.Join(t.TempDir(), "model.bin")
	calls := 0
	lastWritten, lastTotal := int64(-1), int64(-1)
	err := c.Download(ctx, "http://example.test/model.obj", dest, func(written, total int64) {
		calls++
		lastWritten, lastTotal = written, total
	})
	if err != nil {
		t.Fatalf("Download() unexpected error: %v", err)
	}

	data, err := os.ReadFile(dest)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "HELLOWORLD" {
		t.Errorf("file = %q, want %q", data, "HELLOWORLD")
	}
	if calls == 0 || lastWritten != 10 || lastTotal != 11 {
		t.Errorf("progress calls=%d last=(%d,%d), want final (10,11)", calls, lastWritten, lastTotal)
	}
}
