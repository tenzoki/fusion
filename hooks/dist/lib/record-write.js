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
 *               `attach-evidence`, the targets of `set-dependencies`, the
 *               origin of `create`, the package of `evidence`). Its revision
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
 * domain, and the kernel fixes the rest.
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
 * expected revision, `claimed_at` for `claim`, the id for a creation and
 * `accepted_at` for evidence), so the codec sees the same request and answers
 * its stored bytes. An evidence re-send re-reads the brief, the plan, the
 * report and the tree; if one moved, the request differs and the codec
 * answers `conflict/operation-id-reused`. No row is composed for a re-send.
 *
 * No automatic hook imports this module or runs `hooks/write.ts`
 * (`lib/record-client.ts` `## The recovery declaration`).
 */
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gate } from "./record-client.js";
import { composeRows, logObserved, logResend, repairRetained } from "./record-change.js";
import { utcStamp } from "./orchestrator-events.js";
export const SUBCOMMANDS = ["claim", "release", "transition", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "create", "evidence"];
/** Per kind, the `transition` payload fields the codec reads; nothing else is sent. */
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
    claim: [...ON_RECORD, "--claimed-at"],
    release: [...ON_RECORD, "--reason"],
    transition: [...ON_RECORD, "--to", "--reason", ...ALL_PAYLOAD.map(flagOf)],
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
const resendFlags = (s) => s === "claim" ? ["--expected-revision", "--claimed-at"] : s === "create" ? ["--id"] : s === "evidence" ? ["--id", "--accepted-at"] : ["--expected-revision"];
const REPEATED = new Set(["--on"]);
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
        if (flags.has(f) && !REPEATED.has(f))
            return { usage: `${f} is given twice` };
        const value = BARE.has(f) ? "" : argv[++i];
        if (value === undefined)
            return { usage: `${f} needs a value` };
        flags.set(f, [...(flags.get(f) ?? []), value]);
    }
    const missing = ["--actor", ...REQUIRED[s]].find((f) => !flags.has(f));
    if (missing !== undefined)
        return { usage: `${sub} needs ${missing}` };
    const resend = resendFlags(s);
    if (resend.some((f) => flags.has(f) !== flags.has("--operation-id")))
        return { usage: `a re-send gives --operation-id with ${resend.join(" and ")}, as the unknown outcome printed them; a first call gives none of them` };
    if (s === "set-mode") {
        const value = flags.get("--value")[0];
        if (value !== "ordinary" && value !== "autonomous")
            return { usage: "--value is ordinary or autonomous" };
        if ((value === "autonomous") !== flags.has("--source"))
            return { usage: "autonomous needs --source, the user's word or a record; ordinary takes none" };
    }
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
    // `gate` drops `inspect.pending`; the one answer it read is kept here so a pending initialize is named without a second inspect.
    let inspected;
    const g = gate(workbench, { ask: (w, r, o) => (inspected = ask(w, r, o)) });
    switch (g.state) {
        case "json-control":
            return { ok: g.id };
        case "legacy": {
            const pending = inspected?.kind === "result" && isObject(inspected.result) ? inspected.result.pending : null;
            if (isObject(pending))
                return unread(`${workbench} holds a committed initialize (operation ${String(pending.operation_id)}) whose manifest has not landed. Run /fusion:setup, which finishes it. Nothing was sent: this client neither initializes nor migrates, and retries nothing.`);
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
/** Why this call may not send the mutation, or `null`. Only `claim`, `release` and a transition out of `claimed` read the identity. */
function ownership(c, target) {
    const mine = c.identity.checkout;
    if (c.sub === "claim")
        return mine === undefined ? { kind: "ownership", detail: "this checkout's identifier could not be read, so no claim can name it" } : null;
    if ((c.sub !== "release" && c.sub !== "transition") || target.kind !== "package" || target.control.status !== "claimed")
        return null;
    const holder = isObject(target.control.claim) ? target.control.claim.checkout_id : undefined;
    if (mine === undefined)
        return { kind: "ownership", detail: `the package is claimed and this checkout's identifier could not be read, so whether this checkout holds it is unknown; nothing was sent` };
    if (holder !== mine)
        return { kind: "ownership", detail: `the package is claimed by checkout ${String(holder)}, not by this checkout (${mine}); only the holder releases it or moves it out of claimed, and nothing overrides that` };
    return null;
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
            // The binding carries the policy the evidence record was produced under, read off the record.
            return { ok: { evidence: { ref: { ...ref(ev.ok), revision: ev.ok.revision }, policy: ev.ok.control.execution_policy } } };
        }
        default:
            throw new Error(`fieldsOf: ${c.sub} is a creation, built by creation()`);
    }
}
/** A mutation of the record `--record` names, at the revision its `show` answered. */
function mutation(c, workbenchId, operationId, see, now) {
    const path = one(c, "--record");
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
    const request = { op: c.sub, operation_id: operationId, record: { path }, expected_revision: expectedRevision, actor: { actor: one(c, "--actor"), person: c.identity.person ?? null }, ...fields.ok };
    return { ok: { request, resend: { "--expected-revision": expectedRevision, ...(claimedAt !== undefined && { "--claimed-at": claimedAt }) } } };
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
/** One write, from the gate to the log. `ask` is the record client's, or a test's stand-in. */
export function write(c, ask, now = () => new Date()) {
    try {
        repairRetained(c.workbench);
    }
    catch {
        // Retained rows stay retained; the next call repairs them. The mutation does not wait on the log.
    }
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
