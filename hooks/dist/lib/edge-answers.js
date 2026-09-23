/**
 * What prior policy-curator runs already asked the user about a work-item edge.
 *
 * `agents/policy-curator.md` `### The suppression read` must not re-propose an edge the
 * user has already answered. The corpus that records those answers is every
 * policy-curator run file in the workbench, and it is large: 975 220 bytes over 15
 * files on fusion's own tree at 2026-09-18, of which exactly ONE carries an edge
 * entry, and each run adds 60 to 170 KB. Pulling that into an agent's context to
 * learn a handful of pairs is the uneconomic charge the ruling on
 * `260918-0712_*_how-does-the-curators-edge-survey-know-not-to-re-propose-an-edge-the-user-declined.md`
 * paid for separately; this module is where it was paid.
 *
 * ## What a row carries, and what it deliberately does not
 *
 * One row per (dependent, target, field) — the outcome value and the pair, and
 * no third thing beyond the field. The field is load-bearing rather than
 * decoration: `**Depends-on:**` and `**Cross-references:**` are two consequence
 * groups a user approves separately, so the same pair can be answered in one and
 * unanswered in the other, and a row without it would suppress an ordering edge
 * on the strength of an answer about a citation.
 *
 * The entry's **consequence group is not a column**, and that absence is the
 * ruling. The suppression key reads the outcome value alone: `not-offered` names
 * the entry the gate never put, so nothing has to be learned by holding the group
 * line beside the outcome line. What decides on each value is
 * `agents/policy-curator.md` `### The suppression read` and nothing here — this module
 * reports a fact and applies no key, the stdout-verdict stance every other
 * reporting helper in `bin/` carries.
 *
 * ## The corpus is every run file, with nothing excluded
 *
 * Not bounded by the evidence anchor, not resolved through `$SCAN_ANALYSES`, and
 * `archive/` is read like the live tree. All three follow from the same fact: a
 * run file records a refusal whatever its age, whichever item was claimed when it
 * was written, and whether or not its container has since been archived. A bound
 * that loses a refusal loses it silently, which is the failure the mechanism
 * exists to prevent.
 *
 * ## The outcome parse, stated because it is a heuristic over free prose
 *
 * The Outcomes section has no fixed shape in the corpus — tables of three, four
 * and five columns, bullet lists and prose paragraphs all appear. The rule is
 * narrow on purpose:
 *
 *   - The section is a heading whose text is `Outcomes`, optionally numbered.
 *   - Inside it, only a ROW line counts: one where the entry id stands first,
 *     after at most a list bullet or table pipe. A prose sentence mentioning the
 *     id is not an outcome statement and is never read as one — "a
 *     hand-transcription of L02 failed its own staleness check" sits in a real
 *     run file and would otherwise report L02 as `failed`.
 *   - On the first such row, the first vocabulary word standing after the id is
 *     the outcome.
 *   - An id with no row at all is `none`; an id whose row carries no vocabulary
 *     word is `unreadable`. An id written only inside a range (`L01–L12`) has no
 *     row of its own and so reads `none`.
 *
 * `none` and `unreadable` both mean "no answer was read", and
 * `### The suppression read` re-proposes on both. The parse therefore fails
 * toward re-asking, which is the harmless direction the 2026-09-11 record
 * preferred and the ruling kept.
 *
 * ## Most recent wins
 *
 * Where two run files carry an entry for the same pair and field, the row takes
 * the outcome of the later file — run files are named `YYMMDD-HHMM-curator-run.md`
 * and that name is their order. A later answer is the user answering again, and
 * an earlier one it contradicts is superseded rather than combined.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
/** The outcome vocabulary, authored in `agents/policy-curator.md` `## The run file`. */
export const OUTCOMES = ["applied", "skipped", "not-offered", "stale", "failed"];
/** `YYMMDD-HHMM-curator-run.md`, and nothing else — a defect record whose slug
 *  merely contains the words is not a run file. */
export function isRunFile(base) {
    return /^\d{6}-\d{4}-curator-run\.md$/.test(base);
}
/** Every policy-curator run file under the workbench, in name order, which is time order. */
export function runFiles(root) {
    const wb = join(root, "fusion-workbench");
    const found = [];
    const walk = (dir) => {
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return; // unreadable directory: nothing to read, nothing to claim
        }
        for (const e of entries) {
            const abs = join(dir, e.name);
            if (e.isDirectory())
                walk(abs);
            else if (e.isFile() && isRunFile(e.name))
                found.push(abs);
        }
    };
    try {
        if (statSync(wb).isDirectory())
            walk(wb);
    }
    catch {
        return [];
    }
    // By basename, so two stores interleave by run time rather than by store name.
    return found.sort((a, b) => {
        const ab = a.slice(a.lastIndexOf("/") + 1);
        const bb = b.slice(b.lastIndexOf("/") + 1);
        return ab.localeCompare(bb) || a.localeCompare(b);
    });
}
const BASENAME = /[0-9A-Za-z][-0-9A-Za-z_.]*\.md/g;
/** The two endpoints and the field off one `- **Edge:**` line, or null if the
 *  line does not carry both endpoints. Tolerant of the `(named | hop |
 *  container)` qualifiers the schema allows and the first run file omits. */
