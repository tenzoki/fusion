/**
 * The host migration entry: a v12 Markdown workbench to JSON control, for
 * `bin/fusion-migrate` and nothing else (step 9 of
 * `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 *
 *   migrate.js <sub> <workbench> [--session <dir>] [flags]
 *
 * The host reads and the codec writes. This entry reads the v12 Markdown
 * (`lib/legacy-import.ts`), applies the consented repairs an owner chooses
 * (`lib/legacy-repair.ts`; optional, the migration requires none), composes
 * the proposal into `.json-state/migration/`, and drives the codec's
 * `migration` phases through `lib/record-client.ts`, one request per process.
 * It writes no control file, no plan file and no stored answer; the codec
 * alone writes those. It needs the plugin and Node and nothing else.
 *
 * ## The git pass
 *
 * A filer the Markdown never recorded is carried as `legacy-unknown`, its
 * person the author git names for the file's first add (`firstAdds`): one
 * `git log --reverse -M --diff-filter=AR --name-status` over the workbench,
 * each path followed back through the renames git reports, so a marker move
 * and the v11-to-v12 store rename both lead to the original add, as does a
 * rename staged in the index and not yet committed. The person
 * is `%an <%ae>` as written, with no mailmap. A file git does not track, a
 * workbench in no repository and a shallow history each give no person, with
 * that reason as evidence. The run's own identity is never read.
 *
 * ## The session
 *
 * `<dir>` (default `$HOME/.fusion-migrate/<12 hex of the workbench path>`)
 * lies outside the workbench and holds what the host keeps: the verified
 * backup and its tree hash, the repair log, and `state.json`, which records
 * the canonical workbench path, the migration id, the proposal's path and
 * hash, every operation id chosen before the first request (the codec's
 * schedule, the `maintenance end` and a rollback's `begin` and `end`), and
 * `.fusion-setup` as it stood before setup metadata. `resume` and `rollback`
 * read it and send the next request whose answer is not stored, under its
 * recorded id; an unknown outcome is answered by the same id, never a fresh
 * one. Every request names the workbench by its `realpath`, because the codec
 * rebuilds the exempt `maintenance` requests from that spelling (W5).
 *
 * ## Setup metadata
 *
 * After `verify` and before `maintenance end`, `.fusion-setup` gains
 * `migration: {id, receipt, migrated_at}` and the plugin version. It is the
 * one file setup metadata writes, and it is on the codec's exclusion
 * allowlist, so neither a later chunk check nor the first rollback after
 * activation sees it. Rollback puts the recorded bytes back.
 *
 * Output: `KEY=value` lines on stdout, reasons on stderr prefixed
 * `fusion-migrate:`; the exit table is the wrapper's header.
 */
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { blocking, buildInventory, composeProposal, inventoryFromSurvey } from "./lib/legacy-import.js";
import { actorsFromLog, applyRepair, ensureBackup, proposeRepair, readRepairLog, REPAIRS, treeHash } from "./lib/legacy-repair.js";
import { ask } from "./lib/record-client.js";
import { CONTAINER_STORE, V11_STORE_NAMES } from "./lib/stores.js";
const EXIT = { done: 0, usage: 2, fault: 3, precondition: 5, blocking: 6, unknown: 7, refused: 8, backup: 9 };
/** The codec's exclusion allowlist (`codec/README.md` `## migration`); fusion's host selects the whole list. */
const EXCLUSIONS = [".session-marker", ".checkout-id", ".cadence-anchors", ".check-stamps", "monitor", "orchestrator-events.jsonl", ".fusion-setup", ".asset-provenance", ".guard-state", ".commit-lock"];
const STATE_DIR = ".json-state";
const SETUP = ".fusion-setup";
class Stop extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
const sha = (b) => "sha256:" + createHash("sha256").update(b).digest("hex");
const out = (lines) => void process.stdout.write(lines.map((l) => `${l}\n`).join(""));
const say = (line) => void process.stderr.write(`fusion-migrate: ${line}\n`);
// --- the codec ---------------------------------------------------------------------
/** One request; a refusal or no answer stops the run with the code a caller acts on. */
function send(wb, request) {
    const a = ask(wb, request);
    const what = `${request.op}${request.phase ? ` ${request.phase}` : ""}${request.chunk !== undefined ? ` chunk ${request.chunk}` : ""}${request.action ? ` ${request.action}` : ""}`;
    if (a.kind === "unanswered")
        throw new Stop(EXIT.unknown, `the outcome of ${what} (operation ${String(request.operation_id ?? "-")}) is unknown: ${a.detail}. Nothing is lost; \`bin/fusion-migrate resume\` (or \`rollback\`, if that was the command) sends the same request again.`);
    if (a.kind === "refused")
        throw new Stop(EXIT.refused, `${what} refused: ${a.class}/${a.reason}${a.detail ? `: ${a.detail}` : ""}`);
    return a.result;
}
const stored = (wb, id) => existsSync(join(wb, STATE_DIR, "ops", `${id}.json`));
function inspect(wb) {
    return send(wb, { op: "inspect" });
}
// --- the session -------------------------------------------------------------------
function sessionDir(wb, flag) {
    return resolve(flag ?? join(homedir(), ".fusion-migrate", sha(wb).slice(7, 19)));
}
function readState(session) {
    const p = join(session, "state.json");
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf-8")) : null;
}
function writeState(session, s) {
    mkdirSync(session, { recursive: true });
    writeFileSync(join(session, "state.json.tmp"), `${JSON.stringify(s, null, 2)}\n`);
    renameSync(join(session, "state.json.tmp"), join(session, "state.json"));
}
// --- reading the workbench ---------------------------------------------------------
/** Untracked and ignored files under the workbench, by git; empty lists outside a repository. */
function gitLists(wb) {
    const ls = (...flags) => {
        const r = spawnSync("git", ["-C", wb, "ls-files", "-z", "--others", "--exclude-standard", ...flags, "--", "."], { encoding: "utf-8", timeout: 30_000 });
        return r.status === 0 ? r.stdout.split("\0").filter(Boolean) : null;
    };
    const untracked = ls();
    return untracked === null ? { untracked: [], ignored: [], git: false } : { untracked, ignored: ls("--ignored") ?? [], git: true };
}
function survey(wb) {
    const r = send(wb, { op: "migration", phase: "survey" });
    return { layout: r.layout, entries: r.entries, eligible: r.eligible_sha256, local: r.local_state };
}
/** The git pass of the header: workbench path to its first add, or why there is none. */
function firstAdds(wb, untracked) {
    const git = (...a) => spawnSync("git", ["-C", wb, ...a], { encoding: "utf-8", timeout: 600_000, maxBuffer: 1 << 30 });
    const top = git("rev-parse", "--show-toplevel");
    if (top.status !== 0)
        return () => ({ unknown: "no-repository" });
    if (git("rev-parse", "--is-shallow-repository").stdout.trim() === "true")
        return () => ({ unknown: "shallow-history" });
    const prefix = relative(realpathSync(top.stdout.trim()), wb);
    const log = spawnSync("git", ["-C", top.stdout.trim(), "-c", "core.quotePath=off", "log", "--reverse", "-M", "--diff-filter=AR", "--name-status", "-z", "--no-mailmap", "--format=%x01%H%x09%an <%ae>", "--", prefix || "."], { encoding: "utf-8", timeout: 600_000, maxBuffer: 1 << 30 });
    if (log.status !== 0)
        throw new Stop(EXIT.fault, `git log over ${wb} failed: ${log.stderr.trim()}`);
    const origin = new Map();
    for (const block of log.stdout.split("\x01").slice(1)) {
        const [head, ...rest] = block.split("\0");
        const [hash, person] = head.replace(/\n+$/, "").split("\t");
        const at = { person, commit: hash };
        const f = rest.map((x) => x.replace(/^\n+/, ""));
        for (let i = 0; i < f.length; i++) {
            if (f[i] === "A" && !origin.has(f[i + 1]))
                origin.set(f[++i], at);
            else if (/^R\d*$/.test(f[i])) {
                const was = origin.get(f[i + 1]) ?? at;
                origin.delete(f[i + 1]);
                origin.set(f[i + 2], was);
                i += 2;
            }
            else if (f[i] === "A")
                i++;
        }
    }
    // A rename staged and not yet committed (`/fusion:migrate` Step 4's `git mv`) is followed the same way, so the moved path keeps its first add.
    const staged = spawnSync("git", ["-C", top.stdout.trim(), "-c", "core.quotePath=off", "diff", "--cached", "-M", "--diff-filter=R", "--name-status", "-z", "--", prefix || "."], { encoding: "utf-8", timeout: 600_000, maxBuffer: 1 << 30 });
    if (staged.status !== 0)
        throw new Stop(EXIT.fault, `git diff --cached over ${wb} failed: ${staged.stderr.trim()}`);
    const s = staged.stdout.split("\0");
    for (let i = 0; i + 2 < s.length; i += 3) {
        const was = origin.get(s[i + 1]);
        if (!was)
            continue;
        origin.delete(s[i + 1]);
        origin.set(s[i + 2], was);
    }
    return (path) => {
        const hit = untracked.has(path) ? undefined : origin.get(prefix ? `${prefix}/${path}` : path);
        return hit ?? { unknown: "untracked" };
    };
}
function compose(wb, session, entries, migrationId = "migration-00000000-survey") {
    const g = gitLists(wb);
    return composeProposal({ root: wb, inventory: inventoryFromSurvey(entries), migrationId, newId: randomUUID, untracked: g.untracked, ignored: g.ignored, actors: actorsFromLog(readRepairLog(session)), firstAdd: firstAdds(wb, new Set([...g.untracked, ...g.ignored])) });
}
const findingId = (wb, f) => {
    const p = join(wb, f.path);
    const bytes = existsSync(p) && statSync(p).isFile() ? sha(readFileSync(p)) : "-";
    return sha([f.class, f.path, f.detail, bytes].join("\0")).slice(7, 19);
};
const legacyNames = (wb) => V11_STORE_NAMES.flatMap((n) => [n, `shared/${n}`, ...(existsSync(join(wb, CONTAINER_STORE)) ? readdirSync(join(wb, CONTAINER_STORE)).map((d) => `${CONTAINER_STORE}/${d}/${n}`) : [])]).filter((p) => existsSync(join(wb, p)));
// --- the proposal ------------------------------------------------------------------
/** Byte ranges that turn `src` into `after`, which the composer made by dropping whole lines or a `[MARK]` token with or without its trailing space. Verified by hash. */
function deletionsOf(src, after) {
    const s = src.toString("utf-8").split("\n");
    const a = after.split("\n");
    const ranges = [];
    const dropped = [];
    let off = 0;
    let j = 0;
    for (let i = 0; i < s.length; i++) {
        const start = off;
        off += Buffer.byteLength(s[i]) + (i < s.length - 1 ? 1 : 0);
        if (j < a.length && s[i] === a[j]) {
            j++;
            continue;
        }
        const cut = j < a.length ? s[i].length - a[j].length : -1;
        let p = 0;
        while (cut > 0 && p < a[j].length && s[i][p] === a[j][p])
            p++;
        for (; cut > 0 && p >= 0; p--) {
            if (/^\[[A-Z][A-Z -]*\] ?$/.test(s[i].slice(p, p + cut)) && s[i].slice(0, p) + s[i].slice(p + cut) === a[j])
                break;
        }
        if (cut > 0 && p >= 0) {
            ranges.push({ offset: start + Buffer.byteLength(s[i].slice(0, p)), length: Buffer.byteLength(s[i].slice(p, p + cut)) });
            j++;
        }
        else
            dropped.push(i), ranges.push({ offset: start, length: off - start });
    }
    // A dropped last line has no newline of its own; the one before it goes instead.
    const last = ranges[ranges.length - 1];
    if (dropped.at(-1) === s.length - 1 && last && last.offset > 0 && last.offset + last.length === src.length)
        last.offset--;
    const merged = ranges.reduce((m, r) => {
        const prev = m[m.length - 1];
        if (prev && prev.offset + prev.length === r.offset)
            prev.length += r.length;
        else
            m.push({ ...r });
        return m;
    }, []);
    let rebuilt = Buffer.alloc(0);
    let at = 0;
    for (const r of merged)
        (rebuilt = Buffer.concat([rebuilt, src.subarray(at, r.offset)])), (at = r.offset + r.length);
    rebuilt = Buffer.concat([rebuilt, src.subarray(at)]);
    if (j !== a.length || sha(rebuilt) !== sha(after))
        throw new Error("a rewrite is not a deletion of its source; the composer and this serialiser disagree");
    return merged;
}
/** The proposal in `fusion.migration-proposal/v1`'s form (step 4's note lists the mapping). */
function serialise(wb, p, eligible, ids, session) {
    const records = {};
    for (const r of p.records) {
        const src = readFileSync(join(wb, r.narrative));
        if (sha(src) !== r.source_sha256)
            throw new Stop(EXIT.precondition, `${r.narrative} changed between survey and composition; run again once the workbench is quiet`);
        const rewrite = r.narrative_after === null ? null : { after_sha256: sha(r.narrative_after), deletions: deletionsOf(src, r.narrative_after) };
        records[r.id] = { row: r.row, kind: r.kind, narrative: r.narrative, source_sha256: r.source_sha256, control_path: r.control_path, backup: r.backup, rewrite, control: r.control };
    }
    const counts = Object.fromEntries(Object.entries(p.counts).map(([k, v]) => [k.replace(/-/g, "_"), v]));
    const repairs = readRepairLog(session).map(({ finding, answers, pre_sha256, post_sha256 }) => ({ finding, answers, pre_sha256, post_sha256 }));
    const doc = { schema: "fusion.migration-proposal/v1", migration_id: p.migration_id, workbench_id: p.workbench_id, source_layout: p.source_layout, source_inventory_sha256: eligible, operation_ids: ids, exclusions: EXCLUSIONS, records, counts, findings: p.findings, repairs };
    return `${JSON.stringify(doc)}\n`;
}
// --- the run -----------------------------------------------------------------------
function pluginVersion() {
    try {
        return JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".claude-plugin", "plugin.json"), "utf-8")).version ?? null;
    }
    catch {
        return null;
    }
}
/** Sends every scheduled request whose answer is not stored, in order, then setup metadata and `maintenance end`. */
function drive(wb, session, s) {
    const lines = [];
    if (s.plan === null || s.schedule === null) {
        const r = send(wb, { op: "migration", operation_id: s.operation_ids.plan, phase: "plan", proposal: s.proposal });
        s.plan = r.plan;
        s.schedule = { apply: r.schedule.apply, verify: r.schedule.verify, rollback: r.schedule.rollback };
        writeState(session, s);
        lines.push(`planned=${r.migration_id}\t${r.plan.sha256}\t${r.schedule.apply.length} chunks`);
    }
    const plan = s.plan;
    for (const { chunk, operation_id } of s.schedule.apply) {
        if (stored(wb, operation_id))
            continue;
        send(wb, { op: "migration", operation_id, phase: "apply", plan, chunk });
        lines.push(`applied=${chunk}`);
    }
    let receipt = "";
    if (!stored(wb, s.schedule.verify)) {
        const r = send(wb, { op: "migration", operation_id: s.schedule.verify, phase: "verify", plan });
        receipt = r.receipt.path;
        lines.push(`verified=${r.receipt.path}\t${r.receipt.sha256}`);
    }
    const setup = join(wb, SETUP);
    const now = existsSync(setup) ? readFileSync(setup, "utf-8") : "";
    if (!now.includes(`"${s.migration_id}"`)) {
        let head = {};
        try {
            head = JSON.parse(now);
        }
        catch {
            head = {};
        }
        const version = pluginVersion();
        writeFileSync(setup, `${JSON.stringify({ ...head, ...(version ? { plugin_version: version } : {}), migration: { id: s.migration_id, receipt: receipt || `archive/migrations/${s.migration_id}/receipt.json`, migrated_at: new Date().toISOString() } })}\n`);
        lines.push(`setup=${SETUP}`);
    }
    if (!stored(wb, s.end_id))
        send(wb, { op: "maintenance", operation_id: s.end_id, action: "end", fence: s.schedule.apply[0].operation_id });
    s.done = true;
    writeState(session, s);
    return [...lines, `migrated=${s.migration_id}`, "result=json-control"];
}
function preconditions(wb) {
    const names = legacyNames(wb);
    if (names.length)
        throw new Stop(EXIT.precondition, `the v11 store names stand (${names.join(", ")}); rename them first with /fusion:migrate's rename pass. Nothing was written.`);
    const i = inspect(wb);
    if (!(i.operations?.implemented ?? []).includes("migration"))
        throw new Stop(EXIT.precondition, "the installed codec does not implement `migration`; update the plugin. Nothing was written.");
    if (i.state !== "legacy")
        throw new Stop(EXIT.precondition, `the workbench is ${i.state}, not legacy Markdown. Nothing was written.`);
    if (i.maintenance !== null || i.pending !== null)
        throw new Stop(EXIT.precondition, `a fence or a pending intent stands (${JSON.stringify(i.maintenance ?? i.pending)}); \`resume\`, \`rollback\` or the archive helper that set it closes it. Nothing was written.`);
    const lines = [];
    const marker = join(wb, ".session-marker");
    if (existsSync(marker))
        lines.push(`reported=session-marker\t${Date.now() - statSync(marker).mtimeMs < 600_000 ? "live" : "stale"}\tanother session may write Markdown during the run; the chunks detect a write, they do not prevent one`);
    lines.push("reported=monitor\tnot detected: a monitor only reads");
    const g = gitLists(wb);
    if (!g.git)
        lines.push("reported=git\tnot a repository: untracked and ignored files are not listed");
    for (const p of g.untracked)
        lines.push(`untracked=${p}`);
    for (const p of g.ignored)
        lines.push(`ignored=${p}`);
    return lines;
}
function run(wb, session) {
    const previous = readState(session);
    if (previous?.done && !previous.rolled_back)
        return [`migrated=${previous.migration_id}`, "result=no-op", "note=nothing was sent: the session records this migration as verified"];
    if (previous && !previous.rolled_back)
        throw new Stop(EXIT.precondition, `a run of ${previous.migration_id} is recorded in ${session}; \`resume\` finishes it or \`rollback\` undoes it`);
    const lines = preconditions(wb);
    try {
        ensureBackup(wb, session);
    }
    catch (e) {
        throw new Stop(EXIT.backup, `${e.message}; nothing was repaired or migrated, and ${session} holds the copy that failed`);
    }
    const sv = survey(wb);
    let n = 1;
    const base = `migration-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-v12`;
    let id = base;
    while (existsSync(join(wb, "archive", "migrations", id)))
        id = `${base}-${++n}`;
    const p = compose(wb, session, sv.entries, id);
    const blocks = blocking(p);
    if (blocks.length) {
        out(lines);
        for (const f of blocks)
            say(`blocking ${f.class} ${f.path}: ${f.detail}`);
        throw new Stop(EXIT.blocking, `${blocks.length} blocking findings remain; \`repair --list\` proposes their repairs. Nothing was migrated.`);
    }
    const writes = p.records.reduce((t, r) => t + 2 + (r.narrative_after === null ? 0 : 1), 0);
    const chunks = Math.floor(writes / 48) + 1;
    const ids = { plan: randomUUID(), apply: Array.from({ length: chunks }, randomUUID), verify: randomUUID(), rollback: Array.from({ length: chunks + 1 }, randomUUID) };
    const proposalPath = `${STATE_DIR}/migration/${id}.json`;
    const bytes = serialise(wb, p, sv.eligible, ids, session);
    mkdirSync(join(wb, STATE_DIR, "migration"), { recursive: true });
    writeFileSync(join(wb, proposalPath), bytes);
    const setup = join(wb, SETUP);
    const s = { workbench: wb, migration_id: id, proposal: { path: proposalPath, sha256: sha(bytes) }, operation_ids: ids, end_id: randomUUID(), setup_before: existsSync(setup) ? readFileSync(setup, "utf-8") : null, plan: null, schedule: null, rollback: null, done: false, rolled_back: false };
    writeState(session, s);
    return [...lines, `proposal=${proposalPath}\t${s.proposal.sha256}\t${p.records.length} records`, ...drive(wb, session, s)];
}
function recorded(wb, session) {
    const s = readState(session);
    if (s === null)
        throw new Stop(EXIT.precondition, `no run is recorded in ${session}`);
    if (s.workbench !== wb)
        throw new Stop(EXIT.precondition, `${session} records ${s.workbench}, not ${wb}`);
    return s;
}
function resumeRun(wb, session) {
    const s = recorded(wb, session);
    if (s.rolled_back || s.rollback !== null)
        throw new Stop(EXIT.precondition, `${s.migration_id} is being or was rolled back; \`rollback\` finishes that`);
    if (s.done)
        return [`migrated=${s.migration_id}`, "result=no-op"];
    return drive(wb, session, s);
}
/**
 * Ends the fence a rollback began after activation once its first chunk is
 * refused, as the codec's session base D does, so the store takes writes
 * again. The codec's audit then refuses every later rollback of this
 * migration, which work since activation had already decided. The ids are
 * dropped only after the `end` is stored, so a retry resends it under its id.
 */
