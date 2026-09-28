// ---------------------------------------------------------------------------
// The validation harness: every schema under `codec/schemas/` in one Ajv.
//
// The loader hard-codes no schema name. It reads whatever `*.schema.json` files
// are present in the directory when it is first asked, keys each by its `$id`,
// and compiles all of them up front so that an unresolved `$ref` between two
// schemas fails at load, naming the file, and not at the first record that
// happens to reach the reference. Zero, some or all of the six schemas the
// FJ00 plan names may be present; the set is whatever the directory holds.
//
// Ajv runs in strict mode with one restriction lifted: `strictRequired`, which
// refuses a `required` inside `then` unless the property is re-declared there,
// because Ajv does not see a `properties` declaration in the parent through
// `allOf`/`if`/`then`. The cross-field rules spec §4.2 asks the package schema
// to carry (`status: claimed` requires a claim, and so on) are exactly such
// `if`/`then` rules, so this restriction would refuse the schemas by design.
// Every other strict-mode restriction stands: unknown keywords, unknown formats,
// ignored keywords and untyped applicators are refused.
//
// Schema files are read through `strictParse`: a schema is a control artefact
// too, and a duplicate key in one would otherwise be a silent last-wins.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { strictParse } from "./strict-json.js";

/** Where the contract's schemas live: `codec/schemas/`, beside `src/`. */
export const SCHEMA_DIR = fileURLToPath(new URL("../schemas/", import.meta.url));
export const SCHEMA_FILE_SUFFIX = ".schema.json";

export interface ValidationError {
  instancePath: string;
  keyword: string;
  message: string;
}

export type ValidateResult =
  | { ok: true }
  | { ok: false; class: "schema-invalid"; errors: ValidationError[] }
  | { ok: false; class: "unsupported-format"; schemaId: string; known: string[] };

export interface SchemaSet {
  /** The `$id`s loaded, sorted. */
  ids(): string[];
  validate(schemaId: string, value: unknown): ValidateResult;
}

/**
 * Loads every `*.schema.json` under `dir` into one Ajv instance. A directory
 * that does not exist is an empty set; a file that is not a strict JSON
 * object, has no string `$id`, repeats another file's `$id`, or does not
 * compile, throws with the file named. Nothing is skipped quietly.
 */
export function loadSchemas(dir: string = SCHEMA_DIR): SchemaSet {
  const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
  addFormats(ajv);

  const files = listSchemaFiles(dir);
  const owner = new Map<string, string>(); // $id -> file, for the duplicate message
  for (const file of files) {
    const abs = join(dir, file);
    const parsed = strictParse(readFileSync(abs));
    if (!parsed.ok) throw new Error(`${abs}: ${parsed.reason}: ${parsed.detail}`);
    const id = (parsed.value as Record<string, unknown>).$id;
    if (typeof id !== "string" || id.length === 0) throw new Error(`${abs}: schema has no string $id`);
    const other = owner.get(id);
    if (other !== undefined) throw new Error(`${abs}: $id "${id}" is already declared by ${join(dir, other)}`);
    owner.set(id, file);
    try {
      ajv.addSchema(parsed.value as object);
    } catch (e) {
      throw new Error(`${abs}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const compiled = new Map<string, ValidateFunction>();
  for (const [id, file] of owner) {
    let fn: ValidateFunction | undefined;
    try {
      fn = ajv.getSchema(id);
    } catch (e) {
      throw new Error(`${join(dir, file)}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (fn === undefined) throw new Error(`${join(dir, file)}: Ajv did not return a validator for $id "${id}"`);
    compiled.set(id, fn);
  }

  const ids = [...compiled.keys()].sort();
  return {
    ids: () => [...ids],
    validate(schemaId, value) {
      const fn = compiled.get(schemaId);
      if (fn === undefined) return { ok: false, class: "unsupported-format", schemaId, known: [...ids] };
      if (fn(value)) return { ok: true };
      return { ok: false, class: "schema-invalid", errors: (fn.errors ?? []).map(toValidationError) };
    },
  };
}

function listSchemaFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  return entries
    .filter((d) => d.isFile() && d.name.endsWith(SCHEMA_FILE_SUFFIX))
    .map((d) => d.name)
    .sort();
}

const toValidationError = (e: ErrorObject): ValidationError => ({
  instancePath: e.instancePath,
  keyword: e.keyword,
  message: e.message ?? "",
});

// ---------------------------------------------------------------------------
// The default set: `codec/schemas/` as it stands when first asked. The load
// happens once per process, on the first call to either function below.
// ---------------------------------------------------------------------------

let defaultSet: SchemaSet | undefined;
const current = (): SchemaSet => (defaultSet ??= loadSchemas());

export function schemaIds(): string[] {
  return current().ids();
}

export function validate(schemaId: string, value: unknown): ValidateResult {
  return current().validate(schemaId, value);
}
