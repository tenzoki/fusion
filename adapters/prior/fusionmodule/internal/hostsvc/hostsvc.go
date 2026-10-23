// Package hostsvc is the module's client of the six repair host services
// Prior's answer 69 fixed (docs/design/fusion-repair-contract-prior-response.md
// at 10ad78b, 69.1): host.role.compose.v1, host.workspace.v1,
// host.capture.v1, host.integrate.v1, host.snapshot.v1 and
// host.workbench.v1, one method each over the authenticated workflow's
// HostCaller, the way internal/steps reaches the three host.role.* services.
//
// Every request is the SDK's api.RepairCall: a closed object with identity
// and workflow_id first and the service's own fields after, marshalled once
// per slot so the bytes the host freezes are the bytes any replay sends
// again. The operation id is api.RepairOperationID over the slot the answer
// assigns: the run id for compose, workspace and capture, `integration` for
// integrate, `post-integration` for snapshot, `record`, `page:<handle>:<offset>`
// and `close` for the workbench, and for entry.v1's reads
// `record:<control path>`, one slot per record. The reply is decoded by
// api.DecodeRepairResponse into the closed envelope {state, result, code}; a
// reply the host answers, refused or recovery-required included, is a Reply
// the workflow routes on, and a reply that violates the wire contract is an
// error, as the SDK's own RemoteRoles treats one. The workbench client
// assembles a paged read from its descriptors, follows next_offset until it
// is null, checks total_bytes and sha256 after assembly, never fabricates a
// page, and refuses a handle that is not 64 lowercase hex.
package hostsvc

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// PageLimit is the most decoded bytes one workbench page carries (69.1).
const PageLimit = 65536

// AssemblyLimit bounds an assembled object: the codec's 16 MiB response
// ceiling, which paging does not lift (69.1).
const AssemblyLimit = 16 << 20

var (
	// ErrOversize is returned before any byte is sent when the request would
	// not fit the 1 MiB frame once the SDK wraps it.
	ErrOversize = errors.New("hostsvc: request would not fit the frame")
	// ErrReply is returned when the host's reply violates the service
	// contract: the outcome is known to be unusable, never inferred.
	ErrReply = errors.New("hostsvc: reply violates the service contract")
	// ErrNotCompleted is returned by a typed accessor on a reply that is not
	// completed, or that answers another service.
	ErrNotCompleted = errors.New("hostsvc: reply is not a completed result of this service")
)

var (
	handlePattern = regexp.MustCompile(`^[0-9a-f]{64}$`)
	digestPattern = regexp.MustCompile(`^sha256:[0-9a-f]{64}$`)
)

// Digest is the host's sha256:<hex> form over bytes.
func Digest(body []byte) string {
	sum := sha256.Sum256(body)
	return "sha256:" + hex.EncodeToString(sum[:])
}

// Client calls the six services under one identity and one workflow id.
type Client struct {
	Host       api.HostCaller
	Identity   api.Identity
	WorkflowID string
}

// Reply is one service's decoded envelope with the call it answered. Result
// is the result object's bytes on completed and nil otherwise; for a paged
// workbench read or close it is the assembled object.
type Reply struct {
	Capability string
	Slot       string
	State      string
	Code       string
	Result     json.RawMessage
}

// Completed reports whether the host completed the call.
func (r Reply) Completed() bool { return r.State == "completed" }

func (c Client) call(ctx context.Context, capability, slot string, call api.RepairCall) (Reply, error) {
	call.Identity, call.WorkflowID = c.Identity, c.WorkflowID
	body, err := json.Marshal(call)
	if err != nil {
		return Reply{}, err
	}
	inv := api.Invocation{OperationID: api.RepairOperationID(capability, c.WorkflowID, slot), Capability: capability, Input: body}
	if err := steps.CheckFrame("host.invoke", inv); err != nil {
		return Reply{}, fmt.Errorf("%w: %s %s: %v", ErrOversize, capability, slot, err)
	}
	out, err := c.Host.CallHost(ctx, inv)
	if err != nil {
		return Reply{}, err
	}
	response, err := api.DecodeRepairResponse(out)
	if err != nil {
		return Reply{}, fmt.Errorf("%w: %s %s: envelope", ErrReply, capability, slot)
	}
	reply := Reply{Capability: capability, Slot: slot, State: response.State, Code: response.Code}
	if response.State == "completed" {
		reply.Result = response.Result
	}
	return reply, nil
}

