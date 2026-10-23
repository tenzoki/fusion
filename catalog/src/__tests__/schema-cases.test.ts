// The shared schema contract cases, asserted by ajv: every row of each table
// under `testdata/` validates against the schema it names with exactly the
// verdict it records. The Go validator in
// `adapters/prior/fusionmodule/internal/steps/schema_cases_test.go` asserts the
// same rows, so the two validators agree on them or one of the suites is red.
//
// The repair table: plan step 12 of
// 261022-1611-plan-prior-bundle-closing-review-follow-ups.md. The entry table
// (entry-request and entry-result of fusion.entry.v1): plan step 4 of
// 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; the Go side runs it
// from that plan's step 17.

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogRoot, readJson } from "../render.js";

const CATALOG = catalogRoot();
const TABLES = [
  { label: "repair", file: "repair-schema-cases.v1.json", schemas: null },
  { label: "entry", file: "entry-schema-cases.v1.json", schemas: ["entry-request.v1.json", "entry-result.v1.json"] },
] as const;

interface SchemaCase {
  name: string;
  schema: string;
  pointer: string;
  document: unknown;
  valid: boolean;
}

// Compiled as render.test.ts compiles the catalog's own schemas.
const ajv = new Ajv2020({ strict: false, allErrors: true });
const compiled = new Map<string, ValidateFunction>();
function validatorFor(name: string): ValidateFunction {
  let validate = compiled.get(name);
  if (!validate) {
    validate = ajv.compile(readJson<object>(join(CATALOG, "schemas", name)));
    compiled.set(name, validate);
  }
  return validate;
}

for (const { label, file, schemas } of TABLES) {
  const table = readJson<{ schema: string; cases: SchemaCase[] }>(join(CATALOG, "testdata", file));

  describe(`the shared ${label}-schema cases`, () => {
    it("is a v1 table of uniquely named rows, each naming a shipped schema at the root", () => {
      expect(table.schema).toBe("fusion.schema-cases/v1");
      expect(table.cases.length).toBeGreaterThan(0);
      const names = table.cases.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
      for (const c of table.cases) {
        expect(Object.keys(c).sort(), c.name).toEqual(["document", "name", "pointer", "schema", "valid"]);
        expect(existsSync(join(CATALOG, "schemas", c.schema)), `${c.name}: ${c.schema}`).toBe(true);
        expect(typeof c.valid, c.name).toBe("boolean");
        // The Go validator compiles a root document only, so the table holds
        // root cases only; a pointer would be asserted on one side alone.
        expect(c.pointer, `${c.name}: only the root pointer is supported`).toBe("");
      }
    });

    if (schemas !== null) {
      it("covers each of its schemas with both verdicts, and names no other schema", () => {
        for (const c of table.cases) expect(schemas as readonly string[], c.name).toContain(c.schema);
        for (const s of schemas) {
          expect(table.cases.some((c) => c.schema === s && c.valid), `${s}: no accepted row`).toBe(true);
          expect(table.cases.some((c) => c.schema === s && !c.valid), `${s}: no refused row`).toBe(true);
        }
      });
    }

    it.each(table.cases.map((c) => [c.name, c] as const))("%s", (_name, c) => {
      const validate = validatorFor(c.schema);
      const ok = validate(c.document);
      expect(ok, `${c.name} against ${c.schema}: ${JSON.stringify(validate.errors)}`).toBe(c.valid);
    });
  });
}
