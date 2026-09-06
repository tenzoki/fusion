/**
 * Citation form, measured at the moment a record lands — the measurement behind
 * issue `260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`.
 *
 * ## The defect this answers
 *
 * The citation form is mandated in `rules/fusion-workbench-conventions.md`,
 * which `bin/fusion-rules` emits to every agent on every dispatch. In one
 * session three different agents — an orchestrator, a coder and an analyst —
 * wrote a record carrying a citation that rule forbids, and every one of them
 * was caught minutes to hours later by a release gate or by the hand-run
 * checker, never at the moment of writing. One left `npm test` red for every
 * agent in the checkout until a human repaired it.
 *
 * The record that filed this is explicit that the rule is not unclear and the
 * writers were not careless: three writers with the text in context violating
 * it in one session is a property of WHERE THE RULE SITS RELATIVE TO THE ACT.
 * So nothing here rewrites the rule, adds a second grammar, or teaches an agent
 * anything it was not already told. It moves the moment.
 *
 * ## The trigger, argued against the three questions `hooks/tracker.ts` asks
 *
 * A `.md` file landing under the workbench, written by a write tool.
 *
 *   1. **The moment its answer changes from "not yet" to "wrong".** Before the
 *      write there is no token to judge. At the write the citation is wrong,
 *      and every later reader of that file — the release gate, the sweep, a
 *      person following the pointer — will read it wrong. There is no
 *      intervening state in which it is correct-for-now, which is what
 *      separates this from an uncovered review range or an unstaged record.
 *   2. **On the commonest path it reports nothing.** Measured over this
 *      repository's own workbench on 2026-09-06, `bin/fusion-citation-check`
 *      reported `edited-violations=0`: no file anybody still edits carries a
 *      violation of any class. The reportable classes below are narrower again.
 *      An ordinary record write is silent, which is the disqualifying test the
 *      family header states.
 *   3. **The condition is read, never predicted.** The hook input names the
 *      path the tool wrote; the file is read back off disk; the grammar in
 *      `lib/citation-scan.ts` decides. Nothing infers from a command's text
 *      what it was about to do.
 *
 * ## One grammar, and this module contains none of it
 *
 * `lib/citation-scan.ts` is the parser `bin/fusion-citation-check`,
 * `bin/fusion-citation-sweep` and both release gates run. A second
 * implementation is the defect this project has removed more than once (see
 * that module's header, and `lib/git.ts`'s). This module calls
 * `createScanner()` and decides three things the scanner deliberately does not:
 * which file, which lines, and which of the scanner's verdicts is worth
 * interrupting a writer for.
 *
 * ## Which verdicts, and the one that is deliberately left out
 *
 * `REPORTED_STATUSES` is `store-prefixed` and `stale-marker`, and NOT
 * `dangling`, which the gate treats as a violation exactly like the other two.
 * The split is by what the verdict is decided FROM:
 *
 *   - `store-prefixed` is settled by the token's own shape, before anything is
 *     looked up (`SHAPE_DECIDED_KINDS` in the scanner). A fixture, a real
 *     pointer and a fabricated name are the same input to it, so it cannot be
 *     wrong about a file this hook has just watched land.
 *   - `stale-marker` is decided by a lookup that FOUND the record under a
 *     different marker. The record exists, the fix is the wildcard, and no
 *     invented name reaches this branch.
 *   - `dangling` is decided by a lookup that found NOTHING, and "nothing on
 *     disk matches" is what a dead pointer, a probe fixture quoted in prose, a
 *     foreign record written without its qualifier and a record somebody is
 *     about to create all produce. Issue
 *     `260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
 *     measured six instances of the fixture case by four writers and states
 *     that no decidable keying property has been proposed for it. Reporting it
 *     here would put that undecidable question in front of a writer at the one
 *     moment they cannot check it, on the record kinds most likely to quote a
 *     fixture — which is the noise this measurement's whole value depends on
 *     not producing (`rules/critical-stance.md` §4).
 *
 * THE COST OF LEAVING IT OUT IS REAL AND IS NOT HIDDEN: a dangling citation
 * still reddens the release gate later, exactly as it did before this module
 * existed. This mechanism does not reach that record's acceptance and does not
 * claim to.
 *
 * ## A statement ABOUT a citation is not a citation
 *
 * `rules/fusion-workbench-conventions.md` `## Marker globs` closes by
 * distinguishing a pointer from a record that talks about one, and the scanner
 * implements that distinction as its exemption chain: a fence, a blockquote, an
 * `e.g.` clause, a footer template, a placeholder, a glob, the `foreign:`
 * qualifier. This module reports only hits whose `reason` is undefined.
 *
 * That is one notch quieter than the gate, on purpose and in one case only.
 * Since 2026-09-05 the scanner judges a shape-decided kind under a
 * resolution-premised exemption anyway and KEEPS the reason, so a retired
 * spelling quoted inside a fence comes back as `store-prefixed` with
 * `reason: "fenced-code"`. The gate reports it; the sweep declines to rewrite
 * it, because rewriting an exhibit deletes the finding it exists to show. A
 * write-time report is addressed to the writer as "respell this", which is the
 * sweep's question rather than the gate's, so it follows the sweep: a hit
 * carrying a reason is somebody's exhibit and this module says nothing about
 * it. The residual is that such a token still reaches the gate unannounced.
 *
 * ## One residual, stated because the gate that would catch it cannot
 *
 * The sentence carries the grammar's own `problem` and `fix` strings verbatim,
 * and the `fix` for both reported verdicts names the fusion decision that
 * settled the citation form — a fusion record stamp, in a sentence handed to a
 * model working in somebody else's project. That is the class issue
 * `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`
 * measured, and `sentence-identifier-containment.test.ts` cannot see it: its
 * relation is `identifiers(sentence) ⊆ identifiers(input)`, the stamp is
 * authored into the hit rather than into the builder, and an identifier that
 * travels inside the input is contained by construction — the latent hole that
 * file's header already names for a report's `why` field, arriving live here.
 *
 * It is carried rather than stripped, on two grounds. The same string already
 * reaches that project's terminal through `bin/fusion-citation-check`, so
 * removing it here would make the hook and the checker disagree about the same
 * hit without removing the stamp from the project. And composing a different
 * fix would be a second statement of what the storeless form is, which is the
 * one thing this module refuses to build.
 *
 * ## What it does not do
 *
 * It never blocks — a PostToolUse hook cannot, and `hooks/guard.ts`'s header
 * records that this project removed every deciding path from its hooks
 * deliberately. It never rewrites a citation: the rewriter is
 * `bin/fusion-citation-sweep`, run by a person. It writes nothing but its own
 * throttle record, and it is anchored at the workbench root rather than at cwd,
 * so it is not stood down in fusion's own repository — which is where the
 * defect was measured.
 */
import { readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { FROZEN_PREFIXES } from "./citation-corpus.js";
import { GATE_KINDS, createScanner } from "./citation-scan.js";
import { isStateObject, loadGuardState, saveGuardState } from "./guard-state-file.js";
import { foldCase } from "./paths.js";
/** The workbench directory name, root-anchored exactly as its siblings read it. */
const WB = "fusion-workbench";
/**
 * The throttle record's file NAME, not its path: `lib/guard-state-file.ts`
 * builds the path under `.guard-state/` and this module does not know how.
 */
const THROTTLE_FILE = "citation-form.json";
/**
 * The verdicts worth interrupting a writer for. The header's own section argues
 * the cut and names what `dangling` costs; this is the operative half.
 */
export const REPORTED_STATUSES = ["store-prefixed", "stale-marker"];
/** How many violation rows the sentence spells before it starts counting. */
const MAX_ROWS = 4;
/* ------------------------------------------------------------------ *
 * Which file — the trigger's first half
 * ------------------------------------------------------------------ */
/**
 * The workbench-relative path of a record this measurement judges, or null.
 *
 * Case-folded for the containment test alone, for the reason
 * `measureReviewCoverageForModel` folds its own: a case-insensitive file system
 * must not decide whether a measurement fires. The returned path is cut from
 * the UNFOLDED input, because it is rendered to a human and used as a scanner
 * key, and neither wants a lower-cased name.
 *
 * The frozen stores are out for `lib/citation-corpus.ts`'s reason, imported
 * rather than restated: an archived record is a frozen copy of what was true
 * when it was swept, and telling a writer to respell a citation inside one is
 * telling them to rewrite history. Nothing else about a path is asked. The
 * marker-less kinds — a history entry, an analysis, a review — are IN, and
 * deliberately so: two of the three instances that filed this defect were a
 * history file and an analysis, and both were caught by the sweep rather than
 * by the gate, whose corpus excludes them.
 */
export function workbenchRecordPath(root, abs) {
    const store = resolve(root, WB);
    const folded = foldCase(abs);
    if (!folded.startsWith(foldCase(store) + sep))
        return null;
    if (!folded.endsWith(".md"))
        return null;
    const rel = relative(store, abs).split(sep).join("/");
    return FROZEN_PREFIXES.some((p) => rel.startsWith(p)) ? null : rel;
}
/* ------------------------------------------------------------------ *
 * Which lines — the trigger's second half
 * ------------------------------------------------------------------ */
/** Every line number in `text`, 1-based. */
function everyLine(text) {
    const out = new Set();
    const n = text.split("\n").length;
    for (let i = 1; i <= n; i++)
        out.add(i);
    return out;
}
/**
 * The lines each fragment occupies, wherever it sits in `text`.
 *
 * An occurrence is found by `indexOf` rather than by trusting an offset the
 * tool payload does not carry, and EVERY occurrence counts: `replace_all` puts
 * the same string in several places and the writer wrote all of them. A
 * fragment that is not found contributes nothing, which is the quiet direction
 * — the file moved between the tool and this hook, and a guess about which
 * lines the writer touched would be worse than silence.
 */
function linesCovering(text, fragments) {
    const starts = [0];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "\n")
            starts.push(i + 1);
    }
    const lineAt = (offset) => {
        let lo = 0;
        let hi = starts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (starts[mid] <= offset)
                lo = mid;
            else
                hi = mid - 1;
        }
        return lo + 1;
    };
    const out = new Set();
    for (const fragment of fragments) {
        if (fragment === "")
            continue; // `indexOf("")` never advances
        let at = text.indexOf(fragment);
        while (at !== -1) {
            const from = lineAt(at);
            const to = lineAt(at + fragment.length - 1);
            for (let line = from; line <= to; line++)
                out.add(line);
            at = text.indexOf(fragment, at + 1);
        }
    }
    return out;
}
/**
 * The lines THIS CALL wrote, or null when the payload names none.
 *
 * Reporting the whole file on every write would report somebody else's
 * violation at this writer's keystroke, and a report that fires for a reason
 * the reader did not cause is one they learn to read past. So the scope is the
 * payload's own text, and the case split is over the four write tools:
 *
 *   - `Write` replaces the file, so every line is this call's. It is taken as
 *     that rather than by locating `content` in the result, which is both
 *     exact and free of a match that could fail on a trailing newline.
 *   - `Edit` and `MultiEdit` name what they inserted, and only those lines are
 *     this call's. The rest of the file may carry a violation somebody else
 *     wrote, which is the gate's business and not this hook's.
 *   - `NotebookEdit` names a notebook, which no branch above reaches: a record
 *     is a `.md` file, and `workbenchRecordPath` has already declined.
 *
 * THE WHOLE FILE IS STILL SCANNED whatever this returns — the caller passes the
 * complete text to the scanner and filters the hits by these lines. Scanning
 * the fragment alone would lose the fence and blockquote context the exemptions
 * are made of, and a token inside a fenced exhibit would be judged as a pointer.
 */
