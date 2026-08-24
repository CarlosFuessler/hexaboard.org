package content

import (
	"encoding/json"
	"fmt"
)

// Link is an external link shown in the hero pane.
type Link struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

// Spec is a single key/value hardware specification.
type Spec struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// Feature is one product feature card.
type Feature struct {
	Icon        string `json:"icon"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Hero holds the landing headline copy.
type Hero struct {
	Eyebrow     string   `json:"eyebrow"`
	Title       string   `json:"title"`
	Tagline     string   `json:"tagline"`
	TypingLines []string `json:"typingLines"`
}

// Content mirrors the JSON payload served by GET /api/tui.
type Content struct {
	Version  int       `json:"version"`
	Hero     Hero      `json:"hero"`
	Features []Feature `json:"features"`
	Specs    []Spec    `json:"specs"`
	Links    []Link    `json:"links"`
}

func validate(c Content) error {
	if c.Version < 1 {
		return fmt.Errorf("content: unsupported version %d", c.Version)
	}
	if c.Hero.Title == "" {
		return fmt.Errorf("content: hero.title is required")
	}
	return nil
}

// Decode parses and validates a /api/tui JSON payload.
func Decode(data []byte) (Content, error) {
	var c Content
	if err := json.Unmarshal(data, &c); err != nil {
		return Content{}, fmt.Errorf("content: invalid JSON: %w", err)
	}
	if err := validate(c); err != nil {
		return Content{}, err
	}
	return c, nil
}
