import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { BOUND_AGENTS } from "../events-query.js";

// ---------------------------------------------------------------------------
// The bound-agent set, pinned across the two places it exists.
//
// `bin/fusion-rules` decides which agents are TOLD about a stopping time: its
// `IS_BOUND_AGENT=1` case arm is what emits `rules/bounded-dispatch.md`.
// `BOUND_AGENTS` in `hooks/lib/events-query.ts` decides which agents the
// `dispatches` reading MEASURES. Neither can read the other: the script is
// shell and the module is a pure function that runs no subprocess. So the two
// are separate copies of one set, and this gate is what stops a name being
// added to one side alone — a name in the script but not the constant is an
// agent that is bounded and never measured; the reverse is an agent measured
// against a bound it was never given, which reports `longer` on a dispatch that
// was never asked to stop.
//
// Modelled on `review-coverage-mandate.test.ts`, which pins `REVIEW_SENDERS`
// against the same script's `IS_REVIEWER_AGENT` arm.
//
// WHAT THIS DOES NOT CHECK: that a dispatch actually carried a `**Stop by:**`
// line, or that the agent read it. Nothing here runs at dispatch time.
// ---------------------------------------------------------------------------

const HELPER = join(pluginRoot, "bin", "fusion-rules");
const CONSTANT = "hooks/lib/events-query.ts";

/**
 * The same regex `derivable-enumerations-lint.test.ts` reads every
 * `IS_<X>_AGENT=1` case arm with. One reader of the script's shape, so a
 * reshape fails both gates rather than silently emptying one.
 */
function flagAgents(text: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of text.matchAll(/^\s*([a-z|]+)\)\s*IS_([A-Z_]+)_AGENT=1/gm)) {
    out.set(`IS_${m[2]}_AGENT`, m[1].split("|"));
  }
  return out;
}

describe("the bound-agent set is one set in two places", () => {
  const script = readFileSync(HELPER, "utf-8");
  const derived = flagAgents(script).get("IS_BOUND_AGENT");

  it("the case arm is still readable, so this gate cannot pass by finding nothing", () => {
    expect(
      derived,
      `bin/fusion-rules no longer carries an IS_BOUND_AGENT=1 case arm in the shape this ` +
        "gate and derivable-enumerations-lint both read. Either the emission was removed — " +
        "then remove BOUND_AGENTS and this gate with it — or the script was reshaped and " +
        "both parsers follow.",
    ).toBeDefined();
    expect(derived!.length).toBeGreaterThan(0);
    expect(script).toContain('emit_if_exists "$PLUGIN_RULES_DIR/bounded-dispatch.md"');
  });

  it("bin/fusion-rules and BOUND_AGENTS name exactly the same agents", () => {
    const fromScript = [...derived!].sort();
    const fromModule = [...BOUND_AGENTS].sort();

    const onlyScript = fromScript.filter((a) => !fromModule.includes(a));
    const onlyModule = fromModule.filter((a) => !fromScript.includes(a));

    expect(
      { onlyInScript: onlyScript, onlyInConstant: onlyModule },
      "The bound-agent set has drifted. WHICH SIDE TO CHANGE:\n" +
        `  - a name in onlyInScript is emitted rules/bounded-dispatch.md by bin/fusion-rules ` +
        `but is not measured. Add it to BOUND_AGENTS in ${CONSTANT}, and give it a row in ` +
        "rules/bounded-dispatch.md's unit table, or it is bounded with no unit defined.\n" +
        `  - a name in onlyInConstant is measured by the dispatches reading but is told ` +
        "nothing about a stopping time. Either add it to the IS_BOUND_AGENT case arm in " +
        `bin/fusion-rules, or remove it from BOUND_AGENTS — measuring an unbound agent ` +
        "reports `longer` on a dispatch nobody ever asked to stop.\n" +
        "WHY THE TWO EXIST SEPARATELY: bin/fusion-rules is shell and decides who is told; " +
        `${CONSTANT} is a pure function that runs no subprocess and decides who is read. ` +
        "Neither can query the other, so this gate is the only join between them.",
    ).toEqual({ onlyInScript: [], onlyInConstant: [] });

    expect(fromScript).toEqual(fromModule);
  });

  it("every bound agent has a unit row in rules/bounded-dispatch.md", () => {
    // A name on both sides with no unit defined is bound to a boundary it
    // cannot locate: the rule's table is where `one unit` is said for each.
    const rule = readFileSync(join(pluginRoot, "rules", "bounded-dispatch.md"), "utf-8");
    const missing = [...BOUND_AGENTS].filter((a) => !new RegExp(`\`${a}\``).test(rule));
    expect(
      missing,
      "these bound agents are named by bin/fusion-rules and by BOUND_AGENTS but appear " +
        "nowhere in rules/bounded-dispatch.md, so nothing tells them what one unit is.",
    ).toEqual([]);
  });
});