function endRefusedFence(wb, session, s, refusal) {
    const fence = s.rollback.begin_id;
    try {
        send(wb, { op: "maintenance", operation_id: s.rollback.end_id, action: "end", fence });
    }
    catch (e) {
        return new Stop(e.code ?? EXIT.fault, `${refusal.message}; ending the fence ${fence} this rollback began then failed: ${e.message}`);
    }
    s.rollback = null;
    writeState(session, s);
    return new Stop(EXIT.refused, `${refusal.message}. The fence ${fence} this rollback began is ended: the store stays under JSON control and takes writes again, and the codec refuses every later rollback of this migration`);
}
/** Rolls back every landed chunk, then chunk 0, then ends the fence; resumable under the recorded ids. */
function rollback(wb, session) {
    const s = recorded(wb, session);
    if (s.rolled_back)
        return [`rolled-back=${s.migration_id}`, "result=no-op"];
    if (s.plan === null || s.schedule === null) {
        if (stored(wb, s.operation_ids.plan) || existsSync(join(wb, STATE_DIR, "journal", s.operation_ids.plan)))
            throw new Stop(EXIT.precondition, "the plan landed or is pending and only its own request finishes it; `resume` first");
        rmSync(join(wb, s.proposal.path), { force: true });
        s.rolled_back = true;
        writeState(session, s);
        return [`rolled-back=${s.migration_id}`, "result=nothing-planned"];
    }
    const i = inspect(wb);
    const lines = [];
    if (s.rollback === null) {
        s.rollback = { begin_id: randomUUID(), end_id: randomUUID() };
        writeState(session, s);
    }
    if (i.state === "json-control" && !stored(wb, s.rollback.begin_id))
        send(wb, { op: "maintenance", operation_id: s.rollback.begin_id, action: "begin" });
    const landed = s.schedule.apply.filter((a) => stored(wb, a.operation_id)).map((a) => a.chunk);
    const rb = new Map(s.schedule.rollback.map((r) => [r.chunk, r.operation_id]));
    try {
        for (const chunk of [...landed.sort((x, y) => y - x), 0]) {
            if (stored(wb, rb.get(chunk)))
                continue;
            send(wb, { op: "migration", operation_id: rb.get(chunk), phase: "rollback", plan: s.plan, chunk });
            lines.push(`rolled-back-chunk=${chunk}`);
        }
    }
    catch (e) {
        // Still activated, so no rollback chunk landed: the refused one was the first, and nothing binds this fence yet (codec/README.md, `## migration`).
        if (!(e instanceof Stop) || e.code !== EXIT.refused || i.state !== "json-control")
            throw e;
        throw endRefusedFence(wb, session, s, e);
    }
    const fence = inspect(wb).maintenance;
    if (fence !== null && !stored(wb, s.rollback.end_id))
        send(wb, { op: "maintenance", operation_id: s.rollback.end_id, action: "end", fence: fence.operation_id });
    if (s.setup_before !== null)
        writeFileSync(join(wb, SETUP), s.setup_before);
    s.rolled_back = true;
    writeState(session, s);
    return [...lines, `rolled-back=${s.migration_id}`, "result=legacy"];
}
/** Every file and directory but `.json-state/`, which holds the replay protection and never travels. */
const treeWithoutState = (root) => {
    const inv = buildInventory(root);
    const keep = (p) => p !== STATE_DIR && !p.startsWith(`${STATE_DIR}/`);
    return sha([...inv.files.filter((f) => keep(f.path)).map((f) => `${f.path}\t${f.kind}\t${f.sha256}`), ...inv.dirs.filter(keep).map((d) => `${d}/`)].join("\n"));
};
/** Puts the verified external backup back over a legacy store with no fence and no plan; never calls the codec. */
function restoreBackup(wb, session, consent) {
    const backup = join(session, "backup");
    if (!existsSync(join(session, "backup.sha256")))
        throw new Stop(EXIT.precondition, `${session} holds no backup`);
    if (treeHash(backup) !== readFileSync(join(session, "backup.sha256"), "utf-8").trim())
        throw new Stop(EXIT.backup, `${backup} no longer matches its recorded tree hash; nothing was restored`);
    const plans = existsSync(join(wb, "archive", "migrations")) ? readdirSync(join(wb, "archive", "migrations")).filter((d) => existsSync(join(wb, "archive", "migrations", d, "plan.json"))) : [];
    if (existsSync(join(wb, "workbench.json")) || existsSync(join(wb, STATE_DIR, "maintenance.json")) || plans.length)
        throw new Stop(EXIT.precondition, "a manifest, a fence or plan files stand; `rollback` first. Nothing was restored.");
    if (!consent)
        throw new Stop(EXIT.precondition, "restore-backup replaces the workbench with the backup; pass --consent. Nothing was restored.");
    for (const name of readdirSync(wb))
        if (name !== STATE_DIR)
            rmSync(join(wb, name), { recursive: true, force: true });
    for (const name of readdirSync(backup))
        if (name !== STATE_DIR)
            cpSync(join(backup, name), join(wb, name), { recursive: true, verbatimSymlinks: true });
    if (treeWithoutState(wb) !== treeWithoutState(backup))
        throw new Stop(EXIT.backup, "the restored tree does not hash as the backup; the backup is kept as it was");
    return [`restored=${backup}`, `tree=${treeWithoutState(wb)}`, "result=restored"];
}
function status(wb, session) {
    const s = readState(session);
    const i = inspect(wb);
    const lines = [`session=${session}`, `state=${i.state}`, `fence=${i.maintenance?.operation_id ?? "-"}`, `backup=${existsSync(join(session, "backup.sha256")) ? "present" : "absent"}`, `repairs=${readRepairLog(session).length}`];
    if (s === null)
        return [...lines, "run=none"];
    const landed = s.schedule?.apply.filter((a) => stored(wb, a.operation_id)).length ?? 0;
    return [...lines, `migration=${s.migration_id}`, `planned=${s.plan ? "yes" : "no"}`, `chunks=${landed}/${s.schedule?.apply.length ?? "-"}`, `verified=${s.schedule && stored(wb, s.schedule.verify) ? "yes" : "no"}`, `done=${s.done}`, `rolled_back=${s.rolled_back}`];
}
function surveyOut(wb, session) {
    const sv = survey(wb);
    const p = compose(wb, session, sv.entries);
    const by = new Map();
    for (const f of p.findings)
        by.set(`${f.severity}\t${f.class}`, (by.get(`${f.severity}\t${f.class}`) ?? 0) + 1);
    // The derived and defaulted values by pointer, rule and evidence; an evidence naming a commit, a mark or step ids is counted as `*`.
    const derived = new Map();
    for (const r of p.records) {
        for (const [at, d] of Object.entries(r.control.provenance.legacy_fields.derived ?? {})) {
            const k = `${at.replace(/\/\d+(?=\/|$)/g, "/<i>")}\t${d.rule}\t${d.evidence === undefined ? "-" : /^[a-z][a-z-]*$/.test(d.evidence) ? d.evidence : "*"}`;
            derived.set(k, (derived.get(k) ?? 0) + 1);
        }
    }
    return [`layout=${sv.layout}`, `eligible=${sv.eligible}`, `pending=${sv.local.intents.length}`, ...Object.entries(p.counts).map(([k, v]) => `count=${k}\t${v}`), ...[...by].map(([k, v]) => `findings=${k}\t${v}`), ...[...derived].sort().map(([k, v]) => `derived=${k}\t${v}`), ...blocking(p).map((f) => `blocking=${findingId(wb, f)}\t${f.class}\t${f.path}\t${f.detail}`)];
}
function repair(wb, session, flags) {
    const p = compose(wb, session, survey(wb).entries);
    const blocks = blocking(p);
    // A reported finding of a class the repair module holds: the owner may still fix its Markdown first.
    const optional = p.findings.filter((f) => f.severity === "reported" && REPAIRS[f.class] !== undefined);
    if (flags.has("--list")) {
        const listed = flags.has("--optional") ? optional : blocks;
        const lines = [`${flags.has("--optional") ? "optional" : "blocking"}=${listed.length}`];
        for (const f of listed) {
            const id = findingId(wb, f);
            const r = proposeRepair(wb, f);
            lines.push(`finding=${id}\t${f.class}\t${f.path}\t${f.detail}`);
            if (!r.repairable)
                lines.push(`unrepairable=${id}\t${r.reason}`);
            else {
                lines.push(`edit=${id}\t${r.edit}`, ...r.listed.map((l) => `listed=${id}\t${l}`));
                for (const q of r.questions)
                    lines.push(`ask=${id}\t${q.key}\t${q.form}\t${q.ask}\t${q.choices?.join("|") ?? "-"}\t${q.when ? `${q.when.key}=${q.when.value}` : "-"}`);
            }
        }
        return lines;
    }
    const id = flags.get("--apply")?.[0];
    const f = [...blocks, ...optional].find((x) => findingId(wb, x) === id);
    if (f === undefined)
        throw new Stop(EXIT.blocking, `no repairable finding ${id}; its file may have changed since it was listed. \`repair --list\` names the current ones. Nothing was written.`);
    const answers = {};
    for (const v of flags.get("--value") ?? []) {
        const at = v.indexOf("=");
        if (at <= 0)
            throw new Stop(EXIT.usage, `--value takes key=value, not ${JSON.stringify(v)}`);
        answers[v.slice(0, at)] = v.slice(at + 1);
    }
    let r;
    try {
        r = applyRepair({ root: wb, session, proposal: proposeRepair(wb, f), consent: flags.has("--consent"), answers });
    }
    catch (e) {
        throw new Stop(EXIT.backup, `${e.message}; nothing was repaired`);
    }
    if (!r.applied)
        throw new Stop(EXIT.blocking, `${id} not applied: ${r.refusal}: ${r.detail}. Nothing was written.`);
    return [`applied=${id}\t${f.class}\t${f.path}`, `logged=${readRepairLog(session).length}`];
}
// --- the entry -----------------------------------------------------------------------
const TAKES = { survey: [], repair: ["--list", "--optional", "--apply", "--value", "--consent"], run: [], resume: [], rollback: [], status: [], "restore-backup": ["--consent"] };
const VALUED = new Set(["--apply", "--value", "--session"]);
function main(argv) {
    const [sub, given, ...rest] = argv;
    if (sub === undefined || !(sub in TAKES) || !given)
        throw new Stop(EXIT.usage, "usage: migrate.js <survey|repair|run|resume|rollback|restore-backup|status> <workbench> [flags]; run it through bin/fusion-migrate");
    const flags = new Map();
    for (let i = 0; i < rest.length; i++) {
        const f = rest[i];
        if (f !== "--session" && !TAKES[sub].includes(f))
            throw new Stop(EXIT.usage, `${sub} takes no ${JSON.stringify(f)}`);
        const v = VALUED.has(f) ? rest[++i] : "";
        if (v === undefined)
            throw new Stop(EXIT.usage, `${f} needs a value`);
        flags.set(f, [...(flags.get(f) ?? []), v]);
    }
    if (sub === "repair" && (flags.has("--list") === flags.has("--apply") || (flags.has("--optional") && !flags.has("--list"))))
        throw new Stop(EXIT.usage, "repair takes --list [--optional] or --apply <finding>");
    if (!lstatSync(given).isDirectory())
        throw new Stop(EXIT.usage, `${given} is not a directory`);
    const wb = realpathSync(given);
    const session = sessionDir(wb, flags.get("--session")?.[0]);
    const lines = sub === "survey" ? surveyOut(wb, session)
        : sub === "repair" ? repair(wb, session, flags)
            : sub === "run" ? run(wb, session)
                : sub === "resume" ? resumeRun(wb, session)
                    : sub === "rollback" ? rollback(wb, session)
                        : sub === "restore-backup" ? restoreBackup(wb, session, flags.has("--consent"))
                            : status(wb, session);
    out(lines);
    return EXIT.done;
}
try {
    process.exitCode = main(process.argv.slice(2));
}
catch (e) {
    if (e instanceof Stop) {
        say(e.message);
        process.exitCode = e.code;
    }
    else {
        say(`an internal fault stopped the migration entry, a fusion bug or an incomplete install. \`status\` names where the run stands.\n${e instanceof Error ? e.stack : String(e)}`);
        process.exitCode = EXIT.fault;
    }
}
