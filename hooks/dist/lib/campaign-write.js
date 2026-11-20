/**
 * The steering writes of a campaign: `open`, `lanes`, `pause`, `resume`,
 * `move`, `reassign` and `end`, behind `bin/fusion-campaign`. That script's
 * header is the authoritative documentation of each sub-command's usage, of
 * the output and of the exit table; this header is that of the mechanism
 * (plan step 16b of
 * `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`).
 *
 * ## One sequence serves every write
 *
 * The codec reads a campaign and writes none (`codec/README.md`, "A campaign
 * is read and never written"), so this module is the campaign's writer, and
 * every sub-command goes through the same five steps:
 *
 *   1  the candidate: the stored control with the act applied, or for `open`
 *      the new document, with `state.charter_hash` set to `PLACEHOLDER_HASH`
 *      and `state.revision` to null. The schema admits both, and the codec's
 *      validation compares no hash;
 *   2  `priorRevisions`: THE ONE FUNCTION THAT KNOWS WHERE THE TWO VALUES COME
 *      FROM. It places the candidate in a scratch workbench, a copy of
 *      `workbench.json` and the candidate at its own relative path, asks
 *      `show` through `lib/record-client.ts`, and returns the member `prior`
 *      the codec answers for a campaign: Prior's `charterHash` and
 *      `stateRevision`, computed by `codec/src/prior` inside the bundle
 *      (decision
 *      `261109-1238-by-which-build-route-does-the-claude-side-writer-produce-priors-charter-hash-and-state-revision.md`,
 *      option 1). A `prior.problem` is a refusal;
 *   3  the two values replace the placeholders;
 *   4  the filled candidate replaces the first in the scratch workbench and
 *      `validate` must answer no finding, the three lane rules included;
 *   5  the file is written beside its target and renamed into place.
 *
 * The scratch directory is removed on every way out (`withScratch`). A
 * refusal at 2 or 4 writes nothing. No sub-command branches off the sequence:
 * a write that changes `lanes` alone gets back the two values it had, `lanes`
 * being no part of the export, and the file's own `sha256:` revision moves.
 *
 * ## The claim test comes before any candidate
 *
 * A steering act runs only from a checkout holding no claimed package (spec
 * C3). Every write runs `bin/fusion-claimed-package` before it builds a
 * candidate, after the codec's gate alone (a workbench refused by name is
 * exit 4 under every sub-command, and the claim helper would report it under
 * the code it also uses for two claims): a `PACKAGE=` line
 * is `holds-package`, and so is that helper's refusal over two claimed
 * packages, which it names by the sentence its own test pins. Any other
 * outcome of the helper but an empty exit 0 means the test could not be made,
 * and is a `HelperFailure`: the write does not proceed on a guess.
 *
 * ## Which campaign a write names
 *
 * `open` names its own. Every other act takes `--campaign <id>`, and without
 * it the one live campaign of the workbench, read through `list`: none or
 * several is a refusal naming each. Live is `LIVE_STATES` of
 * `lib/campaign.ts`, `running` or `paused`, the one set the overview
 * evaluates lanes over and `sync` reads `mine` from, so the campaign the
 * default names is the one that steers. A `draft` or `authorised` campaign
 * (Prior's states; `open` writes `running`) is named with `--campaign` alone:
 * `lanes`, `move` and `reassign` prepare it, and no checkout reads its lanes
 * until it runs. The terminal set `TERMINAL_STATES` answers a different
 * question, which campaign no act moves.
 *
 * ## What is refused here, before the codec is asked
 *
 * The state rules are the helper's own, with the codec's classes: `pause`
 * from `running` alone, `resume` from `paused` alone, `end` from either,
 * `lanes`, `move` and `reassign` on no terminal campaign; a lane or a package
 * that is not there; a proposal file that is not one. Everything the schema
 * and the lane rules decide is left to `validate` at step 4 and reported as
 * the codec reports it.
 *
 * ## The proposal file `lanes --from` reads
 *
 * The file `bin/fusion-campaign cut` writes (plan step 15, `## Data
 * Structures`). This module reads one key of it, `lanes`, an array of
 * `{ "id": <lane id>, "members": [<container name>, ...] }`, and ignores the
 * rest (`checkouts`, `tolerance`, `handoffs`, `no_areas`, `imbalance`). A
 * member is resolved to a `record_ref` through `list`, its `display` the
 * container name; a lane's `checkout_id` comes from `--assign <lane>=<hex>`
 * or is null.
 *
 * ## The answer write
 *
 * `answer` is no campaign write and shares only the claim test with the
 * others (plan step 5 of
 * `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md`,
 * spec C3). It fetches the upstream and reads, through `steeringAt` of
 * `lib/campaign.ts`, the `question=` rows the overview prints: the question
 * must be one of them with no answer, the answer rule being that module's and
 * no second one. A `**Answers:**` line naming the question in the working
 * tree's shared decisions store, an answer filed and not yet pushed, refuses
 * it as well, so an unpushed answer is never doubled into two that read as
 * none. Then the narrative in the shared decisions store, filed through
 * `lib/record-write.ts` `create --kind decision` as `bin/fusion-write` files
 * one, its `Answered:` line, and `transition --to answered` citing the record
 * itself. The question's record is never opened: the domain the answer
 * carries is that of the asking package's control, at the ref.
 *
 * ## What it writes and never does
 *
 * One file, `campaigns/<id>/campaign.json`, two-space indented with a final
 * newline, the keys in the order the schema's fixtures hold them. It commits
 * nothing: the steering session commits through the ordinary commit step. It
 * sends the codec no mutation; the codec has none for a campaign. No hook
 * imports this module.
 */
