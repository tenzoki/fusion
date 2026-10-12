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

// These are unit tests of the service client over the fake repair host of
// internal/fixture and over scripted callers, in-process: the request each
// service sends, the operation id it mints, the envelope it decodes and the
// pages it assembles.

const workflowID = "wf-hostsvc"

func client(t *testing.T) (Client, *fixture.RepairHost) {
	t.Helper()
	host := fixture.NewRepairHost(t, fixture.CatalogDir(t), workflowID, fixture.DefaultRuns())
	return Client{Host: host.Caller(), Identity: fixture.Identity, WorkflowID: workflowID}, host
}

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

func completed(result string) string { return `{"state":"completed","result":` + result + `,"code":""}` }

func TestEveryRequestIsClosedWithTheSlotsOfAnswer69(t *testing.T) {
	c, host := client(t)
	ctx := context.Background()
	calls := []struct {
		call func() (Reply, error)
		slot string
		keys string
	}{
		{func() (Reply, error) { return c.Compose(ctx, "run-explore", "explorer", json.RawMessage(`{"question":"q"}`)) }, "run-explore", "identity,workflow_id,run_id,profile,task"},
		{func() (Reply, error) { return c.Workspace(ctx, "run-impl-0") }, "run-impl-0", "identity,workflow_id,run_id"},
		{func() (Reply, error) { return c.Capture(ctx, "run-impl-0") }, "run-impl-0", "identity,workflow_id,run_id"},
		{func() (Reply, error) { return c.Integrate(ctx, "run-review-0") }, "integration", "identity,workflow_id,run_id"},
		{func() (Reply, error) { return c.Snapshot(ctx) }, "post-integration", "identity,workflow_id"},
		{func() (Reply, error) { return c.ReadRecord(ctx, fixture.RecordPath) }, "record", "identity,workflow_id,action,record"},
		{func() (Reply, error) { return c.Close(ctx, "run-audit") }, "close", "identity,workflow_id,action,audit_run_id"},
	}
	for i, tc := range calls {
		reply, err := tc.call()
		if err != nil {
			t.Fatalf("call %d: %v", i, err)
		}
		recorded := host.Calls[len(host.Calls)-1]
		if reply.Slot != tc.slot || recorded.Slot != tc.slot || recorded.OperationID != api.RepairOperationID(recorded.Capability, workflowID, tc.slot) {
			t.Fatalf("call %d: slot %q, recorded %+v", i, reply.Slot, recorded)
		}
		if _, slot, err := api.DecodeRepairCall(api.Invocation{OperationID: recorded.OperationID, Capability: recorded.Capability, Input: recorded.Input}); err != nil || slot != tc.slot {
			t.Fatalf("call %d: the host's decoder refuses the request: %v", i, err)
		}
		if got := memberOrder(t, recorded.Input); got != tc.keys {
			t.Fatalf("call %d: members %s, want %s", i, got, tc.keys)
		}
		if !strings.HasPrefix(string(recorded.Input), `{"identity":{"module_id":"fusion",`) {
			t.Fatalf("call %d: identity is not first: %s", i, recorded.Input)
		}
	}
	// The workbench read followed no page: the record fits one page, and the
	// capture, integrate, snapshot and close were refused for want of their
	// preconditions, as replies rather than errors.
	states := []string{}
	for _, c := range host.Calls {
		states = append(states, c.Capability+"/"+c.Slot)
	}
	if strings.Join(states, " ") != "host.role.compose.v1/run-explore host.workspace.v1/run-impl-0 host.capture.v1/run-impl-0 host.integrate.v1/integration host.snapshot.v1/post-integration host.workbench.v1/record host.workbench.v1/close" {
		t.Fatalf("calls %v", states)
	}
	if reply, _ := c.Capture(ctx, "run-impl-0"); reply.State != "refused" || reply.Code != "conflict" {
		t.Fatalf("a capture without a settled implementer was %+v", reply)
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
	c, host := client(t)
	host.PageBytes = 7
	reply, err := c.ReadRecord(context.Background(), fixture.RecordPath)
	if err != nil || !reply.Completed() || reply.Slot != "record" {
		t.Fatalf("reply %+v, %v", reply, err)
	}
	record, err := reply.Record()
	if err != nil {
		t.Fatal(err)
	}
	if record.Revision != host.Revision || string(record.Record) != string(host.Record) {
		t.Fatalf("assembled %+v", record)
	}
	handle := fixture.Sha256Hex([]byte(workflowID + ":read:" + fixture.RecordPath))
	expected := []string{"record"}
	for offset := 7; offset < len(reply.Result); offset += 7 {
		expected = append(expected, "page:"+handle+":"+itoa(offset))
	}
	var slots []string
	for _, call := range host.Calls {
		slots = append(slots, call.Slot)
	}
	if strings.Join(slots, " ") != strings.Join(expected, " ") {
		t.Fatalf("slots %v, want %v", slots, expected)
	}
	if len(slots) < 3 {
		t.Fatalf("the read was not paged: %v", slots)
	}
}

func itoa(n int) string { return strconv.Itoa(n) }

func TestARefusedPageIsReturnedAsItsOwnReply(t *testing.T) {
	c, host := client(t)
	host.PageBytes = 7
	handle := fixture.Sha256Hex([]byte(workflowID + ":read:" + fixture.RecordPath))
	host.Refuse[api.WorkbenchCapability+"/page:"+handle+":14"] = "permission-denied"
	reply, err := c.ReadRecord(context.Background(), fixture.RecordPath)
	if err != nil || reply.State != "refused" || reply.Code != "permission-denied" || reply.Slot != "page:"+handle+":14" || reply.Result != nil {
		t.Fatalf("reply %+v, %v", reply, err)
	}
}

// tampering wraps the fake host and rewrites one descriptor member on the
// page at a given offset.
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
			c, host := client(t)
			host.PageBytes = 7
			c.Host = tampering{host.Caller(), tc.offset, tc.edit}
			_, err := c.ReadRecord(context.Background(), fixture.RecordPath)
			if !errors.Is(err, ErrReply) {
				t.Fatalf("err %v", err)
			}
		})
	}
}

