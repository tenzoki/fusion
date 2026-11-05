package controlrecord

import "testing"

// The rows name the cases of Prior's entryControlRecord and of
// TestEntryServicesControlRecordSelection at Prior 52a2703, and the files
// fusion's own hooks write under the workbench, which is what D-F1 read.
func TestSelectIsTheCodecsRule(t *testing.T) {
	for _, row := range []struct {
		path, record string
		ok           bool
	}{
		// The three names, wherever a store keeps them.
		{"fusion-workbench/package.json", "package.json", true},
		{"fusion-workbench/work-packages/a/package.json", "work-packages/a/package.json", true},
		{"fusion-workbench/shared/issues/x.record.json", "shared/issues/x.record.json", true},
		{"fusion-workbench/shared/reviews/x.evidence.json", "shared/reviews/x.evidence.json", true},
		{"fusion-workbench/shared/reviews/x.2.evidence.json", "shared/reviews/x.2.evidence.json", true},
		// Only the root's archive/ is archived.
		{"fusion-workbench/x/archive/package.json", "x/archive/package.json", true},

		// What the hooks write: JSON, and no record.
		{"fusion-workbench/.guard-state/staging-drift.json", "", false},
		{"fusion-workbench/.guard-state/citation-form.json", "", false},
		{"fusion-workbench/.guard-state/dispatch-map.json", "", false},
		// Another name.
		{"fusion-workbench/workbench.json", "", false},
		{"fusion-workbench/shared/x.json", "", false},
		{"fusion-workbench/shared/memos/notes.md", "", false},
		{"fusion-workbench/orchestrator-events.jsonl", "", false},
		{"fusion-workbench/x.package.json", "", false},
		// A dot segment, at any depth, the record's own name included.
		{"fusion-workbench/.json-state/x.json", "", false},
		{"fusion-workbench/.json-state/x.record.json", "", false},
		{"fusion-workbench/shared/.x/y.record.json", "", false},
		{"fusion-workbench/.record.json", "", false},
		// The root's archive/.
		{"fusion-workbench/archive/a/package.json", "", false},
		{"fusion-workbench/archive/old.record.json", "", false},
		// A character the host's read refuses.
		{"fusion-workbench/a:b.record.json", "", false},
		{`fusion-workbench/a\b.record.json`, "", false},
		{"fusion-workbench/a\x00b.record.json", "", false},
		{"fusion-workbench/a\tb.record.json", "", false},
		{"fusion-workbench/a\rb.record.json", "", false},
		{"fusion-workbench/a\nb.record.json", "", false},
		// Not a valid relative path.
		{"fusion-workbench/a//package.json", "", false},
		{"fusion-workbench/../package.json", "", false},
		{"fusion-workbench/a/../package.json", "", false},
		{"fusion-workbench/./package.json", "", false},
		{"fusion-workbench/", "", false},
		// Outside the workbench.
		{"package.json", "", false},
		{"docs/a.record.json", "", false},
		{"fusion-workbench-2/package.json", "", false},
	} {
		record, ok := Select(row.path)
		if record != row.record || ok != row.ok {
			t.Errorf("Select(%q) = %q, %v; want %q, %v", row.path, record, ok, row.record, row.ok)
		}
	}
}
