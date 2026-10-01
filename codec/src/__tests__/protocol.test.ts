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
  properties: { op: { const: string }; kind?: { const?: string; enum?: string[] } };
  additionalProperties: boolean;
  required: string[];
}
interface ProtocolSchema {
  $id: string;
  properties: { op: { enum: string[] } };
  oneOf: Branch[];
}

/** The operations whose request has two branches of the schema, adjacent. */
const TWO_BRANCHES: readonly string[] = ["create", "maintenance"];
/** An operation with no single valid fixture names one per branch; every other one is `<op>.json`. */
const VALID_FIXTURES: Readonly<Record<string, readonly string[]>> = { maintenance: ["maintenance-begin.json", "maintenance-end.json"] };

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

  it("names the sixteen operations, spec section 6's table and maintenance after reconcile, in both the enum and the branches", () => {
    const s = schema();
    expect(OPERATIONS).toHaveLength(16);
    expect(OPERATIONS.indexOf("initialize")).toBe(OPERATIONS.indexOf("validate") + 1);
    expect(OPERATIONS.indexOf("maintenance")).toBe(OPERATIONS.indexOf("reconcile") + 1);
    expect(OPERATIONS.at(-1)).toBe("migration");
    expect(s.properties.op.enum).toEqual([...OPERATIONS]);
    // One branch per operation in the table's order, except the two that
    // carry two adjacent ones: create, the record create and the evidence
    // create (FJ02b settled choice 1, Prior's request 19), and maintenance,
    // begin and end (request 39).
    const expected = OPERATIONS.flatMap((op) => (TWO_BRANCHES.includes(op) ? [op, op] : [op]));
    expect(s.oneOf.map((b) => b.properties.op.const)).toEqual(expected);
  });

  it("the two maintenance branches are disjoint on action: begin carries no fence, end requires one", () => {
    const branches = schema().oneOf.filter((b) => b.properties.op.const === "maintenance") as unknown as Array<{ required: string[]; properties: Record<string, { const?: string }> }>;
    expect(branches.map((b) => b.properties.action?.const)).toEqual(["begin", "end"]);
    const [begin, end] = branches as [(typeof branches)[number], (typeof branches)[number]];
    expect(begin.required.slice().sort()).toEqual(["action", "op", "operation_id"]);
    expect(Object.keys(begin.properties).sort()).toEqual(["action", "op", "operation_id", "workbench"]);
    expect(end.required.slice().sort()).toEqual(["action", "fence", "op", "operation_id"]);
    expect(Object.keys(end.properties).sort()).toEqual(["action", "fence", "op", "operation_id", "workbench"]);
  });

  it("the two create branches are disjoint on kind: the evidence branch's is const evidence, the record branch's enum lacks it", () => {
    const creates = schema().oneOf.filter((b) => b.properties.op.const === "create");
    expect(creates).toHaveLength(2);
    const [record, evidence] = creates as [Branch, Branch];
    expect(evidence.properties.kind?.const).toBe("evidence");
    expect(evidence.properties.kind?.enum).toBeUndefined();
    expect(evidence.required).toContain("kind");
    expect(record.properties.kind?.const).toBeUndefined();
    expect(record.properties.kind?.enum).toEqual(["package", "issue", "plan", "discussion", "decision"]);
    expect(record.properties.kind?.enum).not.toContain("evidence");
    expect(record.required).toContain("kind");
  });

  it("every branch is closed: additionalProperties false, op required", () => {
    for (const b of schema().oneOf) {
      expect(b.additionalProperties, b.properties.op.const).toBe(false);
      expect(b.required, b.properties.op.const).toContain("op");
    }
  });

  it("every mutation branch requires an operation_id; every read branch forbids one", () => {
    const mutations = ["initialize", "create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "maintenance"];
    for (const b of schema().oneOf) {
      const op = b.properties.op.const;
      const hasId = b.required.includes("operation_id");
      expect(hasId, `${op} ${hasId ? "carries" : "lacks"} operation_id`).toBe(mutations.includes(op));
    }
  });

  it("the initialize branch requires the workbench and the new workbench's id, and admits no manifest", () => {
    const branch = schema().oneOf.find((b) => b.properties.op.const === "initialize");
    expect(branch?.required.slice().sort()).toEqual(["id", "op", "operation_id", "workbench"]);
    expect(Object.keys(branch?.properties ?? {}).sort()).toEqual(["id", "op", "operation_id", "workbench"]);
  });

  it("the answered operations are every operation of the table but migration", () => {
    expect(IMPLEMENTED_OPERATIONS).toEqual(["inspect", "list", "show", "validate", "initialize", "create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "reconcile", "maintenance"]);
    expect(OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o))).toEqual(["migration"]);
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
    const valid = VALID_FIXTURES[op] ?? [`${op}.json`];
    it(`${op}: ${valid.map((f) => `valid/protocol/${f}`).join(" and ")} validate${valid.length === 1 ? "s" : ""} and name the op`, () => {
      for (const name of valid) {
        const file = join(validDir, name);
        expect(existsSync(file), file).toBe(true);
        const parsed = strictParse(readFileSync(file));
        expect(parsed.ok, name).toBe(true);
        if (!parsed.ok) return;
        expect((parsed.value as { op: string }).op, name).toBe(op);
        expect(validate(PROTOCOL_SCHEMA_ID, parsed.value), name).toEqual({ ok: true });
      }
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
