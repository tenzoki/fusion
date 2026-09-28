// ---------------------------------------------------------------------------
// The strict reader: bytes in, one JSON object or a typed refusal out.
//
// Prior's `concept/fusion-json-workbench-spec.md` §4 fixes the limits a
// control record must meet: UTF-8 without a byte order mark, exactly one JSON
// object, no comments, no duplicate keys, no non-finite numbers, at most 1 MiB.
// `JSON.parse` already refuses comments, `NaN` and `Infinity`, a second
// top-level value and a bad escape, but it silently keeps the LAST of two
// duplicate keys and it does not care what the bytes were before decoding.
// This module adds exactly those checks and names every refusal.
//
// It is deliberately not a second JSON grammar. The scanner below recognises
// only what it needs to find duplicate keys and a second top-level value: the
// six punctuators, strings (so that a `{` inside a string is not a nesting),
// and runs of bare characters (so that `NaN` can be named). Everything the
// scanner does not understand it leaves to `JSON.parse`, whose message becomes
// the `syntax` detail. Every valid JSON document is inside the scanner's model,
// so a deferral always ends in a `JSON.parse` error; a deferral that did not is
// a defect in this file and is thrown, never swallowed, because it would mean
// duplicate keys went unchecked.
//
// Precedence, when a document breaks more than one rule: the byte-level checks
// first (`too-large`, `bom`, `invalid-utf8`, in that order), then the scanner's
// finding in document order (`non-finite`, `duplicate-key`, `multiple-values`,
// whichever comes first in the text), then `syntax`, then `not-an-object`.
// ---------------------------------------------------------------------------

/** The cap on a control record, in bytes: 1 MiB, spec §4. */
export const MAX_RECORD_BYTES = 1_048_576;

export const STRICT_REASONS = [
  "bom",
  "too-large",
  "invalid-utf8",
  "duplicate-key",
  "non-finite",
  "multiple-values",
  "not-an-object",
  "syntax",
] as const;

export type StrictReason = (typeof STRICT_REASONS)[number];

export interface StrictRefusal {
  ok: false;
  class: "schema-invalid";
  reason: StrictReason;
  detail: string;
}

export type StrictParseResult = { ok: true; value: unknown } | StrictRefusal;

const refuse = (reason: StrictReason, detail: string): StrictRefusal => ({
  ok: false,
  class: "schema-invalid",
  reason,
  detail,
});

export function strictParse(bytes: Uint8Array): StrictParseResult {
  if (bytes.byteLength > MAX_RECORD_BYTES) {
    return refuse("too-large", `${bytes.byteLength} bytes; the cap is ${MAX_RECORD_BYTES} bytes (1 MiB)`);
  }
  if (bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return refuse("bom", "UTF-8 byte order mark (EF BB BF) at offset 0");
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return refuse("invalid-utf8", "the bytes are not well-formed UTF-8");
  }

  const found = scan(text);
  if (found !== null) return found;

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return refuse("syntax", e instanceof Error ? e.message : String(e));
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return refuse("not-an-object", `the top-level value is ${describe(value)}, not an object`);
  }
  return { ok: true, value };
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  return `a ${typeof value}`;
}

// ---------------------------------------------------------------------------
// The scanner.
// ---------------------------------------------------------------------------

type Frame =
  | { kind: "object"; keys: Set<string>; expect: "first-key" | "key" | "colon" | "value" | "comma"; key: string }
  | { kind: "array"; expect: "first-value" | "value" | "comma"; index: number };

const isWhitespace = (c: number): boolean => c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d;