export function writtenLines(toolName, toolInput, text) {
    if (toolName === "Write")
        return everyLine(text);
    const fragments = [];
    if (toolName === "Edit") {
        if (typeof toolInput.new_string === "string")
            fragments.push(toolInput.new_string);
    }
    else if (toolName === "MultiEdit") {
        const edits = toolInput.edits;
        if (Array.isArray(edits)) {
            for (const edit of edits) {
                if (isStateObject(edit) && typeof edit.new_string === "string") {
                    fragments.push(edit.new_string);
                }
            }
        }
    }
    return fragments.length === 0 ? null : linesCovering(text, fragments);
}
const EMPTY = (root, file, why) => ({
    root,
    file,
    why,
    violations: [],
    signature: "",
});
/**
 * Judge one record's citations, scoped to the lines a single write produced.
 *
 * `text` is the file as it now stands and `lines` is what this call wrote; the
 * scanner reads the first and the filter applies the second, for the reason
 * `writtenLines` gives. A `lines` of null is the payload naming nothing this
 * can scope, and the honest answer to that is to say nothing at all.
 */
export function measureCitationForm(root, file, text, lines) {
    if (lines === null)
        return EMPTY(root, file, "the tool payload names no written text to scope the report to");
    const scanner = createScanner(join(root, WB));
    if (!scanner.present)
        return EMPTY(root, file, "no workbench to resolve citations against");
    const hits = scanner.scanCitationTokens(file, text.split("\n").map((line, i) => ({ line: i + 1, text: line })));
    const violations = hits.filter((h) => h.reason === undefined &&
        GATE_KINDS.includes(h.kind) &&
        REPORTED_STATUSES.includes(h.status) &&
        lines.has(h.line));
    const signature = violations.length === 0
        ? ""
        : `${file}|${violations.map((h) => `${h.line}:${h.token}`).join(",")}`;
    return { root, file, why: "", violations, signature };
}
/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
/**
 * The sentence handed back to the model when a record lands carrying a citation
 * in a form the project retired.
 *
 * It names the token, the line and the fix, because the fix is a respelling of
 * a specific string and a writer told only that "a citation is wrong" has to
 * re-derive which one. The scanner already produces both halves; nothing is
 * phrased twice here.
 */
