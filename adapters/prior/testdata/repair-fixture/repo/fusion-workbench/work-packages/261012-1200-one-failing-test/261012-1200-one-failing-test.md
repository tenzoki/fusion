# TestDouble in pkg/a fails since the last refactor

## Directive

pkg/a/a_test.go expects Double(3) to be 6 and gets 4: Double adds one where it should double. The package is done when `go test ./...` exits 0 with pkg/a the only package changed; pkg/b stays as it is.