// Letters, digits, `+`, `-` and `.`: everything a number or literal token is made of.
const isBare = (c: number): boolean =>
  (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || c === 0x2b || c === 0x2d || c === 0x2e;

const NON_FINITE = /^[+-]?(NaN|Infinity)$/;

/** The JSON path of the value the innermost frame is currently reading. */
function pathOf(frames: readonly Frame[]): string {
  let p = "$";
  for (const f of frames) p += f.kind === "object" ? `.${f.key}` : `[${f.index}]`;
  return p;
}

/**
 * Returns the first refusal the token stream shows, or null when the scanner
 * saw nothing it refuses: either the document is inside the model and clean, or
 * the scanner met something outside its model and defers to `JSON.parse`.
 */
function scan(text: string): StrictRefusal | null {
  const stack: Frame[] = [];
  let topDone = false;
  const n = text.length;
  let i = 0;

  const valueDone = (): void => {
    const f = stack[stack.length - 1];
    if (f === undefined) topDone = true;
    else f.expect = "comma";
  };

  while (i < n) {
    const c = text.charCodeAt(i);
    if (isWhitespace(c)) {
      i++;
      continue;
    }
    const f = stack[stack.length - 1];
    const expectsValue =
      f === undefined
        ? !topDone
        : f.kind === "object"
          ? f.expect === "value"
          : f.expect === "first-value" || f.expect === "value";

    // After the one top-level value, anything that could begin another value
    // is a second value. Anything else is left to `JSON.parse` to name.
    if (topDone) {
      if (c === 0x7b || c === 0x5b || c === 0x22 || isBare(c)) {
        return refuse("multiple-values", `a second top-level value begins at character offset ${i}`);
      }
      return null;
    }

    switch (c) {
      case 0x22: {
        // "
        const end = stringEnd(text, i);
        if (end < 0) return null;
        if (f !== undefined && f.kind === "object" && (f.expect === "first-key" || f.expect === "key")) {
          const key = decodeKey(text.slice(i, end + 1));
          if (key === undefined) return null;
          if (f.keys.has(key)) {
            return refuse("duplicate-key", `key "${key}" appears twice in ${pathOf(stack.slice(0, -1))}`);
          }
          f.keys.add(key);
          f.key = key;
          f.expect = "colon";
        } else if (expectsValue) {
          valueDone();
        } else {
          return null;
        }
        i = end + 1;
        continue;
      }
      case 0x7b: // {
        if (!expectsValue) return null;
        stack.push({ kind: "object", keys: new Set(), expect: "first-key", key: "" });
        break;
      case 0x5b: // [
        if (!expectsValue) return null;
        stack.push({ kind: "array", expect: "first-value", index: 0 });
        break;
      case 0x7d: // }
        if (f === undefined || f.kind !== "object" || (f.expect !== "first-key" && f.expect !== "comma")) return null;
        stack.pop();
        valueDone();
        break;
      case 0x5d: // ]
        if (f === undefined || f.kind !== "array" || (f.expect !== "first-value" && f.expect !== "comma")) return null;
        stack.pop();
        valueDone();
        break;
      case 0x3a: // :
        if (f === undefined || f.kind !== "object" || f.expect !== "colon") return null;
        f.expect = "value";
        break;
      case 0x2c: // ,
        if (f === undefined || f.expect !== "comma") return null;
        if (f.kind === "object") f.expect = "key";
        else {
          f.index++;
          f.expect = "value";
        }
        break;
      default: {
        if (!isBare(c)) return null;
        let j = i + 1;
        while (j < n && isBare(text.charCodeAt(j))) j++;
        const word = text.slice(i, j);
        if (NON_FINITE.test(word)) {
          return refuse("non-finite", `${word} at character offset ${i} (${pathOf(stack)}) is not a JSON number`);
        }
        if (!expectsValue) return null;
        valueDone();
        i = j;
        continue;
      }
    }
    i++;
  }
  return null;
}

/** Index of the closing quote of the string opening at `start`, or -1 if the text ends first. */
function stringEnd(text: string, start: number): number {
  let j = start + 1;
  while (j < text.length) {
    const c = text.charCodeAt(j);
    if (c === 0x5c) j += 2; // backslash: skip the escaped character
    else if (c === 0x22) return j;
    else j++;
  }
  return -1;
}

/**
 * The key a raw string token denotes, so that `"a"` and `"a"` compare
 * equal. `JSON.parse` does the unescaping: this file writes no string grammar.
 * Undefined when the token is not a valid JSON string, which `JSON.parse` of
 * the whole document will then report.
 */
function decodeKey(raw: string): string | undefined {
  if (!raw.includes("\\")) return raw.slice(1, -1);
  try {
    const v: unknown = JSON.parse(raw);
    return typeof v === "string" ? v : undefined;
  } catch {
    return undefined;
  }
}
