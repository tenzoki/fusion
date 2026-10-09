/**
 * The Claude side's write client: one codec mutation per call, after the
 * gate, a `show` of every record it names and, where response 22 asks for
 * it, the ownership check.
 *
 * ## The sequence
 *
 *   repair      rows an earlier call retained are appended first
 *               (`lib/record-change.ts` `repairRetained`). A repair that
 *               failed or left rows retained is reported on the outcome
 *               (`repair`), and the mutation does not wait on it.
 *   gate        `inspect`; only `json-control` admits a write. `legacy` with a
 *               committed `initialize` pending is refused and names Setup,
 *               which finishes it: a mutation sends no `initialize`, no
 *               migration and no retry. `initialize` is Setup's alone, below.
 *   show        the record the mutation names, and each record a request
 *               field is read from (the plan of `adopt-plan`, the evidence of
 *               `attach-evidence` and of `transition --evidence`, the targets
 *               of `set-dependencies`, the origin of `create`, the package of
 *               `evidence`). Its revision
 *               is the `expected_revision` sent, so the write lands only
 *               against the record this call inspected.
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
 * For `release` and every `transition` out of `claimed`, the standing claim's
 * `checkout_id` in `show` must equal this checkout's `CHECKOUT=`, read by
 * `bin/fusion-identity` in the wrapper. A request that writes a claim, `claim`
 * or a `transition` into `claimed` or carrying a non-null `--claim`, names this
 * checkout as its `checkout_id`: the rule is the claim field the request
 * writes, not the subcommand, so `transition` is no route past `claim`'s
 * binding. A foreign claim, standing or written, refuses, and so does an
 * identity that cannot be read; no flag overrides either. `release` of a
 * package that is not `claimed` has no claim to check and goes to the codec,
 * which refuses it `conflict/not-claimed`. A write that landed between the
 * `show` and the mutation is `conflict/revision-mismatch`, and nothing is
 * retried. What is not checked,
 * because this host does not have it, is stated in `REQUESTS.md` under
 * "Stated for objection: the Claude side binds a caller by its checkout
 * identity alone".
 *
 * ## Takeover (request 62)
 *
 * `claim --take-over-from <checkout> --source <JSON>`, the two flags together
 * or neither, moves a standing claim to this checkout: the codec's `claim`
 * with `takeover`, as `REQUESTS.md` `## FJ05 (the takeover addendum, …)`
 * part 8 and Prior's answer to 62 fix it. `show` must name `<checkout>` as
 * the holder, or the call is refused as ownership and nothing is sent; that
 * is a checkout-only pre-check, and the kernel compares all three fields.
 * `previous_claim` is the standing claim as `show` answered it,
 * `expected_revision` that `show`'s revision, and the new claim names this
 * checkout, as `claimWritten` requires. A `<checkout>` that is this checkout
 * is a usage error, and so is a `--source` that is not a JSON object; its
 * finer shape is the protocol schema's, refused by the codec. The codec's
 * check that the source resolves is evidence validation: it proves neither
 * the user's consent nor any authority, and nothing here decides who may
 * take over. That is the user's explicit word for this package and this
 * transfer, which the caller holds before it sends; `release` and
 * `transition` gain no route past the holder check.
 *
 * The unknown outcome of a takeover prints `--previous-claim` beside the
 * revision and the time, and its re-send repeats that frozen request: it
 * reads no `show`, which after a landed takeover would name the new holder.
 *
 * ## Payload fields
 *
 * `PAYLOAD_FIELDS` names, per kind, the `transition` payload fields the
 * codec admits for it; `lib/__tests__/record-write.test.ts` holds it equal to
 * the schemas. A field outside the target's kind is a usage error, decided
 * after `show` named the kind and before the mutation is sent.
 *
 * `transition --evidence <evidence control path>`, repeatable, binds evidence
 * into a package's finish: each record is `show`n and composed by
 * `evidenceBinding`, as `attach-evidence` composes its one, and appended to
 * `--outcome`'s `evidence`, the one field a `succeeded` edge reads.
 * It is a usage error without `--outcome`, on a record that is not a package,
 * and naming a record that is not evidence. A re-send recomposes the entries
 * from `show`, so its line is unchanged.
 *
 * ## Creation
 *
 * `create` files a new pair, and `evidence` a reviewer's evidence record
 * beside its report; both are the codec's `create`, which names no existing
 * record and so takes no `expected_revision`. The caller writes the Markdown
 * half first, at a marker-free name it derives, and names it; the codec
 * writes the control file beside it and refuses a name, store or container
 * that does not agree. The id is a new UUID, the filer `--actor` with this
 * checkout's person, the origin the user's request or the package `--origin`
 * names. A record kind starts at `INITIAL_CONTROL`, held by the test to the
 * one state of its kind no edge of `codec/contract/transitions.json` enters
 * and to the control fields its schema requires; a package's payload is its
 * domain, and the kernel fixes the rest. A plan's steps are read from its
 * narrative by `planSteps`: one `open` anchor per numbered line under
 * `## Implementation Steps`, outside fences, and no criteria, so
 * `transition --steps` has ids to update. A number that occurs twice there
 * is a usage error naming it and its lines: no operation adds an anchor
 * later, so a plan is not filed with a step it cannot track.
 *
 * An evidence record is produced against the package `--record` names:
 * `brief_revision` is its narrative hash in `show`, `plan_revision` the
 * revision of its `role: plan` binding or null. The report's hash is read
 * from its bytes, the workbench id is the gate's, the subject is the
 * project's `HEAD` tree as the call runs, and the role is `--actor` at this
 * plugin's version. Host `claude-code` and policy `claude-guided` are all
 * this host can claim; the verdict is the caller's, and the codec judges it.
 * No `predecessor` is sent, so a second record over one report is
 * `record-exists`.
 *
 * ## A re-send
 *
 * An unanswered mutation may have landed. The caller re-sends it explicitly
 * with the operation id and the fields the unknown outcome printed (the
 * expected revision, `claimed_at` for `claim` and the previous claim for a
 * takeover, the id for a creation and
 * `accepted_at` for evidence), so the codec sees the same request and answers
 * its stored bytes. An evidence re-send re-reads the brief, the plan, the
 * report and the tree; if one moved, the request differs and the codec
 * answers `conflict/operation-id-reused`. No row is composed for a re-send.
 *
 * ## Initialize, Setup's route to a new workbench
 *
 * `initialize` is the one call that sends `initialize`, and `/fusion:setup`
 * the one caller. It splits on `inspect`, each answer in exactly one row:
 *
 *   json-control (a manifest without the marker too)   reused; nothing sent
 *   legacy, pending not blocked                        the request rebuilt from pending, once
 *   legacy, pending blocked                            stop; corrected by hand
 *   legacy, no pending, `.fusion-setup` present        legacy: Setup runs as before, until FJ04
 *   legacy, no pending, no marker, a fusion store      legacy: a workbench that lost its marker,
 *     (`work-packages`, `circles`, `shared`) present     which Setup's marker block writes again
 *   legacy, no pending, no marker, no fusion store     a new id and operation id, sent once
 *   unsupported                                        stop, naming the diagnosis
 *   refused (pending-initialize-unreadable, -ambiguous
 *     among them) or unanswered                        stop
 *
 * The marker row keeps every workbench Setup wrote before the JSON cutover
 * setting up as it did: it is not empty, so `initialize` would answer
 * `target-not-empty`. The store row keeps such a workbench setting up when
 * its marker is gone, a clone of one whose marker was never committed for
 * one, as Setup did before the cutover; only a target holding no fusion store
 * goes on to `initialize`, so foreign entries alone are refused by name. Both
 * rows read only a target with no pending intent, so neither splits anything
 * the pending rows decide. A refused `initialize`
 * (`target-not-empty` and `manifest-present` name the entries) and an
 * unanswered one stop; nothing is retried, and a Setup run again reads the
 * intent from `pending`. After every answer that landed, `inspect` is asked
 * again and must be `json-control` under the id sent: a replay answers after
 * `workbench.json` was deleted, so the answer alone proves nothing.
 *
 * No automatic hook imports this module or runs `hooks/write.ts`
 * (`lib/record-client.ts` `## The recovery declaration`).
 */
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gate } from "./record-client.js";
import { composeRows, logObserved, logResend, repairRetained } from "./record-change.js";
import { utcStamp } from "./orchestrator-events.js";
import { CONTAINER_ROOT_NAMES } from "./stores.js";
export const SUBCOMMANDS = ["claim", "release", "transition", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "create", "evidence"];
/** Per kind, the `transition` payload fields the codec admits; nothing else is sent. */
export const PAYLOAD_FIELDS = {
    package: ["claim", "outcome"],
    issue: ["disposition"],
    plan: ["steps", "criteria"],
    decision: ["answer_ref", "implementation_ref", "superseded_by", "deferral"],
    discussion: [],
};
const ALL_PAYLOAD = [...new Set(Object.values(PAYLOAD_FIELDS).flat())];
const flagOf = (field) => `--${field.replace(/_/g, "-")}`;
/** Per record kind, the control a new record is created with. */
export const INITIAL_CONTROL = {
    issue: { state: "open", disposition: null },
    plan: { state: "open", steps: [], criteria: [], acceptance: null },
    discussion: { state: "open", participants: [], outcome_refs: [] },
    decision: { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null },
};
const CREATED_KINDS = ["package", ...Object.keys(INITIAL_CONTROL)];
/** The two subcommands that file a new record: nothing to show first, so no expected revision. */
const CREATING = new Set(["create", "evidence"]);
/** Flags each subcommand takes, beyond `--actor` and `--operation-id`. */
const ON_RECORD = ["--record", "--expected-revision"];
const FLAGS = {
    claim: [...ON_RECORD, "--claimed-at", "--take-over-from", "--source", "--previous-claim"],
    release: [...ON_RECORD, "--reason"],
    transition: [...ON_RECORD, "--to", "--reason", ...ALL_PAYLOAD.map(flagOf), "--evidence"],
    "set-mode": [...ON_RECORD, "--value", "--source"],
    "set-dependencies": [...ON_RECORD, "--on", "--clear"],
    "adopt-plan": [...ON_RECORD, "--plan", "--role"],
    "attach-evidence": [...ON_RECORD, "--evidence"],
    create: ["--kind", "--narrative-file", "--origin", "--domain", "--id"],
    evidence: ["--record", "--report", "--verdict", "--id", "--accepted-at"],
};
const REQUIRED = {
    claim: ["--record"],
    release: ["--record", "--reason"],
    transition: ["--record", "--to", "--reason"],
    "set-mode": ["--record", "--value"],
    "set-dependencies": ["--record"],
    "adopt-plan": ["--record", "--plan"],
    "attach-evidence": ["--record", "--evidence"],
    create: ["--kind", "--narrative-file", "--origin"],
    evidence: ["--record", "--report", "--verdict"],
};
/** What a re-send repeats beside `--operation-id`, as the unknown outcome printed it. */
const resendFlags = (s, takeover) => s === "claim" ? ["--expected-revision", "--claimed-at", ...(takeover ? ["--previous-claim"] : [])] : s === "create" ? ["--id"] : s === "evidence" ? ["--id", "--accepted-at"] : ["--expected-revision"];
/** A flag given more than once: `--on`, and `--evidence` on a finish; `attach-evidence` binds one record. */
const repeated = (s, f) => f === "--on" || (s === "transition" && f === "--evidence");
const BARE = new Set(["--clear"]);
/** The subcommand's flags read from `argv`, or the usage error. Values are opaque here. */
export function parseFlags(sub, argv) {
    if (!SUBCOMMANDS.includes(sub))
        return { usage: `unknown subcommand ${JSON.stringify(sub)}; one of ${SUBCOMMANDS.join(", ")}` };
    const s = sub;
    const known = new Set(["--actor", "--operation-id", ...FLAGS[s]]);
    const flags = new Map();
    for (let i = 0; i < argv.length; i++) {
        const f = argv[i];
        if (!known.has(f))
            return { usage: `${sub} takes no ${JSON.stringify(f)}` };
        if (flags.has(f) && !repeated(s, f))
            return { usage: `${f} is given twice` };
        const value = BARE.has(f) ? "" : argv[++i];
        if (value === undefined)
            return { usage: `${f} needs a value` };
        flags.set(f, [...(flags.get(f) ?? []), value]);
    }
    const missing = ["--actor", ...REQUIRED[s]].find((f) => !flags.has(f));
    if (missing !== undefined)
        return { usage: `${sub} needs ${missing}` };
    const takeover = flags.has("--take-over-from");
    // `--source` is set-mode's too, so the pairing and the object check below are a claim's alone.
    if (s === "claim" && takeover !== flags.has("--source"))
        return { usage: "a takeover gives --take-over-from <checkout> and --source <JSON> together, and an ordinary claim neither" };
    if (takeover && flags.get("--take-over-from")[0] === "")
        return { usage: "--take-over-from names the holder's checkout, and is not empty" };
    if (!takeover && flags.has("--previous-claim"))
        return { usage: "--previous-claim is repeated by a takeover's re-send alone" };
    for (const f of ["--source", "--previous-claim"].filter((x) => takeover && flags.has(x))) {
        if (!isObject(json(flags.get(f)[0])))
            return { usage: `${f} takes a JSON object` };
    }
    const resend = resendFlags(s, takeover);
    if (resend.some((f) => flags.has(f) !== flags.has("--operation-id")))
        return { usage: `a re-send gives --operation-id with ${resend.join(" and ")}, as the unknown outcome printed them; a first call gives none of them` };
    if (s === "set-mode") {
        const value = flags.get("--value")[0];
        if (value !== "ordinary" && value !== "autonomous")
            return { usage: "--value is ordinary or autonomous" };
        if ((value === "autonomous") !== flags.has("--source"))
            return { usage: "autonomous needs --source, the user's word or a record; ordinary takes none" };
    }
    if (s === "transition" && flags.has("--evidence") && !flags.has("--outcome"))
        return { usage: "--evidence binds evidence into a package's outcome, and is given with --outcome" };
    if (s === "set-dependencies" && flags.has("--on") === flags.has("--clear"))
        return { usage: "set-dependencies takes one or more --on <terminal|succeeded>:<control path>, or --clear" };
    if (s === "create") {
        const kind = flags.get("--kind")[0];
        if (!CREATED_KINDS.includes(kind))
            return { usage: `--kind is one of ${CREATED_KINDS.join(", ")}` };
        if ((kind === "package") !== flags.has("--domain"))
            return { usage: "a package is created with its --domain, and a record kind takes none" };
    }
    return { call: { sub: s, flags } };
}
const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
/** A flag's JSON value, or undefined when it is not JSON. */
const json = (raw) => {
    try {
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
};
const one = (c, f) => c.flags.get(f)?.[0];
const refusal = (a) => ({ class: a.class, reason: a.reason, ...(a.detail !== undefined && { detail: a.detail }) });
const named = (r) => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;
const message = (e) => (e instanceof Error ? e.message : String(e));
/** One record as `show` answers it, or why it was not read. */
function shown(workbench, path, ask) {
    const a = ask(workbench, { op: "show", record: { path } });
    if (a.kind === "refused")
        return { stop: { kind: "unread", detail: `the codec refused show of ${path} (${named(refusal(a))}), so nothing was sent` } };
    if (a.kind === "unanswered")
        return { stop: { kind: a.cause === "bundle-missing" ? "install" : "unread", detail: `the codec gave no answer to show of ${path} (${a.cause}: ${a.detail}), so nothing was sent` } };
    const r = a.result;
    if (!isObject(r) || typeof r.kind !== "string" || typeof r.revision !== "string" || !isObject(r.control))
        return { stop: { kind: "unread", detail: `show of ${path} carries no kind, revision and control, so nothing was sent` } };
    return { ok: { kind: r.kind, control: r.control, revision: r.revision, narrative: r.narrative } };
}
const usage = (detail) => ({ stop: { kind: "usage", detail } });
const unread = (detail) => ({ stop: { kind: "unread", detail } });
/** The workbench id, or why no write is admitted. */
function admitted(workbench, ask) {
    const g = gate(workbench, { ask });
    switch (g.state) {
        case "json-control":
            return { ok: g.id };
        case "legacy": {
            if (g.pending !== null)
                return unread(`${workbench} holds a committed initialize (operation ${g.pending.operation_id}) whose manifest has not landed. Run /fusion:setup, which finishes it. Nothing was sent: this client neither initializes nor migrates, and retries nothing.`);
            return unread(`${workbench} is legacy (no workbench.json: its control data is Markdown), so nothing was sent`);
        }
        case "unsupported":
            return unread(`${workbench} is unsupported by this codec${g.diagnosis === null ? "" : ` (${named(g.diagnosis)})`}, so nothing was sent`);
        case "refused":
            return unread(`the codec refused inspect (${named(g)}), so nothing was sent`);
        case "unanswered":
            return { stop: { kind: g.cause === "bundle-missing" ? "install" : "unread", detail: `the codec gave no answer to inspect (${g.cause}: ${g.detail}), so nothing was sent` } };
    }
}
/** Why this call may not send the mutation, or `null`: the standing claim for `release` and a transition out of `claimed`. */
function ownership(c, target) {
    const mine = c.identity.checkout;
    if ((c.sub !== "release" && c.sub !== "transition") || target.kind !== "package" || target.control.status !== "claimed")
        return null;
    const holder = isObject(target.control.claim) ? target.control.claim.checkout_id : undefined;
    if (mine === undefined)
        return { kind: "ownership", detail: `the package is claimed and this checkout's identifier could not be read, so whether this checkout holds it is unknown; nothing was sent` };
    if (holder !== mine)
        return { kind: "ownership", detail: `the package is claimed by checkout ${String(holder)}, not by this checkout (${mine}); only the holder releases it or moves it out of claimed, and nothing overrides that` };
    return null;
}
/** Why a request that writes a claim may not be sent, or `null`: the claim it writes names this checkout, as `claim` builds it. */
function claimWritten(c, target, fields) {
    const written = c.sub === "claim" ? fields.claim : isObject(fields.payload) ? fields.payload.claim : undefined;
    const into = c.sub === "transition" && target.kind === "package" && fields.to === "claimed";
    if (!into && (written === undefined || written === null))
        return null;
    const mine = c.identity.checkout;
    if (mine === undefined)
        return { kind: "ownership", detail: "this checkout's identifier could not be read, so no claim can name it; nothing was sent" };
    const named = isObject(written) ? written.checkout_id : undefined;
    if (named !== mine)
        return { kind: "ownership", detail: `a claim is written only for this checkout (${mine}), and this request's names ${named === undefined ? "none" : String(named)}; claim this package with claim, and nothing overrides that; nothing was sent` };
    return null;
}
/**
 * One evidence binding, the codec's `evidence_ref`: the record at the revision
 * `show` answered, with the policy it was produced under read off the record.
 * `attach-evidence` sends it as its `evidence`, `transition --evidence` appends
 * it to the outcome's.
 */
function evidenceBinding(ev, workbenchId) {
    return { ref: { workbench_id: workbenchId, record_id: String(ev.control.id), revision: ev.revision }, policy: ev.control.execution_policy };
}
/** The fields the subcommand adds to the request, reading any other record it names. */
function fieldsOf(c, target, workbenchId, claimedAt, see) {
    const ref = (s) => ({ workbench_id: workbenchId, record_id: String(s.control.id) });
    switch (c.sub) {
        case "claim":
            return { ok: { claim: { checkout_id: c.identity.checkout, person: c.identity.person ?? null, claimed_at: claimedAt } } };
        case "release":
            return { ok: { reason: one(c, "--reason") } };
        case "transition": {
            const allowed = PAYLOAD_FIELDS[target.kind] ?? [];
            const bound = c.flags.get("--evidence") ?? [];
            if (bound.length > 0 && target.kind !== "package")
                return usage(`--evidence binds into a package's outcome; ${one(c, "--record")} is a ${target.kind} record`);
            const payload = {};
            for (const field of ALL_PAYLOAD) {
                const raw = one(c, flagOf(field));
                if (raw === undefined)
                    continue;
                if (!allowed.includes(field))
                    return usage(`${flagOf(field)} is no payload field of a ${target.kind} record, which reads ${allowed.map(flagOf).join(", ") || "none"}`);
                try {
                    payload[field] = JSON.parse(raw);
                }
                catch {
                    return usage(`${flagOf(field)} takes a JSON value`);
                }
            }
            if (bound.length > 0) {
                const outcome = payload.outcome;
                if (!isObject(outcome) || (outcome.evidence !== undefined && !Array.isArray(outcome.evidence)))
                    return usage("--evidence appends to --outcome's evidence, so --outcome is an object whose evidence, if given, is a list");
                const entries = [...(outcome.evidence ?? [])];
                for (const path of bound) {
                    const ev = see(path);
                    if ("stop" in ev)
                        return ev;
                    if (ev.ok.kind !== "evidence")
                        return usage(`--evidence names an evidence record; ${path} is a ${ev.ok.kind} record`);
                    entries.push(evidenceBinding(ev.ok, workbenchId));
                }
                payload.outcome = { ...outcome, evidence: entries };
            }
            return { ok: { to: one(c, "--to"), reason: one(c, "--reason"), ...(Object.keys(payload).length > 0 && { payload }) } };
        }
        case "set-mode": {
            const source = one(c, "--source");
            if (source === undefined)
                return { ok: { mode: { value: one(c, "--value"), source: null } } };
            try {
                return { ok: { mode: { value: one(c, "--value"), source: JSON.parse(source) } } };
            }
            catch {
                return usage("--source takes a JSON value");
            }
        }
        case "set-dependencies": {
            const depends_on = [];
            for (const on of c.flags.get("--on") ?? []) {
                const m = /^(terminal|succeeded):(.+)$/.exec(on);
                if (m === null)
                    return usage(`--on takes <terminal|succeeded>:<control path>, not ${JSON.stringify(on)}`);
                const s = see(m[2]);
                if ("stop" in s)
                    return s;
                depends_on.push({ target: ref(s.ok), condition: m[1] });
            }
            return { ok: { depends_on } };
        }
        case "adopt-plan": {
            const plan = see(one(c, "--plan"));
            if ("stop" in plan)
                return plan;
            const role = one(c, "--role");
            // The plan's narrative as it stands is what this call accepts; the codec refuses it if it moves before the write.
            return { ok: { plan: ref(plan.ok), revision: isObject(plan.ok.narrative) ? plan.ok.narrative.sha256 : undefined, ...(role !== undefined && { role }) } };
        }
        case "attach-evidence": {
            const ev = see(one(c, "--evidence"));
            if ("stop" in ev)
                return ev;
            return { ok: { evidence: evidenceBinding(ev.ok, workbenchId) } };
        }
        default:
            throw new Error(`fieldsOf: ${c.sub} is a creation, built by creation()`);
    }
}
/** A mutation of the record `--record` names, at the revision its `show` answered. */
function mutation(c, workbenchId, operationId, see, now) {
    const path = one(c, "--record");
    if (c.sub === "claim" && c.flags.has("--take-over-from"))
        return takeover(c, path, operationId, see, now);
    const seen = see(path);
    if ("stop" in seen)
        return seen;
    const refusedOwner = ownership(c, seen.ok);
    if (refusedOwner !== null)
        return { stop: refusedOwner };
    const expectedRevision = one(c, "--expected-revision") ?? seen.ok.revision;
    const claimedAt = c.sub === "claim" ? (one(c, "--claimed-at") ?? `${utcStamp(now())}Z`) : undefined;
    const fields = fieldsOf(c, seen.ok, workbenchId, claimedAt, see);
    if ("stop" in fields)
        return fields;
    const refusedClaim = claimWritten(c, seen.ok, fields.ok);
    if (refusedClaim !== null)
        return { stop: refusedClaim };
    const request = { op: c.sub, operation_id: operationId, record: { path }, expected_revision: expectedRevision, actor: { actor: one(c, "--actor"), person: c.identity.person ?? null }, ...fields.ok };
    return { ok: { request, resend: { "--expected-revision": expectedRevision, ...(claimedAt !== undefined && { "--claimed-at": claimedAt }) } } };
}
/**
 * `claim` with `takeover`, by `## Takeover (request 62)`: composed from the
 * holder `show` names, or, on a re-send, from the frozen fields alone.
 */
function takeover(c, path, operationId, see, now) {
    const from = one(c, "--take-over-from");
    if (from === c.identity.checkout)
        return usage(`--take-over-from names this checkout (${from}), which a takeover moves the claim to; nothing was sent`);
    const frozen = one(c, "--previous-claim");
    let previous, expectedRevision;
    if (frozen !== undefined) {
        previous = json(frozen);
        expectedRevision = one(c, "--expected-revision");
        if (isObject(previous) && previous.checkout_id !== from)
            return usage(`--previous-claim names checkout ${String(previous.checkout_id)}, and --take-over-from ${from}; a re-send repeats both as the unknown outcome printed them`);
    }
    else {
        const seen = see(path);
        if ("stop" in seen)
            return seen;
        const holder = seen.ok.control.status === "claimed" && isObject(seen.ok.control.claim) ? seen.ok.control.claim.checkout_id : null;
        if (holder !== from)
            return { stop: { kind: "ownership", detail: `${path} is ${holder === null ? "claimed by no checkout" : `claimed by checkout ${String(holder)}`}, not by ${from}, which --take-over-from names; nothing was sent` } };
        previous = seen.ok.control.claim;
        expectedRevision = seen.ok.revision;
    }
    const claimedAt = one(c, "--claimed-at") ?? `${utcStamp(now())}Z`;
    const fields = { claim: { checkout_id: c.identity.checkout, person: c.identity.person ?? null, claimed_at: claimedAt }, takeover: { previous_claim: previous, source: json(one(c, "--source")) } };
    const refusedClaim = claimWritten(c, { kind: "package", control: {}, revision: expectedRevision, narrative: null }, fields);
    if (refusedClaim !== null)
        return { stop: refusedClaim };
    const request = { op: "claim", operation_id: operationId, record: { path }, expected_revision: expectedRevision, actor: { actor: one(c, "--actor"), person: c.identity.person ?? null }, ...fields };
    return { ok: { request, resend: { "--expected-revision": expectedRevision, "--claimed-at": claimedAt, "--previous-claim": JSON.stringify(previous) } } };
}
/** `<container>/<store>/<name>`, or `shared/<store>/<name>`: where a record or a report is filed. The codec judges the rest. */
function scopeOf(path) {
    const parts = path.split("/");
    const container = parts.slice(0, -2).join("/");
    return { container: container === "shared" ? null : container, store: parts[parts.length - 2] ?? "" };
}
/** dist layout: `<plugin>/hooks/dist/lib/record-write.js` → `<plugin>/.claude-plugin/plugin.json`. */
function pluginVersion() {
    try {
        const v = JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".claude-plugin", "plugin.json"), "utf-8")).version;
        return typeof v === "string" && v !== "" ? v : undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * A new plan's step numbers, each with the 1-based lines it stands on: a
 * numbered line, bare or as a `##`-to-`####` heading, under
 * `## Implementation Steps` and outside fences. A new plan carries no bracket
 * mark, so none makes a step of a numbered line elsewhere, as an import's
 * reading of a legacy plan does.
 */
