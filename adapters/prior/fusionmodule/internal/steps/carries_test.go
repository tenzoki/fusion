package steps

import (
	"strings"
	"testing"

	api "github.com/kai/prior/moduleapi/v1"
)

// Carries accepts the task with the named host members added, and refuses a
// changed task member, a missing one, and a member neither side named.
func TestCarries(t *testing.T) {
	task := []byte(`{"entry":{"id":"memo"},"arguments":[]}`)
	cases := map[string]struct {
		input string
		ok    bool
	}{
		"task and host members": {`{"workflow_id":"wf","entry":{"id":"memo"},"arguments":[],"project_context":{}}`, true},
		"task alone":            {`{"entry":{"id":"memo"},"arguments":[]}`, true},
		"changed member":        {`{"entry":{"id":"note"},"arguments":[]}`, false},
		"missing member":        {`{"entry":{"id":"memo"}}`, false},
		"unnamed member":        {`{"entry":{"id":"memo"},"arguments":[],"audit_ref":"a"}`, false},
		"not an object":         {`[]`, false},
	}
	for name, tc := range cases {
		parsed, err := Parse([]byte(tc.input))
		if err != nil {
			t.Fatal(err)
		}
		if err := Carries(parsed, task, "workflow_id", "project_context"); (err == nil) != tc.ok {
			t.Errorf("%s: %v", name, err)
		}
	}
}

// CheckRoleCalls refuses an input whose role call would outgrow the frame.
func TestCheckRoleCalls(t *testing.T) {
	id := api.Identity{ModuleID: "fusion", Version: "1.0.0", BundleDigest: "sha256:" + strings.Repeat("ab", 32)}
	if err := CheckRoleCalls(id, "run-1", "skill-memo", []byte(`{"a":1}`), "audit-1"); err != nil {
		t.Fatal(err)
	}
	big := []byte(`{"a":"` + strings.Repeat("x", api.DefaultMaxFrame) + `"}`)
	if err := CheckRoleCalls(id, "run-1", "skill-memo", big, ""); err == nil {
		t.Fatal("an oversize input passed")
	}
}
