// The catalog renderer: one source, two renders.
//
// `catalog/profiles/<id>/profile.json` lists a role's text as ordered parts,
// each tagged `neutral`, `claude` or `prior`. The Claude render concatenates
// the `neutral` and `claude` parts and must reproduce the committed
// `agents/<id>.md` byte for byte; the Prior render concatenates the `neutral`
// and `prior` parts, resolves the one directive a `prior` part may carry, and
// becomes the bundle's `profiles/<id>.md`. Beside it the Prior render writes
// `profiles/<id>.json` and `catalog.json` with exactly the keys Prior's loader
// reads. Decision: 261010-1235-how-is-the-host-neutral-role-text-the-source-of-
// both-the-claude-agents-and-the-prior-profiles.md (option 1); the loader is
// Prior `internal/fusionhost/external_catalog.go` at `5199cf1`.
//
// Neutral and claude parts are never decoded: they are copied as bytes, which
// is what makes byte equality with the committed prompt hold by construction.
// Only a prior part is read as UTF-8, and only to replace its include lines.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type Host = "claude-code" | "prior";
export type SupportState = "supported" | "planned" | "unsupported";
export type PartTag = "neutral" | "claude" | "prior";

export interface CatalogAlias {
  id: string;
  domain: string;
}

export interface CatalogRole {
  id: string;
  claude_name: string | null;
  prior_ids: string[];
  aliases: CatalogAlias[];
  support: Record<Host, SupportState>;
}

// The catalog's version name. v2 adds `entries` beside an unchanged `roles`:
// the name says the shape to two decoders that read exact key sets, so an old
// decoder refuses by version rather than by an unknown key. Decision
// 261023-1854-does-the-catalog-gain-entries-under-fusion-catalog-v1-or-as-v2.md
// (option 2).
export const CATALOG_SCHEMA = "fusion.catalog/v2";

export type EntryKind = "agent" | "skill";
export type EntryClass = "asks" | "dispatches" | "plain";
export type ArgumentKind = "flag" | "option" | "positional" | "parameter-line" | "first-message";

export const ENTRY_KINDS: readonly EntryKind[] = ["agent", "skill"];
export const ENTRY_CLASSES: readonly EntryClass[] = ["asks", "dispatches", "plain"];
// Prior's argument kinds: `internal/fusionhost/admission.go` at `08c57fb`,
// the `Argument*` constants, which are inventory.schema.json's enum.
export const ARGUMENT_KINDS: readonly ArgumentKind[] = ["flag", "option", "positional", "parameter-line", "first-message"];
// The three host services an entry may require beyond what its workflow
// declares: the ones Prior binds as model tools of a role run.
export const ENTRY_SERVICES = ["host.question.v1", "host.exec.v1", "host.dispatch.v1"] as const;
export const SUPPORT_STATES: readonly SupportState[] = ["supported", "planned", "unsupported"];

export interface EntryArgument {
  name: string;
  kind: ArgumentKind;
  required: boolean;
  values?: string[];
  note?: string;
}

export interface EntryArguments {
  items: EntryArgument[];
  note?: string;
}

/** One function a user starts: a Claude agent or a skill, and its Prior profile. */
export interface CatalogEntry {
  id: string;
  kind: EntryKind;
  profile: string;
  class: EntryClass;
  arguments: EntryArguments;
  requires: string[];
  support: Record<Host, SupportState>;
}

export interface Catalog {
  schema: typeof CATALOG_SCHEMA;
  roles: CatalogRole[];
  entries: CatalogEntry[];
}

export interface ProfilePart {
  file: string;
  tag: PartTag;
}

export interface Profile {
  id: string;
  parts: ProfilePart[];
  input_schema: string;
  result_schema: string;
  tools_ceiling: string[];
  may_delegate: boolean;
  writes_workbench: Record<Host, boolean>;
  execution_policy: Record<Host, string>;
}