function planSteps(text) {
    const steps = new Map();
    let fence = null;
    let inSteps = false;
    text.split("\n").forEach((line, i) => {
        const mark = /^\s*(```|~~~)/.exec(line)?.[1];
        if (mark !== undefined)
            fence = fence === null ? mark : fence === mark ? null : fence;
        if (mark !== undefined || fence !== null)
            return;
        if (/^## /.test(line))
            inSteps = /^##\s+implementation steps\b/i.test(line);
        const id = inSteps ? /^(?:#{2,4}\s+)?(\d+[a-z]?)\.\s+/.exec(line)?.[1] : undefined;
        if (id !== undefined)
            steps.set(id, [...(steps.get(id) ?? []), i + 1]);
    });
    return steps;
}
/** The `create` of a new pair, or of an evidence record over its report, reading what it binds. */
function creation(c, workbenchId, operationId, see, now) {
    const id = one(c, "--id") ?? randomUUID();
    const envelope = { op: "create", operation_id: operationId, id };
    if (c.sub === "create") {
        const kind = one(c, "--kind");
        const narrative = one(c, "--narrative-file");
        const origin = one(c, "--origin");
        let from = { kind: "user-request", ref: null };
        if (origin !== "user-request") {
            const pkg = see(origin);
            if ("stop" in pkg)
                return pkg;
            from = { kind: "package", ref: { workbench_id: workbenchId, record_id: String(pkg.ok.control.id) } };
        }
        const scope = kind === "package" ? { container: null, store: "work-packages" } : scopeOf(narrative);
        const payload = kind === "package" ? { domain: one(c, "--domain") } : structuredClone(INITIAL_CONTROL[kind]);
        if (kind === "plan") {
            let text;
            try {
                text = readFileSync(join(c.workbench, narrative), "utf-8");
            }
            catch (e) {
                return unread(`the plan ${narrative} could not be read (${message(e)}), and its steps are its anchors; nothing was sent`);
            }
            const steps = planSteps(text);
            const twice = [...steps].filter(([, lines]) => lines.length > 1).map(([id, lines]) => `step number ${id} stands on lines ${lines.join(" and ")}`);
            if (twice.length > 0)
                return usage(`the plan ${narrative} repeats a number under ## Implementation Steps (${twice.join("; ")}), and a step's number is its anchor; number each step once. Nothing was sent`);
            payload.steps = [...steps.keys()].map((id) => ({ id, state: "open" }));
        }
        const request = { ...envelope, kind, filed_by: { actor: one(c, "--actor"), person: c.identity.person ?? null }, origin: from, scope, narrative: { path: narrative }, payload };
        return { ok: { request, resend: { "--id": id } } };
    }
    const pkgPath = one(c, "--record");
    const pkg = see(pkgPath);
    if ("stop" in pkg)
        return pkg;
    if (pkg.ok.kind !== "package")
        return usage(`evidence is produced against a package's brief; ${pkgPath} is a ${pkg.ok.kind} record`);
    const brief = isObject(pkg.ok.narrative) ? pkg.ok.narrative.sha256 : undefined;
    if (typeof brief !== "string")
        return unread(`show of ${pkgPath} names no brief hash, so nothing was sent`);
    const docs = pkg.ok.control.active_documents;
    const plan = Array.isArray(docs) ? docs.find((d) => isObject(d) && d.role === "plan") : undefined;
    const report = one(c, "--report");
    let bytes;
    try {
        bytes = readFileSync(join(c.workbench, report));
    }
    catch (e) {
        return unread(`the report ${report} could not be read (${message(e)}), so nothing was sent`);
    }
    const tree = spawnSync("git", ["rev-parse", "HEAD^{tree}"], { cwd: dirname(c.workbench), encoding: "utf-8" });
    const gitTree = tree.status === 0 ? tree.stdout.trim() : "";
    if (!/^([0-9a-f]{40}|[0-9a-f]{64})$/.test(gitTree))
        return unread(`the project's HEAD tree could not be read (${String(tree.stderr ?? tree.error).trim()}), and evidence names the tree it was produced against; nothing was sent`);
    const version = c.roleVersion ?? pluginVersion();
    if (version === undefined)
        return { stop: { kind: "install", detail: "this plugin's version could not be read from .claude-plugin/plugin.json, and evidence names it; nothing was sent" } };
    const acceptedAt = one(c, "--accepted-at") ?? `${utcStamp(now())}Z`;
    const payload = {
        schema: "fusion.evidence/v1",
        id,
        workbench_id: workbenchId,
        subject: { git_tree: gitTree, git_range: null },
        brief_revision: brief,
        plan_revision: isObject(plan) && typeof plan.revision === "string" ? plan.revision : null,
        role: { profile: one(c, "--actor"), version },
        host: "claude-code",
        execution_policy: "claude-guided",
        verdict: one(c, "--verdict"),
        uncertainties: [],
        checks: [],
        report: { path: report, sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}`, kind: "review" },
        predecessor: null,
        accepted_at: acceptedAt,
        extensions: {},
    };
    return { ok: { request: { ...envelope, kind: "evidence", scope: scopeOf(report), payload }, resend: { "--id": id, "--accepted-at": acceptedAt } } };
}
/** The file Setup writes last and every agent walks up to; its presence marks a workbench set up before the JSON cutover. */
export const SETUP_MARKER = ".fusion-setup";
/** The stores that make a target without the marker a workbench that lost it, never a new one. */
const FUSION_STORES = [...CONTAINER_ROOT_NAMES, "shared"];
/** Setup's one route to a new workbench, by the table of `## Initialize, Setup's route to a new workbench`. */
export function initialize(workbench, ask) {
    const wb = resolve(workbench);
    const g = gate(wb, { ask });
    const stop = (kind, detail) => ({ kind, detail: `${detail}. Setup stops here, and nothing was sent.` });
    switch (g.state) {
        case "json-control":
            return { kind: "ready", how: "reused", workbenchId: g.id };
        case "unsupported":
            return stop("unread", `${wb} is unsupported by this codec${g.diagnosis === null ? "" : ` (${named(g.diagnosis)})`}`);
        case "refused":
            return stop("unread", `the codec refused inspect (${named(g)})${g.reason.startsWith("pending-initialize-") ? "; the committed initialize in .json-state/journal/ is to be corrected by hand" : ""}`);
        case "unanswered":
            return stop(g.cause === "bundle-missing" ? "install" : "unread", `the codec gave no answer to inspect (${g.cause}: ${g.detail})`);
    }
    const pending = g.pending;
    if (pending?.blocked)
        return stop("unread", `${wb} holds a committed initialize (operation ${pending.operation_id}) whose manifest stands at neither its old nor its new bytes; the intent is to be corrected by hand`);
    if (pending === null && [SETUP_MARKER, ...FUSION_STORES].some((e) => existsSync(join(wb, e))))
        return { kind: "ready", how: "legacy", workbenchId: null };
    const operationId = pending?.operation_id ?? randomUUID();
    const id = pending?.id ?? randomUUID();
    const a = ask(wb, { op: "initialize", operation_id: operationId, id });
    if (a.kind === "refused")
        return { kind: "refused", operationId, detail: `the codec refused initialize: ${named(refusal(a))}. Nothing landed, nothing is retried, and Setup stops here` };
    if (a.kind === "unanswered") {
        if (a.cause === "bundle-missing")
            return stop("install", `the codec bundle is missing (${a.detail})`);
        return { kind: "unknown", operationId, detail: `the codec gave no answer to initialize (${a.cause}: ${a.detail}), and it may have landed. Nothing was retried and Setup stops here; run it again, and inspect's pending names the intent it finishes` };
    }
    const again = gate(wb, { ask });
    if (again.state !== "json-control" || again.id !== id)
        return { kind: "unread", operationId, detail: `initialize answered, and inspect then answers ${again.state}${again.state === "json-control" ? ` under ${again.id}` : ""}, not json-control under ${id}: the manifest is not in place. Setup stops here, and nothing more was sent` };
    return { kind: "ready", how: "initialized", workbenchId: id, operationId };
}
/** One write, from the gate to the log. `ask` is the record client's, or a test's stand-in. */
export function write(c, ask, now = () => new Date()) {
    // Retained rows stay retained and the next call repairs them; the mutation does not wait on the log, and the outcome says so.
    let repair;
    try {
        const r = repairRetained(c.workbench);
        if (r.retained > 0 || r.detail !== undefined)
            repair = { retained: r.retained, detail: `${r.retained} record_change row(s) stay retained${r.detail === undefined ? "" : `: ${r.detail}`}` };
    }
    catch (e) {
        repair = { retained: null, detail: `the repair of retained record_change rows failed: ${message(e)}` };
    }
    const o = mutate(c, ask, now);
    return repair === undefined ? o : { ...o, repair };
}
function mutate(c, ask, now) {
    const gated = admitted(c.workbench, ask);
    if ("stop" in gated)
        return gated.stop;
    const workbenchId = gated.ok;
    const shows = {};
    const see = (p) => {
        const s = shown(c.workbench, p, ask);
        if ("ok" in s)
            shows[p] = s.ok;
        return s;
    };
    const resend = one(c, "--operation-id");
    const operationId = resend ?? randomUUID();
    const built = CREATING.has(c.sub) ? creation(c, workbenchId, operationId, see, now) : mutation(c, workbenchId, operationId, see, now);
    if ("stop" in built)
        return built.stop;
    const { request } = built.ok;
    const answer = ask(c.workbench, request);
    if (answer.kind === "refused")
        return { kind: "refused", operationId, refusal: refusal(answer) };
    if (answer.kind === "unanswered") {
        if (answer.cause === "bundle-missing")
            return { kind: "install", detail: `the codec bundle is missing (${answer.detail}), so nothing was sent` };
        return { kind: "unknown", operationId, resend: built.ok.resend, detail: `the codec gave no answer to ${c.sub} (${answer.cause}: ${answer.detail})` };
    }
    let logged;
    try {
        logged = resend !== undefined
            ? logResend(c.workbench, request.op, workbenchId, operationId, answer.revisions)
            : logObserved(c.workbench, composeRows({ request, workbenchId: workbenchId, result: answer.result, revisions: answer.revisions, shows }, { ts: utcStamp(now()), ...c.identity, ...(process.env.FUSION_SESSION_ID && { session_id: process.env.FUSION_SESSION_ID }) }));
    }
    catch (e) {
        logged = { event: "unlogged", detail: `the change landed and its rows could not be composed or kept: ${message(e)}` };
    }
    return { kind: "landed", operationId, revisions: answer.revisions, ...logged };
}