import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { ANSWERS_LABEL, answersIn, defaultBin, extractAt, fetchRef, HelperFailure, LIVE_STATES, run, SHARED_DECISIONS, steeringAt, STEERING_ENTRIES, withScratch } from "./campaign.js";
import { isObject, isPackageRow, listedRecords, problemOf, refusedByGate, resultOf } from "./codec-read.js";
import { ask as askCodec } from "./record-client.js";
import { parseFlags as parseWriteFlags, write as recordWrite } from "./record-write.js";
import { CAMPAIGN_RECORD, CAMPAIGN_STORE, CONTAINER_STORE, PACKAGE_CONTROL, RECORD_CONTROL_SUFFIX, WORKBENCH_MANIFEST } from "./stores.js";
/* ------------------------------------------------------------------ *
 * The vocabulary
 * ------------------------------------------------------------------ */
/** What `state.charter_hash` holds while the codec is asked for the true value: the schema's pattern, no hash. */
export const PLACEHOLDER_HASH = `prior-json-sha256:${"0".repeat(64)}`;
/** The working rule, as request 80 `### Stated and not asked` states it. */
export const DELIVERY_POLICY = "commit, then pull with rebase, then read the campaign, then push";
/** `YYMMDD-HHMM-<slug>`, the directory's own name. */
export const CAMPAIGN_ID = /^\d{6}-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A checkout identifier, as `bin/fusion-identity` prints it. */
export const CHECKOUT_HEX = /^[0-9a-f]{8}$/;
/** The outcomes `end` writes. */
export const OUTCOMES = ["completed", "bounded", "failed", "cancelled"];
/** The states no steering act moves a campaign out of. */
export const TERMINAL_STATES = new Set([...OUTCOMES, "archived", "discarded"]);
/* ------------------------------------------------------------------ *
 * The claim test
 * ------------------------------------------------------------------ */
/** The sentence `bin/fusion-claimed-package` prints over two claims, pinned by its own test. */
const TWO_CLAIMS = "which one is in scope cannot be determined";
/**
 * `bin/fusion-claimed-package` from `cwd`: `free` on an empty exit 0, the
 * holding sentence on a `PACKAGE=` line or on the two-claims refusal, and a
 * `HelperFailure` on anything else, the helper's own reason carried.
 */
