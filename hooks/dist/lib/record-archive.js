/**
 * The host's archive move over a JSON-controlled workbench: which units may
 * leave the current record store, the fence that keeps every codec writer out
 * while they move, the move, its verification, and the recovery a crash
 * leaves behind. Reached through `archive.ts` and `bin/fusion-archive`, by
 * explicit calls only. No skill calls it before step 13 of
 * `261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md`,
 * which waits on Prior's qualification of the archive revision.
 *
 * ## What it decides, and from what
 *
 * Prior rules (`## 36` of its FJ03c response, `codec/fixtures/prior/REQUESTS.md`
 * `## The archive revision (the contract delta)`) that every record staying
 * under JSON control keeps every binding it makes. Whether a unit may leave is
 * decided from one codec answer: `reconcile`'s `references`, complete by the
 * schemas since the archive revision (`codec/README.md`
 * `## What \`reconcile\` reports`). Nothing here parses a control file. The
 * store is read through `lib/record-index.ts` `readRecordIndex` (gate, `list`,
 * `reconcile`, and its judgement of which rows read), whose `list` and
 * `reconcile` answers are kept rather than asked for twice. State is the
 * contract's liveness, never a Markdown header or a file name.
 *
 * ## Units
 *
 *   package          a container `work-packages/<dir>/`, every file below it.
 *                    Eligible when every record in it is terminal by
 *                    `codec/contract/transitions.json` and it holds nothing
 *                    but directories and regular files.
 *   pair             a record under `shared/`, its control file and its
 *                    narrative, named by either. Eligible when terminal.
 *   evidence-group   a report and every evidence record naming it, moved
 *                    whole or not at all; named by the report or any record.
 *
 * A candidate line naming anything else is refused by name: a path under
 * `archive/`, one reached through a symbolic link, a record inside a
 * container (it moves with its container), a file no record names (the skill
 * moves it as before).
 *
 * ## Holds, to a fixed point
 *
 * A reference whose source stays binds its target, and a unit containing the
 * target stays too. A container contains every path below it, so it inherits
 * the hold of anything inside. A unit held in one round stays, so its own
 * references hold in the next; the computation repeats until no round holds a
 * further unit. The target of an entry:
 *
 *   resolved                      its `target`
 *   unresolved, ambiguous,        the value at the entry's own pointer in
 *     foreign                     `show` of its source: a record id holds
 *                                 every unit carrying that id, a path every
 *                                 unit containing it
 *   unchecked                     none: a legacy citation, a git commit or a
 *                                 named external target binds no local file
 *
 * A control file that does not read (the index's `unreadable`) has bindings
 * nobody can know, so every unit is held.
 *
 * Prose binds too, where it names a path. A remaining record's narrative that
 * cites a unit by a full workbench path holds it, because that path no longer
 * resolves once the unit moves; Prior accepts no intentional break of such a
 * citation (its response at `39f6fb8`, ruling 40). The tokens are the citation
 * grammar's own (`lib/citation-scan.ts`): every token it reports
 * `store-prefixed` is read as a path, `./` and `../` from the citing file,
 * `fusion-workbench/` and a bare container directory from the workbench root,
 * and one rooted in `archive/` names nothing that moves. The file it names
 * holds, and so does every file the grammar's own lookup of its last segment
 * finds in that directory (a wildcarded marker, a prefix). The hold line names
 * the citing narrative, `line <n>`, and the cited path. A storeless basename
 * holds nothing: the lookup covers `archive/`, so it still resolves. A report,
 * a forum entry or any other Markdown file names no record and binds nothing
 * here, and a narrative that does not read stops the survey (exit 4).
 *
 * ## The move
 *
 *   inventory   `archive/<into>/.inventory.json`, naming the operation id
 *               the fence will take, before the fence is asked for
 *   fence       `maintenance begin`; refused or unanswered, nothing moves
 *   recheck     the store read again under the fence: the survey's
 *               candidates are resolved and held afresh, and `store=` says
 *               whether any revision moved since the survey. A unit held now
 *               is not moved, whatever the survey said
 *   final       the kept units with every file's sha256; a unit whose
 *               destination stands is refused (`collision`)
 *   moves       unit by unit, the inventory rewritten after each
 *   verify      every moved file absent at its source and at its destination
 *               with its hash, the store reading again with no unreadable
 *               record, and no reference left unresolved that resolved under
 *               the fence (`baseline`)
 *   end         `maintenance end` naming the fence
 *
 * Verification is the host's own because the codec cannot see two of the
 * three ways a move goes half-wrong: a control file moved without its
 * narrative, and a container moved without its evidence group, both leave
 * `validate` and `reconcile` clean (step 9's recorded failed moves 1 and 3).
 * A failed move or verification puts every moved file back and ends the
 * fence; a restore that cannot finish leaves the store fenced and names it.
 *
 * ## Recovery
 *
 * Maintenance bypasses the codec's record journal: `begin` writes the fence
 * and `end` removes it before its answer is stored, so a crash in that gap
 * leaves a fence state that no replay reports as a success. Recovery therefore
 * reads state and never re-sends: `resume` and `abandon` ask `inspect` for the
 * fence and match it and the files against the durable inventory. Neither
 * sends `begin`, and each sends `end` only to the fence `inspect` names as
 * this inventory's. An answer that did not come is never re-sent within the
 * run; it is exit 7, and the next `resume` reads what landed.
 *
 *   phase survey       nothing had moved. The inventory's fence, if it
 *                      stands, is ended; the inventory is closed
 *   fence standing     every file at its source or its destination with its
 *                      recorded hash finishes the move; anything else is
 *                      put back under the fence, which then ends
 *   no fence standing  every file at its destination with its hash, and the
 *                      store verifying, closes the move; anything else moves
 *                      nothing (exit 5), since files move only under the fence
 *
 * `abandon` ends a fence whose inventory records nothing moved, and refuses
 * once a unit moved.
 *
 * With the inventory lost there is no last resort by hand. A `validate` and a
 * `reconcile` do not show a store whole: two of step 9's three half-moves pass
 * both. Before the fence is removed, a trustworthy inventory is recovered, or
 * a known complete state is restored or verified under it: every pair and
 * evidence group whole, every file at its recorded hash. Where neither can be
 * established, the fence stays and normal work stays blocked.
 *
 * Normal work is gated on the fence itself (Prior's ruling 39(a)). The codec
 * checks it under its lock on every fresh mutation, so `bin/fusion-write`
 * meets `conflict/maintenance-active` however its caller read the store.
 * Only a replay of an operation completed before the fence answers, and it
 * writes nothing. The readers (`lib/record-index.ts`, `bin/fusion-claimed-package`,
 * `bin/fusion-work-order`) keep reading under a fence, as 39(a) permits, and
 * authorise no write; a fence that does not read refuses their `inspect`.
 * Nothing fences a narrative edited outside the codec. The fence is local to
 * one checkout: a checkout that has not pulled the move can still reference
 * an archived record, and only a `reconcile` after the pull reports it
 * (request 39).
 */
