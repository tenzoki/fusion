/**
 * A throwaway project whose workbench is JSON-controlled, for the suites that
 * drive the record client and the helpers built on it.
 *
 * ## The kernel writes the records, and no function of a test's does
 *
 * The workbench starts from the manifest and the setup marker of
 * `codec/fixtures/workbench/`, copied, and from nothing else. Every package a
 * case needs is then written through `ask`: `create`, `claim`, `transition`,
 * `set-dependencies`, each a request the codec validates and lands through
 * its kernel. A fixture built that way cannot hold a state the codec would
 * refuse, so a case that passes here passes on records a real session could
 * have produced. A helper that serialised a package of its own would be a
 * second writer of fusion JSON, and its fixtures would drift from the schema
 * on the next field the codec adds.
 *
 * `place()` is the one exception and its comment bounds it.
 *
 * ## Which bundle
 *
 * This tree's committed `codec/dist/fusion-record.js`, named explicitly. The
 * client's own default resolves relative to the COMPILED module, which a
 * suite importing the source does not run from.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { ask, type Answer, type CodecRequest } from "../../record-client.js";
import { readRecordIndex, type IndexRead } from "../../record-index.js";
import { REPO_ROOT } from "./guard-harness.js";

/** The committed bundle of this tree. */
export const BUNDLE = resolve(REPO_ROOT, "codec", "dist", "fusion-record.js");

const FIXTURE = resolve(REPO_ROOT, "codec", "fixtures", "workbench");
const ACTOR = { actor: "user", person: null } as const;

export interface JsonProject {
  /** The project root, its own realpath. */
  root: string;
  /** `<root>/fusion-workbench`, absolute. */
  workbench: string;
  /** Ids are counted per project, so two runs of one case write the same bytes. */
  next: number;
}

/** One package the kernel created. */
export interface Package {
  /** The container, workbench-relative: `work-packages/<stem>`. */
  dir: string;
  /** Its control file: `<dir>/package.json`. */
  path: string;
  /** Its narrative: `<dir>/<stem>.md`. */
  narrative: string;
  id: string;
}

/**
 * Run `fn` against a fresh project, removed afterwards. `legacy: true` leaves
 * the manifest out, which is the workbench every release before the JSON
 * cutover wrote and the state the gate has to refuse by name.
 */
