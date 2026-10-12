// Package a is the toy repository's one package with a defect: Double
// returns its argument plus one, and a_test.go expects the double.
package a

import "toy/pkg/b"

// Double is meant to return twice n.
func Double(n int) int {
	return b.Add(n, 1)
}