func TestCloseIsInlineOrPaged(t *testing.T) {
	closure := `{"record":"issues/one.record.json","before":"7","after":"8","reconciled":true}`
	inline := &scripted{replies: map[string]string{api.RepairOperationID(api.WorkbenchCapability, workflowID, "close"): completed(closure)}}
	c := Client{Host: inline, Identity: fixture.Identity, WorkflowID: workflowID}
	reply, err := c.Close(context.Background(), "run-audit")
	if err != nil || !reply.Completed() {
		t.Fatalf("reply %+v, %v", reply, err)
	}
	if got, err := reply.Closure(); err != nil || got.After != "8" || !got.Reconciled {
		t.Fatalf("closure %+v, %v", got, err)
	}
	if len(inline.calls) != 1 {
		t.Fatalf("inline close made %d calls", len(inline.calls))
	}

	handle := strings.Repeat("c", 64)
	page := func(offset, n int, next string) string {
		return completed(`{"handle":"` + handle + `","sha256":"` + Digest([]byte(closure)) + `","total_bytes":` + itoa(len(closure)) + `,"offset":` + itoa(offset) + `,"page_bytes":` + itoa(n) + `,"data_base64":"` + base64.StdEncoding.EncodeToString([]byte(closure[offset:offset+n])) + `","next_offset":` + next + `}`)
	}
	paged := &scripted{replies: map[string]string{
		api.RepairOperationID(api.WorkbenchCapability, workflowID, "close"):                          page(0, 40, "40"),
		api.RepairOperationID(api.WorkbenchCapability, workflowID, "page:"+handle+":40"):             page(40, len(closure)-40, "null"),
		api.RepairOperationID(api.WorkbenchCapability, workflowID, "page:"+handle+":"+itoa(len(closure))): completed(`{}`),
	}}
	c.Host = paged
	reply, err = c.Close(context.Background(), "run-audit")
	if err != nil || !reply.Completed() || reply.Slot != "close" || string(reply.Result) != closure {
		t.Fatalf("reply %+v, %v", reply, err)
	}
	if len(paged.calls) != 2 {
		t.Fatalf("paged close made %d calls", len(paged.calls))
	}
	var call api.RepairCall
	if err := api.Decode(paged.calls[1].Input, &call); err != nil || call.Action != "page" || call.Handle != handle || call.Offset == nil || *call.Offset != 40 {
		t.Fatalf("page request %s", paged.calls[1].Input)
	}
}

func TestAnOversizeRequestIsRefusedBeforeAnyCall(t *testing.T) {
	c, host := client(t)
	task := json.RawMessage(`{"question":"` + strings.Repeat("q", api.DefaultMaxFrame) + `"}`)
	_, err := c.Compose(context.Background(), "run-explore", "explorer", task)
	if !errors.Is(err, ErrOversize) || len(host.Calls) != 0 {
		t.Fatalf("err %v, calls %d", err, len(host.Calls))
	}
}

func TestAMalformedEnvelopeIsAnError(t *testing.T) {
	for _, body := range []string{
		`{"state":"done","result":{},"code":""}`,
		`{"state":"completed","result":{}}`,
		`{"state":"refused","result":null,"code":"raw backend error"}`,
		`[]`,
	} {
		s := &scripted{replies: map[string]string{api.RepairOperationID(api.WorkspaceCapability, workflowID, "run-impl-0"): body}}
		c := Client{Host: s, Identity: fixture.Identity, WorkflowID: workflowID}
		if _, err := c.Workspace(context.Background(), "run-impl-0"); !errors.Is(err, ErrReply) {
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

func TestCaptureChecksTheDiffDigest(t *testing.T) {
	op := api.RepairOperationID(api.CaptureCapability, workflowID, "run-impl-0")
	fields := func(digest string) string {
		return completed(`{"base_revision":"` + fixture.BaseRevision + `","tree":"t","diff":"d","diff_sha256":"` + digest + `","validations":[],"criteria_sha256":"` + Digest([]byte("c")) + `","inputs_sha256":"` + Digest([]byte("i")) + `","binding":{}}`)
	}
	c := Client{Identity: fixture.Identity, WorkflowID: workflowID, Host: &scripted{replies: map[string]string{op: fields(Digest([]byte("d")))}}}
	r, err := c.Capture(context.Background(), "run-impl-0")
	if err != nil {
		t.Fatal(err)
	}
	if captured, err := r.Capture(); err != nil || captured.Tree != "t" {
		t.Fatalf("capture %+v, %v", captured, err)
	}
	c.Host = &scripted{replies: map[string]string{op: fields(Digest([]byte("other")))}}
	r, _ = c.Capture(context.Background(), "run-impl-0")
	if _, err := r.Capture(); !errors.Is(err, ErrReply) {
		t.Fatalf("a wrong diff digest was accepted: %v", err)
	}
}
