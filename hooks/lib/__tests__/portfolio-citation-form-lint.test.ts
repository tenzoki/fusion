import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Portfolio citation-form lint gate.
//
// `portfolio.md` is regenerated in full by playmaker on every run, so the path
// citations inside it are written fresh each time from the examples in
// `agents/playmaker.md`. A citation that spells its target's state marker out
// (`260510-0930_o_token-format.md`) dies at that target's first transition, and
// a hand correction does not survive the next run — the generator writes the
// same form back. The rule and its reasoning are authored once, in
// `rules/circle-records.md` `## Citation form in the portfolio`; this gate holds
// the generating prompt to it, because an example that contradicts a rule is
// what a run actually follows.
//
// Measured cause: five citations in one consuming project's generated portfolio,
// two pointing at nothing on the day of filing and a third two hours later
// (`shared/issues/260810-1730_*_die-erzeugung-von-portfolio-md-…`). The wildcard
// form itself is ratified in `260806-0015_*_zitierform-fuer-workbench-records`.
//
// **The pattern encodes the distinction the rule makes.** It requires a
// `YYMMDD-HHMM` stamp in front of the marker, so it fires only on a *pointer to
// a file* and never on the *naming of a marker* — `_a_ → _t_`, `_t_circle.md`,
// `## Recently closed (_c_ / _b_)` and the marker table all pass untouched.
// Starring those would delete the statement they make, which is the exact
// mistake a broader pattern would provoke on the next correction pass.
//
// **Why the file set is one file.** Elsewhere in the shipped text a stamped
// literal marker is legitimate and is the statement being made:
// `skills/migrate/SKILL.md` demonstrates rewriting a record's path field
// (`shared/planning/260716-1910_p_plan-foo.md`), and
// `rules/decision-record-examples.md` walks the `_o_ → _a_ → _i_` transitions on
// fabricated records. Widening this gate to every prompt would need an
// exemption list to hold those, and an exemption list is how a gate stops
// meaning anything. Dangling and stale citations across the whole shipped
// surface are already `reference-resolution-lint.test.ts`'s job; this gate is
// narrower on purpose — it is about the form a *generator* teaches, not about
// whether a citation resolves today.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------


/** The prompt that generates `portfolio.md`. */
const GATED = "agents/playmaker.md";

const MARKER_LETTERS = "oatcibspd";

// A record filename with the marker spelled out: stamp, then the marker. The
// stamp is what makes this a pointer to a file rather than a marker being named.
const literalCitation = new RegExp(
  String.raw`([0-9]{6}-[0-9]{4})(_[${MARKER_LETTERS}]_)`,
  "g",
);

interface Violation {
  file: string;
  line: number;
  token: string;
  marker: string;
}

/** Every stamped literal-marker citation in `text`. */
function scan(file: string, text: string): Violation[] {
  const out: Violation[] = [];
  text.split("\n").forEach((line, i) => {
    literalCitation.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = literalCitation.exec(line)) !== null) {
      out.push({ file, line: i + 1, token: m[0], marker: m[2] });
    }
  });
  return out;
}

/** An actionable, HYG-NO-SILENT-FAIL message: file, line, token, and the fix. */
function report(violations: Violation[]): string {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  portfolio citation with a written-out marker '${v.token}'\n` +
        `    -> wildcard the marker position ('${v.token.replace(v.marker, "_*_")}').\n` +
        `       playmaker regenerates portfolio.md on every run, so a citation carrying its\n` +
        `       target's current marker dies at that target's first transition, and a hand\n` +
        `       correction is overwritten by the next run. See rules/circle-records.md\n` +
        `       '## Citation form in the portfolio'. A marker being NAMED (_a_ -> _t_,\n` +
        `       _t_circle.md) keeps its letter — this pattern needs a YYMMDD-HHMM stamp in\n` +
        `       front, so it never fires on one.`,
    )
    .join("\n");
}

function gatedText(): string {
  return readFileSync(join(pluginRoot, GATED), "utf-8");
}

describe("portfolio citation-form lint: the generator's examples wildcard the marker", () => {
  it(`${GATED} carries no stamped, written-out marker`, () => {
    const violations = scan(GATED, gatedText());
    expect(
      violations,
      `portfolio path citations must wildcard the marker position:\n${report(violations)}`,
    ).toEqual([]);
  });

  it("the gate has a subject: the prompt still demonstrates a wildcarded citation", () => {
    // Without this, deleting the example would make the gate vacuously green and
    // the next run would invent its own citation form.
    expect(
      /[0-9]{6}-[0-9]{4}_\*_/.test(gatedText()),
      `${GATED} no longer demonstrates a record citation at all. The gate above is now ` +
        `vacuous — restore an example in the wildcard form (YYMMDD-HHMM_*_<slug>.md) or ` +
        `retire this gate deliberately.`,
    ).toBe(true);
  });
});

describe("portfolio citation-form lint: pointers fire, marker namings do not", () => {
  const NAMINGS_THAT_MUST_NOT_FIRE: [string, string][] = [
    ["transition arrow", "on `_a_` → `_t_` the orchestrator writes .active-circle"],
    ["circle record filename", "the record `_t_circle.md` carries the state"],
    ["closed-section heading", "`## Recently closed (_c_ / _b_)` — last 5 closed Circles"],
    ["marker placeholder", "the record is `<circle-dir>/_S_circle.md`"],
    ["marker in a table cell", "| `_b_` | **Bounded Closure** — Directive not reachable |"],
    ["circle directory name", "Circle `260511-1100-rebuild-auth` ranks first"],
    ["bare stamp", "session 260810-1730 produced the finding"],
    ["already wildcarded", "decision `260510-0930_*_token-format.md` cited"],
  ];

  for (const [label, text] of NAMINGS_THAT_MUST_NOT_FIRE) {
    it(`naming a marker is not a citation: ${label}`, () => {
      expect(scan("fixture.md", text)).toEqual([]);
    });
  }

  const POINTERS_THAT_MUST_FIRE: [string, string][] = [
    ["bare record citation", "one open decision `260510-0930_o_token-format.md` cited"],
    ["store-prefixed citation", "see `shared/issues/260810-1730_p_the-defect.md`"],
    ["circle-scoped citation", "`circles/260511-1100-auth/decisions/260510-0930_a_token.md`"],
  ];

  for (const [label, text] of POINTERS_THAT_MUST_FIRE) {
    it(`a pointer with a written-out marker is caught: ${label}`, () => {
      expect(scan("fixture.md", text).length).toBeGreaterThan(0);
    });
  }
});

describe("portfolio citation-form lint: a re-introduced literal marker fails loudly", () => {
  it("catches a marker spliced into a copy of the real prompt, naming file/line/token/fix", () => {
    const original = gatedText().split("\n");
    const injectAt = 7; // 0-based; a body line, not frontmatter
    const copy = [...original];
    copy[injectAt] = "cite the open decision `260510-0930_o_token-format.md` in the rationale";

    const violations = scan(GATED, copy.join("\n"));
    const hit = violations.find((v) => v.line === injectAt + 1);
    expect(hit, "the injected citation must be caught on its own line").toBeDefined();
    expect(hit!.token).toBe("260510-0930_o_");

    const msg = report(violations);
    expect(msg).toContain(`${GATED}:${injectAt + 1}`);
    expect(msg).toContain("260510-0930_*_");
    expect(msg).toContain("rules/circle-records.md");
  });
});