func (r Reply) violation(detail string) error {
	return fmt.Errorf("%w: %s %s: %s", ErrReply, r.Capability, r.Slot, detail)
}

// decode reads a completed result as a closed object with exactly the named
// members, none null except those listed as nullable.
func (r Reply) decode(capability string, target any, fields []string, nullable ...string) error {
	if r.Capability != capability || !r.Completed() {
		return ErrNotCompleted
	}
	if err := closedObject(r.Result, target, fields, nullable...); err != nil {
		return r.violation(err.Error())
	}
	return nil
}

func closedObject(body []byte, target any, fields []string, nullable ...string) error {
	if api.Decode(body, target) != nil {
		return errors.New("not the closed object")
	}
	var object map[string]json.RawMessage
	if json.Unmarshal(body, &object) != nil || len(object) != len(fields) {
		return errors.New("member set")
	}
	mayBeNull := map[string]bool{}
	for _, name := range nullable {
		mayBeNull[name] = true
	}
	for _, name := range fields {
		value, ok := object[name]
		if !ok {
			return errors.New("missing " + name)
		}
		if !mayBeNull[name] && bytes.Equal(bytes.TrimSpace(value), []byte("null")) {
			return errors.New("null " + name)
		}
	}
	return nil
}

func isArray(raw json.RawMessage) bool {
	trimmed := bytes.TrimSpace(raw)
	return len(trimmed) > 0 && trimmed[0] == '[' && json.Valid(raw)
}

func isObject(raw json.RawMessage) bool {
	trimmed := bytes.TrimSpace(raw)
	return len(trimmed) > 0 && trimmed[0] == '{' && json.Valid(raw)
}

// Composed is a completed compose reply: the four members, role_input
// compacted to the bytes the host froze and checked against its digest.
type Composed struct {
	RunID           string          `json:"run_id"`
	Profile         string          `json:"profile"`
	RoleInput       json.RawMessage `json:"role_input"`
	RoleInputSHA256 string          `json:"role_input_sha256"`
}

// Compose asks the host to compose and freeze a run's role input from the
// module's task; slot run_id. The task carries no project_context and no
// output_contract, which the host adds.
func (c Client) Compose(ctx context.Context, runID, profile string, task json.RawMessage) (Reply, error) {
	return c.call(ctx, api.RoleComposeCapability, runID, api.RepairCall{RunID: runID, Profile: profile, Task: task})
}

// Composed decodes a completed compose reply.
func (r Reply) Composed() (Composed, error) {
	var out Composed
	if err := r.decode(api.RoleComposeCapability, &out, []string{"run_id", "profile", "role_input", "role_input_sha256"}); err != nil {
		return out, err
	}
	var compact bytes.Buffer
	if json.Compact(&compact, out.RoleInput) != nil || !isObject(compact.Bytes()) {
		return out, r.violation("role_input is not an object")
	}
	out.RoleInput = append(json.RawMessage(nil), compact.Bytes()...)
	if out.RunID == "" || out.Profile == "" {
		return out, r.violation("run_id or profile empty")
	}
	if Digest(out.RoleInput) != out.RoleInputSHA256 {
		return out, r.violation("role_input_sha256 does not cover role_input")
	}
	return out, nil
}

// Workspace is a completed workspace reply.
type Workspace struct {
	Root         string `json:"root"`
	BaseRevision string `json:"base_revision"`
}

// Workspace asks for the isolated workspace of an implementer run; slot the
// run id.
func (c Client) Workspace(ctx context.Context, runID string) (Reply, error) {
	return c.call(ctx, api.WorkspaceCapability, runID, api.RepairCall{RunID: runID})
}

// Workspace decodes a completed workspace reply.
func (r Reply) Workspace() (Workspace, error) {
	var out Workspace
	if err := r.decode(api.WorkspaceCapability, &out, []string{"root", "base_revision"}); err != nil {
		return out, err
	}
	if out.Root == "" || out.BaseRevision == "" {
		return out, r.violation("root or base_revision empty")
	}
	return out, nil
}