export function claimTest(cwd, bin = defaultBin()) {
    const helper = join(bin, "fusion-claimed-package");
    const r = run(helper, [], cwd);
    const held = /^PACKAGE=(.*)$/m.exec(r.stdout);
    if (r.status === 0)
        return held === null ? { kind: "free" } : { kind: "holds", detail: `this checkout holds ${held[1]}` };
    if (r.status === 3 && r.stderr.includes(TWO_CLAIMS))
        return { kind: "holds", detail: r.stderr.trim() };
    throw new HelperFailure(`the claim test could not be made: ${helper} exited ${r.status}. ${r.stderr.trim()}`);
}
const refused = (cls, reason, detail) => ({ kind: "refused", refusal: { class: cls, reason, detail } });
const failed = (unread) => ({ kind: "failed", ...unread });
const relOf = (id) => `${CAMPAIGN_STORE}/${id}/${CAMPAIGN_RECORD}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
/** The new document `open` writes: request 80's charter values, `running` with nothing started, every other member null or at zero. */
export function openDocument(act, workbenchId) {
    return {
        schema: "fusion.campaign/v1",
        id: randomUUID(),
        workbench_id: workbenchId,
        charter: {
            schema_version: 1,
            campaign_id: act.id,
            revision: "prior-opaque:r1",
            authorisation_ref: act.authorisation,
            objective: act.objective,
            item_kinds: ["work-package"],
            candidate_sources: ["work-packages"],
            workflow_templates: ["fusion-claude-code"],
            stop_conditions: act.stops,
            intake_policy: "user-filed",
            selection_policy: "user-confirmed-lanes",
            package_policy: "one-claim-per-checkout",
            acceptance_policy: "closing-review-per-package",
            autonomy_policy: "per-package-mode",
            backend_policy: "claude-code",
            delivery_policy: DELIVERY_POLICY,
            data_boundary: [],
            capabilities: [],
            budget_account: "none",
            limits: { max_attempts: 1, max_failures: 0, max_consecutive_failures: 1, max_reviews: 1, resource_units: 1 },
        },
        state: {
            campaign_id: act.id,
            revision: null,
            state: "running",
            previous_terminal: null,
            reason: null,
            charter_hash: PLACEHOLDER_HASH,
            counters: { attempts: 0, failures: 0, consecutive_failures: 0, reviews: 0, resource_units: 0 },
            settlement: { owned_runs: 0, open_intents: 0, unknown_effects: 0, quarantined: 0 },
            requested_outcome: null,
            sessions: [],
            runs: [],
            baseline_hash: null,
            completion_evidence: null,
        },
        lanes: null,
        register: null,
        formation: null,
        provenance: { source: "created", legacy_fields: {} },
        extensions: {},
    };
}
/** The `lanes` key of a proposal file, or the reason it is no proposal. */
export function readProposal(path) {
    let parsed;
    try {
        parsed = JSON.parse(readFileSync(path, "utf-8"));
    }
    catch (e) {
        return { detail: `${path} could not be read as JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
    if (!isObject(parsed) || !Array.isArray(parsed.lanes))
        return { detail: `${path} carries no \`lanes\` array` };
    const lanes = [];
    for (const [i, lane] of parsed.lanes.entries()) {
        if (!isObject(lane) || typeof lane.id !== "string" || lane.id === "" || !Array.isArray(lane.members) || !lane.members.every((m) => typeof m === "string" && m !== "")) {
            return { detail: `${path} lanes[${i}] is not { "id": <non-empty string>, "members": [<container name>, ...] }` };
        }
        lanes.push({ id: lane.id, members: lane.members });
    }
    return { lanes };
}
/** The packages of the workbench by container name, from `list`: the record id each lane member names. */
function packagesByContainer(rows) {
    const out = new Map();
    for (const row of rows)
        if (isPackageRow(row) && typeof row.id === "string" && typeof row.path === "string")
            out.set(basename(dirname(row.path)), row.id);
    return out;
}
/** The campaign the act names, as `list` lists it, or the refusal. */
function campaignOf(rows, named) {
    const campaigns = rows.filter((row) => typeof row.path === "string" && row.path.startsWith(`${CAMPAIGN_STORE}/`) && basename(row.path) === CAMPAIGN_RECORD);
    if (named !== null) {
        const row = campaigns.find((row) => row.path === relOf(named));
        if (row === undefined)
            return refused("unknown-scope", "no-campaign", `no campaign ${named} in the workbench: ${relOf(named)} is not listed`);
        return { path: row.path };
    }
    const live = campaigns.filter((row) => !("problem" in row) && typeof row.status === "string" && LIVE_STATES.has(row.status));
    if (live.length === 1)
        return { path: live[0].path };
    if (live.length === 0)
        return refused("unknown-scope", "no-campaign", `no live campaign in the workbench (${campaigns.length} listed, none running or paused); open one, or --campaign <id> names one that is not live`);
    return refused("unknown-scope", "several-campaigns", `${live.length} live campaigns, so --campaign <id> names the one: ${live.map((row) => row.path).sort().join(", ")}`);
}
/** The act applied to the stored control, or the refusal that it does not apply. `candidate` is mutated. */
function apply(act, candidate, rows) {
    const state = candidate.state;
    const current = String(state.state);
    if (TERMINAL_STATES.has(current))
        return refused("conflict", "campaign-terminal", `the campaign stands at ${current}, which no steering act moves`);
    const lanes = candidate.lanes;
    const laneNamed = (id) => {
        if (lanes === null)
            return refused("conflict", "no-lanes", "the campaign has no lanes yet; `lanes --from <proposal>` writes them");
        return lanes.find((l) => l.id === id) ?? refused("unknown-scope", "lane-unknown", `no lane ${id}; the lanes are ${lanes.map((l) => l.id).join(", ")}`);
    };
    switch (act.act) {
        case "pause":
            if (current !== "running")
                return refused("conflict", "campaign-not-running", `pause applies to a running campaign and this one stands at ${current}`);
            state.state = "paused";
            state.reason = act.reason;
            return null;
        case "resume":
            if (current !== "paused")
                return refused("conflict", "campaign-not-paused", `resume applies to a paused campaign and this one stands at ${current}`);
            state.state = "running";
            state.reason = null;
            return null;
        case "end":
            if (!LIVE_STATES.has(current))
                return refused("conflict", "campaign-not-live", `end applies to a running or paused campaign and this one stands at ${current}`);
            state.state = act.outcome;
            state.reason = act.reason;
            state.completion_evidence = act.evidence;
            return null;
        case "reassign": {
            const lane = laneNamed(act.lane);
            if ("kind" in lane)
                return lane;
            lane.checkout_id = act.checkout;
            return null;
        }
        case "move": {
            const lane = laneNamed(act.to);
            if ("kind" in lane)
                return lane;
            const id = packagesByContainer(rows).get(act.package);
            if (id === undefined)
                return refused("unknown-scope", "package-unknown", `no work package ${act.package} is listed in the workbench`);
            const holds = (l) => l.members.some((m) => m.record_id === id);
            if (holds(lane))
                return refused("conflict", "package-already-in-lane", `${act.package} already stands in lane ${act.to}`);
            for (const l of lanes)
                l.members = l.members.filter((m) => m.record_id !== id);
            lane.members.push({ workbench_id: candidate.workbench_id, record_id: id, display: act.package });
            return null;
        }
        case "lanes": {
            const proposal = readProposal(act.from);
            if ("detail" in proposal)
                return refused("schema-invalid", "proposal-unreadable", proposal.detail);
            const known = new Set(proposal.lanes.map((l) => l.id));
            for (const id of Object.keys(act.assign))
                if (!known.has(id))
                    return refused("unknown-scope", "lane-unknown", `--assign names lane ${id}, which the proposal does not have`);
            const packages = packagesByContainer(rows);
            const written = [];
            for (const lane of proposal.lanes) {
                const members = [];
                for (const container of lane.members) {
                    const id = packages.get(container);
                    if (id === undefined)
                        return refused("unknown-scope", "package-unknown", `the proposal's lane ${lane.id} names ${container}, which is not listed in the workbench`);
                    members.push({ workbench_id: candidate.workbench_id, record_id: id, display: container });
                }
                written.push({ id: lane.id, checkout_id: act.assign[lane.id] ?? null, members });
            }
            candidate.lanes = written;
            return null;
        }
    }
}
/* ------------------------------------------------------------------ *
 * Prior's two values, and the validation, in a scratch workbench
 * ------------------------------------------------------------------ */
