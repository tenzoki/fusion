/**
 * The Claude side's write client: one codec mutation per call, after the
 * gate, a `show` of every record it names and, where response 22 asks for
 * it, the ownership check.
 *
 * ## The sequence
 *
 *   repair      rows an earlier call retained are appended first
 *               (`lib/record-change.ts` `repairRetained`).
 *   gate        `inspect`; only `json-control` admits a write. `legacy` with a
 *               committed `initialize` pending is refused and names Setup,
 *               which finishes it: this client sends no `initialize`, no
 *               migration and no retry.
 *   show        the record the mutation names, and each record a request
 *               field is read from (the plan of `adopt-plan`, the evidence of
 *               `attach-evidence`, the targets of `set-dependencies`). Its
 *               revision is the `expected_revision` sent, so the write lands
 *               only against the record this call inspected.
 *   check       ownership, below; and every payload field against the kind
 *               `show` named (`PAYLOAD_FIELDS`).
 *   mutation    one request under a new operation id. The answer is landed,
 *               refused, or unknown; nothing is sent twice.
 *   rows        a landed answer to an id this call minted is logged by
 *               `logObserved`; a re-send's rows by `logResend`, which
 *               composes none.
 *
 * ## Ownership (response 22 (a))
 *
 * For `release` and every `transition` out of `claimed`, and for nothing
 * else, the standing claim's `checkout_id` in `show` must equal this
 * checkout's `CHECKOUT=`, read by `bin/fusion-identity` in the wrapper. A
 * foreign claim refuses, and so does an identity that cannot be read; no flag
 * overrides either. `release` of a package that is not `claimed` has no claim
 * to check and goes to the codec, which refuses it `conflict/not-claimed`. A
 * write that landed between the `show` and the mutation is
 * `conflict/revision-mismatch`, and nothing is retried. What is not checked,
 * because this host does not have it, is stated in `REQUESTS.md` under
 * "Stated for objection: the Claude side binds a caller by its checkout
 * identity alone". A takeover waits for request 38.
 *
 * ## Payload fields
 *
 * `PAYLOAD_FIELDS` names, per kind, the `transition` payload fields the
 * codec reads for it; `lib/__tests__/record-write.test.ts` holds it equal to
 * the schemas. A field outside the target's kind is a usage error, decided
 * after `show` named the kind and before the mutation is sent.
 *
 * ## A re-send
 *
 * An unanswered mutation may have landed. The caller re-sends it explicitly
 * with the operation id and the expected revision the unknown outcome
 * printed (and `claimed_at` for `claim`), so the codec sees the same request
 * and answers its stored bytes. No row is composed for a re-send.
 *
 * No automatic hook imports this module or runs `hooks/write.ts`
 * (`lib/record-client.ts` `## The recovery declaration`).
 */

import { randomUUID } from "node:crypto";
import { gate, type Answer, type Ask, type Refusal } from "./record-client.js";
import { composeRows, logObserved, logResend, repairRetained, type LogEvent, type PriorShow } from "./record-change.js";
import { utcStamp } from "./orchestrator-events.js";

