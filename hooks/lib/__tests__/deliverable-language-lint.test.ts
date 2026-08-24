import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Deliverable-language lint (issue 260811-1732; decision
// `260807-2131_*_which-language-governs-a-customer-deliverable.md`, option 3).
//
// The defect: `agents/editor.md` read a project-wide declaration to decide a
// customer deliverable's language, and a wrong default is not an error but a
// FINISHED document in the wrong language, found by the customer. The fix has
// no default: the dispatch names the language and the editor halts otherwise.
// A fallback can only return by the prompt naming one of the two project
// declarations, so the first case asserts those tokens are absent.
//
// Honestly (rules/critical-stance.md §2, §4): this checks the CONTRACT IS IN
// THE PROMPT and cannot check that a dispatched run halted. What it buys is
// that the contract cannot quietly leave the prompt. A guard, not a fixer.
// ---------------------------------------------------------------------------

const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

const EDITOR = "agents/editor.md";
const CONVENTIONS = "rules/fusion-workbench-conventions.md";

/**
 * The two `CLAUDE.md` declaration tokens. Naming either one inside the editor's
 * prompt is the only shape a project-wide default for a deliverable can take —
 * there is nowhere else a default could be read from. Matched with the asterisks
 * so ordinary prose about "the artifact language" elsewhere is not caught; the
 * bolded form is the declaration itself.
 */
const DECLARATION_TOKENS = ["**Language:**", "**Artifact language:**"];

/** The `## Project language` section of the conventions file. */
function projectLanguageSection(): string {
  const parts = read(CONVENTIONS).split(/^## Project language\s*$/m);
  expect(
    parts.length,
    `${CONVENTIONS}: expected exactly one "## Project language" heading, found ${parts.length - 1}`,
  ).toBe(2);
  return parts[1].split(/^## /m)[0];
}

/** The `## Deliverable language …` section of the editor prompt. */
function deliverableLanguageSection(): string {
  const text = read(EDITOR);
  const parts = text.split(/^## Deliverable language.*$/m);
  expect(
    parts.length,
    `${EDITOR}: expected exactly one "## Deliverable language" section, found ${parts.length - 1}. Two would be two contracts.`,
  ).toBe(2);
  return parts[1].split(/^## /m)[0];
}

describe("the editor's deliverable language has no default", () => {
  it("names neither project declaration anywhere in the prompt", () => {
    const text = read(EDITOR);
    const found = DECLARATION_TOKENS.filter((t) => text.includes(t));
    expect(
      found,
      `${EDITOR} names ${found.join(" and ")}. A deliverable takes its language from the ` +
        `dispatch and from nothing else (decision 260807-2131, option 3). Naming a project ` +
        `declaration here is how a silent fallback gets back in, and a silent fallback ` +
        `produces a finished document in the wrong language instead of a stop.`,
    ).toEqual([]);
  });

  it("carries the contract in one section, with the dispatch as the source", () => {
    const section = deliverableLanguageSection();
    expect(
      /dispatch/i.test(section),
      `${EDITOR} "## Deliverable language" must name the dispatching task as the source`,
    ).toBe(true);
    expect(
      /\bhalt/i.test(section),
      `${EDITOR} "## Deliverable language" must say the agent HALTS when no language is given — ` +
        `the loudness is the substance of the answer, not politeness around it`,
    ).toBe(true);
    expect(
      /no fallback/i.test(section),
      `${EDITOR} "## Deliverable language" must state that no fallback path exists`,
    ).toBe(true);
  });

  it("cites the conventions file rather than restating the boundary", () => {
    // The authoring home rule: agents cite `## Project language`, they do not
    // carry a competing definition of it.
    expect(deliverableLanguageSection()).toContain(
      "rules/fusion-workbench-conventions.md` `## Project language",
    );
  });
});

describe("the conventions file's language split stays four-way", () => {
  it("declares four cases, not three", () => {
    const section = projectLanguageSection();
    expect(
      section,
      `${CONVENTIONS} "## Project language" must say the split is four-way — the ` +
        `customer-deliverable case was added by decision 260807-2131 and a stale count ` +
        `sends a reader looking for a case that is there`,
    ).toContain("exactly one of four cases");
  });

  it("carries the customer-deliverable case with the dispatch as its source", () => {
    const section = projectLanguageSection();
    expect(section).toMatch(/customer deliverable/i);
    expect(
      /the dispatching task names/i.test(section),
      `${CONVENTIONS} "## Project language" must name the dispatching task as the deliverable's source`,
    ).toBe(true);
  });

  it("is cited by content on every shipped surface, never by ordinal", () => {
    // "the fourth case" once resolved silently to the bullet stating the
    // opposite rule (issue 260811-2245). Same-line window around the name.
    const hits: string[] = [];
    for (const rel of ["agents/orchestrator.md", "agents/editor.md", "CLAUDE.md", CONVENTIONS]) {
      read(rel).split("\n").forEach((line, i) => {
        if (/Project language/.test(line) && /\b(first|second|third|fourth|fifth) case\b/i.test(line)) {
          hits.push(`${rel}:${i + 1}`);
        }
      });
    }
    expect(hits, "cite a `## Project language` case by its content, not its position").toEqual([]);
  });

  it("keeps the two persisted cases disjoint by who the file is for", () => {
    // The fourth case is carved out of the persisted-file case. If the carve-out
    // is not stated, a reader lands back in the artifact-language branch — which
    // is exactly the silence the decision was filed against.
    const section = projectLanguageSection();
    expect(section).toContain("for the project's own use");
    expect(section).toContain("for a reader outside the project");
  });
});
