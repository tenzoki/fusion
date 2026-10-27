package hostsvc

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// These are unit tests of the service client over scripted callers,
// in-process: the request each service sends, the operation id it mints, the
// envelope it decodes and the pages it assembles.

const (
	workflowID = "wf-hostsvc"
	recordPath = "work-packages/261023-1200-fixture-package/package.json"
)

// scripted answers each operation id from a table, recording the calls.
type scripted struct {
	replies map[string]string
	calls   []api.Invocation
}

func (s *scripted) CallHost(_ context.Context, inv api.Invocation) (json.RawMessage, error) {
	s.calls = append(s.calls, inv)
	body, ok := s.replies[inv.OperationID]
	if !ok {
		return nil, api.ErrCapability
	}
	return json.RawMessage(body), nil
}

func completed(result string) string {
	return `{"state":"completed","result":` + result + `,"code":""}`
}

// paging is a workbench that serves one record's object under any read slot,
// cut into pages of size bytes, and refuses a page slot named in refuse.
type paging struct {
	object []byte
	size   int
	refuse map[string]string
	calls  []api.Invocation
	slots  []string
}

func (p *paging) CallHost(_ context.Context, inv api.Invocation) (json.RawMessage, error) {
	p.calls = append(p.calls, inv)
	var call api.RepairCall
	if err := api.Decode(inv.Input, &call); err != nil || inv.Capability != api.WorkbenchCapability {
		return nil, api.ErrCapability
	}
	handle := fixture.Sha256Hex([]byte(workflowID + ":read:" + recordPath))
	slot, offset := "record", 0
	if call.Action == "page" {
		slot, offset = "page:"+call.Handle+":"+strconv.FormatInt(*call.Offset, 10), int(*call.Offset)
	}
	p.slots = append(p.slots, slot)
	if code := p.refuse[slot]; code != "" {
		return json.RawMessage(`{"state":"refused","result":null,"code":"` + code + `"}`), nil
	}
	return json.RawMessage(completed(string(fixture.PageDescriptor(p.size, handle, p.object, offset)))), nil
}

func newPaging(size int) *paging {
	return &paging{object: []byte(`{"record":{"control":{"kind":"package","state":"active","revision":"3"},"narrative":"# Fixture package\n"},"revision":"3"}`), size: size, refuse: map[string]string{}}
}

// Every request is a closed object with identity first and workflow_id
// second, under the operation id of its slot: the run id for compose and
// workspace, integration for the integrate call, record and
// record:<control path> for reads, page:<handle>:<offset> for a page. The
// requests Prior's pinned decoder knows are admitted by it under the same
// slot.
func TestEveryRequestIsClosedUnderItsSlot(t *testing.T) {
	ctx := context.Background()
	recorder := &scripted{replies: map[string]string{}}
	c := Client{Host: recorder, Identity: fixture.Identity, WorkflowID: workflowID}
	offset := int64(40)
	handle := strings.Repeat("c", 64)
	calls := []struct {
		call   func() (Reply, error)
		slot   string
		keys   string
		pinned bool
	}{
		{func() (Reply, error) {
			return c.Compose(ctx, "run-explore", "explorer", json.RawMessage(`{"question":"q"}`))
		}, "run-explore", "identity,workflow_id,run_id,profile,task", true},
		{func() (Reply, error) { return c.Workspace(ctx, "run-entry") }, "run-entry", "identity,workflow_id,run_id", true},
		{func() (Reply, error) { return c.EntryIntegrate(ctx, "run-entry") }, "integration", "identity,workflow_id,run_id", false},
		{func() (Reply, error) { return c.ReadRecord(ctx, recordPath) }, "record", "identity,workflow_id,action,record", true},
		{func() (Reply, error) { return c.ReadRecordAt(ctx, "record:"+recordPath, recordPath) }, "record:" + recordPath, "identity,workflow_id,action,record", false},
		{func() (Reply, error) {
			return c.call(ctx, api.WorkbenchCapability, "page:"+handle+":40", api.RepairCall{Action: "page", Handle: handle, Offset: &offset})
		}, "page:" + handle + ":40", "identity,workflow_id,action,handle,offset", true},
	}
	for i, tc := range calls {
		// The scripted host knows no operation: every call is a transport
		// error after it was sent, which is what this test reads.
		if _, err := tc.call(); !errors.Is(err, api.ErrCapability) {
			t.Fatalf("call %d: %v", i, err)
		}
		sent := recorder.calls[len(recorder.calls)-1]
		if sent.OperationID != api.RepairOperationID(sent.Capability, workflowID, tc.slot) {
			t.Fatalf("call %d: operation id %s is not slot %q's", i, sent.OperationID, tc.slot)
		}
		if got := memberOrder(t, sent.Input); got != tc.keys {
			t.Fatalf("call %d: members %s, want %s", i, got, tc.keys)
		}
		if !strings.HasPrefix(string(sent.Input), `{"identity":{"module_id":"fusion",`) {
			t.Fatalf("call %d: identity is not first: %s", i, sent.Input)
		}
		if tc.pinned {
			if _, slot, err := api.DecodeRepairCall(sent); err != nil || slot != tc.slot {
				t.Fatalf("call %d: the pinned decoder refuses the request: %v", i, err)
			}
		}
	}
	if got := recorder.calls[2].Capability; got != EntryIntegrateCapability {
		t.Fatalf("the integrate call went to %s", got)
	}
}