import { createHash, randomUUID } from "node:crypto";
import { lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { ask as askCodec } from "./record-client.js";
import { createScanner } from "./citation-scan.js";
import { isObject, resultOf } from "./codec-read.js";
import { bundleMissing, defaultContract, notReadLine, readRecordIndex } from "./record-index.js";
import { CONTAINER_STORE, PACKAGE_CONTROL } from "./stores.js";
const UNIT_KINDS = ["package", "pair", "evidence-group"];
/** The wrapper's exit table, one code per kind. 1 is the wrapper's own: no workbench above the working directory. */
export const EXIT = { done: 0, usage: 2, install: 3, unread: 4, fence: 5, nothing: 6, fenced: 7, restored: 8 };
export const INVENTORY_FORMAT = "fusion.archive-inventory/1";
/** `<stamp>-<slug>`, the archive folder's name as `/fusion:archive` composes it. */
export const INTO = /^[0-9]{6}-[0-9]{4}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const defaultIo = { rename: renameSync };
const resolved = (o) => ({ ask: o.ask ?? askCodec, contract: o.contract ?? defaultContract(), io: o.io ?? defaultIo });
const message = (e) => (e instanceof Error ? e.message : String(e));
const stop = (kind, detail, lines = []) => ({ kind, lines, detail });
// --- the file system, workbench-relative ------------------------------------
const present = (wb, rel) => {
    try {
        lstatSync(join(wb, rel));
        return true;
    }
    catch {
        return false;
    }
};
const isFile = (wb, rel) => {
    try {
        return lstatSync(join(wb, rel)).isFile();
    }
    catch {
        return false;
    }
};
export const sha256 = (wb, rel) => `sha256:${createHash("sha256").update(readFileSync(join(wb, rel))).digest("hex")}`;
const destinationOf = (into, rel) => `archive/${into}/${rel}`;
export const inventoryPath = (into) => `archive/${into}/.inventory.json`;
/** Every regular file below `dir`, sorted, and the first entry that is neither a file nor a directory. */
function walk(wb, dir) {
    const files = [];
    let irregular = null;
    const go = (rel) => {
        for (const name of readdirSync(join(wb, rel)).sort()) {
            const r = `${rel}/${name}`;
            const st = lstatSync(join(wb, r));
            if (st.isDirectory())
                go(r);
            else if (st.isFile())
                files.push(r);
            else
                irregular ??= r;
        }
    };
    go(dir);
    return { files, irregular };
}
/** A candidate line's own fault, or null: it must name a path inside the store, reached through no link. */
function lineFault(wb, line) {
    const segments = line.split("/");
    if (line.startsWith("/") || segments.some((s) => s === "" || s === "." || s === ".."))
        return "is no workbench-relative path";
    if (segments[0] === "archive")
        return "is under archive/ already";
    for (let i = 1; i <= segments.length; i++) {
        const prefix = segments.slice(0, i).join("/");
        if (!present(wb, prefix))
            return i === segments.length ? "does not exist" : `does not exist (${prefix})`;
        if (lstatSync(join(wb, prefix)).isSymbolicLink())
            return `is reached through the symbolic link ${prefix}`;
    }
    return null;
}
// --- reading the store --------------------------------------------------------
/** The store through `readRecordIndex`, keeping its `list` and `reconcile` answers; or why it was not read. */
export function readStore(wb, options = {}) {
    const o = resolved(options);
    const seen = new Map();
    const recording = (w, r, opts) => {
        const a = o.ask(w, r, opts);
        seen.set(r.op, a);
        return a;
    };
    const read = readRecordIndex(wb, recording, o.contract);
    if (read.format === "legacy")
        return { stop: stop("unread", `${wb} is legacy (no workbench.json): this helper archives a JSON-controlled workbench only, and nothing was fenced`) };
    if (read.format === "unknown")
        return { stop: stop(bundleMissing(read.unread) ? "install" : "unread", `${notReadLine(read.unread, wb)} Nothing was fenced or moved by this read.`) };
    const result = (op) => {
        const a = seen.get(op);
        return a?.kind === "result" && isObject(a.result) ? a.result : {};
    };
    const id = result("inspect").id;
    const rows = result("list").records;
    const refs = result("reconcile").references;
    if (typeof id !== "string" || !Array.isArray(rows) || !Array.isArray(refs))
        return { stop: stop("unread", "the codec's inspect, list or reconcile answer carries no id, records or references this helper reads") };
    const lines = rows.filter(isObject).map((r) => `${String(r.path)}\t${String(r.revision)}\n`).sort();
    const digest = `sha256:${createHash("sha256").update(lines.join("")).digest("hex")}`;
    const references = refs.filter(isObject).map((r) => ({ path: String(r.path), at: String(r.at), status: String(r.status), ...(typeof r.target === "string" && { target: r.target }) }));
    return { store: { id, index: read.index, digest, references } };
}
/** The value at an RFC 6901 pointer, or undefined. */
function pointed(value, pointer) {
    let v = value;
    for (const token of pointer.split("/").slice(1).map((t) => t.replace(/~1/g, "/").replace(/~0/g, "~"))) {
        if (Array.isArray(v))
            v = v[Number(token)];
        else if (isObject(v))
            v = v[token];
        else
            return undefined;
    }
    return v;
}
/** What one entry binds: a path or a record id per the header's table; an entry whose source does not show is an error. */
function targetsOf(wb, ask, shown) {
    return (ref) => {
        if (ref.status === "resolved")
            return ref.target === undefined ? [] : [{ path: ref.target }];
        if (ref.status === "unchecked")
            return [];
        if (!shown.has(ref.path)) {
            const s = resultOf(wb, { op: "show", record: { path: ref.path } }, ask);
            if ("unread" in s)
                throw new Error(`show of ${ref.path}, whose ${ref.at} does not resolve, was not answered (${JSON.stringify(s.unread)})`);
            shown.set(ref.path, s.result.control);
        }
        const value = pointed(shown.get(ref.path), ref.at);
        if (isObject(value) && typeof value.record_id === "string")
            return [{ id: value.record_id }];
        if (isObject(value) && typeof value.path === "string")
            return [{ path: value.path }];
        return [];
    };
}
/** The workbench path a `store-prefixed` token names, read from the narrative citing it. One under `archive/` or outside the workbench matches no unit. */
function citedPath(token, from) {
    const [, hops, rooted, rest] = /^((?:\.{1,2}\/)*)(fusion-workbench\/)?(.*)$/.exec(token);
    const p = (rooted === undefined && hops !== "" ? posix.join(posix.dirname(from), hops + rest) : rest).replace(/\/+$/, "");
    return /^[0-9]{6}-[0-9]{4}-/.test(p) ? `${CONTAINER_STORE}/${p}` : p; // the bare container directory, `<dir>/<store>/…`
}
/** Every full-path citation in a remaining record's narrative: the header's prose paragraph. Throws on a narrative that does not read. */
function proseCitations(wb, store) {
    const scanner = createScanner(wb);
    if (!scanner.present)
        throw new Error(`${wb} carries no .fusion-setup, so no citation in its narratives can be read`);
    const out = [];
    for (const { narrative: from } of store.index.byControl.values()) {
        if (from === null)
            continue;
        const lines = readFileSync(join(wb, from), "utf-8").split("\n").map((text, i) => ({ line: i + 1, text }));
        for (const hit of scanner.scanCitationTokens(from, lines).filter((h) => h.status === "store-prefixed")) {
            const path = citedPath(hit.token, from);
            const found = scanner.scanCitationTokens(from, [{ line: 1, text: posix.basename(path) }]).flatMap((h) => h.matches);
            out.push({ from, line: hit.line, path, reaches: [path, ...found.filter((m) => posix.dirname(m) === posix.dirname(path))] });
        }
    }
    return out;
}
// --- units and holds ---------------------------------------------------------
const contains = (u, path) => (u.kind === "package" ? path === u.source || path.startsWith(`${u.source}/`) : u.files.includes(path));
/** The candidate lines as units, each named once, and the lines that name none. */
export function unitsOf(wb, lines, store, ask) {
    const { index } = store;
    const live = (paths) => {
        const e = paths.map((p) => index.byControl.get(p)).find((x) => x !== undefined && x.live);
        return e === undefined ? null : { why: "live", path: e.control, at: "-", target: e.status ?? "-" };
    };
    // A report and its evidence records, read off `/report`; an entry that does not resolve names its path at its pointer.
    const reportOf = new Map();
    const target = targetsOf(wb, ask, new Map());
    for (const r of store.references) {
        if (r.at !== "/report" || index.byControl.get(r.path)?.kind !== "evidence")
            continue;
        const t = target(r).find((x) => "path" in x);
        if (t !== undefined)
            reportOf.set(r.path, t.path);
    }
    const groupOf = (report) => {
        const evidence = [...reportOf].filter(([, rep]) => rep === report).map(([ev]) => ev).sort();
        return { kind: "evidence-group", source: report, files: [report, ...evidence].sort(), ids: evidence.map((e) => index.byControl.get(e).id), barred: null };
    };
    const units = new Map();
    const refused = [];
    for (const raw of lines) {
        const line = raw.replace(/\/+$/, "");
        const fault = lineFault(wb, line);
        if (fault !== null) {
            refused.push({ line: raw, reason: fault });
            continue;
        }
        const segments = line.split("/");
        let unit = null;
        if (segments[0] === CONTAINER_STORE && segments.length === 2 && index.byControl.has(`${line}/${PACKAGE_CONTROL}`)) {
            const { files, irregular } = walk(wb, line);
            const records = [...index.byControl.values()].filter((e) => e.control.startsWith(`${line}/`));
            unit = { kind: "package", source: line, files, ids: records.map((e) => e.id), barred: irregular !== null ? { why: "not-regular", path: irregular, at: "-", target: "-" } : live(records.map((e) => e.control)) };
        }
        else if (segments[0] === CONTAINER_STORE) {
            refused.push({ line: raw, reason: `lies inside the container ${segments.slice(0, 2).join("/")} and moves with it` });
            continue;
        }
        else {
            const entry = index.byControl.get(line) ?? index.byNarrative.get(line);
            if (entry?.kind === "evidence")
                unit = reportOf.has(entry.control) ? groupOf(reportOf.get(entry.control)) : null;
            else if (entry !== undefined && entry.narrative !== null)
                unit = { kind: "pair", source: entry.control, files: [entry.control, entry.narrative].sort(), ids: [entry.id], barred: live([entry.control]) };
            else if ([...reportOf.values()].includes(line))
                unit = groupOf(line);
            if (unit === null) {
                refused.push({ line: raw, reason: "names no record, container or evidence group; a file without a record is not this helper's" });
                continue;
            }
        }
        units.set(unit.source, unit);
    }
    return { units: [...units.values()], refused };
}
/** Which units stay, and why: the header's `## Holds, to a fixed point`. */
export function holdsOf(wb, units, store, ask) {
    const held = new Map();
    const bad = store.index.unreadable[0];
    for (const u of units) {
        if (bad !== undefined)
            held.set(u.source, { why: "unreadable", path: bad.path, at: "-", target: `${bad.problem.class}/${bad.problem.reason}` });
        else if (u.barred !== null)
            held.set(u.source, u.barred);
    }
    const target = targetsOf(wb, ask, new Map());
    const cited = proseCitations(wb, store);
    for (;;) {
        const moving = units.filter((u) => !held.has(u.source));
        let grew = false;
        const hold = (u, why) => {
            if (held.has(u.source))
                return;
            held.set(u.source, why);
            grew = true;
        };
        for (const ref of store.references) {
            if (moving.some((u) => contains(u, ref.path)))
                continue;
            for (const t of target(ref)) {
                for (const u of moving.filter((m) => ("id" in t ? m.ids.includes(t.id) : contains(m, t.path))))
                    hold(u, { why: "binding", path: ref.path, at: ref.at, target: "id" in t ? t.id : t.path });
            }
        }
        for (const c of cited.filter((x) => !moving.some((u) => contains(u, x.from)))) {
            for (const u of moving.filter((m) => c.reaches.some((p) => contains(m, p))))
                hold(u, { why: "citation", path: c.from, at: `line ${c.line}`, target: c.path });
        }
        if (!grew)
            return held;
    }
}
export const heldLine = (u, w) => `held=${u.kind}\t${u.source}\t${w.why}\t${w.path}\t${w.at}\t${w.target}`;
const refusedLines = (r) => r.map((x) => `refused=${x.line}\t${x.reason}`);
/** `survey --candidates`: every candidate line as a unit, `candidate=` or `held=`, over one read of the store. */
export function survey(wb, lines, options = {}) {
    const o = resolved(options);
    const read = readStore(wb, o);
    if ("stop" in read)
        return read;
    try {
        const { units, refused } = unitsOf(wb, lines, read.store, o.ask);
        return { survey: { workbenchId: read.store.id, digest: read.store.digest, units, held: holdsOf(wb, units, read.store, o.ask), refused } };
    }
    catch (e) {
        return { stop: stop("unread", message(e)) };
    }
}
export function surveyOutcome(s) {
    const kept = s.units.filter((u) => !s.held.has(u.source));
    const lines = [`workbench_id=${s.workbenchId}`, `store=${s.digest}`, ...kept.map((u) => `candidate=${u.kind}\t${u.source}`), ...s.units.filter((u) => s.held.has(u.source)).map((u) => heldLine(u, s.held.get(u.source))), ...refusedLines(s.refused)];
    return kept.length > 0 ? { kind: "done", lines } : { kind: "nothing", lines, detail: "no candidate is eligible; every unit above is held or refused" };
}
/** A survey's printed lines read back: the workbench, the store digest and the candidates. */
export function parseSurvey(text) {
    const lines = text.split("\n");
    const value = (key) => lines.find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);
    const workbenchId = value("workbench_id");
    const digest = value("store");
    if (workbenchId === undefined || digest === undefined)
        return { usage: "the survey file carries no workbench_id= or store= line; pass what survey printed" };
    const candidates = [];
    for (const l of lines.filter((x) => x.startsWith("candidate="))) {
        const [kind, source, ...rest] = l.slice("candidate=".length).split("\t");
        if (!UNIT_KINDS.includes(kind) || source === undefined || source === "" || rest.length > 0)
            return { usage: `the survey line ${JSON.stringify(l)} is not one survey prints` };
        candidates.push({ kind: kind, source });
    }
    return { workbenchId, digest, candidates };
}
// --- the inventory -------------------------------------------------------------
export function writeInventory(wb, inv) {
    const path = join(wb, inventoryPath(inv.into));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(`${path}.tmp`, `${JSON.stringify(inv, null, 2)}\n`);
    renameSync(`${path}.tmp`, path);
}
/** An inventory file read and checked, or why it is none this helper wrote. */
export function readInventory(file) {
    let inv;
    try {
        inv = JSON.parse(readFileSync(file, "utf-8"));
    }
    catch (e) {
        return { usage: `the inventory ${file} does not read: ${message(e)}` };
    }
    const rel = (p) => typeof p === "string" && p !== "" && !p.startsWith("/") && !p.split("/").includes("..");
    const ok = isObject(inv) && inv.format === INVENTORY_FORMAT && typeof inv.workbench_id === "string" && typeof inv.fence === "string" && typeof inv.into === "string" && INTO.test(inv.into) &&
        ["survey", "final", "closed"].includes(String(inv.phase)) && Array.isArray(inv.baseline) && inv.baseline.every((b) => typeof b === "string") && Array.isArray(inv.units) &&
        inv.units.every((u) => isObject(u) && UNIT_KINDS.includes(String(u.kind)) && rel(u.source) && rel(u.destination) && u.destination === destinationOf(String(inv.into), u.source) &&
            ["planned", "moved", "restored"].includes(String(u.state)) && Array.isArray(u.files) && u.files.every((f) => isObject(f) && rel(f.path) && typeof f.sha256 === "string"));
    return ok ? { inventory: inv } : { usage: `${file} is not an inventory this helper wrote (${INVENTORY_FORMAT})` };
}
function close(wb, inv, outcome) {
    inv.phase = "closed";
    inv.outcome = outcome;
    writeInventory(wb, inv);
}
// --- the fence -----------------------------------------------------------------
const named = (a) => (a.kind === "refused" ? `${a.class}/${a.reason}${a.detail === undefined ? "" : `: ${a.detail}`}` : a.kind === "unanswered" ? `${a.cause}: ${a.detail}` : "answered");
/** `inspect`'s workbench id and fence, or why they were not read. */
function fenceState(wb, ask) {
    const r = resultOf(wb, { op: "inspect" }, ask);
    if ("unread" in r)
        return { stop: stop(r.unread.cause === "unanswered" && r.unread.how === "bundle-missing" ? "install" : "unread", `inspect was not answered: ${JSON.stringify(r.unread)}`) };
    const m = r.result.maintenance;
    if (r.result.state !== "json-control" || typeof r.result.id !== "string")
        return { stop: stop("unread", `${wb} is not json-control (${JSON.stringify(r.result.state)}), so nothing was fenced or moved`) };
    if (m !== null && !(isObject(m) && typeof m.operation_id === "string"))
        return { stop: stop("unread", "inspect names no maintenance field this helper reads: the codec predates the archive revision") };
    return { id: r.result.id, fence: m === null ? null : m.operation_id };
}
/** `maintenance begin` under the inventory's operation id: null once the fence stands. */
export function beginFence(wb, inv, options = {}) {
    const a = resolved(options).ask(wb, { op: "maintenance", operation_id: inv.fence, action: "begin" });
    if (a.kind === "result")
        return null;
    if (a.kind === "refused")
        return stop("fence", `the fence was refused (${named(a)}); nothing was moved`);
    if (a.cause === "bundle-missing")
        return stop("install", a.detail);
    return stop("fenced", `maintenance begin was not answered (${named(a)}), so the fence may stand`);
}
/** `maintenance end` naming the inventory's fence: null once no fence of it stands. */
function endFence(wb, inv, ask) {
    const a = ask(wb, { op: "maintenance", operation_id: randomUUID(), action: "end", fence: inv.fence });
    return a.kind === "result" || (a.kind === "refused" && a.reason === "maintenance-not-active") ? null : `maintenance end was not answered as ended (${named(a)})`;
}
const fenced = (wb, inv, lines, why) => stop("fenced", `${why}. The store is left fenced: \`bin/fusion-archive resume --inventory ${join(wb, inventoryPath(inv.into))}\` finishes or restores the move, \`abandon\` ends a fence that moved nothing`, [...lines, "result=fenced"]);
// --- moving, verifying, restoring ------------------------------------------------
/** The recheck under the fence: the survey's candidates resolved and held afresh, the kept ones fixed with their hashes. */
export function finalize(wb, inv, surveyDigest, options = {}) {
    const o = resolved(options);
    const read = readStore(wb, o);
    if ("stop" in read)
        return read;
    let units;
    let held;
    let refused;
    try {
        ({ units, refused } = unitsOf(wb, inv.units.map((u) => u.source), read.store, o.ask));
        held = holdsOf(wb, units, read.store, o.ask);
    }
    catch (e) {
        return { stop: stop("unread", message(e)) };
    }
    for (const u of units) {
        const taken = (u.kind === "package" ? [u.source] : u.files).map((f) => destinationOf(inv.into, f)).find((d) => present(wb, d));
        if (!held.has(u.source) && taken !== undefined)
            held.set(u.source, { why: "collision", path: taken, at: "-", target: "-" });
    }
    const kept = units.filter((u) => !held.has(u.source));
    inv.units = kept.map((u) => ({ kind: u.kind, source: u.source, destination: destinationOf(inv.into, u.source), files: u.files.map((f) => ({ path: f, sha256: sha256(wb, f) })), state: "planned" }));
    inv.baseline = read.store.references.filter((r) => r.status !== "resolved" && r.status !== "unchecked").map((r) => `${r.path}\t${r.at}`);
    inv.phase = "final";
    writeInventory(wb, inv);
    return { lines: [`store=${read.store.digest === surveyDigest ? "unchanged" : "changed"}`, ...units.filter((u) => held.has(u.source)).map((u) => heldLine(u, held.get(u.source))), ...refusedLines(refused)] };
}
/** One unit to its destination, the inventory rewritten after it. A file already at its destination stays there. */
export function moveUnit(wb, inv, unit, io = defaultIo) {
    const go = (rel) => {
        if (!present(wb, rel))
            return;
        mkdirSync(dirname(join(wb, destinationOf(inv.into, rel))), { recursive: true });
        io.rename(join(wb, rel), join(wb, destinationOf(inv.into, rel)));
    };
    if (unit.kind === "package")
        go(unit.source);
    else
        unit.files.forEach((f) => go(f.path));
    unit.state = "moved";
    writeInventory(wb, inv);
}
/** Why the moved units are not where the inventory says, or the store does not read clean after them; null when they are and it does. */
export function verifyMove(wb, inv, options = {}) {
    for (const u of inv.units.filter((x) => x.state === "moved")) {
        if (u.kind === "package" && present(wb, u.source))
            return `${u.source} still stands at its source`;
        for (const f of u.files) {
            const d = destinationOf(inv.into, f.path);
            if (present(wb, f.path))
                return `${f.path} is still at its source`;
            if (!isFile(wb, d))
                return `${d} is missing`;
            if (sha256(wb, d) !== f.sha256)
                return `${d} does not hash to ${f.sha256}`;
        }
    }
    const read = readStore(wb, options);
    if ("stop" in read)
        return `the store does not read after the move: ${read.stop.detail}`;
    const bad = read.store.index.unreadable[0];
    if (bad !== undefined)
        return `${bad.path} does not read after the move (${bad.problem.class}/${bad.problem.reason})`;
    const broken = read.store.references.find((r) => r.status !== "resolved" && r.status !== "unchecked" && !inv.baseline.includes(`${r.path}\t${r.at}`));
    return broken === undefined ? null : `${broken.path} ${broken.at} no longer resolves (${broken.status})`;
}
/** Every file of the inventory put back at its source; why not, or null. */
function restoreUnits(wb, inv, io) {
    const back = (rel) => {
        const d = destinationOf(inv.into, rel);
        if (!present(wb, d))
            return null;
        if (present(wb, rel))
            return `${rel} stands at its source and at ${d}`;
        mkdirSync(dirname(join(wb, rel)), { recursive: true });
        io.rename(join(wb, d), join(wb, rel));
        return null;
    };
    try {
        for (const u of [...inv.units].reverse()) {
            const left = u.kind === "package" ? back(u.source) : u.files.map((f) => back(f.path)).find((x) => x !== null) ?? null;
            if (left !== null)
                return left;
            if (u.state === "moved")
                u.state = "restored";
        }
        writeInventory(wb, inv);
    }
    catch (e) {
        return message(e);
    }
    const missing = inv.units.flatMap((u) => u.files).find((f) => !isFile(wb, f.path));
    return missing === undefined ? null : `${missing.path} is not back at its source`;
}
/** A move that failed or did not verify: restore, end the fence, and say which. */
function fallBack(wb, inv, lines, why, o) {
    const left = restoreUnits(wb, inv, o.io);
    if (left !== null)
        return fenced(wb, inv, lines, `${why}; the restore did not finish: ${left}`);
    const ended = endFence(wb, inv, o.ask);
    if (ended !== null)
        return fenced(wb, inv, lines, `${why}; every file is back at its source, and ${ended}`);
    close(wb, inv, "restored");
    return stop("restored", `${why}. Every moved file is back at its source and the fence is ended; nothing was archived`, [...lines, "result=restored"]);
}
/** The planned units moved, verified and the fence ended; any failure falls back. */
function carryOut(wb, inv, lines, o) {
    try {
        for (const u of inv.units.filter((x) => x.state === "planned"))
            moveUnit(wb, inv, u, o.io);
    }
    catch (e) {
        return fallBack(wb, inv, lines, `a move failed: ${message(e)}`, o);
    }
    const bad = verifyMove(wb, inv, o);
    if (bad !== null)
        return fallBack(wb, inv, lines, `verification failed: ${bad}`, o);
    const moved = inv.units.map((u) => `moved=${u.kind}\t${u.source}\t${u.destination}`);
    const ended = endFence(wb, inv, o.ask);
    if (ended !== null)
        return fenced(wb, inv, [...lines, ...moved], `every unit moved and verified, and ${ended}`);
    close(wb, inv, "moved");
    return { kind: "done", lines: [...lines, ...moved, "result=moved"] };
}
// --- the three verbs that write -----------------------------------------------------
/** The inventory written and the fence taken, before anything is rechecked; or why not. */
export function planMove(wb, surveyText, into, options = {}) {
    const o = resolved(options);
    const parsed = parseSurvey(surveyText);
    if ("usage" in parsed)
        return { stop: stop("usage", parsed.usage) };
    if (!INTO.test(into))
        return { stop: stop("usage", `--into takes <YYMMDD-HHMM>-<slug>, not ${JSON.stringify(into)}`) };
    if (present(wb, inventoryPath(into)))
        return { stop: stop("usage", `${inventoryPath(into)} already stands; resume or abandon that move, or name another folder`) };
    if (parsed.candidates.length === 0)
        return { stop: stop("nothing", "the survey names no candidate, so nothing was fenced", ["result=nothing"]) };
    const state = fenceState(wb, o.ask);
    if ("stop" in state)
        return state;
    if (state.id !== parsed.workbenchId)
        return { stop: stop("usage", `the survey is of workbench ${parsed.workbenchId}, and this one is ${state.id}`) };
    const inventory = { format: INVENTORY_FORMAT, workbench_id: state.id, fence: randomUUID(), into, phase: "survey", baseline: [], units: parsed.candidates.map((c) => ({ kind: c.kind, source: c.source, destination: destinationOf(into, c.source), files: [], state: "planned" })) };
    writeInventory(wb, inventory);
    return { inventory, digest: parsed.digest };
}
/** `move --survey --into`: the header's `## The move`, end to end. */
export function move(wb, surveyText, into, options = {}) {
    const o = resolved(options);
    const planned = planMove(wb, surveyText, into, o);
    if ("stop" in planned)
        return planned.stop;
    const inv = planned.inventory;
    const lines = [`inventory=${inventoryPath(into)}`, `fence=${inv.fence}`];
    const refused = beginFence(wb, inv, o);
    if (refused !== null) {
        if (refused.kind === "fenced")
            return fenced(wb, inv, lines, refused.detail);
        close(wb, inv, "fence-refused");
        return { ...refused, lines: [...lines, "result=refused"] };
    }
    const fin = finalize(wb, inv, planned.digest, o);
    if ("stop" in fin) {
        const ended = endFence(wb, inv, o.ask);
        if (ended !== null)
            return fenced(wb, inv, lines, `${fin.stop.detail}; and ${ended}`);
        close(wb, inv, "unread");
        return { ...fin.stop, lines: [...lines, "result=unread"] };
    }
    const all = [...lines, ...fin.lines];
    if (inv.units.length === 0) {
        const ended = endFence(wb, inv, o.ask);
        if (ended !== null)
            return fenced(wb, inv, all, `nothing stayed eligible under the fence, and ${ended}`);
        close(wb, inv, "nothing");
        return stop("nothing", "no candidate stayed eligible under the fence; the fence is ended and nothing moved", [...all, "result=nothing"]);
    }
    return carryOut(wb, inv, all, o);
}
/** Where each file of a final inventory stands: every one at its source or its destination with its hash, or the first that is neither. */
function whereabouts(wb, inv) {
    for (const f of inv.units.flatMap((u) => u.files)) {
        const d = destinationOf(inv.into, f.path);
        const at = [f.path, d].filter((p) => present(wb, p));
        if (at.length !== 1)
            return `${f.path} stands ${at.length === 0 ? "at neither its source nor" : "at its source and at"} ${d}`;
        if (!isFile(wb, at[0]) || sha256(wb, at[0]) !== f.sha256)
            return `${at[0]} does not hash to ${f.sha256}`;
    }
    return null;
}
/** The inventory and the fence it names, read for `resume` and `abandon`. */
function recovering(wb, file, ask) {
    const read = readInventory(file);
    if ("usage" in read)
        return { stop: stop("usage", read.usage) };
    const inv = read.inventory;
    if (inv.phase === "closed")
        return { stop: stop("usage", `the inventory is closed (${inv.outcome ?? "no outcome"}); there is nothing to resume or abandon`) };
    const state = fenceState(wb, ask);
    if ("stop" in state)
        return state;
    if (state.id !== inv.workbench_id)
        return { stop: stop("usage", `the inventory is of workbench ${inv.workbench_id}, and this one is ${state.id}`) };
    if (state.fence !== null && state.fence !== inv.fence)
        return { stop: stop("fence", `the fence standing is ${state.fence}'s, not this inventory's (${inv.fence}); nothing was moved`) };
    return { inv, standing: state.fence !== null };
}
/**
 * `resume --inventory`: the header's `## Recovery` table, matched against what
 * `inspect` names. It sends no `begin`, and `end` only to a fence it saw stand.
 */
