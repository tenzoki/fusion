# Plan: make TestDouble in pkg/a pass

**Decidability:** whether Double doubles is decided by the test the repository already carries; the check runs it.

## Implementation Steps

1. Change pkg/a/a.go so Double returns twice its argument, calling pkg/b as before; touch nothing under pkg/b.

## Acceptance Criteria

- go-test: `go test ./...` exits 0
- scope: no file outside pkg/a changes