// ---------------------------------------------------------------------------
// Prior's key sets, derived from the Go structs the loader decodes with
// `api.Decode` (unknown fields rejected) and `requiredObject` (exact key
// count): `internal/fusionhost/external_catalog.go` at `5199cf1`. The order is
// the struct's field order, and the bundle JSON is written in it.
// ---------------------------------------------------------------------------

// parseExternalCatalog: the anonymous catalog struct, fields Schema, Roles,
// and under fusion.catalog/v2 Entries, which Prior's loader gains at its
// step 28 on request 76.
export const PRIOR_CATALOG_KEYS = ["schema", "roles", "entries"] as const;
// The entry: the shape Prior's hand-over H1 proposes. No Prior loader decodes
// it yet; the key set is fusion's proposal in request 76, held to the same
// exactness as the role so the module and Prior can decode it alike.
export const PRIOR_ENTRY_KEYS = ["id", "kind", "profile", "class", "arguments", "requires", "support"] as const;
// The argument declaration is Prior's inventory.schema.json `arguments` and
// `$defs/argument`, which carry optional keys: required ones, then the ones
// that may be present.
export const PRIOR_ARGUMENTS_KEYS = { required: ["items"], optional: ["note"] } as const;
export const PRIOR_ARGUMENT_KEYS = { required: ["name", "kind", "required"], optional: ["values", "note"] } as const;
// ExternalRole: ID, ClaudeName, PriorIDs, Aliases, Support.
export const PRIOR_ROLE_KEYS = ["id", "claude_name", "prior_ids", "aliases", "support"] as const;
// ExternalAlias: ID, Domain.
export const PRIOR_ALIAS_KEYS = ["id", "domain"] as const;
// Support and WritesWorkbench are maps the loader requires to hold exactly
// these two hosts (`len(r.Support) != 2`, then each host read by name).
export const PRIOR_HOSTS = ["prior", "claude-code"] as const;
// ExternalProfile: ID, InputSchema, ResultSchema, ToolsCeiling, MayDelegate,
// WritesWorkbench, ExecutionPolicy. `parts` is fusion's own and never ships.
export const PRIOR_PROFILE_KEYS = [
  "id",
  "input_schema",
  "result_schema",
  "tools_ceiling",
  "may_delegate",
  "writes_workbench",
  "execution_policy",
] as const;

// The one directive a `prior` part may carry, on a line of its own. The path
// is relative to the fusion root and confined to the rule corpus: the Approach
// inlines "the cited rule file", nothing wider.
export const INCLUDE_DIRECTIVE = /^\{\{include ([^}]*)\}\}$/;
export const INCLUDABLE_PATH = /^rules\/[a-z0-9-]+\.md$/;
// What the Prior render must not carry afterwards, and what a neutral or
// claude part may never hold: a line that is a directive. The test is the
// whole-line form the resolver acts on, not a bare `{{`: the committed
// reviewer prompt names `{{.X}}` inside a sentence as a template example,
// and that text is bytes the Claude render must reproduce.
export const DIRECTIVE_LINE = /^\{\{.*\}\}\s*$/m;

export class RenderError extends Error {}

/** The `catalog/` directory this module lives in. */
export function catalogRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

