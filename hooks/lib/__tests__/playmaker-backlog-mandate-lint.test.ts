import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Playmaker backlog-mandate lint (Circle 260813-0858-playmaker-maintains-
// backlog-store, plan step 7; binding record
// `260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`,
// option 3).
//
// What the Circle changed: the playmaker gained full maintenance of the shared
// backlog store — autonomous `_o_`/`_p_` renames, plus splitting, merging,
// closing and deferring, each on a confirmation the run holds for that
// operation. The decision took option 3 with its cost stated openly: ONE AGENT
// NOW CARRIES TWO MANDATES THAT DIFFER BY DISPATCH PATH, and that statement has
// to stay true in several places at once. A non-interactive Phase 4 dispatch
// ranks, regenerates the portfolio and renames markers; the four confirm-gated
// operations belong to the interactive path.
//
// This gate is what makes that cost payable. It is not decoration on a finished
// change: the defect this Circle was filed against is one level down from it —
// a prompt whose frontmatter description advertised a capability its own body
// forbade. A reworded description that stops matching the body is the same
// defect one level up.
//
// FIVE CASES, over two surfaces (`agents/playmaker.md`, the conventions file):
//   1. The prompt names `$OUT_BACKLOG` — the mechanical precondition for
//      `bin/fusion-paths playmaker` emitting the write key at all, since the key
//      set is derived by one grep over the consumer's own prompt.
//   2. The frontmatter description and the body's mandate section state the two
//      mandates in the SAME WORDS.
//   3. The retired write prohibition is gone from the prompt, and the detector
//      that says so still fires on the wording it was written against.
//   4. `## Backlog entries` names the playmaker as the writer of `_p_`, and
//      names no other writer for it.
//   5. Non-vacuity: every parser above located what it reads, and rejects a text
//      where its surface has moved.
//
// WHY CASE 5 EXISTS, and it is the whole design of this file. The failure mode
// of a lint like this is passing VACUOUSLY: a case greps for a phrase, the
// phrase is later reworded, the grep finds nothing to contradict, and the suite
// reports safety it never checked. Two properties prevent it here:
//
//   (a) Nothing is compared against a sentence written into this file. The
//       canonical mandate clauses are EXTRACTED from the prompt's own mandate
//       section, structurally — the bolded lead of each bullet — and then
//       required verbatim in the description. Rewording both surfaces together
//       is what a maintainer is supposed to do, and it stays green. Rewording
//       one is the drift, and it fails.
//   (b) Every extractor returns null rather than an empty result, and `must()`
//       turns a null into a failure that names this file and says to update the
//       parser. A rewording that moves a section, drops the bullet form, or
//       renames the heading therefore fails LOUDLY instead of passing by
//       absence. That trade — a lint that must follow phrasing changes — is the
//       same one `derivable-enumerations-lint.test.ts` documents in its header.
//
// Case 3 carries its own mutation proof for the same reason: the detector is run
// over the real pre-change wording before it is run over the shipped prompt, so
// a stale pattern set cannot show itself green on the current text alone.
//
// NOT IN SCOPE, stated so the omission is a decision rather than an oversight:
// the dispatch-parameter contract between `skills/next/SKILL.md` and the
// prompt's `**Confirmed operations:**` block is deliberately unlinted. The
// plan's `## Testing Strategy` gives the reasoning — a drifted parameter name is
// a LOUD failure (the second dispatch performs nothing and the user sees the
// entries unchanged), while a drifted mandate is a SILENT one, and silent is
// what a lint is for.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a prompt or a rule file.
// ---------------------------------------------------------------------------

const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

const PLAYMAKER = "agents/playmaker.md";
const CONVENTIONS = "rules/backlog-entries.md"; // the marker table moved here at decision 260827-1056

/** Fail with a message that names the parser to update, never with `undefined`. */
function must<T>(value: T | null, what: string): T {
  expect(
    value,
    `${what}\n\nThis is playmaker-backlog-mandate-lint.test.ts. A parser here found ` +
      `nothing to check. Do not delete the case: update the parser to follow the ` +
      `rewording, or the gate goes green while checking nothing.`,
  ).not.toBeNull();
  return value as T;
}

// --- parsers ---------------------------------------------------------------

/** The frontmatter `description:` line of an agent prompt. */
function findDescription(prompt: string): string | null {
  const fm = prompt.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) return null;
  const desc = fm[1].match(/^description:[ \t]*(.+)$/m);
  return desc ? desc[1].trim() : null;
}

