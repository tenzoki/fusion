import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadSchemas, schemaIds, validate } from "../validate.js";

// A throwaway schema directory: the loader is exercised against schemas this
// test controls, so the assertions hold whether or not `codec/schemas/` is
// populated yet. Cross-schema `$ref`s use URN ids, the form that resolves under
// RFC 3986; a scheme-less id such as `x.common/v1` does not (see the report
// that landed this file).
const dirs: string[] = [];
function schemaDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "codec-validate-"));
  dirs.push(dir);
  for (const [name, schema] of Object.entries(files)) {
    writeFileSync(join(dir, name), typeof schema === "string" ? schema : JSON.stringify(schema, null, 2) + "\n");
  }
  return dir;
}
afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

const META = "https://json-schema.org/draft/2020-12/schema";
const common = {
  $schema: META,
  $id: "urn:test:common:v1",
  $defs: {
    hex: { type: "string", pattern: "^[0-9a-f]+$" },
    stamp: { type: "string", format: "date-time" },
  },
};
const thing = {
  $schema: META,
  $id: "urn:test:thing:v1",
  type: "object",
  additionalProperties: false,
  required: ["h", "at"],
  properties: {
    h: { $ref: "urn:test:common:v1#/$defs/hex" },
    at: { $ref: "urn:test:common:v1#/$defs/stamp" },
    status: { enum: ["open", "claimed"] },
    claim: { type: ["object", "null"] },
  },
  if: { required: ["status"], properties: { status: { const: "claimed" } } },
  then: { required: ["claim"] },
};

describe("loadSchemas", () => {
  it("keys every *.schema.json by its $id and resolves $ref across files", () => {
    const set = loadSchemas(schemaDir({ "common.schema.json": common, "thing.schema.json": thing, "notes.json": { ignored: true } }));
    expect(set.ids()).toEqual(["urn:test:common:v1", "urn:test:thing:v1"]);
    expect(set.validate("urn:test:thing:v1", { h: "ab", at: "2026-09-28T10:00:00+02:00" })).toEqual({ ok: true });
  });

  it("reports every error with instancePath, keyword and message", () => {
    const set = loadSchemas(schemaDir({ "common.schema.json": common, "thing.schema.json": thing }));
    const r = set.validate("urn:test:thing:v1", { h: "XY", at: "2026-09-28T10:00:00", extra: 1 });
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error("unreachable");
    expect(r.class).toBe("schema-invalid");
    if (r.class !== "schema-invalid") throw new Error("unreachable");
    const byPath = Object.fromEntries(r.errors.map((e) => [e.instancePath + ":" + e.keyword, e.message]));
    expect(Object.keys(byPath).sort()).toEqual(["/at:format", "/h:pattern", ":additionalProperties"]);
    for (const m of Object.values(byPath)) expect(m.length).toBeGreaterThan(0);
  });

  it("a date-time without an offset is refused; with one it passes", () => {
    const set = loadSchemas(schemaDir({ "common.schema.json": common, "thing.schema.json": thing }));
    expect(set.validate("urn:test:thing:v1", { h: "0", at: "2026-09-28T10:00:00Z" }).ok).toBe(true);
    expect(set.validate("urn:test:thing:v1", { h: "0", at: "2026-09-28T10:00:00" }).ok).toBe(false);
  });

  it("a `required` inside `then` is accepted under the loader's strict configuration", () => {
    const set = loadSchemas(schemaDir({ "common.schema.json": common, "thing.schema.json": thing }));
    const base = { h: "0", at: "2026-09-28T10:00:00Z" };
    expect(set.validate("urn:test:thing:v1", { ...base, status: "open" }).ok).toBe(true);
    const r = set.validate("urn:test:thing:v1", { ...base, status: "claimed" });
    expect(r.ok).toBe(false);
    if (!r.ok && r.class === "schema-invalid") expect(r.errors.map((e) => e.keyword)).toContain("required");
  });

  it("an unknown schema id is unsupported-format and names the known ids", () => {
    const set = loadSchemas(schemaDir({ "common.schema.json": common }));
    expect(set.validate("urn:test:missing:v1", {})).toEqual({
      ok: false,
      class: "unsupported-format",
      schemaId: "urn:test:missing:v1",
      known: ["urn:test:common:v1"],
    });
  });

  it("a directory that does not exist is an empty set", () => {
    const set = loadSchemas(join(tmpdir(), "codec-validate-absent-" + process.pid));
    expect(set.ids()).toEqual([]);
    expect(set.validate("anything", {}).ok).toBe(false);
  });

  it("throws on a duplicate $id, a missing $id, a duplicate key, and an unresolved $ref", () => {
    expect(() => loadSchemas(schemaDir({ "a.schema.json": common, "b.schema.json": common }))).toThrow(/already declared/);
    expect(() => loadSchemas(schemaDir({ "a.schema.json": { $schema: META, type: "object" } }))).toThrow(/no string \$id/);
    expect(() => loadSchemas(schemaDir({ "a.schema.json": '{"$id": "urn:test:x:v1", "$id": "urn:test:y:v1"}' }))).toThrow(/duplicate-key/);
    expect(() => loadSchemas(schemaDir({ "thing.schema.json": thing }))).toThrow(/can't resolve reference/);
  });

  it("throws on an unknown keyword, as strict mode demands", () => {
    expect(() => loadSchemas(schemaDir({ "a.schema.json": { $schema: META, $id: "urn:test:x:v1", type: "object", propertes: {} } }))).toThrow(/strict mode/);
  });
});

describe("the default set over codec/schemas/", () => {
  it("loads whatever is present without throwing", () => {
    const ids = schemaIds();
    expect(ids).toEqual([...ids].sort());
    console.log(`codec/schemas/: ${ids.length} schema(s) loaded${ids.length ? ": " + ids.join(", ") : ""}`);
    expect(validate("fusion.no-such-schema/v0", {})).toMatchObject({ ok: false, class: "unsupported-format" });
  });
});