/** The one place the two `prior_revision` values come from: the codec's `show` of the candidate, placed in `scratch`. */
export function priorRevisions(candidate, rel, manifest, scratch, ask) {
    const wb = join(scratch, "wb");
    mkdirSync(dirname(join(wb, rel)), { recursive: true });
    cpSync(manifest, join(wb, WORKBENCH_MANIFEST));
    writeFileSync(join(wb, rel), serialise(candidate), "utf-8");
    const shown = resultOf(wb, { op: "show", record: { path: rel } }, ask);
    if ("unread" in shown)
        return shown;
    const prior = shown.result.prior;
    if (!isObject(prior))
        return { unread: { cause: "unanswered", op: "show", how: "unparseable", detail: `show answered the campaign with no \`prior\` member: ${JSON.stringify(prior)}` } };
    if ("problem" in prior)
        return { refusal: problemOf(prior.problem) };
    if (typeof prior.charter_hash !== "string" || typeof prior.revision !== "string")
        return { unread: { cause: "unanswered", op: "show", how: "unparseable", detail: `show answered a \`prior\` this writer does not read: ${JSON.stringify(prior)}` } };
    return { values: { charter_hash: prior.charter_hash, revision: prior.revision } };
}
/** The codec's findings on the filled candidate, placed over the first in `scratch`; null when it answered none. */
function validateInScratch(filled, rel, scratch, ask) {
    const wb = join(scratch, "wb");
    writeFileSync(join(wb, rel), serialise(filled), "utf-8");
    const checked = resultOf(wb, { op: "validate", record: { path: rel } }, ask);
    if ("unread" in checked)
        return checked;
    const findings = Array.isArray(checked.result.findings) ? checked.result.findings : null;
    if (findings === null || typeof checked.result.valid !== "boolean")
        return { unread: { cause: "unanswered", op: "validate", how: "unparseable", detail: "validate answered no `valid` and `findings`" } };
    if (checked.result.valid && findings.length === 0)
        return null;
    const first = findings[0];
    return { refusal: first === undefined ? { class: "schema-invalid", reason: "invalid", detail: "validate answered valid: false with no finding" } : problemOf(first) };
}
/** Two-space indent, LF, a final newline: the codec's own shape, in the key order the candidate holds. */
export const serialise = (doc) => JSON.stringify(doc, null, 2) + "\n";
/** `sha256:` over the exact bytes, as `codec/src/store.ts` `revisionOf` computes a record's revision. */
export const revisionOf = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
/* ------------------------------------------------------------------ *
 * The write
 * ------------------------------------------------------------------ */
