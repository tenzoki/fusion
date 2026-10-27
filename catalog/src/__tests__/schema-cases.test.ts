// The shared schema contract cases, asserted by ajv: every row of each table
// under `testdata/` validates against the schema it names with exactly the
// verdict it records. The Go validator in
// `adapters/prior/fusionmodule/internal/steps/schema_cases_test.go` asserts the
// same rows, so the two validators agree on them or one of the suites is red.
//
// The entry table of fusion.entry.v2 (entry-request.v1 and entry-result.v2):
// plan step 2 of 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-
// model.md, the table itself that plan's step 3. The repair table and the
// fusion.entry.v1 table are no longer run: repair is withdrawn (decision
// 261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-
// entry-model) and entry v1 is not served. No table holds explorer rows; the
// explorer's schemas are held by their freeze.

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogRoot, readJson } from "../render.js";

const CATALOG = catalogRoot();
const TABLES: readonly { label: string; file: string; schemas: readonly string[] | null }[] = [
  { label: "entry v2", file: "entry-schema-cases.v2.json", schemas: ["entry-request.v1.json", "entry-result.v2.json"] },
];

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
  // A table not yet written is one failing case naming it, not a collection
  // error that would take the file's other tables down with it.
  let table: { schema: string; cases: SchemaCase[] };
  try {
    table = readJson<{ schema: string; cases: SchemaCase[] }>(join(CATALOG, "testdata", file));
  } catch (error) {
    describe(`the shared ${label}-schema cases`, () => {
      it(`loads testdata/${file}`, () => {
        throw error;
      });
    });
    continue;
  }

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
        for (const c of table.cases) expect(schemas, c.name).toContain(c.schema);
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