/** The fusion repository root: the parent of `catalog/`. */
export function fusionRootOf(catalogDir: string): string {
  return resolve(catalogDir, "..");
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadCatalog(catalogDir: string): { catalog: Catalog; bytes: Buffer } {
  const path = join(catalogDir, "catalog.json");
  const bytes = readFileSync(path);
  const catalog = JSON.parse(bytes.toString("utf8")) as Catalog;
  if (catalog.schema !== CATALOG_SCHEMA || !Array.isArray(catalog.roles) || !Array.isArray(catalog.entries)) {
    throw new RenderError(`${path}: not a ${CATALOG_SCHEMA} document`);
  }
  return { catalog, bytes };
}

export function profilePath(catalogDir: string, id: string): string {
  return join(catalogDir, "profiles", id, "profile.json");
}

/** The profile of a role, or null when the role has none (a hand-edited prompt). */
export function loadProfile(catalogDir: string, id: string): Profile | null {
  const path = profilePath(catalogDir, id);
  if (!existsSync(path)) return null;
  const profile = readJson<Profile>(path);
  if (profile.id !== id) {
    throw new RenderError(`${path}: id ${JSON.stringify(profile.id)} is not the directory name ${id}`);
  }
  if (!Array.isArray(profile.parts) || profile.parts.length === 0) {
    throw new RenderError(`${path}: parts is empty`);
  }
  return profile;
}

export function partPath(catalogDir: string, profile: Profile, part: ProfilePart): string {
  return join(catalogDir, "profiles", profile.id, part.file);
}

export type PartsState = "present" | "absent";

/**
 * `present` when every listed part file exists, `absent` when none does. A
 * profile with some of its files is half-written and an error: a render that
 * silently took the half would produce a prompt missing a span.
 */
export function partsState(catalogDir: string, profile: Profile): PartsState {
  const missing = profile.parts.filter((p) => !existsSync(partPath(catalogDir, profile, p))).map((p) => p.file);
  if (missing.length === 0) return "present";
  if (missing.length === profile.parts.length) return "absent";
  throw new RenderError(`${profile.id}: parts partly absent: ${missing.join(", ")}`);
}

export interface IncludeContext {
  /** Where an included path is read from. */
  fusionRoot: string;
  /** The fusion commit named in the provenance line. */
  commit: string;
}

/** `git rev-parse HEAD` of the fusion checkout. */
export function fusionCommit(fusionRoot: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: fusionRoot, encoding: "utf8" }).trim();
}

export function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** The line that precedes an inlined file in a Prior render. */
export function provenanceLine(path: string, commit: string, bytes: Buffer): string {
  return `Included from fusion: ${path} (commit ${commit}, sha256:${sha256Hex(bytes)})`;
}

/**
 * Replaces each include line of a `prior` part with the provenance line, a
 * blank line and the named file's bytes. Any other directive opener is an
 * error, so the rendered text carries no runtime include.
 */
export function resolveIncludes(part: Buffer, where: string, ctx: IncludeContext): Buffer {
  const text = part.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(part)) {
    throw new RenderError(`${where}: not valid UTF-8`);
  }
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const m = INCLUDE_DIRECTIVE.exec(line);
    if (m === null) {
      if (DIRECTIVE_LINE.test(line)) {
        throw new RenderError(`${where}: unresolved directive: ${line.trim()}`);
      }
      out.push(line);
      continue;
    }
    const path = m[1].trim();
    if (!INCLUDABLE_PATH.test(path)) {
      throw new RenderError(`${where}: include outside the rule corpus: ${path}`);
    }
    const file = join(ctx.fusionRoot, path);
    if (!existsSync(file)) {
      throw new RenderError(`${where}: include target missing: ${path}`);
    }
    const bytes = readFileSync(file);
    const body = bytes.toString("utf8");
    if (DIRECTIVE_LINE.test(body)) {
      throw new RenderError(`${where}: included file ${path} carries a directive line`);
    }
    // The included file ends with its own newline, which closes the directive line.
    out.push(`${provenanceLine(path, ctx.commit, bytes)}\n\n${body.replace(/\n$/, "")}`);
  }
  return Buffer.from(out.join("\n"), "utf8");
}

/**
 * The bytes of one host's render: the neutral parts and the host's own parts,
 * in profile order, concatenated with nothing between them.
 */
export function renderParts(catalogDir: string, profile: Profile, host: "claude" | "prior", ctx?: IncludeContext): Buffer {
  const chunks: Buffer[] = [];
  for (const part of profile.parts) {
    if (part.tag !== "neutral" && part.tag !== host) continue;
    const path = partPath(catalogDir, profile, part);
    const bytes = readFileSync(path);
    if (part.tag === "prior") {
      if (ctx === undefined) throw new RenderError(`${path}: a prior part needs an include context`);
      chunks.push(resolveIncludes(bytes, path, ctx));
    } else {
      // A neutral or claude part is bytes: a directive line there would reach
      // the Claude prompt unresolved, so it is refused here rather than rendered.
      if (DIRECTIVE_LINE.test(bytes.toString("latin1"))) {
        throw new RenderError(`${path}: a ${part.tag} part carries a directive line`);
      }
      chunks.push(bytes);
    }
  }
  return Buffer.concat(chunks);
}