/**
 * Perform `act` on the workbench at `workbench` (absolute), from `cwd` (the
 * working tree the claim test runs in): the header's `## One sequence serves
 * every write`, the claim test first. Throws `HelperFailure` where a sibling
 * helper failed and no result names the failure.
 */
export function write(act, workbench, cwd, options = {}) {
    const ask = options.ask ?? askCodec;
    const bin = options.bin ?? defaultBin();
    // The gate first, so a workbench the codec refuses by name is exit 4 here as under every sub-command: the claim
    // helper reads the same workbench and refuses a legacy one with the code it also uses for two claims.
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return failed(gated);
    const claim = claimTest(cwd, bin);
    if (claim.kind === "holds")
        return { kind: "holds-package", detail: claim.detail };
    const listed = listedRecords(workbench, ask);
    if ("unread" in listed)
        return failed(listed.unread);
    const rows = listed.list.filter(isObject);
    // --- the candidate -------------------------------------------------------------
    let rel;
    let candidate;
    let stored = null;
    if (act.act === "open") {
        if (!CAMPAIGN_ID.test(act.id))
            return refused("schema-invalid", "campaign-id", `${act.id} is not YYMMDD-HHMM-<slug>`);
        rel = relOf(act.id);
        if (existsSync(join(workbench, rel)))
            return refused("conflict", "campaign-exists", `${rel} already exists; a campaign is opened once`);
        const manifest = JSON.parse(readFileSync(join(workbench, WORKBENCH_MANIFEST), "utf-8"));
        if (typeof manifest.id !== "string")
            return failed({ cause: "unanswered", op: "inspect", how: "unparseable", detail: `${WORKBENCH_MANIFEST} names no id` });
        candidate = openDocument(act, manifest.id);
    }
    else {
        const named = campaignOf(rows, act.campaign);
        if ("kind" in named)
            return named;
        rel = named.path;
        const shown = resultOf(workbench, { op: "show", record: { path: rel } }, ask);
        if ("unread" in shown)
            return failed(shown.unread);
        if (!isObject(shown.result.control) || typeof shown.result.revision !== "string")
            return failed({ cause: "unanswered", op: "show", how: "unparseable", detail: `show of ${rel} answered no control and revision` });
        stored = shown.result.revision;
        candidate = clone(shown.result.control);
        const notApplicable = apply(act, candidate, rows);
        if (notApplicable !== null)
            return notApplicable;
        candidate.state.charter_hash = PLACEHOLDER_HASH;
        candidate.state.revision = null;
    }
    // --- the two values, the validation, the write ---------------------------------------
    const manifest = join(workbench, WORKBENCH_MANIFEST);
    const prepared = withScratch(cwd, (scratch) => {
        const prior = priorRevisions(candidate, rel, manifest, scratch, ask);
        if ("unread" in prior)
            return failed(prior.unread);
        if ("refusal" in prior)
            return { kind: "refused", refusal: prior.refusal };
        candidate.state.charter_hash = prior.values.charter_hash;
        candidate.state.revision = prior.values.revision;
        const invalid = validateInScratch(candidate, rel, scratch, ask);
        if (invalid !== null)
            return "unread" in invalid ? failed(invalid.unread) : { kind: "refused", refusal: invalid.refusal };
        return { bytes: serialise(candidate) };
    }, bin);
    if ("kind" in prepared)
        return prepared;
    const target = join(workbench, rel);
    // The single-writer rule is the spec's; a file that moved under the read is still named rather than overwritten.
    if (stored !== null && revisionOf(readFileSync(target)) !== stored)
        return refused("conflict", "revision-moved", `${rel} changed while the write was prepared; read it again`);
    mkdirSync(dirname(target), { recursive: true });
    const beside = `${target}.${process.pid}.tmp`;
    writeFileSync(beside, prepared.bytes, "utf-8");
    renameSync(beside, target);
    return { kind: "written", path: rel, revision: revisionOf(prepared.bytes) };
}
/** A narrative basename as a `question=` row prints it: one path segment ending `.md`. */
export const QUESTION_BASENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;
const two = (n) => String(n).padStart(2, "0");
const isoDay = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
/** The answer's narrative, workbench-relative: `<stamp>-answer-to-<question stem>.md` in the shared decisions store. */
export function answerNarrativeOf(question, at) {
    const stamp = `${String(at.getFullYear()).slice(2)}${two(at.getMonth() + 1)}${two(at.getDate())}-${two(at.getHours())}${two(at.getMinutes())}`;
    const topic = `answer-to-${question.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`.slice(0, 120).replace(/-+$/, "");
    return `${SHARED_DECISIONS}/${stamp}-${topic}.md`;
}
/** The narrative before its `Answered:` line: the head the answer rule reads, then the option and the note quoted with the date. */
export function answerText(act, domain, person, day) {
    const quote = (text) => text.split("\n").map((l) => `> ${l}`.trimEnd()).join("\n");
    return [
        `# Answer to ${act.question}`,
        "",
        "---",
        `**Domain:** ${domain}`,
        `**Filed by:** user${person === null ? "" : `, ${person}`}`,
        `${ANSWERS_LABEL}${act.question}`,
        "",
        "---",
        "",
        "## Answer",
        "",
        `The user chose, at the steering session on ${day}:`,
        "",
        quote(act.option),
        ...(act.note === null ? [] : ["", "The user's note:", "", quote(act.note)]),
        "",
    ].join("\n");
}
/** `PERSON=` of `bin/fusion-identity`, null where the helper printed none (its exit 4 and 5); its exit 1 stops the write. */
function personOf(cwd, bin) {
    const helper = join(bin, "fusion-identity");
    const r = run(helper, [], cwd);
    if (![0, 3, 4, 5].includes(r.status))
        throw new HelperFailure(`${helper} exited ${r.status}, so the answer would name nobody: ${r.stderr.trim()}`);
    const value = (key) => new RegExp(`^${key}=(.+)$`, "m").exec(r.stdout)?.[1] ?? null;
    return { person: value("PERSON"), checkout: value("CHECKOUT") };
}
/** One `lib/record-write.ts` call, as `bin/fusion-write <sub> <argv>` sends it. */
function recordCall(sub, argv, workbench, who, ask) {
    const parsed = parseWriteFlags(sub, argv);
    if ("usage" in parsed)
        throw new HelperFailure(`the answer's ${sub} was malformed, a fusion bug: ${parsed.usage}`);
    const identity = { ...(who.person !== null && { person: who.person }), ...(who.checkout !== null && { checkout: who.checkout }) };
    return recordWrite({ ...parsed.call, workbench, identity }, ask);
}
const outcomeDetail = (o) => (o.kind === "refused" ? `${o.refusal.class}/${o.refusal.reason}` : o.kind === "landed" ? "landed" : `${o.kind}: ${o.detail}`);
/**
 * `answer`: the claim test, the question at a fresh fetch, then the record
 * filed, its `Answered:` line and its transition (the header's `## The answer
 * write`). Throws `HelperFailure` where a step after the narrative was
 * written did not land, naming what stands.
 */
