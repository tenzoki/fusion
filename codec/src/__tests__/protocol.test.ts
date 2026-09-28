// ---------------------------------------------------------------------------
// The protocol module against its schema.
//
// `protocol.ts` and `schemas/protocol.schema.json` say the same thing twice
// on purpose (the header of `protocol.ts` says why); this suite is what keeps
// them from drifting apart: the operation list, the discriminator branches,
// the error classes and the request fixtures are each read from one side and
// asserted against the other. The per-fixture outcomes themselves are the
// manifest suite's business (`fixtures.test.ts`); here the fixtures are the
// evidence that every op has a valid and an invalid shape on disk.
// ---------------------------------------------------------------------------

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ERROR_CLASSES, IMPLEMENTED_OPERATIONS, OPERATIONS, PROTOCOL_SCHEMA_ID, fail, isOperation } from "../cli/protocol.js";
import { strictParse } from "../strict-json.js";
import { schemaIds, schemas, validate } from "../validate.js";

const FIXTURES_DIR = fileURLToPath(new URL("../../fixtures/", import.meta.url));
const SCHEMA_FILE = fileURLToPath(new URL("../../schemas/protocol.schema.json", import.meta.url));

interface Branch {
  properties: { op: { const: string } };
  additionalProperties: boolean;
  required: string[];
}
interface ProtocolSchema {
  $id: string;
  properties: { op: { enum: string[] } };
  oneOf: Branch[];
}

const schema = (): ProtocolSchema => {
  const parsed = strictParse(readFileSync(SCHEMA_FILE));
  if (!parsed.ok) throw new Error(`${SCHEMA_FILE}: ${parsed.reason}: ${parsed.detail}`);
  return parsed.value as ProtocolSchema;
};

describe("the protocol schema is the seventh schema of the default set", () => {
  it("is loaded under its $id by the directory loader", () => {
    expect(schemaIds()).toContain(PROTOCOL_SCHEMA_ID);
    expect(schema().$id).toBe(PROTOCOL_SCHEMA_ID);
    expect(schemas().document(PROTOCOL_SCHEMA_ID)).toBeDefined();
  });

  it("names the fourteen operations of spec section 6, in the table's order, in both the enum and the branches", () => {
    const s = schema();
    expect(OPERATIONS).toHaveLength(14);
    expect(s.properties.op.enum).toEqual([...OPERATIONS]);
    expect(s.oneOf.map((b) => b.properties.op.const)).toEqual([...OPERATIONS]);
  });

  it("every branch is closed: additionalProperties false, op required", () => {
    for (const b of schema().oneOf) {
      expect(b.additionalProperties, b.properties.op.const).toBe(false);
      expect(b.required, b.properties.op.const).toContain("op");
    }
  });

  it("every mutation branch requires an operation_id; every read branch forbids one", () => {
    const mutations = ["create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence"];
    for (const b of schema().oneOf) {
      const op = b.properties.op.const;
      const hasId = b.required.includes("operation_id");
      expect(hasId, `${op} ${hasId ? "carries" : "lacks"} operation_id`).toBe(mutations.includes(op));
    }
  });

  it("the five FJ01 operations are the read set plus transition", () => {
    expect(IMPLEMENTED_OPERATIONS).toEqual(["inspect", "list", "show", "validate", "transition"]);
    for (const op of IMPLEMENTED_OPERATIONS) expect(isOperation(op)).toBe(true);
    expect(isOperation("delete")).toBe(false);
    expect(isOperation(42)).toBe(false);
  });

  it("the eight error classes are the spec's, in the spec's order", () => {
    expect(ERROR_CLASSES).toEqual([
      "schema-invalid",
      "unsupported-format",
      "conflict",
      "unknown-scope",
      "missing-evidence",
      "unresolved-reference",
      "operation-unknown",
      "migration-incomplete",
    ]);
  });

  it("fail() builds the envelope and leaves absent fields absent", () => {
    expect(fail("conflict", "revision-mismatch")).toEqual({ ok: false, error: { class: "conflict", reason: "revision-mismatch" } });
    expect(fail("conflict", "revision-mismatch", "stored x expected y")).toEqual({
      ok: false,
      error: { class: "conflict", reason: "revision-mismatch", detail: "stored x expected y" },
    });
  });
});

describe("every operation has a valid and an invalid request fixture", () => {
  const validDir = join(FIXTURES_DIR, "valid", "protocol");
  const invalidDir = join(FIXTURES_DIR, "invalid", "protocol");
  const invalidFiles = existsSync(invalidDir) ? readdirSync(invalidDir) : [];

  for (const op of OPERATIONS) {
    it(`${op}: valid/protocol/${op}.json validates and names the op`, () => {
      const file = join(validDir, `${op}.json`);
      expect(existsSync(file), file).toBe(true);
      const parsed = strictParse(readFileSync(file));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;
      expect((parsed.value as { op: string }).op).toBe(op);
      expect(validate(PROTOCOL_SCHEMA_ID, parsed.value)).toEqual({ ok: true });
    });

    it(`${op}: an invalid fixture exists under invalid/protocol/ and is refused`, () => {
      const mine = invalidFiles.filter((f) => f === `${op}.json` || f.startsWith(`${op}-`));
      expect(mine.length, `no invalid/protocol/${op}-*.json`).toBeGreaterThan(0);
      for (const f of mine) {
        const parsed = strictParse(readFileSync(join(invalidDir, f)));
        expect(parsed.ok, f).toBe(true);
        if (!parsed.ok) continue;
        expect(validate(PROTOCOL_SCHEMA_ID, parsed.value).ok, `${f} was accepted`).toBe(false);
      }
    });
  }

  it("a request whose op is outside the table matches no branch", () => {
    expect(validate(PROTOCOL_SCHEMA_ID, { op: "delete" }).ok).toBe(false);
    expect(validate(PROTOCOL_SCHEMA_ID, {}).ok).toBe(false);
  });

  it("workbench is optional on every branch and must be absolute when present", () => {
    expect(validate(PROTOCOL_SCHEMA_ID, { op: "inspect" })).toEqual({ ok: true });
    expect(validate(PROTOCOL_SCHEMA_ID, { op: "inspect", workbench: "relative/path" }).ok).toBe(false);
  });
});
