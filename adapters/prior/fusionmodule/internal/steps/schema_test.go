package steps

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
)

func stringsReader(s string) *strings.Reader { return strings.NewReader(s) }

func mustCompile(t *testing.T, schema string) *Schema {
	t.Helper()
	s, err := CompileSchema([]byte(schema))
	if err != nil {
		t.Fatalf("compile %s: %v", schema, err)
	}
	return s
}

func check(t *testing.T, s *Schema, body string, wantKeyword string) {
	t.Helper()
	v, err := Parse([]byte(body))
	if err != nil {
		t.Fatalf("parse %s: %v", body, err)
	}
	err = s.Validate(v)
	if wantKeyword == "" {
		if err != nil {
			t.Errorf("%s: unexpected violation %v", body, err)
		}
		return
	}
	var viol *Violation
	if !errors.As(err, &viol) || viol.Keyword != wantKeyword {
		t.Errorf("%s: want violation %s, got %v", body, wantKeyword, err)
	}
}

func TestSchemaKeywords(t *testing.T) {
	obj := mustCompile(t, `{"type":"object","additionalProperties":false,"required":["a"],"minProperties":1,"properties":{"a":{"type":"string","minLength":2,"pattern":"^x"},"n":{"type":"integer","minimum":1,"maximum":4},"l":{"type":"array","minItems":1,"maxItems":2,"uniqueItems":true,"items":{"type":"string"}},"e":{"enum":["p","q"]},"c":{"const":7},"u":{"type":["object","null"]}}}`)
	check(t, obj, `{"a":"xy"}`, "")
	check(t, obj, `{}`, "required")
	check(t, obj, `{"a":"xy","z":1}`, "additionalProperties")
	check(t, obj, `{"a":"x"}`, "minLength")
	check(t, obj, `{"a":"yy"}`, "pattern")
	check(t, obj, `{"a":"xy","n":1.5}`, "type")
	check(t, obj, `{"a":"xy","n":4.0}`, "")
	check(t, obj, `{"a":"xy","n":0}`, "minimum")
	check(t, obj, `{"a":"xy","n":5}`, "maximum")
	check(t, obj, `{"a":"xy","l":[]}`, "minItems")
	check(t, obj, `{"a":"xy","l":["a","b","c"]}`, "maxItems")
	check(t, obj, `{"a":"xy","l":["a","a"]}`, "uniqueItems")
	check(t, obj, `{"a":"xy","l":["a",1]}`, "type")
	check(t, obj, `{"a":"xy","e":"r"}`, "enum")
	check(t, obj, `{"a":"xy","c":7.0}`, "")
	check(t, obj, `{"a":"xy","c":8}`, "const")
	check(t, obj, `{"a":"xy","u":null}`, "")
	check(t, obj, `{"a":"xy","u":{}}`, "")
	check(t, obj, `{"a":"xy","u":1}`, "type")
	check(t, obj, `[]`, "type")
	check(t, obj, `{"a":"éé"}`, "pattern")
	check(t, obj, `{"a":"xé"}`, "")

	comb := mustCompile(t, `{"type":"object","properties":{"s":{"type":"string"}},"allOf":[{"if":{"type":"object","properties":{"s":{"const":"on"}}},"then":{"type":"object","required":["v"]},"else":{"type":"object","properties":{"v":{"type":"null"}}}}],"oneOf":[{"required":["s"]},{"required":["t"]}]}`)
	check(t, comb, `{"s":"on","v":1}`, "")
	check(t, comb, `{"s":"on"}`, "allOf")
	check(t, comb, `{"s":"off","v":null}`, "")
	check(t, comb, `{"s":"off","v":1}`, "allOf")
	check(t, comb, `{"s":"off","t":1,"v":null}`, "oneOf")
	check(t, comb, `{"v":null}`, "oneOf")

	always := mustCompile(t, `true`)
	check(t, always, `{"anything":1}`, "")
	never := mustCompile(t, `false`)
	check(t, never, `1`, "false")
}

