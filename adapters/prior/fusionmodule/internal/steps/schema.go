package steps

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"regexp"
	"unicode/utf8"
)

// A JSON Schema validator over the keyword subset the bundle's four shipped
// schemas use, draft 2020-12 semantics, standard library only: the adapter may
// import nothing but moduleapi/v1 and the standard library (Prior answer
// 67.4), and the host compiles the same files with a full validator, so this
// one must agree with it on every keyword it accepts and refuse every keyword
// it does not implement. An unknown keyword is a compile error, never an
// annotation silently ignored: a schema change that reaches for `$ref`,
// `patternProperties` or `format` fails here before a bundle ships rather
// than passing input the host would refuse.

// ErrSchema is returned for a schema this validator cannot compile.
var ErrSchema = errors.New("unsupported schema")

// Violation is the first failed keyword, with the JSON pointer of the value.
type Violation struct {
	Path    string
	Keyword string
	Detail  string
}

func (v *Violation) Error() string {
	path := v.Path
	if path == "" {
		path = "/"
	}
	if v.Detail == "" {
		return fmt.Sprintf("%s: %s", path, v.Keyword)
	}
	return fmt.Sprintf("%s: %s: %s", path, v.Keyword, v.Detail)
}

// Schema is a compiled schema. Zero constraints accept every value.
type Schema struct {
	always        *bool
	types         []string
	properties    map[string]*Schema
	additional    *Schema
	required      []string
	minLength     *int
	minItems      *int
	maxItems      *int
	minProperties *int
	uniqueItems   bool
	items         *Schema
	minimum       *big.Rat
	maximum       *big.Rat
	pattern       *regexp.Regexp
	enum          []any
	constValue    any
	hasConst      bool
	allOf         []*Schema
	oneOf         []*Schema
	ifSchema      *Schema
	thenSchema    *Schema
	elseSchema    *Schema
}

// CompileSchema parses and compiles one schema document.
func CompileSchema(body []byte) (*Schema, error) {
	v, err := Parse(body)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrSchema, err)
	}
	return compile(v, "#")
}

func compile(v any, at string) (*Schema, error) {
	switch doc := v.(type) {
	case bool:
		b := doc
		return &Schema{always: &b}, nil
	case map[string]any:
		return compileObject(doc, at)
	}
	return nil, fmt.Errorf("%w: %s is neither an object nor a boolean", ErrSchema, at)
}

func compileObject(doc map[string]any, at string) (*Schema, error) {
	s := &Schema{}
	for key, raw := range doc {
		where := at + "/" + key
		var err error
		switch key {
		case "$schema", "$id", "title", "description", "$comment":
			// Annotations: no constraint.
		case "type":
			s.types, err = typeList(raw, where)
		case "properties":
			obj, ok := raw.(map[string]any)
			if !ok {
				return nil, fmt.Errorf("%w: %s is not an object", ErrSchema, where)
			}
			s.properties = make(map[string]*Schema, len(obj))
			for name, sub := range obj {
				s.properties[name], err = compile(sub, where+"/"+name)
				if err != nil {
					return nil, err
				}
			}
		case "additionalProperties":
			s.additional, err = compile(raw, where)
		case "required":
			s.required, err = stringList(raw, where)
		case "minLength":
			s.minLength, err = nonNegativeInt(raw, where)
		case "minItems":
			s.minItems, err = nonNegativeInt(raw, where)
		case "maxItems":
			s.maxItems, err = nonNegativeInt(raw, where)
		case "minProperties":
			s.minProperties, err = nonNegativeInt(raw, where)
		case "uniqueItems":
			b, ok := raw.(bool)
			if !ok {
				return nil, fmt.Errorf("%w: %s is not a boolean", ErrSchema, where)
			}
			s.uniqueItems = b
		case "items":
			s.items, err = compile(raw, where)
		case "minimum":
			s.minimum, err = rational(raw, where)
		case "maximum":
			s.maximum, err = rational(raw, where)
		case "pattern":
			str, ok := raw.(string)
			if !ok {
				return nil, fmt.Errorf("%w: %s is not a string", ErrSchema, where)
			}
			s.pattern, err = regexp.Compile(str)
			if err != nil {
				return nil, fmt.Errorf("%w: %s: %v", ErrSchema, where, err)
			}
		case "enum":
			arr, ok := raw.([]any)
			if !ok || len(arr) == 0 {
				return nil, fmt.Errorf("%w: %s is not a non-empty array", ErrSchema, where)
			}
			s.enum = arr
		case "const":
			s.constValue, s.hasConst = raw, true
		case "allOf":
			s.allOf, err = schemaList(raw, where)
		case "oneOf":
			s.oneOf, err = schemaList(raw, where)
		case "if":
			s.ifSchema, err = compile(raw, where)
		case "then":
			s.thenSchema, err = compile(raw, where)
		case "else":
			s.elseSchema, err = compile(raw, where)
		default:
			return nil, fmt.Errorf("%w: keyword %q at %s is not implemented", ErrSchema, key, at)
		}
		if err != nil {
			return nil, err
		}
	}
	return s, nil
}

