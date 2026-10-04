/**
 * The repair of findings before FJ04's migration freezes its plan (step 8 of
 * `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 * A finding of `lib/legacy-import.ts` becomes a proposed edit to the v12
 * Markdown, applied only with the user's consent for that one finding.
 *
 * Optional since step 12d (the ruling of 2026-10-03): the composer derives,
 * carries as unknown or defaults every class this module repairs, so the
 * migration requires none of them. An owner who wants the Markdown corrected
 * first applies one, blocking or reported, and the value is then a recorded
 * one with no `derived` entry. `proposeRepair` takes a finding of any class
 * `REPAIRS` holds, whatever its severity.
 *
 * ## What is proposed, and what is asked
 *
 * `REPAIRS` holds one entry per repairable class; the edit is pure (text in,
 * text out). A repair writes only what the user answers: the actor and person
 * of `**Filed by:**`, an `Answered:` line's section, summary and ruler, a step
 * mark, a document, a role, a Circle's status. `offered` lists values the user may pick, such as
 * `bin/fusion-identity`'s `PERSON=`; an unanswered question refuses the
 * repair rather than taking one. A person answered `""` writes the half
 * absent, which the conventions allow and which is an answer, not a gap.
 * A duplicate step number suffixes the later duplicate with the next free
 * letter and asks, per known citation of that step, which of the two steps it
 * means; each answered with the new id is rewritten in the same edit. Known
 * (C16 of the a1fb17a amendment, fusion's reading): a line of the plan, or of
 * another live narrative that cites the plan through `lib/citation-scan.ts`,
 * naming `step <n>`. A terminal narrative or `archive/` is history and is
 * neither scanned nor edited.
 *
 * A terminal narrative is never edited (`## Terminal states are history`):
 * a missing `**Filed by:**` there is asked all the same, consented and logged,
 * but the actor goes into its control file only (`control_only`), through the
 * composer's `actors` input that `actorsFromLog` builds from the log.
 *
 * Every other blocking class has no repair that avoids guessing and stays
 * blocking until the Markdown is fixed by hand; `legacy-store-name` routes to
 * the store rename.
 *
 * ## Applying one
 *
 * `applyRepair` refuses, writing nothing, without consent, with a question
 * unanswered or an answer outside its form, or when the file's sha256 is no
 * longer the one the proposal was made from. Before the first repair it
 * copies the whole workbench into the session directory, outside the root,
 * and verifies the copy by tree hash. It then writes the edit, re-runs the
 * reader, and restores the file unless that finding is gone. Each applied
 * repair is one line of the session's `repair-log.jsonl`: the finding, the
 * answers, and the file's sha256 before and after, for the frozen plan's
 * repair log.
 */
