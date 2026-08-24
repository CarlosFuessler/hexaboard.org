package content

import "testing"

func TestDecodeValidPayload(t *testing.T) {
	data := []byte(`{
		"version": 1,
		"hero": {"eyebrow": "// hi", "title": "Hexaboard", "tagline": "A board.", "typingLines": ["powered by zmk"]},
		"features": [{"icon": "zap", "title": "F", "description": "D"}],
		"specs": [{"label": "Layout", "value": "2x3"}],
		"links": [{"label": "GitHub", "url": "https://github.com/x/y"}]
	}`)
	got, err := Decode(data)
	if err != nil {
		t.Fatalf("Decode() unexpected error: %v", err)
	}
	if got.Version != 1 {
		t.Errorf("Version = %d, want 1", got.Version)
	}
	if got.Hero.Title != "Hexaboard" {
		t.Errorf("Hero.Title = %q, want %q", got.Hero.Title, "Hexaboard")
	}
	if len(got.Features) != 1 || got.Features[0].Icon != "zap" {
		t.Errorf("Features = %+v, want one feature with icon zap", got.Features)
	}
	if len(got.Specs) != 1 || got.Specs[0].Label != "Layout" {
		t.Errorf("Specs = %+v, want one spec labeled Layout", got.Specs)
	}
	if len(got.Links) != 1 || got.Links[0].URL != "https://github.com/x/y" {
		t.Errorf("Links = %+v, want one GitHub link", got.Links)
	}
}

func TestDecodeIgnoresUnknownFields(t *testing.T) {
	data := []byte(`{"version": 1, "hero": {"title": "X", "futureField": true}, "unknownTop": [1,2]}`)
	if _, err := Decode(data); err != nil {
		t.Fatalf("Decode() unexpected error: %v", err)
	}
}

func TestDecodeRejectsMissingTitle(t *testing.T) {
	data := []byte(`{"version": 1, "hero": {}}`)
	if _, err := Decode(data); err == nil {
		t.Fatal("Decode() expected error for hero.title, got nil")
	}
}

func TestDecodeRejectsMissingHero(t *testing.T) {
	data := []byte(`{"version": 1}`)
	if _, err := Decode(data); err == nil {
		t.Fatal("Decode() expected error for missing hero, got nil")
	}
}

func TestDecodeRejectsBadJSON(t *testing.T) {
	data := []byte(`{not json`)
	if _, err := Decode(data); err == nil {
		t.Fatal("Decode() expected error for invalid JSON, got nil")
	}
}
