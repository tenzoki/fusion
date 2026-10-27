// Package hostsvc is the module's client of the host services the entry
// workflow calls under the request-69 common contract, which
// workflows/entry.v2.json states: host.role.compose.v1, host.workspace.v1 and
// the read and page actions of host.workbench.v1 as Prior's answer 69 fixed
// them (docs/design/fusion-repair-contract-prior-response.md at 10ad78b,
// 69.1), and host.entry.integrate.v1, fusion's proposal in request 77. One
// method each over the authenticated workflow's HostCaller, the way
// internal/steps reaches the three host.role.* services.
//
// Every request is the SDK's api.RepairCall, Prior's name at the build pin for
// the common contract's request: a closed object with identity and workflow_id
// first and the service's own fields after, marshalled once per slot so the
// bytes the host freezes are the bytes any replay sends again. The operation
// id is api.RepairOperationID over the slot: the run id for compose and
// workspace, `integration` for the integrate call, `record:<control path>`
// for each workbench read (`record` for ReadRecord), and
// `page:<handle>:<offset>` for a page. The reply is decoded by
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

// Client calls the services under one identity and one workflow id.
type Client struct {
	Host       api.HostCaller
	Identity   api.Identity
	WorkflowID string
}

// Reply is one service's decoded envelope with the call it answered. Result
// is the result object's bytes on completed and nil otherwise; for a paged
// workbench read it is the assembled object.
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

// Workspace asks for the isolated workspace of a run; slot the run id.
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

// EntryIntegrateCapability is the integrate service of fusion.entry.v2,
// fusion's proposal in request 77: Prior's SDK at the build pin names no such
// service.
const EntryIntegrateCapability = "host.entry.integrate.v1"

// IntegrationSlot is the integrate call's slot, once per workflow.
const IntegrationSlot = "integration"

// EntryCommit is one commit of an integration answer: the hash, the commit's
// own subject and its changed paths in name-status form, as the host
// assembles them.
type EntryCommit struct {
	Commit  string   `json:"commit"`
	Subject string   `json:"subject"`
	Changes []string `json:"changes"`
}

// EntryIntegration is a completed host.entry.integrate.v1 answer, the run
// integrated by Prior's step-17 model: base, the reference the user's HEAD
// named and its head after the fast-forward, the run's commits oldest first,
// and the uncommitted delta applied to the user's checkout.
type EntryIntegration struct {
	RunID     string        `json:"run_id"`
	Base      string        `json:"base"`
	Reference string        `json:"reference"`
	Head      string        `json:"head"`
	Commits   []EntryCommit `json:"commits"`
	Delta     []string      `json:"delta"`
}

// EntryIntegrate asks the host to integrate the run's workspace into the
// user's repository; slot `integration`, the request {run_id} after the
// common pair.
func (c Client) EntryIntegrate(ctx context.Context, runID string) (Reply, error) {
	return c.call(ctx, EntryIntegrateCapability, IntegrationSlot, api.RepairCall{RunID: runID})
}

// EntryIntegration decodes a completed integrate reply as closed objects:
// the six members, each commit exactly its three, no member null, and every
// changes and delta item a string. It checks the shape only; what the
// members say is the workflow's to check against what it sent.
func (r Reply) EntryIntegration() (EntryIntegration, error) {
	var out EntryIntegration
	var raw struct {
		RunID     string            `json:"run_id"`
		Base      string            `json:"base"`
		Reference string            `json:"reference"`
		Head      string            `json:"head"`
		Commits   []json.RawMessage `json:"commits"`
		Delta     []string          `json:"delta"`
	}
	if err := r.decode(EntryIntegrateCapability, &raw, []string{"run_id", "base", "reference", "head", "commits", "delta"}); err != nil {
		return out, err
	}
	out = EntryIntegration{RunID: raw.RunID, Base: raw.Base, Reference: raw.Reference, Head: raw.Head, Commits: make([]EntryCommit, 0, len(raw.Commits)), Delta: raw.Delta}
	for i, body := range raw.Commits {
		var commit EntryCommit
		if err := closedObject(body, &commit, []string{"commit", "subject", "changes"}); err != nil {
			return out, r.violation(fmt.Sprintf("commits[%d]: %v", i, err))
		}
		out.Commits = append(out.Commits, commit)
	}
	return out, nil
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

// ReadRecord reads the record the invocation selected; slot `record`. The
// completed reply's Result is the object assembled from the host's pages.
// A page the host refuses is returned as that page's reply.
func (c Client) ReadRecord(ctx context.Context, record string) (Reply, error) {
	return c.ReadRecordAt(ctx, "record", record)
}

// ReadRecordAt is ReadRecord under a slot the caller names, for a workflow
// that reads more than one record: the entry workflow reads each control
// record under `record:<control path>`, so that two reads never share an
// operation id.
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