// memberOrder lists an object's top-level keys in wire order.
func memberOrder(t *testing.T, body []byte) string {
	t.Helper()
	d := json.NewDecoder(strings.NewReader(string(body)))
	if tok, err := d.Token(); err != nil || tok != json.Delim('{') {
		t.Fatalf("not an object: %s", body)
	}
	var keys []string
	for d.More() {
		tok, err := d.Token()
		if err != nil {
			t.Fatal(err)
		}
		keys = append(keys, tok.(string))
		var skip json.RawMessage
		if err := d.Decode(&skip); err != nil {
			t.Fatal(err)
		}
	}
	return strings.Join(keys, ",")
}

func TestPagedReadIsAssembledAndChecked(t *testing.T) {
	host := newPaging(7)
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	reply, err := c.ReadRecord(context.Background(), recordPath)
	if err != nil || !reply.Completed() || reply.Slot != "record" {
		t.Fatalf("reply %+v, %v", reply, err)
	}
	record, err := reply.Record()
	if err != nil {
		t.Fatal(err)
	}
	if record.Revision != "3" || string(reply.Result) != string(host.object) {
		t.Fatalf("assembled %+v", record)
	}
	handle := fixture.Sha256Hex([]byte(workflowID + ":read:" + recordPath))
	expected := []string{"record"}
	for offset := 7; offset < len(host.object); offset += 7 {
		expected = append(expected, "page:"+handle+":"+itoa(offset))
	}
	if strings.Join(host.slots, " ") != strings.Join(expected, " ") {
		t.Fatalf("slots %v, want %v", host.slots, expected)
	}
	if len(host.slots) < 3 {
		t.Fatalf("the read was not paged: %v", host.slots)
	}
}

func itoa(n int) string { return strconv.Itoa(n) }

func TestARefusedPageIsReturnedAsItsOwnReply(t *testing.T) {
	host := newPaging(7)
	handle := fixture.Sha256Hex([]byte(workflowID + ":read:" + recordPath))
	host.refuse["page:"+handle+":14"] = "permission-denied"
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	reply, err := c.ReadRecord(context.Background(), recordPath)
	if err != nil || reply.State != "refused" || reply.Code != "permission-denied" || reply.Slot != "page:"+handle+":14" || reply.Result != nil {
		t.Fatalf("reply %+v, %v", reply, err)
	}
}

// tampering wraps a host and rewrites one descriptor member on the page at a
// given offset.
type tampering struct {
	base   api.HostCaller
	offset string
	edit   func(map[string]any)
}

func (tp tampering) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	out, err := tp.base.CallHost(ctx, inv)
	if err != nil || inv.Capability != api.WorkbenchCapability {
		return out, err
	}
	var call api.RepairCall
	_ = api.Decode(inv.Input, &call)
	at := "0"
	if call.Offset != nil {
		at = itoa(int(*call.Offset))
	}
	if at != tp.offset {
		return out, nil
	}
	var envelope struct {
		State  string         `json:"state"`
		Result map[string]any `json:"result"`
		Code   string         `json:"code"`
	}
	_ = json.Unmarshal(out, &envelope)
	tp.edit(envelope.Result)
	return json.Marshal(envelope)
}

func TestAPageThatDoesNotAddUpIsAnError(t *testing.T) {
	cases := map[string]struct {
		offset string
		edit   func(map[string]any)
	}{
		"handle not lowercase hex":  {"0", func(r map[string]any) { r["handle"] = strings.ToUpper(r["handle"].(string)) }},
		"sha256 not the object's":   {"0", func(r map[string]any) { r["sha256"] = "sha256:" + strings.Repeat("0", 64) }},
		"next_offset skips a byte":  {"0", func(r map[string]any) { r["next_offset"] = float64(8) }},
		"next_offset null too soon": {"0", func(r map[string]any) { r["next_offset"] = nil }},
		"page over the page bound":  {"0", func(r map[string]any) { r["page_bytes"] = float64(PageLimit + 1) }},
		"data not page_bytes long":  {"7", func(r map[string]any) { r["data_base64"] = base64.StdEncoding.EncodeToString([]byte("x")) }},
		"handle changes mid-read":   {"7", func(r map[string]any) { r["handle"] = strings.Repeat("1", 64) }},
		"total changes mid-read":    {"7", func(r map[string]any) { r["total_bytes"] = float64(5) }},
		"a member added":            {"7", func(r map[string]any) { r["extra"] = true }},
		"a member null":             {"7", func(r map[string]any) { r["sha256"] = nil }},
	}
	for name, tc := range cases {
		t.Run(name, func(t *testing.T) {
			c := Client{Host: tampering{newPaging(7), tc.offset, tc.edit}, Identity: fixture.Identity, WorkflowID: workflowID}
			_, err := c.ReadRecord(context.Background(), recordPath)
			if !errors.Is(err, ErrReply) {
				t.Fatalf("err %v", err)
			}
		})
	}
}