export function resume(wb, file, options = {}) {
    const o = resolved(options);
    const r = recovering(wb, file, o.ask);
    if ("stop" in r)
        return r.stop;
    const { inv, standing } = r;
    const lines = [`inventory=${inventoryPath(inv.into)}`, `fence=${inv.fence}`];
    if (inv.phase === "survey") {
        const ended = standing ? endFence(wb, inv, o.ask) : null;
        if (ended !== null)
            return fenced(wb, inv, lines, `nothing had moved, and ${ended}`);
        close(wb, inv, "restored");
        return stop("restored", `the move stopped before its units were fixed, so nothing had moved; ${standing ? "its fence is ended" : "no fence of it stands"}`, [...lines, "result=restored"]);
    }
    const astray = whereabouts(wb, inv);
    if (standing)
        return astray === null ? carryOut(wb, inv, lines, o) : fallBack(wb, inv, lines, `the store does not match the inventory: ${astray}`, o);
    const waiting = inv.units.flatMap((u) => u.files).find((f) => present(wb, f.path));
    inv.units.forEach((u) => (u.state = "moved"));
    const unproven = astray ?? (waiting !== undefined ? `${waiting.path} still waits at its source` : verifyMove(wb, inv, o));
    if (unproven !== null)
        return stop("fence", `no fence of this inventory stands, and ${unproven}. Files move only under the fence and resume takes none, so nothing was moved. The store stands unfenced and does not match the inventory: recover a trustworthy inventory, or restore or verify a complete state under a fence taken by hand`, [...lines, "result=refused"]);
    close(wb, inv, "moved");
    return { kind: "done", lines: [...lines, ...inv.units.map((u) => `moved=${u.kind}\t${u.source}\t${u.destination}`), "result=moved"] };
}
/** `abandon --inventory`: end a fence whose inventory records nothing moved. */
export function abandon(wb, file, options = {}) {
    const o = resolved(options);
    const r = recovering(wb, file, o.ask);
    if ("stop" in r)
        return r.stop;
    const { inv } = r;
    const lines = [`inventory=${inventoryPath(inv.into)}`, `fence=${inv.fence}`];
    const moved = inv.units.find((u) => u.state === "moved" || present(wb, u.destination) || u.files.some((f) => present(wb, destinationOf(inv.into, f.path))));
    if (moved !== undefined)
        return stop("fence", `${moved.source} has moved, so abandon is refused; \`bin/fusion-archive resume\` finishes or restores it`, [...lines, "result=refused"]);
    const ended = r.standing ? endFence(wb, inv, o.ask) : null;
    if (ended !== null)
        return fenced(wb, inv, lines, ended);
    close(wb, inv, "abandoned");
    return { kind: "done", lines: [...lines, "result=abandoned"] };
}
