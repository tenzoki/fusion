package steps

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"math/big"
	"unicode/utf8"
)

// ErrInvalidJSON is returned for input that is not one well-formed JSON value
// in valid UTF-8 with unique object keys and nothing after it.
var ErrInvalidJSON = errors.New("invalid JSON")

// Parse decodes body into a tree of map[string]any, []any, string,
// json.Number, bool and nil. It refuses invalid UTF-8, duplicate keys at any
// depth and trailing data, the same strictness Prior applies to every payload
// it reads from a module, so that what validates here is what the host accepts.
func Parse(body []byte) (any, error) {
	if !utf8.Valid(body) {
		return nil, ErrInvalidJSON
	}
	d := json.NewDecoder(bytes.NewReader(body))
	d.UseNumber()
	v, err := parseValue(d)
	if err != nil {
		return nil, ErrInvalidJSON
	}
	if _, err := d.Token(); err != io.EOF {
		return nil, ErrInvalidJSON
	}
	return v, nil
}

func parseValue(d *json.Decoder) (any, error) {
	tok, err := d.Token()
	if err != nil {
		return nil, err
	}
	delim, ok := tok.(json.Delim)
	if !ok {
		return tok, nil
	}
	switch delim {
	case '{':
		obj := map[string]any{}
		for d.More() {
			keyTok, err := d.Token()
			if err != nil {
				return nil, err
			}
			key, ok := keyTok.(string)
			if !ok {
				return nil, ErrInvalidJSON
			}
			if _, dup := obj[key]; dup {
				return nil, ErrInvalidJSON
			}
			val, err := parseValue(d)
			if err != nil {
				return nil, err
			}
			obj[key] = val
		}
		if _, err := d.Token(); err != nil {
			return nil, err
		}
		return obj, nil
	case '[':
		arr := []any{}
		for d.More() {
			val, err := parseValue(d)
			if err != nil {
				return nil, err
			}
			arr = append(arr, val)
		}
		if _, err := d.Token(); err != nil {
			return nil, err
		}
		return arr, nil
	}
	return nil, ErrInvalidJSON
}

// Equal compares two parsed values as JSON values: numbers by their value,
// objects by key set and member equality, arrays element by element.
func Equal(a, b any) bool {
	switch x := a.(type) {
	case nil:
		return b == nil
	case bool:
		y, ok := b.(bool)
		return ok && x == y
	case string:
		y, ok := b.(string)
		return ok && x == y
	case json.Number:
		y, ok := b.(json.Number)
		if !ok {
			return false
		}
		xr, xok := new(big.Rat).SetString(string(x))
		yr, yok := new(big.Rat).SetString(string(y))
		return xok && yok && xr.Cmp(yr) == 0
	case []any:
		y, ok := b.([]any)
		if !ok || len(x) != len(y) {
			return false
		}
		for i := range x {
			if !Equal(x[i], y[i]) {
				return false
			}
		}
		return true
	case map[string]any:
		y, ok := b.(map[string]any)
		if !ok || len(x) != len(y) {
			return false
		}
		for k, xv := range x {
			yv, ok := y[k]
			if !ok || !Equal(xv, yv) {
				return false
			}
		}
		return true
	}
	return false
}
