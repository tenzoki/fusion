package fixture

import (
	"crypto/sha256"
	"encoding/hex"
)

// Sha256Hex is the host's digest form without the sha256: prefix.
func Sha256Hex(body []byte) string {
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}
