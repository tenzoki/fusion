package steps

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
)

// schemaCase is one row of a shared case table under catalog/testdata/.
type schemaCase struct {
	Name     string          `json:"name"`
	Schema   string          `json:"schema"`
	Pointer  string          `json:"pointer"`
	Document json.RawMessage `json:"document"`
	Valid    *bool           `json:"valid"`
}

// The shared schema contract cases, asserted by this validator: the catalog's
// ajv suite (catalog/src/__tests__/schema-cases.test.ts) asserts the same rows
// of the same tables, so a keyword this subset validator reads differently
// from a full draft 2020-12 validator turns one of the two suites red. The
// repair table covers the frozen repair schemas, the entry table the two
// entry.v1 schemas.
func TestSharedSchemaCases(t *testing.T) {
	for _, table := range []string{"repair-schema-cases.v1.json", "entry-schema-cases.v1.json"} {
		t.Run(table, func(t *testing.T) { runSchemaCases(t, table) })
	}
}

func runSchemaCases(t *testing.T, file string) {
	dir := fixture.CatalogDir(t)
	body, err := os.ReadFile(filepath.Join(dir, "testdata", file))
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Schema string       `json:"schema"`
		Cases  []schemaCase `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatalf("table: %v", err)
	}
	if table.Schema != "fusion.schema-cases/v1" {
		t.Fatalf("table schema %q, want fusion.schema-cases/v1", table.Schema)
	}
	if len(table.Cases) == 0 {
		t.Fatal("table holds no cases")
	}

	compiled := map[string]*Schema{}
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
			// CompileSchema compiles a root document only; a pointer into
			// $defs would be asserted by ajv alone.
			if c.Pointer != "" {
				t.Fatalf("pointer %q: only the root pointer is supported", c.Pointer)
			}
			s, ok := compiled[c.Schema]
			if !ok {
				raw, err := os.ReadFile(filepath.Join(dir, "schemas", c.Schema))
				if err != nil {
					t.Fatal(err)
				}
				if s, err = CompileSchema(raw); err != nil {
					t.Fatalf("%s: %v", c.Schema, err)
				}
				compiled[c.Schema] = s
			}
			doc, err := Parse(c.Document)
			if err != nil {
				t.Fatalf("document: %v", err)
			}
			verr := s.Validate(doc)
			if got := verr == nil; got != *c.Valid {
				t.Errorf("%s: valid=%v, want %v (violation: %v)", c.Schema, got, *c.Valid, verr)
			}
		})
	}
}