export const SUBCOMMANDS = ["claim", "release", "transition", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence"] as const;
export type Sub = (typeof SUBCOMMANDS)[number];

/** Per kind, the `transition` payload fields the codec reads; nothing else is sent. */
export const PAYLOAD_FIELDS: Readonly<Record<string, readonly string[]>> = {
  package: ["claim", "outcome"],
  issue: ["disposition"],
  plan: ["steps", "criteria"],
  decision: ["answer_ref", "implementation_ref", "superseded_by", "deferral"],
  discussion: [],
};
const ALL_PAYLOAD = [...new Set(Object.values(PAYLOAD_FIELDS).flat())];
const flagOf = (field: string): string => `--${field.replace(/_/g, "-")}`;

/** Flags each subcommand takes, beyond `--record`, `--actor`, `--operation-id` and `--expected-revision`. */
const FLAGS: Record<Sub, readonly string[]> = {
  claim: ["--claimed-at"],
  release: ["--reason"],
  transition: ["--to", "--reason", ...ALL_PAYLOAD.map(flagOf)],
  "set-mode": ["--value", "--source"],
  "set-dependencies": ["--on", "--clear"],
  "adopt-plan": ["--plan", "--role"],
  "attach-evidence": ["--evidence"],
};
const COMMON = ["--record", "--actor", "--operation-id", "--expected-revision"];
const REPEATED = new Set(["--on"]);
const BARE = new Set(["--clear"]);

export interface Identity {
  person?: string;
  checkout?: string;
}

export interface Call {
  sub: Sub;
  workbench: string;
  identity: Identity;
  flags: Map<string, string[]>;
}

export type Outcome =
  | { kind: "landed"; operationId: string; revisions: Record<string, string>; event: LogEvent; detail?: string }
  | { kind: "usage"; detail: string }
  /** The bundle is missing: nothing was sent. */
  | { kind: "install"; detail: string }
  /** The workbench or a named record was not read: nothing was sent. */
  | { kind: "unread"; detail: string }
  | { kind: "ownership"; detail: string }
  | { kind: "refused"; operationId: string; refusal: Refusal }
  | { kind: "unknown"; operationId: string; expectedRevision: string; claimedAt?: string; detail: string };

/** The subcommand's flags read from `argv`, or the usage error. Values are opaque here. */
export function parseFlags(sub: string, argv: string[]): { call: Omit<Call, "workbench" | "identity"> } | { usage: string } {
  if (!(SUBCOMMANDS as readonly string[]).includes(sub)) return { usage: `unknown subcommand ${JSON.stringify(sub)}; one of ${SUBCOMMANDS.join(", ")}` };
  const known = new Set([...COMMON, ...FLAGS[sub as Sub]]);
  const flags = new Map<string, string[]>();
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (!known.has(f)) return { usage: `${sub} takes no ${JSON.stringify(f)}` };
    if (flags.has(f) && !REPEATED.has(f)) return { usage: `${f} is given twice` };
    const value = BARE.has(f) ? "" : argv[++i];
    if (value === undefined) return { usage: `${f} needs a value` };
    flags.set(f, [...(flags.get(f) ?? []), value]);
  }
  const need = (...fs: string[]) => fs.find((f) => !flags.has(f));
  const missing = need("--record", "--actor", ...(sub === "transition" ? ["--to", "--reason"] : sub === "release" ? ["--reason"] : sub === "set-mode" ? ["--value"] : sub === "adopt-plan" ? ["--plan"] : sub === "attach-evidence" ? ["--evidence"] : []));
  if (missing !== undefined) return { usage: `${sub} needs ${missing}` };
  if (flags.has("--operation-id") !== flags.has("--expected-revision")) return { usage: "a re-send gives --operation-id and --expected-revision together; a first call gives neither" };
  if (sub === "claim" && flags.has("--claimed-at") !== flags.has("--operation-id")) return { usage: "--claimed-at belongs to a re-send of claim, and a re-send of claim needs it" };
  if (sub === "set-mode") {
    const value = flags.get("--value")![0];
    if (value !== "ordinary" && value !== "autonomous") return { usage: "--value is ordinary or autonomous" };
    if ((value === "autonomous") !== flags.has("--source")) return { usage: "autonomous needs --source, the user's word or a record; ordinary takes none" };
  }
  if (sub === "set-dependencies" && flags.has("--on") === flags.has("--clear")) return { usage: "set-dependencies takes one or more --on <terminal|succeeded>:<control path>, or --clear" };
  return { call: { sub: sub as Sub, flags } };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const one = (c: Call, f: string): string | undefined => c.flags.get(f)?.[0];
const refusal = (a: Answer & { kind: "refused" }): Refusal => ({ class: a.class, reason: a.reason, ...(a.detail !== undefined && { detail: a.detail }) });
const named = (r: Refusal): string => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;

interface Shown extends PriorShow {
  revision: string;
  narrative: unknown;
}

/** A value, or the outcome that ends the call before the mutation. */
type Or<T> = { ok: T } | { stop: Outcome };

/** One record as `show` answers it, or why it was not read. */
function shown(workbench: string, path: string, ask: Ask): Or<Shown> {
  const a = ask(workbench, { op: "show", record: { path } });
  if (a.kind === "refused") return { stop: { kind: "unread", detail: `the codec refused show of ${path} (${named(refusal(a))}), so nothing was sent` } };
  if (a.kind === "unanswered") return { stop: { kind: a.cause === "bundle-missing" ? "install" : "unread", detail: `the codec gave no answer to show of ${path} (${a.cause}: ${a.detail}), so nothing was sent` } };
  const r = a.result;
  if (!isObject(r) || typeof r.kind !== "string" || typeof r.revision !== "string" || !isObject(r.control)) return { stop: { kind: "unread", detail: `show of ${path} carries no kind, revision and control, so nothing was sent` } };
  return { ok: { kind: r.kind, control: r.control, revision: r.revision, narrative: r.narrative } };
}

const usage = (detail: string): { stop: Outcome } => ({ stop: { kind: "usage", detail } });

/** The workbench id, or why no write is admitted. */
function admitted(workbench: string, ask: Ask): Or<string> {
  // `gate` drops `inspect.pending`; the one answer it read is kept here so a pending initialize is named without a second inspect.
  let inspected: Answer | undefined;
  const g = gate(workbench, { ask: (w, r, o) => (inspected = ask(w, r, o)) });
  switch (g.state) {
    case "json-control":
      return { ok: g.id };
    case "legacy": {
      const pending = inspected?.kind === "result" && isObject(inspected.result) ? inspected.result.pending : null;
      if (isObject(pending)) return { stop: { kind: "unread", detail: `${workbench} holds a committed initialize (operation ${String(pending.operation_id)}) whose manifest has not landed. Run /fusion:setup, which finishes it. Nothing was sent: this client neither initializes nor migrates, and retries nothing.` } };
      return { stop: { kind: "unread", detail: `${workbench} is legacy (no workbench.json: its control data is Markdown), so nothing was sent` } };
    }
    case "unsupported":
      return { stop: { kind: "unread", detail: `${workbench} is unsupported by this codec${g.diagnosis === null ? "" : ` (${named(g.diagnosis)})`}, so nothing was sent` } };
    case "refused":
      return { stop: { kind: "unread", detail: `the codec refused inspect (${named(g)}), so nothing was sent` } };
    case "unanswered":
      return { stop: { kind: g.cause === "bundle-missing" ? "install" : "unread", detail: `the codec gave no answer to inspect (${g.cause}: ${g.detail}), so nothing was sent` } };
  }
}

/** Why this call may not send the mutation, or `null`. Only `claim`, `release` and a transition out of `claimed` read the identity. */
function ownership(c: Call, target: Shown): Outcome | null {
  const mine = c.identity.checkout;
  if (c.sub === "claim") return mine === undefined ? { kind: "ownership", detail: "this checkout's identifier could not be read, so no claim can name it" } : null;
  if ((c.sub !== "release" && c.sub !== "transition") || target.kind !== "package" || target.control.status !== "claimed") return null;
  const holder = isObject(target.control.claim) ? target.control.claim.checkout_id : undefined;
  if (mine === undefined) return { kind: "ownership", detail: `the package is claimed and this checkout's identifier could not be read, so whether this checkout holds it is unknown; nothing was sent` };
  if (holder !== mine) return { kind: "ownership", detail: `the package is claimed by checkout ${String(holder)}, not by this checkout (${mine}); only the holder releases it or moves it out of claimed, and nothing overrides that` };
  return null;
}

/** The fields the subcommand adds to the request, reading any other record it names. */
function fieldsOf(c: Call, target: Shown, workbenchId: string, claimedAt: string | undefined, see: (path: string) => Or<Shown>): Or<Record<string, unknown>> {
  const ref = (s: Shown) => ({ workbench_id: workbenchId, record_id: String(s.control.id) });
  switch (c.sub) {
    case "claim":
      return { ok: { claim: { checkout_id: c.identity.checkout, person: c.identity.person ?? null, claimed_at: claimedAt } } };
    case "release":
      return { ok: { reason: one(c, "--reason") } };
    case "transition": {
      const allowed = PAYLOAD_FIELDS[target.kind] ?? [];
      const payload: Record<string, unknown> = {};
      for (const field of ALL_PAYLOAD) {
        const raw = one(c, flagOf(field));
        if (raw === undefined) continue;
        if (!allowed.includes(field)) return usage(`${flagOf(field)} is no payload field of a ${target.kind} record, which reads ${allowed.map(flagOf).join(", ") || "none"}`);
        try {
          payload[field] = JSON.parse(raw);
        } catch {
          return usage(`${flagOf(field)} takes a JSON value`);
        }
      }
      return { ok: { to: one(c, "--to"), reason: one(c, "--reason"), ...(Object.keys(payload).length > 0 && { payload }) } };
    }
    case "set-mode": {
      const source = one(c, "--source");
      if (source === undefined) return { ok: { mode: { value: one(c, "--value"), source: null } } };
      try {
        return { ok: { mode: { value: one(c, "--value"), source: JSON.parse(source) } } };
      } catch {
        return usage("--source takes a JSON value");
      }
    }
    case "set-dependencies": {
      const depends_on: unknown[] = [];
      for (const on of c.flags.get("--on") ?? []) {
        const m = /^(terminal|succeeded):(.+)$/.exec(on);
        if (m === null) return usage(`--on takes <terminal|succeeded>:<control path>, not ${JSON.stringify(on)}`);
        const s = see(m[2]);
        if ("stop" in s) return s;
        depends_on.push({ target: ref(s.ok), condition: m[1] });
      }
      return { ok: { depends_on } };
    }
    case "adopt-plan": {
      const plan = see(one(c, "--plan")!);
      if ("stop" in plan) return plan;
      const role = one(c, "--role");
      // The plan's narrative as it stands is what this call accepts; the codec refuses it if it moves before the write.
      return { ok: { plan: ref(plan.ok), revision: isObject(plan.ok.narrative) ? plan.ok.narrative.sha256 : undefined, ...(role !== undefined && { role }) } };
    }
    case "attach-evidence": {
      const ev = see(one(c, "--evidence")!);
      if ("stop" in ev) return ev;
      // The binding carries the policy the evidence record was produced under, read off the record.
      return { ok: { evidence: { ref: { ...ref(ev.ok), revision: ev.ok.revision }, policy: ev.ok.control.execution_policy } } };
    }
  }
}

/** One write, from the gate to the log. `ask` is the record client's, or a test's stand-in. */
export function write(c: Call, ask: Ask, now: () => Date = () => new Date()): Outcome {
  try {
    repairRetained(c.workbench);
  } catch {
    // Retained rows stay retained; the next call repairs them. The mutation does not wait on the log.
  }
  const gated = admitted(c.workbench, ask);
  if ("stop" in gated) return gated.stop;
  const workbenchId = gated.ok;
  const path = one(c, "--record")!;
  const shows: Record<string, Shown> = {};
  const see = (p: string): Or<Shown> => {
    const s = shown(c.workbench, p, ask);
    if ("ok" in s) shows[p] = s.ok;
    return s;
  };
  const seen = see(path);
  if ("stop" in seen) return seen.stop;
  const target = seen.ok;
  const refusedOwner = ownership(c, target);
  if (refusedOwner !== null) return refusedOwner;

  const resend = one(c, "--operation-id");
  const operationId = resend ?? randomUUID();
  const expectedRevision = one(c, "--expected-revision") ?? target.revision;
  const claimedAt = c.sub === "claim" ? (one(c, "--claimed-at") ?? `${utcStamp(now())}Z`) : undefined;
  const fields = fieldsOf(c, target, workbenchId, claimedAt, see);
  if ("stop" in fields) return fields.stop;

  const request = { op: c.sub, operation_id: operationId, record: { path }, expected_revision: expectedRevision, actor: { actor: one(c, "--actor"), person: c.identity.person ?? null }, ...fields.ok };
  const answer = ask(c.workbench, request);
  if (answer.kind === "refused") return { kind: "refused", operationId, refusal: refusal(answer) };
  if (answer.kind === "unanswered") {
    if (answer.cause === "bundle-missing") return { kind: "install", detail: `the codec bundle is missing (${answer.detail}), so nothing was sent` };
    return { kind: "unknown", operationId, expectedRevision, ...(claimedAt !== undefined && { claimedAt }), detail: `the codec gave no answer to ${c.sub} (${answer.cause}: ${answer.detail})` };
  }
  let logged: { event: LogEvent; detail?: string };
  try {
    logged = resend !== undefined
      ? logResend(c.workbench, c.sub, workbenchId, operationId, answer.revisions)
      : logObserved(c.workbench, composeRows({ request, workbenchId: workbenchId, result: answer.result, revisions: answer.revisions, shows }, { ts: utcStamp(now()), ...c.identity, ...(process.env.FUSION_SESSION_ID && { session_id: process.env.FUSION_SESSION_ID }) }));
  } catch (e) {
    logged = { event: "unlogged", detail: `the change landed and its rows could not be composed or kept: ${e instanceof Error ? e.message : String(e)}` };
  }
  return { kind: "landed", operationId, revisions: answer.revisions, ...logged };
}