export function withJsonProject<T>(fn: (project: JsonProject) => T, options: { legacy?: boolean } = {}): T {
  const base = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-json-")));
  const root = resolve(base, "project");
  const workbench = resolve(root, "fusion-workbench");
  mkdirSync(workbench, { recursive: true });
  cpSync(resolve(FIXTURE, ".fusion-setup"), resolve(workbench, ".fusion-setup"));
  if (options.legacy !== true) cpSync(resolve(FIXTURE, "workbench.json"), resolve(workbench, "workbench.json"));
  try {
    return fn({ root, workbench, next: 1 });
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

/** A fresh UUID in the form the protocol admits, counted and never random. */
function uuid(project: JsonProject): string {
  return `f03a0000-0000-4000-8000-${String(project.next++).padStart(12, "0")}`;
}

/** One request through the client, against this tree's bundle. */
export function send(project: JsonProject, request: CodecRequest): Answer {
  return ask(project.workbench, request, { bundle: BUNDLE });
}

/** An answer that is a result: what it carries, and the revisions the codec named with it. */
export interface Landed {
  result: Record<string, unknown>;
  revisions: Record<string, string>;
}

/** A request the case needs answered with a result; anything else fails the case, naming the answer. */
export function must(project: JsonProject, request: CodecRequest): Landed {
  const answer = send(project, request);
  if (answer.kind !== "result") throw new Error(`${request.op} was not answered with a result: ${JSON.stringify(answer)}`);
  return { result: answer.result as Record<string, unknown>, revisions: answer.revisions };
}

/** A mutation of `pkg` at the revision it stands at, as a caller that just read it would send it. */
function mutate(project: JsonProject, pkg: Package, op: string, fields: Record<string, unknown>): Landed {
  const { revision } = must(project, { op: "show", record: { path: pkg.path } }).result;
  return must(project, { op, operation_id: uuid(project), record: { path: pkg.path }, expected_revision: revision, actor: ACTOR, ...fields });
}

/** `create` a package named `stem` (`YYMMDD-HHMM-<topic>`), narrative included. It starts `open`. */
export function createPackage(project: JsonProject, stem: string): Package {
  const dir = `work-packages/${stem}`;
  const pkg: Package = { dir, path: `${dir}/package.json`, narrative: `${dir}/${stem}.md`, id: uuid(project) };
  must(project, {
    op: "create",
    operation_id: uuid(project),
    id: pkg.id,
    kind: "package",
    filed_by: ACTOR,
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "work-packages" },
    narrative: { path: pkg.narrative, content: `# ${stem}\n\n## Directive\n\nA package a test filed.\n` },
    payload: { domain: "code" },
  });
  return pkg;
}

/** `claim` for the checkout named by its eight hex characters. */
export function claim(project: JsonProject, pkg: Package, checkout: string): Landed {
  return mutate(project, pkg, "claim", { claim: { checkout_id: checkout, person: null, claimed_at: "2026-09-29T12:00:00Z" } });
}

/** `transition` to `to`; `payload` is what the target state needs to see. */
export function transition(project: JsonProject, pkg: Package, to: string, payload: Record<string, unknown> = {}): Landed {
  return mutate(project, pkg, "transition", { to, reason: `a test moved it to ${to}`, payload });
}

/** `set-dependencies`: the whole list, replaced. */
export function setDependencies(project: JsonProject, pkg: Package, on: Array<{ target: Package; condition: "terminal" | "succeeded" }>): Landed {
  const { id } = must(project, { op: "inspect" }).result;
  return mutate(project, pkg, "set-dependencies", {
    depends_on: on.map((d) => ({ target: { workbench_id: id, record_id: d.target.id }, condition: d.condition })),
  });
}

/** The record index of `workbench`, read through this tree's bundle and contract. */
export function indexOf(workbench: string): IndexRead {
  return readRecordIndex(workbench, (w, r) => ask(w, r, { bundle: BUNDLE }), resolve(REPO_ROOT, "codec", "contract", "transitions.json"));
}

/** A JSON workbench at `<root>/fusion-workbench`, from the fixture manifest, for a case that builds its tree by hand. */
export function jsonWorkbenchAt(root: string): string {
  const workbench = resolve(root, "fusion-workbench");
  mkdirSync(workbench, { recursive: true });
  for (const f of [".fusion-setup", "workbench.json"]) cpSync(resolve(FIXTURE, f), resolve(workbench, f));
  return workbench;
}

let placed = 0;

/**
 * A record pair at narrative `rel` under `workbench`: the codec's fixture
 * `valid/record/<fixture>.json` with its own id, no references and `state`.
 * Placed, because `create` refuses the marker names an imported record keeps.
 */
export function placeRecord(workbench: string, fixture: string, rel: string, state: string, text = "# x\n"): void {
  const record = JSON.parse(readFileSync(resolve(REPO_ROOT, "codec", "fixtures", "valid", "record", `${fixture}.json`), "utf-8"));
  const control = { ...record, id: `f03d0000-0000-4000-8000-${String(++placed).padStart(12, "0")}`, references: [], narrative: { path: rel }, control: { ...record.control, state } };
  for (const [path, content] of [[rel, text], [rel.replace(/\.md$/, ".record.json"), JSON.stringify(control, null, 2) + "\n"]]) {
    mkdirSync(dirname(resolve(workbench, path)), { recursive: true });
    writeFileSync(resolve(workbench, path), content, "utf-8");
  }
}

/**
 * Write `content` at `rel` under the workbench, by hand and with no check.
 *
 * ONLY FOR A STATE THE KERNEL REFUSES TO PRODUCE: a manifest requiring a
 * feature no codec knows, a package record carrying merge conflict markers, a
 * dependency cycle. Such a state reaches a real workbench by a hand edit or a
 * pull, never through an operation, so no operation can build the fixture for
 * it. Everything the kernel does produce is written through the functions
 * above; a case that places what it could have created has left the property
 * this file exists for.
 */
export function place(project: JsonProject, rel: string, content: string): void {
  const abs = resolve(project.workbench, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf-8");
}
