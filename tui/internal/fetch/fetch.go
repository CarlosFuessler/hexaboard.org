// Package fetch shells out to curl for all HTTP operations so the
// user's system proxy/TLS configuration applies automatically.
package fetch

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
)

// Error is a typed failure from a curl invocation.
type Error struct {
	ExitCode int
	Stderr   string
	URL      string
}

func (e *Error) Error() string {
	msg := strings.TrimSpace(e.Stderr)
	if msg == "" {
		msg = "curl failed"
	}
	return fmt.Sprintf("fetch %s: %s", e.URL, msg)
}

// Client runs curl subprocesses.
type Client struct {
	// CurlPath overrides the curl binary; defaults to "curl" on PATH.
	CurlPath string
	// Env overrides the child environment (used by tests).
	Env []string
}

// New returns a Client using the system curl.
func New() *Client { return &Client{} }

func (c *Client) curlPath() string {
	if c.CurlPath != "" {
		return c.CurlPath
	}
	return "curl"
}

func (c *Client) baseArgs(timeout string) []string {
	return []string{"-fSsL", "--max-time", timeout}
}

// Get fetches the URL body via curl.
func (c *Client) Get(ctx context.Context, url string) ([]byte, error) {
	args := c.baseArgs("15")
	args = append(args, url)
	cmd := exec.CommandContext(ctx, c.curlPath(), args...)
	var stderr strings.Builder
	cmd.Stderr = &stderr
	if c.Env != nil {
		cmd.Env = c.Env
	}
	out, err := cmd.Output()
	if err != nil {
		var ee *exec.ExitError
		if asExit(err, &ee) {
			return nil, &Error{ExitCode: ee.ExitCode(), Stderr: stderr.String(), URL: url}
		}
		return nil, fmt.Errorf("fetch %s: %w", url, err)
	}
	return out, nil
}

// Download streams the URL to destPath, calling onProgress(written, total)
// as data lands. total comes from a HEAD preflight and may be -1 when the
// server does not advertise content-length. A final call with the exact
// written size is guaranteed on success.
func (c *Client) Download(ctx context.Context, url, destPath string, onProgress func(written, total int64)) error {
	total := int64(-1)
	if head, err := c.head(ctx, url); err == nil {
		total = head.contentLength
	}

	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("fetch %s: create %s: %w", url, destPath, err)
	}
	defer out.Close()

	args := append(c.baseArgs("600"), "-X", "GET", url)
	cmd := exec.CommandContext(ctx, c.curlPath(), args...)
	if c.Env != nil {
		cmd.Env = c.Env
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("fetch %s: %w", url, err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("fetch %s: %w", url, err)
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("fetch %s: start: %w", url, err)
	}

	written, copyErr := io.Copy(out, &countingReader{r: stdout, fn: func(n int64) {
		onProgress(n, total)
	}})
	if onProgress != nil {
		onProgress(written, total)
	}
	waitErr := cmd.Wait()
	if copyErr != nil {
		return fmt.Errorf("fetch %s: read body: %w", url, copyErr)
	}
	if waitErr != nil {
		var ee *exec.ExitError
		if asExit(waitErr, &ee) {
			slurp, _ := io.ReadAll(stderr)
			return &Error{ExitCode: ee.ExitCode(), Stderr: string(slurp), URL: url}
		}
		return fmt.Errorf("fetch %s: %w", url, waitErr)
	}
	return nil
}

type headResult struct {
	contentLength int64
}

func (c *Client) head(ctx context.Context, url string) (headResult, error) {
	args := append(c.baseArgs("10"), "-I", url)
	cmd := exec.CommandContext(ctx, c.curlPath(), args...)
	if c.Env != nil {
		cmd.Env = c.Env
	}
	out, err := cmd.Output()
	if err != nil {
		return headResult{}, err
	}
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if cl, ok := strings.CutPrefix(strings.ToLower(line), "content-length:"); ok {
			var n int64
			if _, err := fmt.Sscanf(strings.TrimSpace(cl), "%d", &n); err == nil {
				return headResult{contentLength: n}, nil
			}
		}
	}
	return headResult{}, fmt.Errorf("no content-length header")
}

// countingReader reports cumulative bytes read through fn.
type countingReader struct {
	r  io.Reader
	n  int64
	fn func(int64)
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	if n > 0 && c.fn != nil {
		c.n += int64(n)
		c.fn(c.n)
	}
	return n, err
}

func asExit(err error, target **exec.ExitError) bool {
	if e, ok := err.(*exec.ExitError); ok {
		*target = e
		return true
	}
	return false
}
