package steps

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"

	api "github.com/kai/prior/moduleapi/v1"
)

// CheckFrame refuses a payload that would not fit the 1 MiB wire frame once
// the SDK wraps it, before any byte is sent. The envelope assumed is the
// largest the SDK writes: a reply's message id (the request's id plus
// ":reply") and its correlation id, each taken at the 64 hex characters a
// connection nonce has. A payload that fits here fits every frame the SDK
// sends it in. This mirrors Prior's own checkFrame on the host side.
func CheckFrame(kind string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("frame %s: %w", kind, err)
	}
	frame := api.Frame{SchemaVersion: api.SchemaVersion, MessageID: strings.Repeat("f", 64) + ":reply", CorrelationID: strings.Repeat("f", 64), Kind: kind, Payload: body}
	if err := api.WriteFrame(io.Discard, frame, api.DefaultMaxFrame); err != nil {
		return fmt.Errorf("frame %s: %w", kind, err)
	}
	return nil
}