export function citationFormSentence(report) {
    if (report.violations.length === 0)
        return "";
    const shown = report.violations.slice(0, MAX_ROWS);
    const rows = shown
        .map((h) => `${report.file}:${h.line} '${h.token}' — ${h.problem}; ${h.fix}`)
        .join(" ");
    const rest = report.violations.length - shown.length;
    const more = rest > 0 ? ` (${rest} more in the same file)` : "";
    return (`fusion: the record you just wrote carries ${report.violations.length} citation(s) in a form this project retired. ` +
        rows +
        more +
        " Repair them in this file now, while it is the file you are in: the same grammar runs in the release gate and in " +
        "`bin/fusion-citation-check`, where the same token turns the suite red for everyone in the checkout instead of for you. " +
        "The form is stated in `rules/fusion-workbench-conventions.md` `## Marker globs`.");
}
/* ------------------------------------------------------------------ *
 * The throttle
 * ------------------------------------------------------------------ */
/**
 * The throttle record's only field, read as a signature. Total, as
 * `lib/guard-state-file.ts` requires: an absent file, unreadable text, a
 * non-object and a `reported` of the wrong type all read as "never reported",
 * so the next violation speaks rather than being swallowed by a state nobody
 * can parse.
 */
function coerceThrottle(value) {
    if (!isStateObject(value))
        return "";
    return typeof value.reported === "string" ? value.reported : "";
}
/** The signature last reported to the model, or "" when none was. */
export function lastReportedCitationForm(root) {
    return loadGuardState(THROTTLE_FILE, coerceThrottle, root);
}
/** Record the signature just reported. `""` clears it, so a later one speaks. */
export function recordReportedCitationForm(root, signature) {
    saveGuardState(THROTTLE_FILE, { reported: signature }, root);
}
/**
 * Read a record back off disk, or null when it will not open.
 *
 * The tool has already run, so this is what the writer produced. A file that
 * has vanished between the tool and the hook is not a fault to report: the
 * measurement simply has nothing to read.
 */
export function readRecord(abs) {
    try {
        return readFileSync(abs, "utf-8");
    }
    catch {
        return null;
    }
}
