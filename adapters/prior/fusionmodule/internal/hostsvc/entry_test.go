package hostsvc

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// The integrate call and the read the entry workflow adds: the integration
// answer decoded as closed objects, and a read under a slot of its own.

func completedReply(capability, result string) Reply {
	return Reply{Capability: capability, Slot: "s", State: "completed", Result: json.RawMessage(result)}
}

const integration = `{"run_id":"run-entry","base":"b","reference":"refs/heads/main","head":"h","commits":[{"commit":"h","subject":"Add the memo","changes":["A\tnotes.md"]}],"delta":["M\tREADME.md"]}`

func TestEntryIntegrationDecodesClosedObjects(t *testing.T) {
	got, err := completedReply(EntryIntegrateCapability, integration).EntryIntegration()
	if err != nil || got.RunID != "run-entry" || got.Reference != "refs/heads/main" || got.Head != "h" || len(got.Commits) != 1 || got.Commits[0].Subject != "Add the memo" || strings.Join(got.Commits[0].Changes, ",") != "A\tnotes.md" || strings.Join(got.Delta, ",") != "M\tREADME.md" {
		t.Fatalf("%+v %v", got, err)
	}
	empty := `{"run_id":"run-entry","base":"b","reference":"r","head":"b","commits":[],"delta":[]}`
	if got, err := completedReply(EntryIntegrateCapability, empty).EntryIntegration(); err != nil || got.Commits == nil || len(got.Commits) != 0 || len(got.Delta) != 0 {
		t.Fatalf("an empty integration: %+v %v", got, err)
	}
	// The decoder checks the shape only: an empty member is the workflow's
	// to refuse, being a statement about the run.
	if _, err := completedReply(EntryIntegrateCapability, strings.Replace(integration, `"reference":"refs/heads/main"`, `"reference":""`, 1)).EntryIntegration(); err != nil {
		t.Fatalf("an empty reference is not a shape violation: %v", err)
	}
	for name, body := range map[string]string{
		"a member added":            strings.Replace(integration, `"delta":`, `"tree":"t","delta":`, 1),
		"a member missing":          strings.Replace(integration, `"head":"h",`, ``, 1),
		"a member null":             strings.Replace(integration, `"delta":["M\tREADME.md"]`, `"delta":null`, 1),
		"commits null":              strings.Replace(integration, `"commits":[{"commit":"h","subject":"Add the memo","changes":["A\tnotes.md"]}]`, `"commits":null`, 1),
		"a commit member added":     strings.Replace(integration, `"subject":"Add the memo",`, `"subject":"Add the memo","reference":"r",`, 1),
		"a commit member missing":   strings.Replace(integration, `"subject":"Add the memo",`, ``, 1),
		"a commit's changes null":   strings.Replace(integration, `"changes":["A\tnotes.md"]`, `"changes":null`, 1),
		"a delta item not a string": strings.Replace(integration, `"delta":["M\tREADME.md"]`, `"delta":[1]`, 1),
		"commits not an array":      strings.Replace(integration, `"commits":[{"commit":"h","subject":"Add the memo","changes":["A\tnotes.md"]}]`, `"commits":{}`, 1),
	} {
		if _, err := completedReply(EntryIntegrateCapability, body).EntryIntegration(); !errors.Is(err, ErrReply) {
			t.Errorf("%s: %v", name, err)
		}
	}
	if _, err := completedReply(api.WorkspaceCapability, integration).EntryIntegration(); !errors.Is(err, ErrNotCompleted) {
		t.Fatalf("another service's reply decoded: %v", err)
	}
	if _, err := (Reply{Capability: EntryIntegrateCapability, State: "refused", Code: "conflict"}).EntryIntegration(); !errors.Is(err, ErrNotCompleted) {
		t.Fatalf("a refusal decoded: %v", err)
	}
}

func TestEntryIntegrateSendsTheRunUnderSlotIntegration(t *testing.T) {
	op := api.RepairOperationID(EntryIntegrateCapability, workflowID, IntegrationSlot)
	host := &scripted{replies: map[string]string{op: completed(integration)}}
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	reply, err := c.EntryIntegrate(context.Background(), "run-entry")
	if err != nil || !reply.Completed() || reply.Slot != IntegrationSlot || reply.Capability != EntryIntegrateCapability {
		t.Fatalf("%+v %v", reply, err)
	}
	var call api.RepairCall
	if err := api.Decode(host.calls[0].Input, &call); err != nil || call.RunID != "run-entry" || call.Identity != fixture.Identity || call.WorkflowID != workflowID {
		t.Fatalf("request %s: %v", host.calls[0].Input, err)
	}
}

func TestReadRecordAtUsesItsOwnSlot(t *testing.T) {
	object := []byte(`{"record":{"control":{}},"revision":"3"}`)
	handle := strings.Repeat("ab", 32)
	descriptor := `{"handle":"` + handle + `","sha256":"` + Digest(object) + `","total_bytes":` + itoa(len(object)) + `,"offset":0,"page_bytes":` + itoa(len(object)) + `,"data_base64":"` + base64.StdEncoding.EncodeToString(object) + `","next_offset":null}`
	slot := "record:work-packages/p/package.json"
	host := &scripted{replies: map[string]string{api.RepairOperationID(api.WorkbenchCapability, workflowID, slot): completed(descriptor)}}
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	reply, err := c.ReadRecordAt(context.Background(), slot, "work-packages/p/package.json")
	if err != nil || reply.Slot != slot {
		t.Fatalf("%+v %v", reply, err)
	}
	record, err := reply.Record()
	if err != nil || record.Revision != "3" {
		t.Fatalf("%+v %v", record, err)
	}
	var call api.RepairCall
	if err := api.Decode(host.calls[0].Input, &call); err != nil || call.Action != "read" || call.Record != "work-packages/p/package.json" {
		t.Fatalf("request %s: %v", host.calls[0].Input, err)
	}
}
