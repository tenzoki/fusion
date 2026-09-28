import { describe, expect, it } from "vitest";
import { MAX_RECORD_BYTES, STRICT_REASONS, strictParse, type StrictReason } from "../strict-json.js";

const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);

function refused(bytes: Uint8Array, reason: StrictReason): string {
  const r = strictParse(bytes);
  expect(r.ok, "expected a refusal").toBe(false);
  if (r.ok) throw new Error("unreachable");
  expect(r.class).toBe("schema-invalid");
  expect(r.reason).toBe(reason);
  expect(r.detail.length).toBeGreaterThan(0);
  return r.detail;
}

function accepted(bytes: Uint8Array): unknown {
  const r = strictParse(bytes);
  expect(r.ok, r.ok ? "" : `${r.reason}: ${r.detail}`).toBe(true);
  return r.ok ? r.value : undefined;
}

describe("strictParse accepts", () => {
  it("one object, nested, with escapes and braces inside strings", () => {
    const value = accepted(utf8('{"a": 1, "b": {"c": [1, 2.5e3, {"d": null}]}, "e": "x\\"y{}[]", "f": [true, false]}'));
    expect(value).toEqual({ a: 1, b: { c: [1, 2500, { d: null }] }, e: 'x"y{}[]', f: [true, false] });
  });

  it("a CRLF-only document", () => {
    expect(accepted(utf8('{\r\n  "a": 1,\r\n  "b": [\r\n    2\r\n  ]\r\n}\r\n'))).toEqual({ a: 1, b: [2] });
  });

  it("the same key in sibling objects and in array elements", () => {
    expect(accepted(utf8('{"a": {"x": 1}, "b": {"x": 1}, "c": [{"x": 1}, {"x": 2}]}'))).toBeDefined();
  });

  it("an empty object and empty containers inside", () => {
    expect(accepted(utf8("{}"))).toEqual({});
    expect(accepted(utf8('{"a": {}, "b": []}'))).toEqual({ a: {}, b: [] });
  });

  it("a document of exactly 1 MiB", () => {
    const head = '{"k": "';
    const tail = '"}';
    const doc = head + "a".repeat(MAX_RECORD_BYTES - head.length - tail.length) + tail;
    const bytes = utf8(doc);
    expect(bytes.byteLength).toBe(MAX_RECORD_BYTES);
    expect(accepted(bytes)).toBeDefined();
  });
});

describe("strictParse refuses", () => {
  it("names eight reasons and a 1 MiB cap", () => {
    expect(STRICT_REASONS).toHaveLength(8);
    expect(MAX_RECORD_BYTES).toBe(1_048_576);
  });

  it("bom: a UTF-8 byte order mark", () => {
    const bytes = Uint8Array.from([0xef, 0xbb, 0xbf, ...utf8("{}")]);
    refused(bytes, "bom");
  });

  it("too-large: one byte over 1 MiB, before any decoding", () => {
    const head = '{"k": "';
    const tail = '"}';
    const doc = head + "a".repeat(MAX_RECORD_BYTES - head.length - tail.length + 1) + tail;
    const bytes = utf8(doc);
    expect(bytes.byteLength).toBe(MAX_RECORD_BYTES + 1);
    expect(refused(bytes, "too-large")).toContain(String(MAX_RECORD_BYTES + 1));
    // The cap beats every other check: invalid UTF-8 past the cap is still too-large.
    const overAndBroken = new Uint8Array(MAX_RECORD_BYTES + 1).fill(0xff);
    refused(overAndBroken, "too-large");
  });

  it("invalid-utf8: a stray continuation byte inside a string", () => {
    const bytes = Uint8Array.from([...utf8('{"a": "'), 0xff, ...utf8('"}')]);
    refused(bytes, "invalid-utf8");
  });

  describe("duplicate-key", () => {
    it("at the top level", () => {
      expect(refused(utf8('{"a": 1, "a": 2}'), "duplicate-key")).toContain('"a"');
    });

    it("at depth, naming the path", () => {
      const detail = refused(utf8('{"a": {"b": [{"x": 1, "y": 2, "x": 3}]}}'), "duplicate-key");
      expect(detail).toContain('"x"');
      expect(detail).toContain("$.a.b[0]");
    });

    it("when the two spellings differ only by escape", () => {
      refused(utf8('{"a": 1, "\\u0061": 2}'), "duplicate-key");
    });

    it("when a brace inside a string separates the two", () => {
      refused(utf8('{"a": "{", "a": 2}'), "duplicate-key");
      refused(utf8('{"a": "}{\\"", "b": 1, "a": 2}'), "duplicate-key");
    });

    it("after a comma and whitespace in any layout", () => {
      refused(utf8('{\r\n"a":1\r\n,\r\n"a":1\r\n}'), "duplicate-key");
    });
  });

  describe("non-finite", () => {
    it.each(["NaN", "Infinity", "-Infinity"])("%s as a value", (token) => {
      expect(refused(utf8(`{"a": ${token}}`), "non-finite")).toContain(token);
    });

    it("inside an array at depth", () => {
      refused(utf8('{"a": [1, {"b": Infinity}]}'), "non-finite");
    });

    it("at the top level, before not-an-object", () => {
      refused(utf8("NaN"), "non-finite");
    });
  });

  describe("multiple-values", () => {
    it.each(['{} {}', '{"a": 1}\n{"b": 2}', '{} 1', '{} "s"', '{} []', '{}null'])("%j", (doc) => {
      refused(utf8(doc), "multiple-values");
    });
  });

  describe("not-an-object", () => {
    it.each(["[]", '["a"]', '"s"', "1", "null", "true"])("%s", (doc) => {
      refused(utf8(doc), "not-an-object");
    });
  });

  describe("syntax", () => {
    it.each([
      "",
      "   ",
      '{"a": }',
      '{"a" 1}',
      "{'a': 1}",
      '{"a": 1,}',
      '{"a": 01}',
      '{"a": "x',
      '{"a": 1',
      '{"a": 1}}',
      '{"a": 1 /* c */}',
      '// c\n{}',
      '{"a": "\\q"}',
      '{"\\q": 1}',
      "{,}",
      '{"a": 1} }',
    ])("%j", (doc) => {
      refused(utf8(doc), "syntax");
    });
  });
});