// Capture is a completed capture reply: the eight fields of 69.1, the
// validations and the binding kept as the host's bytes.
type Capture struct {
	BaseRevision   string          `json:"base_revision"`
	Tree           string          `json:"tree"`
	Diff           string          `json:"diff"`
	DiffSHA256     string          `json:"diff_sha256"`
	Validations    json.RawMessage `json:"validations"`
	CriteriaSHA256 string          `json:"criteria_sha256"`
	InputsSHA256   string          `json:"inputs_sha256"`
	Binding        json.RawMessage `json:"binding"`
}

// Capture asks the host to capture an implementer run's tree and run the
// checks; slot the run id.
func (c Client) Capture(ctx context.Context, runID string) (Reply, error) {
	return c.call(ctx, api.CaptureCapability, runID, api.RepairCall{RunID: runID})
}

// Capture decodes a completed capture reply, checking the diff digest the
// host states against the diff it sent.
func (r Reply) Capture() (Capture, error) {
	var out Capture
	if err := r.decode(api.CaptureCapability, &out, []string{"base_revision", "tree", "diff", "diff_sha256", "validations", "criteria_sha256", "inputs_sha256", "binding"}); err != nil {
		return out, err
	}
	if out.BaseRevision == "" || out.Tree == "" || !isArray(out.Validations) || !isObject(out.Binding) {
		return out, r.violation("base_revision, tree, validations or binding")
	}
	if !digestPattern.MatchString(out.CriteriaSHA256) || !digestPattern.MatchString(out.InputsSHA256) {
		return out, r.violation("criteria_sha256 or inputs_sha256 is not sha256:<hex>")
	}
	if Digest([]byte(out.Diff)) != out.DiffSHA256 {
		return out, r.violation("diff_sha256 does not cover diff")
	}
	return out, nil
}

// UnboundCapture is a completed capture of a run no review binds (entry.v1's
// capture step): repair's capture without criteria_sha256, inputs_sha256 and
// binding. An empty diff is a run that changed nothing.
type UnboundCapture struct {
	BaseRevision string          `json:"base_revision"`
	Tree         string          `json:"tree"`
	Diff         string          `json:"diff"`
	DiffSHA256   string          `json:"diff_sha256"`
	Validations  json.RawMessage `json:"validations"`
}

// UnboundCapture decodes a completed capture reply of five members, checking
// the diff digest the host states against the diff it sent.
func (r Reply) UnboundCapture() (UnboundCapture, error) {
	var out UnboundCapture
	if err := r.decode(api.CaptureCapability, &out, []string{"base_revision", "tree", "diff", "diff_sha256", "validations"}); err != nil {
		return out, err
	}
	if out.BaseRevision == "" || out.Tree == "" || !isArray(out.Validations) {
		return out, r.violation("base_revision, tree or validations")
	}
	if Digest([]byte(out.Diff)) != out.DiffSHA256 {
		return out, r.violation("diff_sha256 does not cover diff")
	}
	return out, nil
}

// Integration is a completed integrate reply: the thirteen fields of the
// audit-request integration object, checks and validations as the host's
// bytes.
type Integration struct {
	ID             string          `json:"id"`
	State          string          `json:"state"`
	Reference      string          `json:"reference"`
	Base           string          `json:"base"`
	Tree           string          `json:"tree"`
	Commit         string          `json:"commit"`
	RecordName     string          `json:"record_name"`
	RecordRevision string          `json:"record_revision"`
	Author         string          `json:"author"`
	Reviewer       string          `json:"reviewer"`
	Checks         json.RawMessage `json:"checks"`
	Validations    json.RawMessage `json:"validations"`
	Correction     string          `json:"correction"`
}

// IntegrationFields are the thirteen members, in the receipt's order.
var IntegrationFields = []string{"id", "state", "reference", "base", "tree", "commit", "record_name", "record_revision", "author", "reviewer", "checks", "validations", "correction"}

// Integrate asks the host to integrate the attempt whose reviewer run
// accepted it; slot `integration`, once per workflow.
func (c Client) Integrate(ctx context.Context, reviewerRunID string) (Reply, error) {
	return c.call(ctx, api.IntegrateCapability, "integration", api.RepairCall{RunID: reviewerRunID})
}

// Integration decodes a completed integrate reply.
func (r Reply) Integration() (Integration, error) { return r.integration(true) }

// UnreviewedIntegration decodes a completed integrate reply of a workflow with
// no review step (entry.v1, revise_bound 0): the same thirteen members, the
// reviewer empty.
func (r Reply) UnreviewedIntegration() (Integration, error) { return r.integration(false) }

