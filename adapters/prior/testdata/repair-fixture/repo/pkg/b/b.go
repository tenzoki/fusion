// Package b is read-only context for the repair: pkg/a may call it and
// must not change it.
package b

// Add returns x + y.
func Add(x, y int) int {
	return x + y
}