// ---------------------------------------------------------------------------
// The Claude render
// ---------------------------------------------------------------------------

export interface ClaudeRenderResult {
  /** `agents/<claude_name>.md` files written, as absolute paths. */
  written: { id: string; path: string }[];
  /** Roles with a Claude name and no render, each with the reason. */
  skipped: { id: string; reason: string }[];
}

/**
 * Writes `<outDir>/<claude_name>.md` for every role that has a profile whose
 * parts exist. A role without a profile keeps its hand-edited prompt; a role
 * whose parts are listed but not yet written is reported, not rendered.
 */
export function renderClaude(catalogDir: string, outDir: string): ClaudeRenderResult {
  const { catalog } = loadCatalog(catalogDir);
  const result: ClaudeRenderResult = { written: [], skipped: [] };
  mkdirSync(outDir, { recursive: true });
  for (const role of catalog.roles) {
    const profile = loadProfile(catalogDir, role.id);
    if (role.claude_name === null) {
      if (profile?.parts.some((p) => p.tag === "claude")) {
        throw new RenderError(`${role.id}: a claude part on a role with no Claude name`);
      }
      continue;
    }
    if (profile === null) {
      result.skipped.push({ id: role.id, reason: "no profile: the prompt is hand-edited" });
      continue;
    }
    if (partsState(catalogDir, profile) === "absent") {
      result.skipped.push({ id: role.id, reason: "parts listed, none written yet" });
      continue;
    }
    const path = join(outDir, `${role.claude_name}.md`);
    writeFileSync(path, renderParts(catalogDir, profile, "claude"));
    result.written.push({ id: role.id, path });
  }
  return result;
}

// ---------------------------------------------------------------------------
// The Prior render
// ---------------------------------------------------------------------------

export interface PriorRenderResult {
  /** Files written under `<outDir>`, relative to it. */
  written: string[];
  /** Planned profiles with nothing to ship yet, each with the reason. */
  skipped: { id: string; reason: string }[];
  /** Supported profiles with no text: Prior refuses a bundle without it. */
  missing: { id: string; reason: string }[];
}

/** The seven keys Prior reads, in struct order, and nothing else. */
export function priorProfileJson(profile: Profile): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PRIOR_PROFILE_KEYS) {
    if (!(key in profile)) throw new RenderError(`${profile.id}: profile.json lacks ${key}`);
    out[key] = profile[key];
  }
  return out;
}

function keysEqual(actual: string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && expected.every((k) => actual.includes(k));
}