export function answer(act, workbench, cwd, options = {}) {
    const ask = options.ask ?? askCodec;
    const bin = options.bin ?? defaultBin();
    const now = (options.now ?? (() => new Date()))();
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return failed(gated);
    const claim = claimTest(cwd, bin);
    if (claim.kind === "holds")
        return { kind: "holds-package", detail: claim.detail };
    // --- the question, at the ref ----------------------------------------------------
    const at = fetchRef(cwd, workbench, null);
    if (at.state !== "ok")
        return { kind: "no-ref", state: at.state, branch: at.branch, ref: at.ref };
    const found = withScratch(cwd, (scratch) => {
        const extract = extractAt(at, STEERING_ENTRIES, scratch);
        const read = steeringAt(extract, ask);
        if ("unread" in read)
            return failed(read.unread);
        const rows = read.questions.filter((q) => q.decision === act.question);
        if (rows.length === 0)
            return refused("unknown-scope", "question-unknown", `${act.question} is no question= row of a live campaign at ${at.ref} (${at.head})`);
        const answered = rows.find((q) => q.answer !== null);
        if (answered !== undefined)
            return refused("conflict", "question-answered", `${act.question} is answered at ${at.ref} by ${answered.answer}`);
        const shown = resultOf(extract, { op: "show", record: { path: `${CONTAINER_STORE}/${rows[0].package}/${PACKAGE_CONTROL}` } }, ask);
        if ("unread" in shown)
            return failed(shown.unread);
        const domain = isObject(shown.result.control) ? shown.result.control.domain : null;
        return { domain: typeof domain === "string" ? domain : "code" };
    }, bin);
    if ("kind" in found)
        return found;
    // An answer filed here and not yet pushed: a second would make both read as none.
    const store = join(workbench, SHARED_DECISIONS);
    for (const name of existsSync(store) ? readdirSync(store).filter((n) => n.endsWith(".md")).sort() : []) {
        if (answersIn(readFileSync(join(store, name), "utf-8")).includes(act.question))
            return refused("conflict", "question-answered", `${act.question} is answered in this working tree by ${name}, not yet pushed`);
    }
    // --- the record --------------------------------------------------------------------
    const who = personOf(cwd, bin);
    const narrative = answerNarrativeOf(act.question, now);
    const control = narrative.replace(/\.md$/, RECORD_CONTROL_SUFFIX);
    if (existsSync(join(workbench, narrative)))
        return refused("conflict", "answer-exists", `${narrative} already exists`);
    mkdirSync(join(workbench, SHARED_DECISIONS), { recursive: true });
    writeFileSync(join(workbench, narrative), answerText(act, found.domain, who.person, isoDay(now)), "utf-8");
    const created = recordCall("create", ["--actor", "user", "--kind", "decision", "--narrative-file", narrative, "--origin", "user-request"], workbench, who, ask);
    if (created.kind !== "landed") {
        // Nothing landed, so the narrative is this run's alone; an unknown outcome may have landed, and it stays.
        if (created.kind !== "unknown")
            rmSync(join(workbench, narrative), { force: true });
        if (created.kind === "refused")
            return { kind: "refused", refusal: created.refusal };
        throw new HelperFailure(`create --kind decision of ${narrative} did not land (${outcomeDetail(created)})${created.kind === "unknown" ? "; the narrative stays, and bin/fusion-write's re-send learns the outcome" : ""}`);
    }
    const shown = resultOf(workbench, { op: "show", record: { path: control } }, ask);
    if ("unread" in shown)
        return failed(shown.unread);
    const record = isObject(shown.result.control) ? shown.result.control.id : undefined;
    const manifest = JSON.parse(readFileSync(join(workbench, WORKBENCH_MANIFEST), "utf-8"));
    if (typeof record !== "string" || typeof manifest.id !== "string")
        throw new HelperFailure(`${control} landed and names no record id, or the manifest no workbench id; it stands at open`);
    const ruling = `ruled by user${who.person === null ? "" : `, ${who.person}`}`;
    appendFileSync(join(workbench, narrative), `\n---\nAnswered: this record — ${act.option}; ${ruling}\n`, "utf-8");
    const ref = JSON.stringify({ workbench_id: manifest.id, record_id: record });
    const moved = recordCall("transition", ["--actor", "user", "--record", control, "--to", "answered", "--reason", "the user answered a peer's question at the steering session", "--answer-ref", ref], workbench, who, ask);
    const revision = moved.kind === "landed" ? moved.revisions[control] : undefined;
    if (revision === undefined)
        throw new HelperFailure(`${control} was filed and its transition to answered did not land (${outcomeDetail(moved)}); it stands at open with its Answered: line, and bin/fusion-write transition --actor user --record ${control} --to answered --reason <text> --answer-ref '${ref}' finishes it`);
    return { kind: "written", path: control, revision };
}