func (r Reply) integration(reviewed bool) (Integration, error) {
	var out Integration
	if err := r.decode(api.IntegrateCapability, &out, IntegrationFields); err != nil {
		return out, err
	}
	named := map[string]string{"id": out.ID, "state": out.State, "reference": out.Reference, "base": out.Base, "tree": out.Tree, "commit": out.Commit, "record_name": out.RecordName, "record_revision": out.RecordRevision, "author": out.Author}
	if reviewed {
		named["reviewer"] = out.Reviewer
	} else if out.Reviewer != "" {
		return out, r.violation("reviewer is not empty on an unreviewed integration")
	}
	for name, value := range named {
		if value == "" {
			return out, r.violation(name + " empty")
		}
	}
	if !isArray(out.Checks) || !isArray(out.Validations) {
		return out, r.violation("checks or validations is not an array")
	}
	return out, nil
}

// SnapshotFields are the eleven members of the host's audit projection.
var SnapshotFields = []string{"snapshot_id", "integration_id", "reference", "commit", "tree", "changed_paths", "file_observations", "runs", "unused_runs", "accounting", "limitations"}

// Snapshot asks for the host's post-integration observation; slot
// `post-integration`, the request the common pair only.
func (c Client) Snapshot(ctx context.Context) (Reply, error) {
	return c.call(ctx, api.SnapshotCapability, "post-integration", api.RepairCall{})
}

// Snapshot checks a completed snapshot reply against the SDK's
// api.RepairSnapshot shape and returns the host's bytes unchanged: the
// observation is forwarded, never rebuilt.
func (r Reply) Snapshot() (json.RawMessage, error) {
	var out api.RepairSnapshot
	if err := r.decode(api.SnapshotCapability, &out, SnapshotFields); err != nil {
		return nil, err
	}
	if out.SnapshotID == "" || out.IntegrationID == "" || out.Reference == "" || out.Commit == "" || out.Tree == "" {
		return nil, r.violation("an identifying member is empty")
	}
	return r.Result, nil
}

// Page is one workbench page descriptor (69.1).
type Page struct {
	Handle     string `json:"handle"`
	SHA256     string `json:"sha256"`
	TotalBytes int64  `json:"total_bytes"`
	Offset     int64  `json:"offset"`
	PageBytes  int64  `json:"page_bytes"`
	DataBase64 string `json:"data_base64"`
	NextOffset *int64 `json:"next_offset"`
}

// Record is the assembled object of a workbench read: the record's control
// data and complete narrative as the codec answers it, and its revision.
type Record struct {
	Record   json.RawMessage `json:"record"`
	Revision string          `json:"revision"`
}

// Closure is the assembled object of a workbench close.
type Closure struct {
	Record     string `json:"record"`
	Before     string `json:"before"`
	After      string `json:"after"`
	Reconciled bool   `json:"reconciled"`
}

// ReadRecord reads the record the invocation selected; slot `record`. The
// completed reply's Result is the object assembled from the host's pages.
// A page the host refuses is returned as that page's reply.
func (c Client) ReadRecord(ctx context.Context, record string) (Reply, error) {
	return c.ReadRecordAt(ctx, "record", record)
}

// ReadRecordAt is ReadRecord under a slot the caller names, for a workflow
// that reads more than one record: entry.v1 reads each control record under
// `record:<control path>`, so that two reads never share an operation id.
func (c Client) ReadRecordAt(ctx context.Context, slot, record string) (Reply, error) {
	reply, err := c.call(ctx, api.WorkbenchCapability, slot, api.RepairCall{Action: "read", Record: record})
	if err != nil || !reply.Completed() {
		return reply, err
	}
	return c.assemble(ctx, reply)
}

// Record decodes an assembled read.
func (r Reply) Record() (Record, error) {
	var out Record
	if err := r.decode(api.WorkbenchCapability, &out, []string{"record", "revision"}); err != nil {
		return out, err
	}
	if !isObject(out.Record) || out.Revision == "" {
		return out, r.violation("record is not an object or revision empty")
	}
	return out, nil
}

