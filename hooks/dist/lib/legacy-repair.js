/**
 * The repair of blocking findings before FJ04's migration freezes its plan
 * (step 8 of `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 * A blocking finding of `lib/legacy-import.ts` becomes a proposed edit to the
 * v12 Markdown, applied only with the user's consent for that one finding.
 *
 * ## What is proposed, and what is asked
 *
 * `REPAIRS` holds one entry per repairable class; the edit is pure (text in,
 * text out). A value only the user has is a question, never a default (spec
 * section 8.2): the actor and person of `**Filed by:**`, an `Answered:`
 * line's section, summary and ruler, a step mark, a document, a role, a
 * Circle's status. `offered` lists values the user may pick, such as
 * `bin/fusion-identity`'s `PERSON=`; an unanswered question refuses the
 * repair rather than taking one. A person answered `""` writes the half
 * absent, which the conventions allow and which is an answer, not a gap.
 * A duplicate step number is the one edit that asks nothing: the later
 * duplicate takes the next free letter, and the lines citing that step are
 * listed for the user, not edited.
 *
 * Every other blocking class has no repair that avoids guessing and stays
 * blocking; `legacy-store-name` routes to the store rename.
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
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join, relative, resolve } from "node:path";
import { ACTOR, buildInventory, composeProposal, entries, readHead, scanPlan, unfenced } from "./legacy-import.js";
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
        edit: "suffix the later duplicate with the next free letter",
        questions: (text, f) => (stepLine(text, f, 1) ? [] : `no second ${f.detail}`),
        listed(text, f) {
            const id = f.detail.slice("step ".length);
            const skip = stepLine(text, f, 1)?.line;
            return text.split("\n").flatMap((l, i) => (i !== skip && new RegExp(`\\b[Ss]teps?\\s+${id}\\b`).test(l) ? [`line ${i + 1}: ${l.trim()}`] : []));
        },
        apply(text, f) {
            const lines = text.split("\n");
            const s = stepLine(text, f, 1);
            const base = s.id.replace(/[a-z]$/, "");
            const taken = new Set(scanPlan(lines).steps.map((x) => x.id));
            const next = "bcdefghijklmnopqrstuvwxyz".split("").map((c) => base + c).find((c) => !taken.has(c));
            if (!next)
                throw new Error(`no free suffix for step ${s.id}`);
            lines[s.line] = lines[s.line].replace(new RegExp(`^((?:#{2,4}\\s+)?)${s.id}\\.`), `$1${next}.`);
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
    if (finding.severity !== "blocking")
        return { repairable: false, finding, reason: "a reported finding blocks nothing" };
    if (finding.class === "legacy-store-name")
        return { repairable: false, finding, reason: "rename the v11 store names first: /fusion:migrate" };
    if (!repair)
        return { repairable: false, finding, reason: "no repair avoids guessing; it stays blocking until the Markdown is fixed by hand" };
    const bytes = readFileSync(join(root, finding.path));
    const text = bytes.toString("utf-8");
    const questions = repair.questions(text, finding, offers);
    if (typeof questions === "string")
        return { repairable: false, finding, reason: questions };
    return { repairable: true, finding, source_sha256: sha(bytes), edit: repair.edit, questions, listed: repair.listed?.(text, finding) ?? [] };
}
/** The first question left unanswered or answered outside its form; null when every asked one is answered. */
export function checkAnswers(questions, answers) {
    for (const q of questions) {
        if (q.when && answers[q.when.key] !== q.when.value)
            continue;
        const v = answers[q.key];
        if (v === undefined)
            return { refusal: "unanswered", detail: q.key };
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
/** Copies the workbench into `session/backup/` once, verified by tree hash. */
function ensureBackup(root, session) {
    if (existsSync(join(session, BACKUP_HASH)))
        return;
    mkdirSync(session, { recursive: true });
    cpSync(root, join(session, BACKUP), { recursive: true, verbatimSymlinks: true });
    const [a, b] = [treeHash(root), treeHash(join(session, BACKUP))];
    if (a !== b)
        throw new Error(`the backup does not verify: ${a} != ${b}`);
    writeFileSync(join(session, BACKUP_HASH), `${a}\n`);
}
const count = (root, f) => {
    let n = 0;
    return composeProposal({ root, inventory: buildInventory(root), migrationId: "repair-check", newId: () => String(n++) }).findings.filter((x) => x.class === f.class && x.path === f.path && x.detail === f.detail).length;
};
/** Applies one consented repair. Without consent, a full answer or an unchanged file it writes nothing at all. */
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
    const path = join(root, f.path);
    const pre = readFileSync(path);
    if (sha(pre) !== proposal.source_sha256)
        return { applied: false, refusal: "file-changed", detail: `${f.path} is ${sha(pre)}, proposed on ${proposal.source_sha256}` };
    let out;
    try {
        out = REPAIRS[f.class].apply(pre.toString("utf-8"), f, answers);
    }
    catch (e) {
        return { applied: false, refusal: "not-located", detail: e.message };
    }
    const before = count(root, f);
    ensureBackup(root, session);
    writeFileSync(path, out);
    if (count(root, f) >= before) {
        writeFileSync(path, pre);
        return { applied: false, refusal: "not-cleared", detail: `${f.class} ${f.path} ${f.detail}` };
    }
    const entry = { finding: f, answers: { ...answers }, pre_sha256: sha(pre), post_sha256: sha(out) };
    appendFileSync(join(session, LOG), `${JSON.stringify(entry)}\n`);
    return { applied: true, entry };
}