func TestAPageThatMakesNoProgressIsAnError(t *testing.T) {
	handle := strings.Repeat("d", 64)
	empty := completed(`{"handle":"` + handle + `","sha256":"` + Digest([]byte("0123456789")) + `","total_bytes":10,"offset":0,"page_bytes":0,"data_base64":"","next_offset":0}`)
	// The host answers the same empty page however often it is asked; an
	// assembler that followed next_offset here would never stop.
	host := &scripted{replies: map[string]string{
		api.RepairOperationID(api.WorkbenchCapability, workflowID, "record"):            empty,
		api.RepairOperationID(api.WorkbenchCapability, workflowID, "page:"+handle+":0"): empty,
	}}
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	_, err := c.ReadRecord(context.Background(), recordPath)
	if !errors.Is(err, ErrReply) {
		t.Fatalf("err %v", err)
	}
	if len(host.calls) > 2 {
		t.Fatalf("assembler made %d calls, more than one page call", len(host.calls))
	}
}

func TestAnOversizeRequestIsRefusedBeforeAnyCall(t *testing.T) {
	host := &scripted{replies: map[string]string{}}
	c := Client{Host: host, Identity: fixture.Identity, WorkflowID: workflowID}
	task := json.RawMessage(`{"question":"` + strings.Repeat("q", api.DefaultMaxFrame) + `"}`)
	_, err := c.Compose(context.Background(), "run-explore", "explorer", task)
	if !errors.Is(err, ErrOversize) || len(host.calls) != 0 {
		t.Fatalf("err %v, calls %d", err, len(host.calls))
	}
}

func TestAMalformedEnvelopeIsAnError(t *testing.T) {
	for _, body := range []string{
		`{"state":"done","result":{},"code":""}`,
		`{"state":"completed","result":{}}`,
		`{"state":"refused","result":null,"code":"raw backend error"}`,
		`[]`,
	} {
		s := &scripted{replies: map[string]string{api.RepairOperationID(api.WorkspaceCapability, workflowID, "run-entry"): body}}
		c := Client{Host: s, Identity: fixture.Identity, WorkflowID: workflowID}
		if _, err := c.Workspace(context.Background(), "run-entry"); !errors.Is(err, ErrReply) {
			t.Errorf("%s: err %v", body, err)
		}
	}
}

func TestComposedChecksTheDigestOverTheCompactBytes(t *testing.T) {
	compact := `{"question":"q","project_context":{"instructions":[]},"output_contract":{}}`
	pretty := "{\n  \"question\": \"q\",\n  \"project_context\": {\"instructions\": []},\n  \"output_contract\": {}\n}"
	op := api.RepairOperationID(api.RoleComposeCapability, workflowID, "run-explore")
	reply := func(input, digest string) string {
		return completed(`{"run_id":"run-explore","profile":"explorer","role_input":` + input + `,"role_input_sha256":"` + digest + `"}`)
	}
	c := Client{Identity: fixture.Identity, WorkflowID: workflowID}
	c.Host = &scripted{replies: map[string]string{op: reply(pretty, Digest([]byte(compact)))}}
	r, err := c.Compose(context.Background(), "run-explore", "explorer", json.RawMessage(`{"question":"q"}`))
	if err != nil {
		t.Fatal(err)
	}
	composed, err := r.Composed()
	if err != nil || string(composed.RoleInput) != compact {
		t.Fatalf("composed %+v, %v", composed, err)
	}
	c.Host = &scripted{replies: map[string]string{op: reply(compact, Digest([]byte(pretty)))}}
	r, _ = c.Compose(context.Background(), "run-explore", "explorer", json.RawMessage(`{"question":"q"}`))
	if _, err := r.Composed(); !errors.Is(err, ErrReply) {
		t.Fatalf("a wrong digest was accepted: %v", err)
	}
	if _, err := (Reply{Capability: api.RoleComposeCapability, State: "refused", Code: "conflict"}).Composed(); !errors.Is(err, ErrNotCompleted) {
		t.Fatalf("a refusal decoded: %v", err)
	}
}
