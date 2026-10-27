package fixture

import (
	"encoding/base64"
	"encoding/json"

	api "github.com/kai/prior/moduleapi/v1"
)

// The host-neutral pieces of the fake durable host: the journal it keeps of
// every request-69 call, the receipts a completed call replays, the reply
// envelope and the workbench page descriptor. The entry host in entry.go is
// built on them.

// BaseRevision is the commit the fake repository is detached at.
const BaseRevision = "0123456789abcdef0123456789abcdef01234567"

// ServiceCall is one call the fake host journalled: its capability, the slot
// the request derives, the operation id and the request's frozen bytes.
type ServiceCall struct {
	Capability  string
	Slot        string
	OperationID string
	Input       []byte
}

// Receipt is a completed call's frozen request and its reply, replayed on
// the same operation id with the same bytes.
type Receipt struct {
	Input []byte
	Reply []byte
}

// refusal is the closed reply envelope of a call the host did not complete.
func refusal(state, code string) json.RawMessage {
	return marshal(map[string]any{"state": state, "result": nil, "code": code})
}

func marshal(v any) json.RawMessage {
	body, _ := json.Marshal(v)
	return body
}

// PageDescriptor is the workbench page of object at offset, cut at size
// bytes, zero being the 65536 bound, in the descriptor form of answer 69.1.
func PageDescriptor(size int, handle string, object []byte, offset int) json.RawMessage {
	if size <= 0 {
		size = 65536
	}
	n := len(object) - offset
	if n > size {
		n = size
	}
	var next any
	if offset+n < len(object) {
		next = offset + n
	}
	return marshal(map[string]any{
		"handle": handle, "sha256": "sha256:" + Sha256Hex(object), "total_bytes": len(object), "offset": offset, "page_bytes": n,
		"data_base64": base64.StdEncoding.EncodeToString(object[offset : offset+n]), "next_offset": next,
	})
}

// settled is a run's stored answer once the run is settled, else nil.
func (h *Host) settled(runID string) *api.RoleAnswer {
	h.mu.Lock()
	defer h.mu.Unlock()
	run := h.Runs[runID]
	if run == nil || run.State != "settled" || run.Answer == nil {
		return nil
	}
	return run.Answer
}