// Close asks the host for the one logical close under the auditor's run;
// slot `close`. The host answers the closure inline when it fits and as a
// page descriptor otherwise; the two are told apart by `handle`, and the
// completed reply's Result is the closure object either way.
func (c Client) Close(ctx context.Context, auditRunID string) (Reply, error) {
	reply, err := c.call(ctx, api.WorkbenchCapability, "close", api.RepairCall{Action: "close", AuditRunID: auditRunID})
	if err != nil || !reply.Completed() {
		return reply, err
	}
	var members map[string]json.RawMessage
	if json.Unmarshal(reply.Result, &members) != nil {
		return reply, reply.violation("result is not an object")
	}
	if _, paged := members["handle"]; paged {
		return c.assemble(ctx, reply)
	}
	return reply, nil
}

// Closure decodes a close reply.
func (r Reply) Closure() (Closure, error) {
	var out Closure
	if err := r.decode(api.WorkbenchCapability, &out, []string{"record", "before", "after", "reconciled"}); err != nil {
		return out, err
	}
	if out.Record == "" || out.Before == "" || out.After == "" {
		return out, r.violation("record, before or after empty")
	}
	return out, nil
}

// assemble follows a descriptor's pages from the first reply to the end and
// checks the whole against total_bytes and sha256. The reply returned keeps
// the first call's slot; a refused page is returned as its own reply.
func (c Client) assemble(ctx context.Context, first Reply) (Reply, error) {
	page, data, err := decodePage(first, nil, 0)
	if err != nil {
		return first, err
	}
	assembled := append([]byte(nil), data...)
	for page.NextOffset != nil {
		offset := *page.NextOffset
		reply, err := c.call(ctx, api.WorkbenchCapability, "page:"+page.Handle+":"+strconv.FormatInt(offset, 10), api.RepairCall{Action: "page", Handle: page.Handle, Offset: &offset})
		if err != nil || !reply.Completed() {
			return reply, err
		}
		previous := page
		if page, data, err = decodePage(reply, &previous, offset); err != nil {
			return reply, err
		}
		assembled = append(assembled, data...)
	}
	if int64(len(assembled)) != page.TotalBytes || Digest(assembled) != page.SHA256 {
		return first, first.violation("assembled object does not match total_bytes and sha256")
	}
	return Reply{Capability: first.Capability, Slot: first.Slot, State: "completed", Result: assembled}, nil
}

// decodePage checks one descriptor against the one before it (nil on the
// first) and the offset expected, and returns its decoded bytes.
func decodePage(reply Reply, previous *Page, expected int64) (Page, []byte, error) {
	var page Page
	if err := reply.decode(api.WorkbenchCapability, &page, []string{"handle", "sha256", "total_bytes", "offset", "page_bytes", "data_base64", "next_offset"}, "next_offset"); err != nil {
		return page, nil, err
	}
	if !handlePattern.MatchString(page.Handle) {
		return page, nil, reply.violation("handle is not 64 lowercase hex")
	}
	if !digestPattern.MatchString(page.SHA256) {
		return page, nil, reply.violation("sha256 is not sha256:<hex>")
	}
	if page.TotalBytes < 0 || page.TotalBytes > AssemblyLimit {
		return page, nil, reply.violation("total_bytes outside the assembly limit")
	}
	if previous != nil && (page.Handle != previous.Handle || page.SHA256 != previous.SHA256 || page.TotalBytes != previous.TotalBytes) {
		return page, nil, reply.violation("descriptor differs from the first page's")
	}
	if page.Offset != expected {
		return page, nil, reply.violation("offset is not the one requested")
	}
	if page.PageBytes < 0 || page.PageBytes > PageLimit || page.Offset+page.PageBytes > page.TotalBytes {
		return page, nil, reply.violation("page_bytes outside the page bound")
	}
	data, err := base64.StdEncoding.Strict().DecodeString(page.DataBase64)
	if err != nil || int64(len(data)) != page.PageBytes {
		return page, nil, reply.violation("data_base64 does not decode to page_bytes")
	}
	end := page.Offset + page.PageBytes
	if page.NextOffset == nil {
		if end != page.TotalBytes {
			return page, nil, reply.violation("next_offset null before the end")
		}
	} else if page.PageBytes == 0 {
		// A page that carries no bytes and names a next page would be asked
		// for again at the same offset; refusing it keeps assemble finite.
		return page, nil, reply.violation("page_bytes is zero before the end")
	} else if *page.NextOffset != end || end >= page.TotalBytes {
		return page, nil, reply.violation("next_offset is not the byte after this page")
	}
	return page, data, nil
}