var typeNames = map[string]bool{"null": true, "boolean": true, "object": true, "array": true, "string": true, "number": true, "integer": true}

func typeList(raw any, where string) ([]string, error) {
	switch t := raw.(type) {
	case string:
		if !typeNames[t] {
			return nil, fmt.Errorf("%w: %s: unknown type %q", ErrSchema, where, t)
		}
		return []string{t}, nil
	case []any:
		names, err := stringList(t, where)
		if err != nil {
			return nil, err
		}
		if len(names) == 0 {
			return nil, fmt.Errorf("%w: %s is empty", ErrSchema, where)
		}
		for _, n := range names {
			if !typeNames[n] {
				return nil, fmt.Errorf("%w: %s: unknown type %q", ErrSchema, where, n)
			}
		}
		return names, nil
	}
	return nil, fmt.Errorf("%w: %s is neither a string nor an array", ErrSchema, where)
}

func stringList(raw any, where string) ([]string, error) {
	arr, ok := raw.([]any)
	if !ok {
		return nil, fmt.Errorf("%w: %s is not an array", ErrSchema, where)
	}
	out := make([]string, 0, len(arr))
	seen := map[string]bool{}
	for _, item := range arr {
		str, ok := item.(string)
		if !ok || seen[str] {
			return nil, fmt.Errorf("%w: %s holds a non-string or a duplicate", ErrSchema, where)
		}
		seen[str] = true
		out = append(out, str)
	}
	return out, nil
}