func TestSchemaRefusesUnimplementedKeywords(t *testing.T) {
	for _, schema := range []string{
		`{"$ref":"#/$defs/x"}`,
		`{"$defs":{"x":{}}}`,
		`{"patternProperties":{"^a":{}}}`,
		`{"format":"uri"}`,
		`{"type":"blob"}`,
		`{"properties":{"a":{"maxLength":1}}}`,
		`{"anyOf":[{}]}`,
		`{"not":{}}`,
		`{"minLength":-1}`,
		`{"enum":[]}`,
		`1`,
	} {
		if _, err := CompileSchema([]byte(schema)); err == nil {
			t.Errorf("compiled %s", schema)
		}
	}
}

// The four shipped schemas compile, and the validator agrees with Prior's on
// the cases the contract names.
func TestShippedSchemas(t *testing.T) {
	dir := fixture.CatalogDir(t)
	load := func(name string) *Schema {
		body, err := os.ReadFile(filepath.Join(dir, "schemas", name+".v1.json"))
		if err != nil {
			t.Fatal(err)
		}
		s, err := CompileSchema(body)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		return s
	}
	request, roleInput, envelope, result := load("explorer-request"), load("explorer-role-input"), load("explorer-envelope"), load("explorer-result")

	input := fixture.RoleInput(t, dir, 4)
	check(t, roleInput, string(input), "")
	check(t, request, string(fixture.Invocation(t, "run-1", input, "")), "")
	check(t, request, string(fixture.Invocation(t, "run-1", input, "audit-7")), "")
	check(t, request, `{"run_id":"run-1","role_input":{"a":1},"audit_ref":""}`, "minLength")
	check(t, request, `{"run_id":"run-1","role_input":{"a":1},"mode":"x"}`, "additionalProperties")
	check(t, request, `{"run_id":"run-1","role_input":{}}`, "minProperties")
	check(t, request, `{"role_input":{"a":1}}`, "required")

	check(t, roleInput, string(fixture.RoleInput(t, dir, 5)), "maximum")
	check(t, roleInput, string(fixture.RoleInput(t, dir, 0)), "minimum")
	check(t, roleInput, `{"question":"q","path_scope":["a"],"findings_limit":1}`, "required")
	check(t, roleInput, `{"question":"q","path_scope":["a","a"],"findings_limit":1,"project_context":{"instructions":[]},"output_contract":{"$id":"x","type":"object","required":[],"properties":{}}}`, "uniqueItems")
	check(t, roleInput, `{"question":"q","path_scope":["a"],"findings_limit":1,"project_context":{"instructions":[{"path":"CLAUDE.md","sha256":"sha256:00","text":""}]},"output_contract":{"$id":"x","type":"object","required":[],"properties":{}}}`, "pattern")

	check(t, result, string(fixture.Answer(4)), "")
	check(t, result, string(fixture.Answer(5)), "")
	check(t, result, `{"answer":"","findings":[],"uncertainties":[]}`, "minLength")
	check(t, result, `{"answer":"a","findings":[],"uncertainties":[],"suggested_follow_up":"orchestrator"}`, "enum")
	check(t, result, `{"answer":"a","findings":[{"location":"x"}],"uncertainties":[]}`, "required")

	evidence := `{"run_id":"run-1","principal_id":"p","observed_at":"2026-10-11T09:30:00.123456789Z","role_state":"settled"}`
	check(t, envelope, `{"domain":{"status":"completed","result":`+string(fixture.Answer(1))+`,"violations":[]},"host_evidence":`+evidence+`}`, "")
	check(t, envelope, `{"domain":{"status":"completed","result":`+string(fixture.Answer(1))+`,"violations":[]},"host_evidence":null}`, "allOf")
	check(t, envelope, `{"domain":{"status":"completed","result":null,"violations":[]},"host_evidence":`+evidence+`}`, "allOf")
	check(t, envelope, `{"domain":{"status":"refused","result":null,"violations":[{"code":"x","detail":""}]},"host_evidence":null}`, "")
	check(t, envelope, `{"domain":{"status":"recovery-required","result":{},"violations":[]},"host_evidence":null}`, "allOf")
	check(t, envelope, `{"domain":{"status":"done","result":null,"violations":[]},"host_evidence":null}`, "enum")
	check(t, envelope, `{"domain":{"status":"refused","result":null,"violations":[]},"host_evidence":{"run_id":"r","principal_id":"p","observed_at":"yesterday","role_state":"settled"}}`, "oneOf")
}
