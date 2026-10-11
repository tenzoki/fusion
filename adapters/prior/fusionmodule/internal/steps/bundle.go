// Package steps is the host-neutral floor the workflows stand on: the bundle
// reader that serves the data files the manifest declares, the catalog,
// profile and workflow decoders that read exactly the keys Prior's loader
// reads, the strict JSON parser and schema validator, the observe-then-act
// executor over one durable host role, and the frame bound every outgoing
// payload is checked against. It knows no workflow; internal/explorer
// interprets the explorer definition on top of it.
package steps

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	api "github.com/kai/prior/moduleapi/v1"
)

// MaxAssetBytes bounds every file the module reads from its payload: the same
// 1 MiB Prior's manifest and receipt readers apply.
const MaxAssetBytes = 1 << 20

// ErrBundle is returned when the installed payload is not what the manifest
// and the catalog contract say it is.
var ErrBundle = errors.New("invalid module bundle")

// Bundle is the installed payload as the manifest declares it: the files
// listed under `data`, read once at start, and nothing else. The host has
// verified every payload byte before it supplied the identity, so a read here
// confirms the layout, not the trust.
type Bundle struct {
	Root     string
	Manifest api.Manifest
	data     map[string][]byte
}

// LocateRoot finds the payload directory above the running executable: the
// nearest ancestor holding module.json. The launcher at bin/fusion-module
// execs bin/<os>-<arch>/fusion-module, two levels below the root; the walk is
// bounded so an executable outside any bundle fails rather than scanning up
// to the filesystem root.
func LocateRoot(executable string) (string, error) {
	path, err := filepath.EvalSymlinks(executable)
	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrBundle, err)
	}
	path, err = filepath.Abs(path)
	if err != nil {
		return "", fmt.Errorf("%w: %v", ErrBundle, err)
	}
	dir := filepath.Dir(path)
	for i := 0; i < 4; i++ {
		if info, err := os.Stat(filepath.Join(dir, "module.json")); err == nil && info.Mode().IsRegular() {
			return dir, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", fmt.Errorf("%w: no module.json above %s", ErrBundle, executable)
}

// AssetPath is the path shape Prior accepts for a payload entry: slash
// separated, relative, no traversal, no backslash, colon or NUL.
func AssetPath(p string) bool {
	return fs.ValidPath(p) && p != "." && !strings.ContainsAny(p, "\\:\x00")
}

// OpenBundle reads module.json under root and every file its `data` list
// names, each confined to the root and bounded by MaxAssetBytes.
func OpenBundle(root string) (*Bundle, error) {
	if !filepath.IsAbs(root) {
		return nil, fmt.Errorf("%w: root %q is not absolute", ErrBundle, root)
	}
	r, err := os.OpenRoot(root)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrBundle, err)
	}
	defer r.Close()
	manifestBytes, err := readAsset(r, "module.json")
	if err != nil {
		return nil, err
	}
	manifest, _, err := api.DecodeManifest(manifestBytes)
	if err != nil {
		return nil, fmt.Errorf("%w: module.json: %v", ErrBundle, err)
	}
	b := &Bundle{Root: root, Manifest: manifest, data: make(map[string][]byte, len(manifest.Data))}
	for _, p := range manifest.Data {
		if !AssetPath(p) {
			return nil, fmt.Errorf("%w: data path %q", ErrBundle, p)
		}
		if _, dup := b.data[p]; dup {
			return nil, fmt.Errorf("%w: data path %q listed twice", ErrBundle, p)
		}
		body, err := readAsset(r, p)
		if err != nil {
			return nil, err
		}
		b.data[p] = body
	}
	return b, nil
}

func readAsset(r *os.Root, p string) ([]byte, error) {
	f, err := r.Open(filepath.FromSlash(p))
	if err != nil {
		return nil, fmt.Errorf("%w: %s: %v", ErrBundle, p, err)
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		return nil, fmt.Errorf("%w: %s: %v", ErrBundle, p, err)
	}
	if !info.Mode().IsRegular() {
		return nil, fmt.Errorf("%w: %s is not a regular file", ErrBundle, p)
	}
	body, err := io.ReadAll(io.LimitReader(f, MaxAssetBytes+1))
	if err != nil {
		return nil, fmt.Errorf("%w: %s: %v", ErrBundle, p, err)
	}
	if len(body) > MaxAssetBytes {
		return nil, fmt.Errorf("%w: %s exceeds %d bytes", ErrBundle, p, MaxAssetBytes)
	}
	return body, nil
}

// Asset returns a copy of a declared data file. A path the manifest does not
// declare is an error even when the file exists: the host serves the module's
// data by the same list, and the two must agree.
func (b *Bundle) Asset(path string) ([]byte, error) {
	body, ok := b.data[path]
	if !ok {
		return nil, fmt.Errorf("%w: %s is not a declared data file", ErrBundle, path)
	}
	return append([]byte(nil), body...), nil
}

// Schema compiles a declared schema asset. Only files under schemas/ are
// schemas, as in Prior's loader.
func (b *Bundle) Schema(path string) (*Schema, error) {
	if !strings.HasPrefix(path, "schemas/") || !strings.HasSuffix(path, ".json") {
		return nil, fmt.Errorf("%w: %s is not a schema asset", ErrBundle, path)
	}
	body, err := b.Asset(path)
	if err != nil {
		return nil, err
	}
	s, err := CompileSchema(body)
	if err != nil {
		return nil, fmt.Errorf("%w: %s: %v", ErrBundle, path, err)
	}
	return s, nil
}

// decodeExact decodes a JSON object with exactly the named keys, unknown
// fields and duplicate keys refused, every value non-null except claude_name.
// It is Prior's requiredObject (internal/fusionhost/external_catalog.go at
// 6080ba76) restated, so a file this accepts is a file Prior accepts.
func decodeExact(body []byte, out any, fields ...string) error {
	if api.Decode(body, out) != nil {
		return ErrBundle
	}
	var obj map[string]json.RawMessage
	if json.Unmarshal(body, &obj) != nil || obj == nil || len(obj) != len(fields) {
		return ErrBundle
	}
	for _, name := range fields {
		value, ok := obj[name]
		if !ok {
			return ErrBundle
		}
		if name != "claude_name" && string(trimSpace(value)) == "null" {
			return ErrBundle
		}
	}
	return nil
}

func trimSpace(b []byte) []byte {
	return []byte(strings.TrimSpace(string(b)))
}