func schemaList(raw any, where string) ([]*Schema, error) {
	arr, ok := raw.([]any)
	if !ok || len(arr) == 0 {
		return nil, fmt.Errorf("%w: %s is not a non-empty array", ErrSchema, where)
	}
	out := make([]*Schema, 0, len(arr))
	for i, item := range arr {
		s, err := compile(item, fmt.Sprintf("%s/%d", where, i))
		if err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, nil
}

func nonNegativeInt(raw any, where string) (*int, error) {
	n, ok := raw.(json.Number)
	if !ok {
		return nil, fmt.Errorf("%w: %s is not a number", ErrSchema, where)
	}
	i, err := n.Int64()
	if err != nil || i < 0 || i > 1<<31 {
		return nil, fmt.Errorf("%w: %s is not a non-negative integer", ErrSchema, where)
	}
	v := int(i)
	return &v, nil
}

func rational(raw any, where string) (*big.Rat, error) {
	n, ok := raw.(json.Number)
	if !ok {
		return nil, fmt.Errorf("%w: %s is not a number", ErrSchema, where)
	}
	r, ok := new(big.Rat).SetString(string(n))
	if !ok {
		return nil, fmt.Errorf("%w: %s is not a number", ErrSchema, where)
	}
	return r, nil
}

// Validate checks a value produced by Parse and returns the first *Violation,
// or nil when the value conforms.
func (s *Schema) Validate(v any) error {
	return s.validate(v, "")
}

func (s *Schema) validate(v any, path string) error {
	if s.always != nil {
		if *s.always {
			return nil
		}
		return &Violation{path, "false", "schema accepts nothing"}
	}
	if len(s.types) > 0 && !matchesAnyType(v, s.types) {
		return &Violation{path, "type", fmt.Sprintf("expected %v", s.types)}
	}
	if s.enum != nil {
		found := false
		for _, candidate := range s.enum {
			if Equal(v, candidate) {
				found = true
				break
			}
		}
		if !found {
			return &Violation{path, "enum", ""}
		}
	}
	if s.hasConst && !Equal(v, s.constValue) {
		return &Violation{path, "const", ""}
	}
	switch t := v.(type) {
	case map[string]any:
		if err := s.validateObject(t, path); err != nil {
			return err
		}
	case []any:
		if err := s.validateArray(t, path); err != nil {
			return err
		}
	case string:
		if s.minLength != nil && utf8.RuneCountInString(t) < *s.minLength {
			return &Violation{path, "minLength", fmt.Sprintf("fewer than %d characters", *s.minLength)}
		}
		if s.pattern != nil && !s.pattern.MatchString(t) {
			return &Violation{path, "pattern", s.pattern.String()}
		}
	case json.Number:
		r, ok := new(big.Rat).SetString(string(t))
		if !ok {
			return &Violation{path, "type", "not a number"}
		}
		if s.minimum != nil && r.Cmp(s.minimum) < 0 {
			return &Violation{path, "minimum", s.minimum.RatString()}
		}
		if s.maximum != nil && r.Cmp(s.maximum) > 0 {
			return &Violation{path, "maximum", s.maximum.RatString()}
		}
	}
	for i, sub := range s.allOf {
		if err := sub.validate(v, path); err != nil {
			return &Violation{path, "allOf", fmt.Sprintf("branch %d: %v", i, err)}
		}
	}
	if len(s.oneOf) > 0 {
		matches := 0
		for _, sub := range s.oneOf {
			if sub.validate(v, path) == nil {
				matches++
			}
		}
		if matches != 1 {
			return &Violation{path, "oneOf", fmt.Sprintf("%d branches match", matches)}
		}
	}
	if s.ifSchema != nil {
		if s.ifSchema.validate(v, path) == nil {
			if s.thenSchema != nil {
				if err := s.thenSchema.validate(v, path); err != nil {
					return &Violation{path, "then", err.Error()}
				}
			}
		} else if s.elseSchema != nil {
			if err := s.elseSchema.validate(v, path); err != nil {
				return &Violation{path, "else", err.Error()}
			}
		}
	}
	return nil
}

func (s *Schema) validateObject(obj map[string]any, path string) error {
	for _, name := range s.required {
		if _, ok := obj[name]; !ok {
			return &Violation{path, "required", name}
		}
	}
	if s.minProperties != nil && len(obj) < *s.minProperties {
		return &Violation{path, "minProperties", fmt.Sprintf("fewer than %d members", *s.minProperties)}
	}
	for name, value := range obj {
		member := path + "/" + escapePointer(name)
		if sub, ok := s.properties[name]; ok {
			if err := sub.validate(value, member); err != nil {
				return err
			}
			continue
		}
		if s.additional != nil {
			if err := s.additional.validate(value, member); err != nil {
				if s.additional.always != nil {
					return &Violation{member, "additionalProperties", "not permitted"}
				}
				return err
			}
		}
	}
	return nil
}

func (s *Schema) validateArray(arr []any, path string) error {
	if s.minItems != nil && len(arr) < *s.minItems {
		return &Violation{path, "minItems", fmt.Sprintf("fewer than %d items", *s.minItems)}
	}
	if s.maxItems != nil && len(arr) > *s.maxItems {
		return &Violation{path, "maxItems", fmt.Sprintf("more than %d items", *s.maxItems)}
	}
	if s.uniqueItems {
		for i := range arr {
			for j := i + 1; j < len(arr); j++ {
				if Equal(arr[i], arr[j]) {
					return &Violation{path, "uniqueItems", fmt.Sprintf("items %d and %d are equal", i, j)}
				}
			}
		}
	}
	if s.items != nil {
		for i, item := range arr {
			if err := s.items.validate(item, fmt.Sprintf("%s/%d", path, i)); err != nil {
				return err
			}
		}
	}
	return nil
}

func matchesAnyType(v any, names []string) bool {
	for _, name := range names {
		if matchesType(v, name) {
			return true
		}
	}
	return false
}

func matchesType(v any, name string) bool {
	switch name {
	case "null":
		return v == nil
	case "boolean":
		_, ok := v.(bool)
		return ok
	case "object":
		_, ok := v.(map[string]any)
		return ok
	case "array":
		_, ok := v.([]any)
		return ok
	case "string":
		_, ok := v.(string)
		return ok
	case "number":
		_, ok := v.(json.Number)
		return ok
	case "integer":
		n, ok := v.(json.Number)
		if !ok {
			return false
		}
		if _, err := n.Int64(); err == nil {
			return true
		}
		r, ok := new(big.Rat).SetString(string(n))
		return ok && r.IsInt()
	}
	return false
}

func escapePointer(name string) string {
	out := make([]byte, 0, len(name))
	for i := 0; i < len(name); i++ {
		switch name[i] {
		case '~':
			out = append(out, '~', '0')
		case '/':
			out = append(out, '~', '1')
		default:
			out = append(out, name[i])
		}
	}
	return string(out)
}
