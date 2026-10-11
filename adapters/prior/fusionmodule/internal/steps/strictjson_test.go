package steps

import (
	"encoding/json"
	"testing"
)

func TestParseRefusesWhatPriorRefuses(t *testing.T) {
	bad := map[string]string{
		"duplicate key":        `{"a":1,"a":2}`,
		"nested duplicate key": `{"a":{"b":1,"b":2}}`,
		"trailing value":       `{"a":1} 2`,
		"trailing garbage":     `{"a":1}x`,
		"empty":                ``,
		"invalid utf-8":        "{\"a\":\"\xff\"}",
		"unterminated":         `{"a":`,
	}
	for name, body := range bad {
		if _, err := Parse([]byte(body)); err == nil {
			t.Errorf("%s: accepted %q", name, body)
		}
	}
	v, err := Parse([]byte(` {"a":[1, 2.5, "x", true, null, {}]} `))
	if err != nil {
		t.Fatal(err)
	}
	arr := v.(map[string]any)["a"].([]any)
	if len(arr) != 6 || arr[0] != json.Number("1") || arr[1] != json.Number("2.5") || arr[2] != "x" || arr[3] != true || arr[4] != nil {
		t.Fatalf("parsed %#v", arr)
	}
}

func TestEqualComparesJSONValues(t *testing.T) {
	cases := []struct {
		a, b string
		want bool
	}{
		{`1`, `1.0`, true},
		{`1`, `"1"`, false},
		{`{"a":1,"b":[1,2]}`, `{"b":[1,2],"a":1}`, true},
		{`{"a":1}`, `{"a":1,"b":null}`, false},
		{`[1,2]`, `[2,1]`, false},
		{`null`, `null`, true},
		{`null`, `false`, false},
	}
	for _, c := range cases {
		var a, b any
		d := json.NewDecoder(stringsReader(c.a))
		d.UseNumber()
		if err := d.Decode(&a); err != nil {
			t.Fatal(err)
		}
		d = json.NewDecoder(stringsReader(c.b))
		d.UseNumber()
		if err := d.Decode(&b); err != nil {
			t.Fatal(err)
		}
		if got := Equal(a, b); got != c.want {
			t.Errorf("Equal(%s, %s) = %v", c.a, c.b, got)
		}
	}
}