/** The one `## ` heading of the prompt that names the mandate split. */
function findMandateHeading(prompt: string): string | null {
  const headings = [...prompt.matchAll(/^## (.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((h) => /mandate/i.test(h));
  return headings.length === 1 ? headings[0] : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A `## <heading>` section's text, up to the next `## ` heading. */
function findSection(text: string, heading: string): string | null {
  const parts = text.split(new RegExp(`^## ${escapeRe(heading)}\\s*$`, "m"));
  if (parts.length !== 2) return null;
  return parts[1].split(/^## /m)[0];
}

const WORD_NUMBERS: Record<string, number> = { two: 2, three: 3, four: 4 };

/** The count a heading claims, e.g. "Two mandates, …" -> 2. */
function findClaimedCount(heading: string): number | null {
  const word = heading.match(/^([A-Za-z]+)\b/);
  const n = word ? WORD_NUMBERS[word[1].toLowerCase()] : undefined;
  return n ?? null;
}

/**
 * The mandate clauses, taken from the section's OWN shape rather than from a
 * sentence written into this test: each is the bolded lead of one bullet in the
 * section's prose. Subsections (`### …`) are excluded on purpose — the
 * confirmation-relay subsection lives under this heading and may grow bullets of
 * its own without becoming a third mandate.
 */
function findMandateClauses(section: string): string[] | null {
  const prose = section.split(/^### /m)[0];
  const clauses = [...prose.matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1].trim());
  return clauses.length > 0 ? clauses : null;
}

interface MarkerRow {
  marker: string;
  writer: string;
  gate: string;
}

/** The `| Marker | Written by | Gate |` rows of the conventions' backlog table. */
function findMarkerRows(section: string): MarkerRow[] | null {
  const rows = [...section.matchAll(/^\|\s*`(_[a-z]_)`\s*\|([^|]*)\|([^|]*)\|/gm)].map((m) => ({
    marker: m[1],
    writer: m[2].trim(),
    gate: m[3].trim(),
  }));
  return rows.length > 0 ? rows : null;
}

/**
 * The prohibitions this change retired, each in the wording it actually had in
 * the pre-change `agents/playmaker.md`. The fixture below is that same wording,
 * so a pattern that stops matching cannot pass unnoticed.
 */
const RETIRED: { re: RegExp; where: string }[] = [
  {
    re: /never write or rename a backlog entry/i,
    where: "the write-narrow paragraph's blanket ban on any backlog write",
  },
  {
    re: /you write no entry/i,
    where: 'Step 2b\'s "Consolidation is naming what is there; you write no entry"',
  },
  {
    re: /Never edits[^.]*backlog entries/i,
    where: "the frontmatter description's never-edits list, which used to include backlog entries",
  },
];

function retiredHits(text: string): string[] {
  return RETIRED.filter((r) => r.re.test(text)).map((r) => r.where);
}

/** The three retired sentences as they stood before the change. */
const PRE_CHANGE_FIXTURE = [
  "Never edits plans, queues, decisions, issues, backlog entries, code, or data.",
  "You never rename a Circle's marker, never write or rename a backlog entry, never update `.active-circle`.",
  "Consolidation is **naming what is there**; you write no entry.",
].join("\n");

/** The other writers the conventions' own marker table names. Excluding them
 *  from the `_p_` row is what makes "the playmaker, and only the playmaker"
 *  checkable. */
const OTHER_WRITERS = ["user", "shaper"];

// ---------------------------------------------------------------------------

describe("playmaker backlog mandate lint", () => {
  const prompt = read(PLAYMAKER);
  const conventions = read(CONVENTIONS);

  // --- case 1 ---------------------------------------------------------------

  it("the prompt names $OUT_BACKLOG, which is what makes the resolver emit the write key", () => {
    // `bin/fusion-paths` derives a consumer's key set by one grep over that
    // consumer's own prompt. The playmaker held `SCAN_BACKLOG` and no write key
    // for exactly one reason: this token was absent. The resolver needed no
    // change; the prompt did. `path-literal-lint.test.ts` covers the other half,
    // that the store is never named as a path literal instead.
    expect(
      prompt.includes("$OUT_BACKLOG"),
      `${PLAYMAKER} no longer names $OUT_BACKLOG. bin/fusion-paths derives the key set by ` +
        `grepping this prompt, so without the token the agent is dispatched with no write ` +
        `target into the backlog store and every maintenance operation the prompt describes ` +
        `is unreachable — silently, because the resolver simply omits the key.`,
    ).toBe(true);
  });

  // --- case 2 ---------------------------------------------------------------

  it("the frontmatter description and the mandate section state the two mandates in the same words", () => {
    const heading = must(
      findMandateHeading(prompt),
      `${PLAYMAKER}: no single "## " heading names a mandate.`,
    );
    const description = must(findDescription(prompt), `${PLAYMAKER}: no frontmatter description: line.`);
    const section = must(
      findSection(prompt, heading),
      `${PLAYMAKER}: heading "${heading}" is not a parseable section.`,
    );

    // The description points at the section by its own name, so renaming one
    // forces the other. This half is independent of how the mandates are worded.
    expect(
      description.includes(heading),
      `${PLAYMAKER}'s description does not name the section "${heading}". The description is ` +
        `what a dispatcher reads before choosing this agent; if it stops pointing at the ` +
        `section that states the split, a reader learns the mandate from whichever surface ` +
        `they happened to open.`,
    ).toBe(true);

    // The count is derived from the heading's own claim, never written here.
    const claimed = must(
      findClaimedCount(heading),
      `${PLAYMAKER}: heading "${heading}" no longer opens with a spelled-out count, so the ` +
        `number of mandates cannot be derived from it.`,
    );
    const clauses = must(
      findMandateClauses(section),
      `${PLAYMAKER}: section "${heading}" carries no "- **…**" bullet, so no mandate clause ` +
        `could be extracted. Those bullets ARE the canonical statement — nothing in this ` +
        `test restates them.`,
    );
    expect(
      clauses.length,
      `${PLAYMAKER}: "${heading}" claims ${claimed} mandates but states ${clauses.length}: ` +
        clauses.map((c) => `"${c.slice(0, 60)}…"`).join(", "),
    ).toBe(claimed);
    expect(
      new Set(clauses).size,
      `${PLAYMAKER}: two mandate bullets under "${heading}" state the same clause twice`,
    ).toBe(clauses.length);

    const missing = clauses.filter((c) => !description.includes(c));
    expect(
      missing,
      `${PLAYMAKER}: the frontmatter description does not carry these mandate clauses ` +
        `verbatim from "${heading}":\n` +
        missing.map((c) => `  - ${c}`).join("\n") +
        `\n\nThe two surfaces have drifted. Reword BOTH or neither: a description that ` +
        `advertises a capability the body does not grant, or withholds one the body does, ` +
        `is the exact defect this Circle was filed to fix one level down.`,
    ).toEqual([]);
  });

  // --- case 3 ---------------------------------------------------------------

  it("carries no retired write prohibition, with the detector proven against the wording it had", () => {
    // The mutation proof runs first. Without it, a stale pattern set would show
    // itself green on the current prompt and catch nothing on a revert.
    expect(
      retiredHits(PRE_CHANGE_FIXTURE).sort(),
      "the retired-prohibition patterns no longer match the pre-change wording they were " +
        "written against — they have gone stale, and the corpus assertion below would then " +
        "be checking nothing",
    ).toEqual(RETIRED.map((r) => r.where).sort());

    const hits = retiredHits(prompt);
    expect(
      hits,
      `${PLAYMAKER} states the retired prohibition again at: ${hits.join("; ")}.\n\n` +
        `The playmaker maintains the backlog store: it renames between _o_ and _p_ ` +
        `autonomously and splits, merges, closes and defers under a confirmation it holds. ` +
        `The bound that survives is narrower — it originates no entry — and a blanket ` +
        `"writes no backlog entry" contradicts the mandate section, the frontmatter ` +
        `description and ${CONVENTIONS} "## Backlog entries" at once.`,
    ).toEqual([]);
  });

  // --- case 4 ---------------------------------------------------------------

  it("the conventions name the playmaker as the writer of _p_, and name no other writer for it", () => {
    const section = must(
      findSection(conventions, "Backlog entries"),
      `${CONVENTIONS}: no parseable "## Backlog entries" section.`,
    );
    const rows = must(
      findMarkerRows(section),
      `${CONVENTIONS} "## Backlog entries": the marker table has no parseable rows.`,
    );

    const row = rows.find((r) => r.marker === "_p_");
    expect(
      row,
      `${CONVENTIONS} "## Backlog entries": the marker table has no \`_p_\` row. Rows found: ` +
        rows.map((r) => r.marker).join(", "),
    ).toBeDefined();
    expect(
      /playmaker/i.test(row!.writer),
      `${CONVENTIONS}: the \`_p_\` row's writer is "${row!.writer}" and does not name the ` +
        `playmaker. The recommended marker is the playmaker's own ranking judgement, the one ` +
        `backlog write it performs without a confirmation.`,
    ).toBe(true);

    const intruders = OTHER_WRITERS.filter((w) => new RegExp(w, "i").test(row!.writer));
    expect(
      intruders,
      `${CONVENTIONS}: the \`_p_\` row names ${intruders.join(" and ")} as a writer alongside ` +
        `the playmaker ("${row!.writer}"). Filing is the user's act and promotion is the ` +
        `shaper's; neither writes the recommended marker.`,
    ).toEqual([]);

    // Non-vacuity for the exclusion above: if the table stopped naming the user
    // and the shaper anywhere, "the `_p_` row does not name them" would hold for
    // the wrong reason.
    const allWriters = rows.map((r) => r.writer).join(" ");
    const dead = OTHER_WRITERS.filter((w) => !new RegExp(w, "i").test(allWriters));
    expect(
      dead,
      `${CONVENTIONS} "## Backlog entries": the marker table no longer names ${dead.join(" or ")} ` +
        `as the writer of anything, so excluding that name from the \`_p_\` row proves nothing. ` +
        `Update OTHER_WRITERS in this test to the writer set the table actually uses.`,
    ).toEqual([]);
  });

  // --- case 5 ---------------------------------------------------------------

  it("non-vacuity: every parser locates its surface, and returns null when the surface moves", () => {
    const heading = must(findMandateHeading(prompt), `${PLAYMAKER}: no mandate heading.`);
    const section = must(findSection(prompt, heading), `${PLAYMAKER}: mandate section unparseable.`);
    expect(section.length, `${PLAYMAKER}: "${heading}" is present but empty`).toBeGreaterThan(200);
    must(findDescription(prompt), `${PLAYMAKER}: no frontmatter description.`);
    must(findMandateClauses(section), `${PLAYMAKER}: no mandate clauses under "${heading}".`);
    const backlog = must(
      findSection(conventions, "Backlog entries"),
      `${CONVENTIONS}: no "## Backlog entries" section.`,
    );
    expect(backlog.length, `${CONVENTIONS}: "## Backlog entries" is present but empty`).toBeGreaterThan(200);
    must(findMarkerRows(backlog), `${CONVENTIONS}: no marker table.`);

    // Each line below is a rewording a future edit could plausibly make. Every
    // one must produce a null that `must()` turns into a named failure — the
    // alternative is a case that passes because it found nothing to contradict,
    // which is the thing this file is built not to do.
    expect(
      findMandateHeading(prompt.replace(/^## .*mandate.*$/gim, "## Dispatch behaviour")),
      "a renamed mandate heading must not go unnoticed",
    ).toBeNull();
    expect(
      findMandateHeading(`${prompt}\n## A second mandate section\n`),
      "two headings naming a mandate must not be read as one",
    ).toBeNull();
    expect(
      findSection(prompt, "A heading this prompt does not carry"),
      "a section that is not there must not resolve to text",
    ).toBeNull();
    expect(
      findDescription(prompt.replace(/^description:.*$/m, "summary: …")),
      "a renamed frontmatter key must not read as a description",
    ).toBeNull();
    expect(
      findMandateClauses(section.replace(/^- \*\*/gm, "- ")),
      "unbolded bullets carry no canonical clause and must not silently yield none",
    ).toBeNull();
    expect(
      findClaimedCount("Mandates, by dispatch path"),
      "a heading with no spelled-out count must not resolve to a count",
    ).toBeNull();
    expect(
      findMarkerRows(backlog.replace(/^\|/gm, ":")),
      "a marker table that is no longer a table must not read as zero violations",
    ).toBeNull();
  });
});
