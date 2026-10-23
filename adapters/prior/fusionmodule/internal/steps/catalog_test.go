package steps

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
)

// catalogBundle is a bundle holding one declared data file, catalog.json.
func catalogBundle(body []byte) *Bundle {
	return &Bundle{data: map[string][]byte{"catalog.json": body}}
}

// The shared fusion.catalog/v2 decode cases, asserted by LoadCatalog: the
// catalog suite asserts the same rows with render.ts checkCatalogDocument
// (catalog/src/__tests__/render.test.ts), so the renderer and the module
// accept and refuse the same documents.
func TestSharedCatalogDecodeCases(t *testing.T) {
	body, err := os.ReadFile(filepath.Join(fixture.CatalogDir(t), "testdata", "catalog-decode-cases.v2.json"))
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Schema string `json:"schema"`
		Cases  []struct {
			Name     string          `json:"name"`
			Valid    *bool           `json:"valid"`
			Document json.RawMessage `json:"document"`
		} `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatalf("table: %v", err)
	}
	if table.Schema != "fusion.catalog-cases/v1" || len(table.Cases) == 0 {
		t.Fatalf("table schema %q with %d cases", table.Schema, len(table.Cases))
	}
	seen := map[string]bool{}
	for _, c := range table.Cases {
		if c.Name == "" || seen[c.Name] {
			t.Fatalf("case name %q is empty or repeated", c.Name)
		}
		seen[c.Name] = true
		t.Run(c.Name, func(t *testing.T) {
			if c.Valid == nil {
				t.Fatal("case carries no boolean valid")
			}
			_, err := LoadCatalog(catalogBundle(c.Document))
			if got := err == nil; got != *c.Valid {
				t.Errorf("valid=%v, want %v (%v)", got, *c.Valid, err)
			}
		})
	}
}

// The decoder keeps the entries in document order with their optional keys,
// and roles still resolve beside them.
func TestCatalogEntriesDecode(t *testing.T) {
	doc := `{
  "schema": "fusion.catalog/v2",
  "roles": [{"id": "alpha", "claude_name": "alpha", "prior_ids": ["alpha"], "aliases": [], "support": {"claude-code": "supported", "prior": "supported"}}],
  "entries": [
    {"id": "alpha", "kind": "agent", "profile": "alpha", "class": "plain",
     "arguments": {"items": [{"name": "task", "kind": "first-message", "required": true}]},
     "requires": [], "support": {"claude-code": "supported", "prior": "supported"}},
    {"id": "note", "kind": "skill", "profile": "skill-note", "class": "asks",
     "arguments": {"items": [{"name": "--only", "kind": "option", "required": false, "values": ["a"], "note": "n"}], "note": "m"},
     "requires": ["host.question.v1", "host.exec.v1"], "support": {"claude-code": "supported", "prior": "unsupported"}}
  ]
}`
	c, err := LoadCatalog(catalogBundle([]byte(doc)))
	if err != nil {
		t.Fatal(err)
	}
	entries := c.Entries()
	if len(entries) != 2 || entries[0].ID != "alpha" || entries[1].ID != "note" {
		t.Fatalf("entries %+v", entries)
	}
	note := entries[1]
	if note.Kind != "skill" || note.Profile != "skill-note" || note.Class != "asks" || note.Arguments.Note != "m" || len(note.Requires) != 2 || note.Support["prior"] != "unsupported" {
		t.Errorf("note %+v", note)
	}
	if a := note.Arguments.Items; len(a) != 1 || a[0].Name != "--only" || a[0].Kind != "option" || a[0].Required || len(a[0].Values) != 1 || a[0].Note != "n" {
		t.Errorf("note arguments %+v", a)
	}
	if a := entries[0].Arguments.Items; len(a) != 1 || !a[0].Required || a[0].Values != nil || a[0].Note != "" {
		t.Errorf("alpha arguments %+v", a)
	}
	if role, _, err := c.Resolve("alpha"); err != nil || role.ID != "alpha" {
		t.Errorf("alpha role: %+v %v", role, err)
	}
	entries[0].ID = "changed"
	if c.Entries()[0].ID != "alpha" {
		t.Error("Entries returned the catalog's own slice")
	}
	// Entry resolves by id whatever the support: refusing an unsupported
	// entry is the workflow's decision.
	if e, ok := c.Entry("note"); !ok || e.Profile != "skill-note" || e.Support["prior"] != "unsupported" {
		t.Errorf("Entry(note) = %+v, %v", e, ok)
	}
	if _, ok := c.Entry("skill-note"); ok {
		t.Error("Entry resolved a profile id as an entry id")
	}
}