/** Every required key present, nothing outside required and optional. */
function keysWithin(actual: string[], keys: { required: readonly string[]; optional: readonly string[] }): boolean {
  return keys.required.every((k) => actual.includes(k)) && actual.every((k) => keys.required.includes(k) || keys.optional.includes(k));
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const ID_SHAPE = /^[a-z][a-z0-9-]*$/;

/**
 * Refuses a catalog whose key sets differ from the ones Prior's loader
 * decodes: an extra key is `ErrExternalContract` on Prior's side, and a
 * missing one too, so the check belongs here, before anything ships.
 */
export function checkPriorCatalogKeys(raw: unknown): void {
  const doc = raw as Record<string, unknown>;
  if (!keysEqual(Object.keys(doc), PRIOR_CATALOG_KEYS)) {
    throw new RenderError(`catalog.json: keys ${Object.keys(doc).join(",")} are not ${PRIOR_CATALOG_KEYS.join(",")}`);
  }
  if (!Array.isArray(doc.roles) || !Array.isArray(doc.entries)) {
    throw new RenderError("catalog.json: roles and entries must be arrays");
  }
  for (const entry of doc.entries as unknown[]) {
    if (!isObject(entry) || !keysEqual(Object.keys(entry), PRIOR_ENTRY_KEYS)) {
      throw new RenderError(`catalog.json: entry ${String(isObject(entry) ? entry.id : entry)} keys are not ${PRIOR_ENTRY_KEYS.join(",")}`);
    }
    const args = entry.arguments;
    if (!isObject(args) || !keysWithin(Object.keys(args), PRIOR_ARGUMENTS_KEYS) || !Array.isArray(args.items)) {
      throw new RenderError(`catalog.json: entry ${String(entry.id)} arguments keys are not items[,note]`);
    }
    for (const arg of args.items as unknown[]) {
      if (!isObject(arg) || !keysWithin(Object.keys(arg), PRIOR_ARGUMENT_KEYS)) {
        throw new RenderError(`catalog.json: entry ${String(entry.id)} argument keys are not name,kind,required[,values][,note]`);
      }
    }
    if (!isObject(entry.support) || !keysEqual(Object.keys(entry.support), PRIOR_HOSTS)) {
      throw new RenderError(`catalog.json: entry ${String(entry.id)} support hosts are not ${PRIOR_HOSTS.join(",")}`);
    }
  }
  for (const role of doc.roles as Record<string, unknown>[]) {
    if (!keysEqual(Object.keys(role), PRIOR_ROLE_KEYS)) {
      throw new RenderError(`catalog.json: role ${String(role.id)} keys ${Object.keys(role).join(",")} are not ${PRIOR_ROLE_KEYS.join(",")}`);
    }
    for (const alias of role.aliases as Record<string, unknown>[]) {
      if (!keysEqual(Object.keys(alias), PRIOR_ALIAS_KEYS)) {
        throw new RenderError(`catalog.json: alias ${String(alias.id)} keys are not ${PRIOR_ALIAS_KEYS.join(",")}`);
      }
    }
    if (!keysEqual(Object.keys(role.support as object), PRIOR_HOSTS)) {
      throw new RenderError(`catalog.json: role ${String(role.id)} support hosts are not ${PRIOR_HOSTS.join(",")}`);
    }
  }
}

/**
 * The document-level verdict on a catalog, as the module's Go decoder
 * (`adapters/prior/fusionmodule/internal/steps/catalog.go` `LoadCatalog`)
 * reaches it for the top level and the entries: the version name, the key
 * sets, and every entry value from its closed set. The two are held to the
 * same verdict by the shared case table `testdata/catalog-decode-cases.v2.json`.
 * The role values (support words, alias and prior-id rules) are the Go
 * decoder's and the catalog tests', and are not repeated here.
 */
export function checkCatalogDocument(raw: unknown): void {
  if (!isObject(raw) || raw.schema !== CATALOG_SCHEMA) {
    throw new RenderError(`catalog.json: not a ${CATALOG_SCHEMA} document`);
  }
  checkPriorCatalogKeys(raw);
  if ((raw.roles as unknown[]).length === 0 || (raw.entries as unknown[]).length === 0) {
    throw new RenderError("catalog.json: roles and entries must each hold at least one item");
  }
  const ids = new Set<string>();
  for (const e of raw.entries as Record<string, unknown>[]) {
    const where = `catalog.json: entry ${JSON.stringify(e.id)}`;
    if (typeof e.id !== "string" || !ID_SHAPE.test(e.id) || ids.has(e.id)) throw new RenderError(`${where}: id not an asset id, or repeated`);
    ids.add(e.id);
    if (!ENTRY_KINDS.includes(e.kind as EntryKind)) throw new RenderError(`${where}: kind ${JSON.stringify(e.kind)}`);
    if (typeof e.profile !== "string" || !ID_SHAPE.test(e.profile)) throw new RenderError(`${where}: profile ${JSON.stringify(e.profile)}`);
    if (!ENTRY_CLASSES.includes(e.class as EntryClass)) throw new RenderError(`${where}: class ${JSON.stringify(e.class)}`);
    if (!Array.isArray(e.requires)) throw new RenderError(`${where}: requires is not an array`);
    const services = new Set<string>();
    for (const s of e.requires as unknown[]) {
      if (typeof s !== "string" || !(ENTRY_SERVICES as readonly string[]).includes(s) || services.has(s)) {
        throw new RenderError(`${where}: requires ${JSON.stringify(s)} is not one of ${ENTRY_SERVICES.join(", ")}, or repeated`);
      }
      services.add(s);
    }
    const args = e.arguments as Record<string, unknown>;
    if ("note" in args && typeof args.note !== "string") throw new RenderError(`${where}: arguments.note`);
    for (const a of args.items as Record<string, unknown>[]) {
      const ok =
        typeof a.name === "string" &&
        a.name !== "" &&
        ARGUMENT_KINDS.includes(a.kind as ArgumentKind) &&
        typeof a.required === "boolean" &&
        (!("values" in a) || (Array.isArray(a.values) && a.values.length > 0 && a.values.every((v) => typeof v === "string"))) &&
        (!("note" in a) || typeof a.note === "string");
      if (!ok) throw new RenderError(`${where}: argument ${JSON.stringify(a.name)}`);
    }
    for (const host of PRIOR_HOSTS) {
      if (!SUPPORT_STATES.includes((e.support as Record<string, unknown>)[host] as SupportState)) {
        throw new RenderError(`${where}: support.${host}`);
      }
    }
  }
}

/** The entry services a text names, in ENTRY_SERVICES order. */
export function servicesNamed(text: string): string[] {
  return ENTRY_SERVICES.filter((s) => text.includes(s));
}

/**
 * The entry invariants that need the fusion tree, checked against it:
 *
 * - an entry of kind `agent` exactly when `agents/<id>.md` exists, of kind
 *   `skill` exactly when `skills/<id>/SKILL.md` exists, so every id is a
 *   Claude agent name or a skill directory name and never both;
 * - an entry supported on `prior` whose profile has its parts has at least
 *   one `prior` part, and the entry services those `prior` parts name are
 *   exactly its `requires`: the declaration is read off the text that makes
 *   the calls, never written beside it. A supported entry with no profile or
 *   no parts written is `renderPrior`'s `missing`, as for a role.
 */
export function checkEntries(catalog: Catalog, catalogDir: string, fusionRoot: string): void {
  for (const e of catalog.entries) {
    const agent = existsSync(join(fusionRoot, "agents", `${e.id}.md`));
    const skill = existsSync(join(fusionRoot, "skills", e.id, "SKILL.md"));
    if ((e.kind === "agent") !== agent || (e.kind === "skill") !== skill) {
      throw new RenderError(`entry ${e.id}: kind ${e.kind}, but agents/${e.id}.md ${agent ? "exists" : "is absent"} and skills/${e.id}/SKILL.md ${skill ? "exists" : "is absent"}`);
    }
    if (e.support.prior !== "supported") continue;
    const profile = loadProfile(catalogDir, e.profile);
    if (profile === null || partsState(catalogDir, profile) === "absent") continue;
    const prior = profile.parts.filter((p) => p.tag === "prior");
    if (prior.length === 0) {
      throw new RenderError(`entry ${e.id}: supported on prior, and profile ${e.profile} has no prior part`);
    }
    const named = servicesNamed(prior.map((p) => readFileSync(partPath(catalogDir, profile, p), "utf8")).join("\n"));
    const declared = ENTRY_SERVICES.filter((s) => e.requires.includes(s));
    if (named.join(",") !== declared.join(",")) {
      throw new RenderError(`entry ${e.id}: requires ${declared.join(",") || "nothing"}, and the prior parts of ${e.profile} name ${named.join(",") || "nothing"}`);
    }
  }
}

/**
 * The profiles the Prior render ships, each once: a role's own id and an
 * entry's `profile`, in catalog order, roles first, for every referrer whose
 * `prior` state is not `unsupported`. A profile named by an agent entry and
 * by its role is one profile; its state is `supported` when any referrer is.
 */
export function priorProfiles(catalog: Catalog): { id: string; state: SupportState }[] {
  const states = new Map<string, SupportState>();
  const referrers: { profile: string; state: SupportState }[] = [
    ...catalog.roles.map((r) => ({ profile: r.id, state: r.support.prior })),
    ...catalog.entries.map((e) => ({ profile: e.profile, state: e.support.prior })),
  ];
  for (const { profile, state } of referrers) {
    if (state === "unsupported") continue;
    if (states.get(profile) !== "supported") states.set(profile, state);
  }
  return [...states].map(([id, state]) => ({ id, state }));
}

/**
 * Writes `profiles/<id>.md` and `profiles/<id>.json` for every profile a role
 * or an entry names whose `prior` state is not `unsupported` and whose parts
 * exist, and `catalog.json` byte for byte. A planned profile without parts
 * gets nothing: Prior's follow-up of 2026-10-11 wants absent preview files
 * omitted, never a placeholder. A supported one without parts is reported
 * under `missing`.
 */
export function renderPrior(catalogDir: string, outDir: string, ctx?: Partial<IncludeContext>): PriorRenderResult {
  const { catalog, bytes } = loadCatalog(catalogDir);
  checkCatalogDocument(JSON.parse(bytes.toString("utf8")));
  const fusionRoot = ctx?.fusionRoot ?? fusionRootOf(catalogDir);
  checkEntries(catalog, catalogDir, fusionRoot);
  const include: IncludeContext = { fusionRoot, commit: ctx?.commit ?? fusionCommit(fusionRoot) };
  const result: PriorRenderResult = { written: [], skipped: [], missing: [] };
  mkdirSync(join(outDir, "profiles"), { recursive: true });
  for (const { id, state } of priorProfiles(catalog)) {
    const profile = loadProfile(catalogDir, id);
    const absent = profile === null ? "no profile" : partsState(catalogDir, profile) === "absent" ? "parts listed, none written yet" : null;
    if (absent !== null) {
      (state === "supported" ? result.missing : result.skipped).push({ id, reason: absent });
      continue;
    }
    const md = join("profiles", `${id}.md`);
    const json = join("profiles", `${id}.json`);
    writeFileSync(join(outDir, md), renderParts(catalogDir, profile!, "prior", include));
    writeFileSync(join(outDir, json), `${JSON.stringify(priorProfileJson(profile!), null, 2)}\n`);
    result.written.push(md, json);
  }
  writeFileSync(join(outDir, "catalog.json"), bytes);
  result.written.push("catalog.json");
  return result;
}

// ---------------------------------------------------------------------------
// CLI: `render claude [<dir>]` and `render prior <dir>`
// ---------------------------------------------------------------------------

function usage(): never {
  process.stderr.write("usage: render claude [<dir>]   (default: ../agents)\n       render prior <dir>\n");
  process.exit(2);
}

export function main(argv: string[]): number {
  const [target, dir] = argv;
  const catalogDir = catalogRoot();
  if (target === "claude") {
    if (argv.length > 2) usage();
    const outDir = dir === undefined ? join(fusionRootOf(catalogDir), "agents") : resolve(dir);
    const r = renderClaude(catalogDir, outDir);
    for (const w of r.written) process.stdout.write(`wrote ${w.path}\n`);
    for (const s of r.skipped) process.stdout.write(`skipped ${s.id}: ${s.reason}\n`);
    return 0;
  }
  if (target === "prior") {
    if (dir === undefined || argv.length > 2) usage();
    const outDir = resolve(dir);
    if (existsSync(outDir) && (!statSync(outDir).isDirectory() || readdirSync(outDir).length > 0)) {
      process.stderr.write(`render prior: ${outDir} exists and is not an empty directory\n`);
      return 1;
    }
    const r = renderPrior(catalogDir, outDir);
    for (const w of r.written) process.stdout.write(`wrote ${join(outDir, w)}\n`);
    for (const s of r.skipped) process.stdout.write(`skipped ${s.id} (planned): ${s.reason}\n`);
    for (const m of r.missing) process.stderr.write(`missing ${m.id} (supported): ${m.reason}\n`);
    return r.missing.length === 0 ? 0 : 1;
  }
  return usage();
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    if (e instanceof RenderError) {
      process.stderr.write(`render: ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }
}
