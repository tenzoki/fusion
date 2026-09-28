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
//
// Two entry points, one compiler. `loadSchemas(dir)` reads the directory and
// is what the tests and a source checkout use; `compileSchemas(documents)`
// takes already-parsed schema objects and is what the shipped bundle uses,
// whose schemas are inlined at build time (`src/cli/schemas.ts`) so that the
// one file `codec/dist/fusion-record.js` carries its whole contract. The
// default set can be replaced with `useSchemas` for the same reason.
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
  /** The schema document as parsed, for a reader that walks it (the serialiser); undefined for an unknown id. */
  document(schemaId: string): unknown;
}

/** One schema as it reaches the compiler: where it came from, for the error messages, and its parsed value. */
export interface SchemaDocument {
  source: string;
  value: unknown;
}

/**
 * Loads every `*.schema.json` under `dir` into one Ajv instance. A directory
 * that does not exist is an empty set; a file that is not a strict JSON
 * object, has no string `$id`, repeats another file's `$id`, or does not
 * compile, throws with the file named. Nothing is skipped quietly.
 */
export function loadSchemas(dir: string = SCHEMA_DIR): SchemaSet {
  const documents: SchemaDocument[] = [];
  for (const file of listSchemaFiles(dir)) {
    const abs = join(dir, file);
    const parsed = strictParse(readFileSync(abs));
    if (!parsed.ok) throw new Error(`${abs}: ${parsed.reason}: ${parsed.detail}`);
    documents.push({ source: abs, value: parsed.value });
  }
  return compileSchemas(documents);
}

/**
 * Compiles already-parsed schema documents into one set. The same checks as
 * `loadSchemas` from the `$id` on: a document that is not an object, has no
 * string `$id`, repeats another's `$id`, or does not compile, throws with its
 * source named.
 */
export function compileSchemas(documents: readonly SchemaDocument[]): SchemaSet {
  const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
  addFormats(ajv);

  const owner = new Map<string, string>(); // $id -> source, for the duplicate message
  const raw = new Map<string, unknown>();
  for (const { source, value } of documents) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${source}: schema is not an object`);
    const id = (value as Record<string, unknown>).$id;
    if (typeof id !== "string" || id.length === 0) throw new Error(`${source}: schema has no string $id`);
    const other = owner.get(id);
    if (other !== undefined) throw new Error(`${source}: $id "${id}" is already declared by ${other}`);
    owner.set(id, source);
    raw.set(id, value);
    try {
      ajv.addSchema(value);
    } catch (e) {
      throw new Error(`${source}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const compiled = new Map<string, ValidateFunction>();
  for (const [id, source] of owner) {
    let fn: ValidateFunction | undefined;
    try {
      fn = ajv.getSchema(id);
    } catch (e) {
      throw new Error(`${source}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (fn === undefined) throw new Error(`${source}: Ajv did not return a validator for $id "${id}"`);
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
    document: (schemaId) => raw.get(schemaId),
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
// The default set: `codec/schemas/` as it stands when first asked, unless a
// caller installed one with `useSchemas` first. The load happens once per
// process, on the first call to any function below.
// ---------------------------------------------------------------------------

let defaultSet: SchemaSet | undefined;
const current = (): SchemaSet => (defaultSet ??= loadSchemas());

/** Makes `set` the default set: what the shipped bundle does with its inlined schemas. */
export function useSchemas(set: SchemaSet): void {
  defaultSet = set;
}

/** The default set itself, for a reader that needs `document()`. */
export function schemas(): SchemaSet {
  return current();
}

export function schemaIds(): string[] {
  return current().ids();
}

export function validate(schemaId: string, value: unknown): ValidateResult {
  return current().validate(schemaId, value);
}
