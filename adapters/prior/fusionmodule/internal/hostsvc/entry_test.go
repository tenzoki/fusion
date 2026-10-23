package hostsvc

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// The decoders and the read entry.v1 adds: a capture with no review binding,
// an integration with no reviewer, and a read under a slot of its own.

func completedReply(capability, result string) Reply {
	return Reply{Capability: capability, Slot: "s", State: "completed", Result: json.RawMessage(result)}
}

func TestUnboundCaptureDecodesFiveMembers(t *testing.T) {
	diff := "diff --git a/x b/x\n"
	good := `{"base_revision":"b","tree":"t","diff":` + quote(diff) + `,"diff_sha256":"` + Digest([]byte(diff)) + `","validations":[]}`
	got, err := completedReply(api.CaptureCapability, good).UnboundCapture()
	if err != nil || got.Diff != diff || got.Tree != "t" {
		t.Fatalf("%+v %v", got, err)
	}
	empty := `{"base_revision":"b","tree":"t","diff":"","diff_sha256":"` + Digest(nil) + `","validations":[]}`
	if got, err := completedReply(api.CaptureCapability, empty).UnboundCapture(); err != nil || got.Diff != "" {
		t.Fatalf("an empty diff: %+v %v", got, err)
	}
	for name, body := range map[string]string{
		"a binding member":         strings.Replace(good, `"validations":[]`, `"validations":[],"binding":{}`, 1),
		"digest not the diff's":    strings.Replace(good, Digest([]byte(diff)), Digest([]byte("x")), 1),
		"validations not an array": strings.Replace(good, `"validations":[]`, `"validations":{}`, 1),
		"tree empty":               strings.Replace(good, `"tree":"t"`, `"tree":""`, 1),
	} {
		if _, err := completedReply(api.CaptureCapability, body).UnboundCapture(); err == nil {
			t.Errorf("%s was accepted", name)
		}
	}
}

func quote(s string) string {
	body, _ := json.Marshal(s)
	return string(body)
}

func TestUnreviewedIntegrationNeedsAnEmptyReviewer(t *testing.T) {
	members := map[string]any{"id": "i", "state": "integrated", "reference": "r", "base": "b", "tree": "t", "commit": "c", "record_name": "n", "record_revision": "1", "author": "a", "reviewer": "", "checks": []any{}, "validations": []any{}, "correction": ""}
	body, _ := json.Marshal(members)
	if _, err := completedReply(api.IntegrateCapability, string(body)).UnreviewedIntegration(); err != nil {
		t.Fatal(err)
	}
	if _, err := completedReply(api.IntegrateCapability, string(body)).Integration(); err == nil {
		t.Fatal("a reviewed integration accepted an empty reviewer")
	}
	members["reviewer"] = "principal:reviewer"
	body, _ = json.Marshal(members)
	if _, err := completedReply(api.IntegrateCapability, string(body)).UnreviewedIntegration(); err == nil {
		t.Fatal("an unreviewed integration accepted a reviewer")
	}
	if _, err := completedReply(api.IntegrateCapability, string(body)).Integration(); err != nil {
		t.Fatal(err)
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