import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join, relative, resolve } from "node:path";
import { createScanner } from "./citation-scan.js";
import { ACTOR, buildInventory, LEGACY_UNKNOWN, composeProposal, entries, readHead, scanPlan, unfenced } from "./legacy-import.js";
const sha = (b) => "sha256:" + createHash("sha256").update(b).digest("hex");
const MARKS = ["OPEN", "IN PROGRESS", "DONE"];
const person = (offers, key = "person") => ({ key, ask: "The person half, git's `Name <email>`; empty for absent", form: "person", offered: offers.person ? [offers.person] : [] });
const actor = (key = "actor") => ({ key, ask: "An agent name, or `user`", form: "actor" });
const withPerson = (a, actorKey, personKey) => `${a[actorKey]}${a[personKey] ? `, ${a[personKey]}` : ""}`;
/** The index after which a head field goes: the last head line, else the title. */
function headEnd(lines) {
    const all = [...readHead(lines).fields.values()].flat().map((f) => f.line);
    return all.length ? Math.max(...all) : 0;
}
/** Rewrites the first head line `**key:**` through `edit` of its entries; an empty result removes the line. */
function editEntries(lines, key, edit) {
    const at = readHead(lines).fields.get(key)?.[0];
    if (!at)
        throw new Error(`no **${key}:** line`);
    const out = edit(entries(at.value));
    if (out.length)
        lines[at.line] = `**${key}:** ${out.join(", ")}`;
    else
        lines.splice(at.line, 1);
}
function segmentOf(text, f) {
    const v = readHead(text.split("\n")).fields.get("Active spec/plan")?.[0]?.value;
    return v === undefined ? undefined : entries(v).find((e) => e.token === f.detail)?.raw;
}
const TERMINAL_MARK = /^\d{6}-\d{4}_[cdis]_.+\.md$/;
/** A terminal narrative by its name or head: a terminal record marker, a closed Circle head, a done or dropped item record. */
export function isTerminalNarrative(path, text) {
    const base = path.split("/").pop();
    if (TERMINAL_MARK.test(base) || /^_[cbs]_circle\.md$/.test(base))
        return true;
    const item = /^work-packages\/([^/]+)\/([^/]+)\.md$/.exec(path);
    return item !== null && item[1] === item[2] && /^(done|dropped)$/.test(readHead(text.split("\n")).fields.get("Status")?.[0]?.value ?? "");
}
const stepRe = (id) => new RegExp(`\\b([Ss]teps?\\s+)${id}\\b`);
const nextFree = (text, id) => {
    const taken = new Set(scanPlan(text.split("\n")).steps.map((x) => x.id));
    return "bcdefghijklmnopqrstuvwxyz".split("").map((c) => id.replace(/[a-z]$/, "") + c).find((c) => !taken.has(c));
};
/** Live narratives under the record stores, the plan excluded: where an incoming citation may stand. */
function liveNarratives(root, except) {
    const out = [];
    const walk = (rel) => {
        for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
            const r = `${rel}/${e.name}`;
            if (e.isDirectory())
                walk(r);
            else if (e.isFile() && r.endsWith(".md") && r !== except)
                out.push(r);
        }
    };
    for (const top of ["work-packages", "shared"])
        if (existsSync(join(root, top)))
            walk(top);
    return out.sort();
}
/** Every known citation of a plan's duplicated step: the plan's own lines, then other live narratives citing the plan (C16). */
function stepCites(root, text, f) {
    const id = f.detail.slice("step ".length);
    const steps = new Set(scanPlan(text.split("\n")).steps.filter((s) => s.id === id).map((s) => s.line));
    const own = text.split("\n").flatMap((l, i) => (!steps.has(i) && stepRe(id).test(l) ? [{ path: f.path, line: i, text: l }] : []));
    const stamp = f.path.split("/").pop().slice(0, 11);
    const scanner = createScanner(root);
    const incoming = liveNarratives(root, f.path).flatMap((p) => {
        const t = readFileSync(join(root, p), "utf-8");
        if (!t.includes(stamp) || isTerminalNarrative(p, t))
            return [];
        const cites = (l, i) => l.includes(stamp) && stepRe(id).test(l) && scanner.scanCitationTokens(p, [{ line: i + 1, text: l }]).some((h) => h.matches.length === 1 && h.matches[0] === f.path);
        return t.split("\n").flatMap((l, i) => (cites(l, i) ? [{ path: p, line: i, text: l }] : []));
    });
    return [...own, ...incoming];
}
/** The citations answered with the renumbered step, rewritten in `text` of `path`. */
function rewriteCites(text, path, cites, f, a) {
    const id = f.detail.slice("step ".length);
    const lines = text.split("\n");
    cites.forEach((c, i) => {
        const to = a[`cite-${i + 1}`];
        if (c.path === path && to !== id)
            lines[c.line] = lines[c.line].replace(stepRe(id), `$1${to}`);
    });
    return lines.join("\n");
}
const stepLine = (text, f, nth) => {
    const m = /^step (\S+)(?: \[(.+)\])?$/.exec(f.detail);
    return scanPlan(text.split("\n")).steps.filter((s) => m && s.id === m[1] && (m[2] === undefined || s.mark === m[2]))[nth];
};
const filedByRepair = {
    edit: "write `**Filed by:** <actor>, <person>`",
    questions: (_t, _f, offers) => [actor(), person(offers)],
    apply(text, f, a) {
        const lines = text.split("\n");
        const line = `**Filed by:** ${withPerson(a, "actor", "person")}`;
        const open = unfenced(lines);
        const at = lines.findIndex((l, i) => open[i] && /^(?:\*\*)?Filed by:/.test(l));
        if (f.class === "filed-by-unreadable" && at >= 0)
            lines[at] = line;
        else
            lines.splice(headEnd(lines) + 1, 0, line);
        return lines.join("\n");
    },
};
export const REPAIRS = {
    "filed-by-missing": filedByRepair,
    "filed-by-not-owed": filedByRepair,
    "filed-by-unreadable": filedByRepair,
    "answered-without-answer-line": {
        edit: "append an `Answered:` line citing the section that holds the answer",
        questions(text, _f, offers) {
            const lines = text.split("\n");
            const open = unfenced(lines);
            const sections = lines.filter((l, i) => open[i] && /^#{2,6} \S/.test(l));
            if (!sections.length)
                return "the record has no section to cite";
            return [{ key: "section", ask: "Which section holds the answer?", form: "choice", choices: sections }, { key: "summary", ask: "The answer in one line", form: "text" }, actor("ruler"), person(offers, "ruler_person")];
        },
        apply(text, f, a) {
            const name = f.path.split("/").pop().replace(/^(\d{6}-\d{4})_[a-z]_/, "$1_*_");
            return `${text.replace(/\n*$/, "\n")}\n---\nAnswered: \`${name}\` \`${a.section}\` — ${a.summary}; ruled by ${withPerson(a, "ruler", "ruler_person")}\n`;
        },
    },
    "mark-outside-numbered-step": {
        edit: "move the mark to a numbered step line, or remove it",
        questions(text, f) {
            const n = Number(/^line (\d+)$/.exec(f.detail)?.[1]);
            if (!/\[(OPEN|IN PROGRESS|DONE)\]/.test(text.split("\n")[n - 1] ?? ""))
                return `no mark on ${f.detail}`;
            const free = scanPlan(text.split("\n")).steps.filter((s) => s.mark === undefined).map((s) => s.id);
            return [{ key: "action", ask: "Move the mark to a step, or remove it?", form: "choice", choices: free.length ? ["move", "remove"] : ["remove"] }, { key: "step", ask: "Which step takes the mark?", form: "choice", choices: free, when: { key: "action", value: "move" } }];
        },
        apply(text, f, a) {
            const lines = text.split("\n");
            const i = Number(/^line (\d+)$/.exec(f.detail)[1]) - 1;
            const mark = /\[(OPEN|IN PROGRESS|DONE)\]/.exec(lines[i])[0];
            lines[i] = lines[i].replace(new RegExp(`${mark.replace(/[[\]]/g, "\\$&")} ?`), "");
            if (a.action === "move") {
                const t = scanPlan(lines).steps.find((s) => s.id === a.step && s.mark === undefined);
                lines[t.line] = lines[t.line].replace(/^((?:#{2,4}\s+)?\d+[a-z]?\.\s+)/, `$1${mark} `);
            }
            return lines.join("\n");
        },
    },
    "unknown-step-mark": {
        edit: "replace the mark with one of the plan vocabulary's three",
        questions: (text, f) => (stepLine(text, f, 0) ? [{ key: "mark", ask: "Which mark does the step carry?", form: "choice", choices: MARKS }] : `no ${f.detail}`),
        apply(text, f, a) {
            const lines = text.split("\n");
            const s = stepLine(text, f, 0);
            lines[s.line] = lines[s.line].replace(`[${s.mark}]`, `[${a.mark}]`);
            return lines.join("\n");
        },
    },
    "duplicate-step-number": {
        edit: "suffix the later duplicate with the next free letter, and rewrite each citation of the step the owner says means it",
        questions(text, f, _offers, root) {
            const s = stepLine(text, f, 1);
            const next = s && nextFree(text, s.id);
            if (!s || !next)
                return `no second ${f.detail}, or no free suffix`;
            return stepCites(root, text, f).map((c, i) => ({ key: `cite-${i + 1}`, ask: `${c.path} line ${c.line + 1}: ${c.text.trim()} -- step ${s.id} or the renumbered ${next}?`, form: "choice", choices: [s.id, next] }));
        },
        cites: (root, text, f) => stepCites(root, text, f),
        listed: (text, f) => [`the later step ${f.detail.slice("step ".length)} becomes ${nextFree(text, f.detail.slice("step ".length)) ?? "?"}`],
        apply(text, f) {
            const lines = text.split("\n");
            const s = stepLine(text, f, 1);
            lines[s.line] = lines[s.line].replace(new RegExp(`^((?:#{2,4}\\s+)?)${s.id}\\.`), `$1${nextFree(text, s.id)}.`);
            return lines.join("\n");
        },
    },
    "unresolvable-active-document": {
        edit: "name the document, or move the binding to `**Cross-references:**`",
        questions: (text, f) => (segmentOf(text, f) === undefined ? `no binding ${f.detail}` : [{ key: "action", ask: "Name the document, or move the binding to the cross-references?", form: "choice", choices: ["rename", "cross-reference"] }, { key: "document", ask: "The document's citation", form: "text", when: { key: "action", value: "rename" } }]),
        apply(text, f, a) {
            const lines = text.split("\n");
            const seg = segmentOf(text, f);
            editEntries(lines, "Active spec/plan", (es) => (a.action === "rename" ? es.map((e) => (e.raw === seg ? e.raw.replace(f.detail, a.document) : e.raw)) : es.filter((e) => e.raw !== seg).map((e) => e.raw)));
            if (a.action !== "rename") {
                if (readHead(lines).fields.has("Cross-references"))
                    editEntries(lines, "Cross-references", (es) => [...es.map((e) => e.raw), seg]);
                else
                    lines.splice(headEnd(lines) + 1, 0, `**Cross-references:** ${seg}`);
            }
            return lines.join("\n");
        },
    },
    "active-document-role-unclear": {
        edit: "state the binding's role in its clause",
        questions: (text, f) => (segmentOf(text, f) === undefined ? `no binding ${f.detail}` : [{ key: "role", ask: "Is the document the spec or the plan?", form: "choice", choices: ["spec", "plan"] }]),
        apply(text, f, a) {
            const lines = text.split("\n");
            editEntries(lines, "Active spec/plan", (es) => es.map((e) => {
                if (e.token !== f.detail)
                    return e.raw;
                if (!e.clause)
                    return `${e.raw} (${a.role})`;
                const both = /\bspec\b/i.test(e.clause) && /\bplan\b/i.test(e.clause);
                return e.raw.replace(`(${e.clause})`, both ? `(${a.role})` : `(${a.role}, ${e.clause})`);
            }));
            return lines.join("\n");
        },
        listed: (text, f) => [`the binding as it stands: ${segmentOf(text, f) ?? f.detail}`],
    },
    "circle-deferred": {
        edit: "write `**Status:** paused` or `dropped` on the Circle head, keeping the old value",
        questions: () => [{ key: "status", ask: "Is the deferred Circle paused or dropped?", form: "choice", choices: ["paused", "dropped"] }],
        apply(text, _f, a) {
            const lines = text.split("\n");
            const at = readHead(lines).fields.get("Status")?.[0];
            if (at)
                lines[at.line] = `**Status:** ${a.status} (was: ${at.value})`;
            else
                lines.splice(headEnd(lines) + 1, 0, `**Status:** ${a.status}`);
            return lines.join("\n");
        },
    },
};
/** Proposes the repair of one finding, reading its file; writes nothing. */
export function proposeRepair(root, finding, offers = {}) {
    const repair = REPAIRS[finding.class];
    if (finding.class === "legacy-store-name")
        return { repairable: false, finding, reason: "rename the v11 store names first: /fusion:migrate" };
    if (!repair)
        return { repairable: false, finding, reason: finding.severity === "blocking" ? "no repair avoids guessing; it stays blocking until the Markdown is fixed by hand" : "a reported finding with no repair; it blocks nothing" };
    const bytes = readFileSync(join(root, finding.path));
    const text = bytes.toString("utf-8");
    if (repair === filedByRepair && isTerminalNarrative(finding.path, text)) {
        const edit = "the actor goes into this terminal record's control file only; its Markdown stays byte-identical";
        return { repairable: true, finding, source_sha256: sha(bytes), edit, questions: [actor(), person(offers)], listed: [], control_only: true, others: [] };
    }
    const questions = repair.questions(text, finding, offers, root);
    if (typeof questions === "string")
        return { repairable: false, finding, reason: questions };
    const others = [...new Set((repair.cites?.(root, text, finding) ?? []).map((c) => c.path).filter((p) => p !== finding.path))].map((p) => ({ path: p, sha256: sha(readFileSync(join(root, p))) }));
    return { repairable: true, finding, source_sha256: sha(bytes), edit: repair.edit, questions, listed: repair.listed?.(text, finding) ?? [], control_only: false, others };
}
/** The first question left unanswered or answered outside its form; null when every asked one is answered. */
export function checkAnswers(questions, answers) {
    for (const q of questions) {
        if (q.when && answers[q.when.key] !== q.when.value)
            continue;
        const v = answers[q.key];
        if (v === undefined)
            return { refusal: "unanswered", detail: q.key };
        // The reserved token says the actor is not known: it answers nothing.
        if (q.form === "actor" && v === LEGACY_UNKNOWN)
            return { refusal: "unanswered", detail: `${q.key}: ${LEGACY_UNKNOWN} names no actor` };
        const ok = q.form === "choice" ? q.choices.includes(v) : q.form === "actor" ? ACTOR.test(v) : !/[\r\n]/.test(v) && (q.form === "person" || v.trim() !== "");
        if (!ok)
            return { refusal: "invalid-answer", detail: `${q.key}: ${JSON.stringify(v)}` };
    }
    return null;
}
/** The workbench's tree hash: every file's path, kind and sha256, and every directory. */
export function treeHash(root) {
    const inv = buildInventory(root);
    return sha([...inv.files.map((f) => `${f.path}\t${f.kind}\t${f.sha256}`), ...inv.dirs.map((d) => `${d}/`)].join("\n"));
}
const BACKUP = "backup";
const BACKUP_HASH = "backup.sha256";
const LOG = "repair-log.jsonl";
export function readRepairLog(session) {
    const p = join(session, LOG);
    return existsSync(p) ? readFileSync(p, "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
}
/** The actors the log supplied to control files only, by narrative, for the composer's `actors`. */
export function actorsFromLog(log) {
    return Object.fromEntries(log.filter((e) => e.control_only).map((e) => [e.finding.path, { actor: e.answers.actor, person: e.answers.person || null }]));
}
/** Copies the workbench into `session/backup/` once, verified by tree hash; a copy that does not verify throws, and nothing is repaired. */
export function ensureBackup(root, session) {
    if (existsSync(join(session, BACKUP_HASH)))
        return;
    mkdirSync(session, { recursive: true });
    cpSync(root, join(session, BACKUP), { recursive: true, verbatimSymlinks: true });
    const [a, b] = [treeHash(root), treeHash(join(session, BACKUP))];
    if (a !== b)
        throw new Error(`the backup does not verify: ${a} != ${b}`);
    writeFileSync(join(session, BACKUP_HASH), `${a}\n`);
}
const count = (root, f, actors = {}) => {
    let n = 0;
    // Only the findings are read, and no finding depends on the person git names, so no git pass runs here.
    return composeProposal({ root, inventory: buildInventory(root), migrationId: "repair-check", newId: () => String(n++), actors, firstAdd: () => ({ unknown: "no-repository" }) }).findings.filter((x) => x.class === f.class && x.path === f.path && x.detail === f.detail).length;
};
/** Applies one consented repair. Without consent, a full answer or unchanged files it writes nothing at all. */
export function applyRepair(input) {
    const { root, session, proposal, answers } = input;
    if (!proposal.repairable)
        return { applied: false, refusal: "unrepairable", detail: proposal.reason };
    if (input.consent !== true)
        return { applied: false, refusal: "no-consent", detail: proposal.finding.class };
    const missing = checkAnswers(proposal.questions, answers);
    if (missing)
        return { applied: false, ...missing };
    const rel = relative(resolve(root), resolve(session));
    if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)))
        return { applied: false, refusal: "session-inside-root", detail: session };
    const f = proposal.finding;
    const pre = new Map([f.path, ...proposal.others.map((o) => o.path)].map((p) => [p, readFileSync(join(root, p))]));
    for (const { path, sha256 } of [{ path: f.path, sha256: proposal.source_sha256 }, ...proposal.others]) {
        if (sha(pre.get(path)) !== sha256)
            return { applied: false, refusal: "file-changed", detail: `${path} is ${sha(pre.get(path))}, proposed on ${sha256}` };
    }
    const log = readRepairLog(session);
    if (proposal.control_only) {
        const entry = { finding: f, answers: { ...answers }, pre_sha256: sha(pre.get(f.path)), post_sha256: sha(pre.get(f.path)), control_only: true };
        if (count(root, f, actorsFromLog([...log, entry])) >= count(root, f, actorsFromLog(log)))
            return { applied: false, refusal: "not-cleared", detail: `${f.class} ${f.path} ${f.detail}` };
        ensureBackup(root, session);
        appendFileSync(join(session, LOG), `${JSON.stringify(entry)}\n`);
        return { applied: true, entry };
    }
    const out = new Map();
    try {
        const text = pre.get(f.path).toString("utf-8");
        const cites = REPAIRS[f.class].cites?.(root, text, f) ?? [];
        for (const [p, bytes] of pre)
            out.set(p, rewriteCites(p === f.path ? REPAIRS[f.class].apply(text, f, answers) : bytes.toString("utf-8"), p, cites, f, answers));
    }
    catch (e) {
        return { applied: false, refusal: "not-located", detail: e.message };
    }
    const before = count(root, f);
    ensureBackup(root, session);
    for (const [p, t] of out)
        writeFileSync(join(root, p), t);
    if (count(root, f) >= before) {
        for (const [p, bytes] of pre)
            writeFileSync(join(root, p), bytes);
        return { applied: false, refusal: "not-cleared", detail: `${f.class} ${f.path} ${f.detail}` };
    }
    // One line per file the edit changed, the finding's own first: each line's hashes are its path's.
    const entries = [...out].filter(([p, t]) => p === f.path || sha(t) !== sha(pre.get(p))).map(([p, t]) => ({ finding: p === f.path ? f : { ...f, path: p, detail: `${f.detail} of ${f.path}` }, answers: { ...answers }, pre_sha256: sha(pre.get(p)), post_sha256: sha(t) }));
    appendFileSync(join(session, LOG), entries.map((e) => `${JSON.stringify(e)}\n`).join(""));
    return { applied: true, entry: entries[0] };
}