export function parseEdgeLine(line) {
    const body = line.replace(/^\s*-\s*\*\*Edge:\*\*\s*/, "");
    const arrow = body.indexOf("->");
    if (arrow === -1)
        return null;
    const left = [...body.slice(0, arrow).matchAll(BASENAME)].map((m) => m[0]);
    const right = [...body.slice(arrow + 2).matchAll(BASENAME)].map((m) => m[0]);
    if (left.length === 0 || right.length === 0)
        return null;
    const fieldMatch = /\binto\s+`?\*{0,2}([A-Za-z][A-Za-z-]*)\*{0,2}:?\*{0,2}`?/.exec(body);
    return {
        dependent: left[left.length - 1],
        target: right[0],
        field: fieldMatch ? fieldMatch[1] : "(unstated)",
    };
}
/** The Outcomes section's lines, or an empty array where the file has none. */
function outcomesSection(lines) {
    const start = lines.findIndex((l) => /^(#{2,4})\s+(?:\d+[.)]\s*)?Outcomes\s*$/i.test(l));
    if (start === -1)
        return [];
    const level = /^(#+)/.exec(lines[start])[1].length;
    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
        const h = /^(#+)\s/.exec(lines[i]);
        if (h && h[1].length <= level)
            break;
        out.push(lines[i]);
    }
    return out;
}
/** The answer an Outcomes section records for one entry id. See the header's
 *  `## The outcome parse` for why only a row line counts. */
export function answerFor(section, id) {
    const row = new RegExp(`^\\s*(?:[|*+-]\\s*)?\\**${id}\\**\\s*(?:[|,;—–-]|$)`);
    let sawRow = false;
    for (const line of section) {
        if (!row.test(line))
            continue;
        sawRow = true;
        const after = line.slice(line.indexOf(id) + id.length);
        let best = null;
        for (const value of OUTCOMES) {
            const at = new RegExp(`(?<![A-Za-z-])${value}(?![A-Za-z-])`).exec(after)?.index;
            if (at !== undefined && (best === null || at < best.at))
                best = { at, value };
        }
        if (best !== null)
            return best.value;
    }
    return sawRow ? "unreadable" : "none";
}
/** Every edge entry one run file carries, with the outcome the file records. */
export function readRunFile(path) {
    let lines;
    try {
        lines = readFileSync(path, "utf-8").split("\n");
    }
    catch {
        return []; // an unreadable run file is a file with no answers in it
    }
    const section = outcomesSection(lines);
    const rows = [];
    let id = null;
    for (const line of lines) {
        const heading = /^###\s+(L\d+)\b/.exec(line);
        if (heading) {
            id = heading[1];
            continue;
        }
        if (/^#/.test(line)) {
            id = null;
            continue;
        }
        if (id === null || !/^\s*-\s*\*\*Edge:\*\*/.test(line))
            continue;
        const pair = parseEdgeLine(line);
        if (pair === null)
            continue;
        rows.push({ ...pair, answer: answerFor(section, id) });
        id = null; // one edge line per entry; a second would be a ledger defect
    }
    return rows;
}
/** Walk the workbench's run files and collapse them to one row per pair+field. */
export function computeEdgeAnswers(root) {
    const files = runFiles(root);
    // Insertion order is file order, which is time order, so a later file's entry
    // overwrites an earlier one's and the surviving row is the most recent answer.
    const byPair = new Map();
    let edgeEntries = 0;
    for (const file of files) {
        for (const row of readRunFile(file)) {
            edgeEntries += 1;
            byPair.set(`${row.dependent} ${row.target} ${row.field}`, row);
        }
    }
    const rows = [...byPair.values()].sort((a, b) => a.dependent.localeCompare(b.dependent) ||
        a.target.localeCompare(b.target) ||
        a.field.localeCompare(b.field));
    return {
        runFiles: files.length,
        edgeEntries,
        rows,
        unreadable: rows.filter((r) => r.answer === "unreadable").length,
        verdict: rows.length === 0 ? "empty" : "answers",
    };
}
/** One row: the outcome value, the pair, the field. Four columns, indented in
 *  the shape `bin/fusion-plan-size` and `bin/fusion-work-order` print. */
export function renderAnswerRow(row) {
    return `  ${row.answer.padEnd(12)}${row.dependent} -> ${row.target}  into ${row.field}`;
}
