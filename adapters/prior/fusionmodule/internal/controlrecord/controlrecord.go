// Package controlrecord is the one rule for which changed path names a
// workbench control record. The entry workflow selects the records it reads
// with it and the fake host of internal/fixture admits a read with it, so the
// two sides of the fake boundary cannot differ.
//
// It is a leaf: internal/hostsvc and internal/steps have in-package tests
// that import internal/fixture, so a predicate in either would make fixture
// an import cycle.
package controlrecord

import (
	"io/fs"
	"strings"
)

// WorkbenchPrefix is the workbench's place in the repository.
const WorkbenchPrefix = "fusion-workbench/"

// Select reports whether a repository-relative changed path names a control
// record and returns its path relative to the workbench, which is how the
// host's read names it.
//
// It is the codec's rule (codec/src/store.ts: isControlFile for the three
// names, controlFiles for the dot entries and the root's archive/), and it is
// the rule Prior's host applies as entryControlRecord
// (internal/fusionhost/entry_workspace.go at Prior 52a2703). The rule is
// copied here, in Go, because no code crosses the two repositories; a change
// on either side reaches the other only through a request. A directory named
// archive below the root is an ordinary store directory, as in the codec.
func Select(changedPath string) (record string, ok bool) {
	record, found := strings.CutPrefix(changedPath, WorkbenchPrefix)
	if !found || !fs.ValidPath(record) || strings.ContainsAny(record, "\\:\x00\t\r\n") {
		return "", false
	}
	segments := strings.Split(record, "/")
	for _, segment := range segments {
		if strings.HasPrefix(segment, ".") {
			return "", false
		}
	}
	if segments[0] == "archive" {
		return "", false
	}
	name := segments[len(segments)-1]
	if name != "package.json" && !strings.HasSuffix(name, ".record.json") && !strings.HasSuffix(name, ".evidence.json") {
		return "", false
	}
	return record, true
}
