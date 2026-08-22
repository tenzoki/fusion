import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Deliverable-language lint (issue 260811-1732, decision 260811-1732's answer
// `260807-2131_*_which-language-governs-a-customer-deliverable.md`, option 3).
//
// The defect: `agents/editor.md` read the project's chat declaration to decide
// a customer deliverable's language, with the dispatching task as an optional
// override. Under the language boundary as authored, a deliverable is a file
// that persists, so the ARTIFACT declaration governed it — and the editor was
// reading the other line. Either way it had a project-wide default, and a
// project's deliverables are not reliably in one language. What a wrong default
// produces is not an error: it is a FINISHED document in the wrong language,
// found by the customer rather than by a stop.
//
// The fix has no default at all. The dispatching task names the language and
// the editor halts when it does not. The whole value of the answer is that the
// failure is LOUD, so the thing worth pinning is the absence of a fallback —
// and a fallback can only be reintroduced by the prompt naming one of the two
// project declarations as a source. That is a token this prompt can simply not
// contain, which is what the first case below asserts.
//
// What this gate is, honestly (rules/critical-stance.md §2, §4): it checks the
// CONTRACT IS PRESENT IN THE PROMPT and that the two tokens which could
// reintroduce a default are absent from it. It does not and cannot check that a
// dispatched run halted — nothing here executes at dispatch time. A prompt
// instruction is overridable under task pressure; this project has a worked
// case of a "MUST" losing to the urgency of a user request. What the gate buys
// is that the contract cannot quietly leave the prompt, and that a later edit
// cannot restore "or the project's language line" without `npm test` saying so.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
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

  it("keeps the two persisted cases disjoint by who the file is for", () => {
    // The fourth case is carved out of the persisted-file case. If the carve-out
    // is not stated, a reader lands back in the artifact-language branch — which
    // is exactly the silence the decision was filed against.
    const section = projectLanguageSection();
    expect(section).toContain("for the project's own use");
    expect(section).toContain("for a reader outside the project");
  });
});
