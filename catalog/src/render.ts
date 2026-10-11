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

export interface Catalog {
  schema: "fusion.catalog/v1";
  roles: CatalogRole[];
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

// parseExternalCatalog: the anonymous catalog struct, fields Schema, Roles.
export const PRIOR_CATALOG_KEYS = ["schema", "roles"] as const;
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
  if (catalog.schema !== "fusion.catalog/v1" || !Array.isArray(catalog.roles)) {
    throw new RenderError(`${path}: not a fusion.catalog/v1 document`);
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
  /** Planned roles with nothing to ship yet, each with the reason. */
  skipped: { id: string; reason: string }[];
  /** Supported roles with no text: Prior refuses a bundle without it. */
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
 * Writes `profiles/<id>.md` and `profiles/<id>.json` for every role whose
 * `prior` state is not `unsupported` and whose parts exist, and `catalog.json`
 * byte for byte. A planned role without parts gets nothing: Prior's follow-up
 * of 2026-10-11 wants absent preview files omitted, never a placeholder. A
 * supported role without parts is reported under `missing`.
 */
export function renderPrior(catalogDir: string, outDir: string, ctx?: Partial<IncludeContext>): PriorRenderResult {
  const { catalog, bytes } = loadCatalog(catalogDir);
  checkPriorCatalogKeys(JSON.parse(bytes.toString("utf8")));
  const fusionRoot = ctx?.fusionRoot ?? fusionRootOf(catalogDir);
  const include: IncludeContext = { fusionRoot, commit: ctx?.commit ?? fusionCommit(fusionRoot) };
  const result: PriorRenderResult = { written: [], skipped: [], missing: [] };
  mkdirSync(join(outDir, "profiles"), { recursive: true });
  for (const role of catalog.roles) {
    const state = role.support.prior;
    if (state === "unsupported") continue;
    const profile = loadProfile(catalogDir, role.id);
    const absent = profile === null ? "no profile" : partsState(catalogDir, profile) === "absent" ? "parts listed, none written yet" : null;
    if (absent !== null) {
      (state === "supported" ? result.missing : result.skipped).push({ id: role.id, reason: absent });
      continue;
    }
    const md = join("profiles", `${role.id}.md`);
    const json = join("profiles", `${role.id}.json`);
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
