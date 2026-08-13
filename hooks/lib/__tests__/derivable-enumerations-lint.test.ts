import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Derivable-enumerations lint gate (Circle 260805-2005-textschicht-gegen-code-
// nachziehen, plan step 15).
//
// The shipped documentation carries several enumerations whose ground truth is
// the tree itself — the skill roster, the agent count, the always-on rule
// list, the conditional emission sets, the hooks/lib file table, the stash
// manifest's field count, and the path-literal lint's DEFINITION_SITES echo in
// CLAUDE.md. Each went stale at least once (the review measured a skill list
// missing `seed-from-plane`, a lib table missing three modules, "nine fields"
// against a ten-key schema). This gate re-derives each enumeration from the
// tree and diffs it against the documented claim.
//
// THE BOUNDARY, stated plainly (the plan warns against overreach): only
// enumerations that are MECHANICALLY derivable are checked. Deliberately out
// of scope, and why:
//   - prose lists with no parseable shape (the "Conditional:" bullet names its
//     agent sets in running text; the check below asserts co-mention on one
//     line, not full set equality — a doc naming EXTRA agents next to a rule
//     file is not caught);
//   - spelled-out word counts in code comments ("the other thirteen read the
//     core half" in bin/fusion-rules) — pairing each word-number with the set
//     it derives from needs context a regex does not have; digit claims only;
//   - open-set surfaces: README.md names *some* skills in prose and never
//     claims completeness, so it gets the dangling-token check (every named
//     skill exists) but no completeness check.
//
// The documented-claim parsers are anchored to the current phrasing of the
// surfaces. If a surface is reworded, the parser finds nothing and the
// non-vacuity assertion fails loudly — the fix is to update the parser, not a
// silent pass. That trade (a lint that must follow phrasing changes) is what
// keeps the checks honest.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a document.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

// --- derived ground truth ---------------------------------------------------

/** Every skill: a directory under skills/ that carries a SKILL.md. */
function skillDirs(): string[] {
  return readdirSync(join(pluginRoot, "skills"))
    .filter((d) => existsSync(join(pluginRoot, "skills", d, "SKILL.md")))
    .sort();
}

/** Every agent: agents/<name>.md. */
function agentNames(): string[] {
  return readdirSync(join(pluginRoot, "agents"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

function libFiles(): string[] {
  return readdirSync(join(pluginRoot, "hooks", "lib"))
    .filter((f) => f.endsWith(".ts"))
    .sort();
}

// --- 1. the skill roster ----------------------------------------------------

describe("enumeration lint: the skill roster", () => {
  const dirs = skillDirs();

  /** Every `/fusion:<name>` token in a text. */
  const tokens = (text: string) => [...text.matchAll(/\/fusion:([a-z-]+)/g)].map((m) => m[1]);

  it("the tree has a plausible number of skills", () => {
    expect(dirs.length).toBeGreaterThan(10);
  });

  function claudeMdDrift(skills: string[], text: string): string[] {
    const mentioned = new Set(tokens(text));
    const problems: string[] = [];
    for (const s of skills) {
      if (!mentioned.has(s)) {
        problems.push(`skills/${s}/ exists but CLAUDE.md never mentions /fusion:${s}`);
      }
    }
    for (const t of mentioned) {
      if (!skills.includes(t)) {
        problems.push(`CLAUDE.md mentions /fusion:${t} but skills/${t}/SKILL.md does not exist`);
      }
    }
    return problems;
  }

  it("CLAUDE.md's skill list covers every skill directory, and cites no phantom skill", () => {
    // CLAUDE.md's own line declares "that listing is the authoritative set" —
    // a closed enumeration, so both directions are checked over the whole file.
    expect(claudeMdDrift(dirs, read("CLAUDE.md"))).toEqual([]);
  });

  it("mutation check: a scratch skill directory would be reported", () => {
    // toContain, not toEqual: with a REAL drift present the corpus test above
    // already fails, and this fixture should not fail a second time over it.
    const drift = claudeMdDrift([...dirs, "scratch-skill"], read("CLAUDE.md"));
    expect(drift).toContain(
      "skills/scratch-skill/ exists but CLAUDE.md never mentions /fusion:scratch-skill",
    );
  });

  it("README-agents' skill table has exactly one row per skill directory", () => {
    const rows = [
      ...read("README-agents.md").matchAll(
        /^\| `\/fusion:([a-z-]+)` \| `skills\/([a-z-]+)\/SKILL\.md` \|/gm,
      ),
    ];
    expect(rows.length, "the table parser found no rows — README-agents' table was reshaped; update the parser").toBeGreaterThan(0);
    const mismatched = rows.filter((m) => m[1] !== m[2]).map((m) => `${m[1]} vs ${m[2]}`);
    expect(mismatched, "a table row's slash command and file column disagree").toEqual([]);
    expect(rows.map((m) => m[1]).sort()).toEqual(dirs);
  });

  it("no shipped doc cites a phantom skill", () => {
    // Open-set direction only: prose may name any subset, but every name must
    // resolve to a real skill.
    const surfaces = ["README.md", "README-agents.md", "README-hooks.md", "CLAUDE.md"];
    for (const f of readdirSync(join(pluginRoot, "docs"))) {
      if (f.endsWith(".md")) surfaces.push(`docs/${f}`);
    }
    const phantom: string[] = [];
    for (const rel of surfaces) {
      for (const t of tokens(read(rel))) {
        if (!dirs.includes(t)) phantom.push(`${rel} cites /fusion:${t}`);
      }
    }
    expect(phantom, "citations of skills that do not exist").toEqual([]);
  });
});

// --- 2. the agent count -----------------------------------------------------

describe("enumeration lint: agent counts stated as closed numbers", () => {
  const n = agentNames().length;

  // The digit-claim patterns the surfaces carry today. `expected` is derived,
  // never written literally, so the check follows the tree when an agent is
  // added or removed.
  const CLAIMS: { rel: string; re: RegExp; expected: number; what: string }[] = [
    { rel: "CLAUDE.md", re: /\b(\d+) specialized agents\b/g, expected: n, what: "specialized-agents count" },
    { rel: "CLAUDE.md", re: /\bThe (\d+) agent prompts\b/g, expected: n, what: "agent-prompts count" },
    { rel: "CLAUDE.md", re: /\bthe other (\d+) inherit\b/g, expected: n - 1, what: "non-orchestrator count" },
    { rel: "README.md", re: /\b(\d+) specialized agents\b/g, expected: n, what: "specialized-agents count" },
    { rel: "README-agents.md", re: /\bof the (\d+) prompts\b/g, expected: n, what: "prompt count" },
  ];

  for (const c of CLAIMS) {
    it(`${c.rel}: every '${c.what}' claim equals the tree (${c.expected})`, () => {
      const hits = [...read(c.rel).matchAll(c.re)];
      expect(
        hits.length,
        `${c.rel} no longer carries a '${c.what}' claim matching ${c.re} — ` +
          `if the phrasing changed, update this parser rather than dropping the check`,
      ).toBeGreaterThan(0);
      for (const h of hits) {
        expect(
          Number(h[1]),
          `${c.rel} claims '${h[0]}' but the tree has ${agentNames().length} agents (${agentNames().join(", ")})`,
        ).toBe(c.expected);
      }
    });
  }
});

// --- 3. the always-on rule list ---------------------------------------------

/** The always-on emissions: UNINDENTED emit_if_exists lines, in order. The
 *  conditional emissions are indented inside their if-blocks, which is what
 *  makes the always-on set parseable without a shell interpreter. */
function alwaysOnList(): string[] {
  return [
    ...read("bin/fusion-rules").matchAll(/^emit_if_exists "\$PLUGIN_RULES_DIR\/([a-z-]+\.md)"$/gm),
  ].map((m) => m[1]);
}

describe("enumeration lint: the always-on rule list", () => {
  const list = alwaysOnList();

  it("the parser sees the block, agent-setup.md first, every file existing", () => {
    expect(list.length, "no unindented emit_if_exists lines found — bin/fusion-rules was reshaped; update the parser").toBeGreaterThan(3);
    expect(list[0], "agent-setup.md must be emitted first (the Setup contract is read before the conventions)").toBe("agent-setup.md");
    const missing = list.filter((f) => !existsSync(join(pluginRoot, "rules", f)));
    expect(missing, "always-on rules that do not exist in rules/").toEqual([]);
  });

  it("README-agents' 'Always-on core' bullet names every file, in emission order", () => {
    const line = read("README-agents.md")
      .split("\n")
      .find((l) => l.includes("Always-on core"));
    expect(line, "README-agents.md no longer has an 'Always-on core' line — update the parser").toBeDefined();
    let at = -1;
    const problems: string[] = [];
    for (const f of list) {
      const idx = line!.indexOf(`\`${f}\``);
      if (idx === -1) problems.push(`${f} is always-on in bin/fusion-rules but missing from the bullet`);
      else if (idx < at) problems.push(`${f} appears out of emission order in the bullet`);
      else at = idx;
    }
    expect(problems, "the Always-on core bullet has drifted from the emit_if_exists block").toEqual([]);
  });
});

// --- 4. the conditional emission sets ---------------------------------------

interface ConditionalEmission {
  file: string; // rule-file basename
  agents: string[]; // derived agent set
  pluginRepoOnly: boolean;
}

/**
 * Derive (rule file -> agent set) from bin/fusion-rules' own shape: each
 * `IS_<X>_AGENT=1` case arm names its agents, and each indented
 * `emit_if_exists` sits inside an `if` naming either a flag or a literal
 * agent. Regex-level shell reading — if the script's shape changes, the
 * non-vacuity assertions below fail and this parser follows.
 */
function conditionalEmissions(): ConditionalEmission[] {
  const text = read("bin/fusion-rules");
  const flagAgents = new Map<string, string[]>();
  for (const m of text.matchAll(/^\s*([a-z|]+)\)\s*IS_([A-Z_]+)_AGENT=1/gm)) {
    flagAgents.set(`IS_${m[2]}_AGENT`, m[1].split("|"));
  }
  const out: ConditionalEmission[] = [];
  let condition: string | null = null;
  for (const line of text.split("\n")) {
    if (/^if /.test(line)) condition = line;
    else if (/^fi\b/.test(line)) condition = null;
    const emit = line.match(/^\s+emit_if_exists "\$PLUGIN_RULES_DIR\/([a-z-]+\.md)"/);
    if (!emit || condition === null) continue;
    const flag = condition.match(/IS_[A-Z_]+_AGENT/)?.[0];
    const literal = condition.match(/"\$AGENT" = "([a-z]+)"/)?.[1];
    const agents = flag ? flagAgents.get(flag) : literal ? [literal] : undefined;
    if (!agents) continue;
    out.push({
      file: emit[1],
      agents,
      pluginRepoOnly: condition.includes("IN_PLUGIN_REPO"),
    });
  }
  return out;
}

describe("enumeration lint: the conditional emission sets", () => {
  const emissions = conditionalEmissions();

  it("the parser sees the conditional blocks, and every derived agent is real", () => {
    expect(
      emissions.length,
      "no conditional emit_if_exists blocks derived — bin/fusion-rules was reshaped; update the parser",
    ).toBeGreaterThan(2);
    const known = new Set(agentNames());
    const phantom = emissions.flatMap((e) => e.agents.filter((a) => !known.has(a)));
    expect(phantom, "derived agent names that are not agents/<name>.md").toEqual([]);
  });

  it("accounts for every emit_if_exists line: an unparseable block fails loudly instead of vanishing", () => {
    // The completeness assertion the header's loud-failure promise needs
    // (issue 260806-1031): conditionalEmissions() drops an emission whose
    // if-condition it cannot classify (`if (!agents) continue`), and
    // alwaysOnList()'s strict regex drops a reshaped line — in both cases the
    // non-vacuity floors (> 2 / > 3) notice only TOTAL parser loss, so a
    // single new block in an unrecognized form went unchecked while the count
    // stayed green. Here a dumb count — every line whose command word is
    // emit_if_exists with a $PLUGIN_RULES_DIR argument, split by indentation —
    // must equal what the two parsers derived, and a shortfall names the
    // unaccounted rule files.
    const text = read("bin/fusion-rules");
    const dumbIndented: string[] = [];
    const dumbUnindented: string[] = [];
    for (const line of text.split("\n")) {
      const m = line.match(/^(\s*)emit_if_exists "\$PLUGIN_RULES_DIR\/([^"]+)"/);
      if (!m) continue;
      (m[1].length > 0 ? dumbIndented : dumbUnindented).push(m[2]);
    }

    const tally = (files: string[]) => {
      const c = new Map<string, number>();
      for (const f of files) c.set(f, (c.get(f) ?? 0) + 1);
      return c;
    };
    const unaccounted = (dumb: string[], parsed: string[]) => {
      const have = tally(parsed);
      const missing: string[] = [];
      for (const [f, n] of tally(dumb)) {
        if ((have.get(f) ?? 0) < n) missing.push(f);
      }
      return missing;
    };

    expect(
      unaccounted(dumbIndented, emissions.map((e) => e.file)),
      "indented emit_if_exists lines that conditionalEmissions() did not derive — " +
        "their if-condition is in a form the parser does not classify " +
        "(compound condition, two literals, a new flag convention); teach the parser " +
        "the new form so these emissions are checked again",
    ).toEqual([]);
    expect(
      unaccounted(dumbUnindented, alwaysOnList()),
      "unindented emit_if_exists lines that alwaysOnList() did not parse — " +
        "the line was reshaped (trailing comment, changed quoting); update the " +
        "alwaysOnList() regex so the README bullet check covers them again",
    ).toEqual([]);
  });

  it("README-agents co-mentions each conditional rule file with its full derived agent set", () => {
    // Co-mention on ONE line is the checkable half (see the boundary note in
    // the header): an agent added to the script's set but absent from the doc
    // line fails here; a doc line naming extra agents does not.
    const lines = read("README-agents.md").split("\n");
    const problems: string[] = [];
    for (const e of emissions) {
      // The file may be spelled bare or as `rules/<file>`; the agent names are
      // required in their backticked form so prose words never satisfy them.
      const line = lines.find((l) => l.includes(e.file) && e.agents.every((a) => l.includes(`\`${a}\``)));
      if (!line) {
        problems.push(
          `no single line in README-agents.md names ${e.file} together with all of: ` +
            e.agents.join(", "),
        );
        continue;
      }
      if (e.pluginRepoOnly && !/own repo only/.test(line)) {
        problems.push(
          `${e.file} is emitted in the plugin's own repo only (the IN_PLUGIN_REPO gate), ` +
            `but the line naming it does not say 'own repo only'`,
        );
      }
    }
    expect(problems, "conditional-emission claims have drifted from bin/fusion-rules").toEqual([]);
  });
});

// --- 5. the README-hooks lib table ------------------------------------------

describe("enumeration lint: the hooks/lib file table in README-hooks.md", () => {
  it("lists exactly the lib/*.ts files that exist", () => {
    const documented = [
      ...read("README-hooks.md").matchAll(/^\| `lib\/([A-Za-z0-9-]+\.ts)` \|/gm),
    ].map((m) => m[1]);
    expect(
      documented.length,
      "no `| `lib/….ts` |` table rows found — README-hooks' files table was reshaped; update the parser",
    ).toBeGreaterThan(0);
    expect([...documented].sort()).toEqual(libFiles());
  });
});

// --- 6. the stash-manifest field count --------------------------------------

const WORD_NUMBERS: Record<string, number> = {
  five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
};

describe("enumeration lint: the stash manifest's field count", () => {
  const rel = "rules/workbench-stash-and-lock.md";
  const text = read(rel);

  /** Top-level keys of the first ```yaml block. */
  function schemaKeys(): string[] {
    const block = text.match(/```yaml\n([\s\S]*?)```/);
    expect(block, `${rel} no longer carries a \`\`\`yaml schema block — update the parser`).not.toBeNull();
    return [...block![1].matchAll(/^([a-z_]+):/gm)].map((m) => m[1]);
  }

  it("both stated counts equal the schema's key count", () => {
    const keys = schemaKeys();
    const claims: { text: string; value: number }[] = [];
    const fieldsLine = text.match(/\b([A-Za-z]+) fields, in this order:/);
    expect(fieldsLine, `${rel} no longer says '<N> fields, in this order:' — update the parser`).not.toBeNull();
    claims.push({ text: fieldsLine![0], value: WORD_NUMBERS[fieldsLine![1].toLowerCase()] });
    const indexComment = text.match(/\b([A-Za-z]+)-field index\b/);
    expect(indexComment, `${rel} no longer says '<N>-field index' — update the parser`).not.toBeNull();
    claims.push({ text: indexComment![0], value: WORD_NUMBERS[indexComment![1].toLowerCase()] });
    for (const c of claims) {
      expect(
        c.value,
        `${rel} claims '${c.text}' but the schema block has ${keys.length} keys: ${keys.join(", ")}`,
      ).toBe(keys.length);
    }
  });
});

// --- 7. DEFINITION_SITES echoed in CLAUDE.md --------------------------------

describe("enumeration lint: CLAUDE.md's echo of the path-literal lint's DEFINITION_SITES", () => {
  it("every declared definition site is named where CLAUDE.md describes the list", () => {
    const src = read("hooks/lib/__tests__/path-literal-lint.test.ts");
    const arr = src.match(/const DEFINITION_SITES = \[([\s\S]*?)\];/);
    expect(arr, "path-literal-lint.test.ts no longer declares DEFINITION_SITES — update both lints").not.toBeNull();
    const sites = [...arr![1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(sites.length).toBeGreaterThan(2);

    const claude = read("CLAUDE.md");
    expect(
      claude.includes("DEFINITION_SITES"),
      "CLAUDE.md no longer mentions DEFINITION_SITES — if the description moved, update this check",
    ).toBe(true);
    const missing = sites.filter((s) => {
      const base = s.split("/").pop()!;
      return !claude.includes(base);
    });
    expect(
      missing,
      `CLAUDE.md describes DEFINITION_SITES but no longer names: ${missing.join(", ")} — ` +
        `its description drifted from the test's declared list`,
    ).toEqual([]);
  });
});

// --- 8. the bin/ helper roster in CLAUDE.md's Layout table -------------------

/** Every bin/ helper: a regular file directly under bin/. No extension filter —
 *  the helpers are extensionless executables (plus the compiled `monitor`), so
 *  the roster is simply "what is there", minus dotfiles. */
function binHelpers(): string[] {
  return readdirSync(join(pluginRoot, "bin"), { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

describe("enumeration lint: the bin/ helper roster in CLAUDE.md's Layout table", () => {
  // A closed enumeration in both directions: CLAUDE.md's Layout table is where
  // a reader looks up what a helper is for, and a helper with no row is
  // invisible there (five were, until the Circle that added this check).
  //
  // NOT checked here, deliberately: the workbench's tracked-file count. The
  // Layout row for `fusion-workbench/` used to carry one ("612 files since
  // e8988d9"), and it was DELETED rather than gated, because the sentence's
  // point survives without a number. There is no documented value left to diff
  // against — do not add a count check here, and do not restore the count in
  // CLAUDE.md so that one becomes possible.
  const helpers = binHelpers();

  /** The documented claim: Layout rows opening `| `bin/<name>` |`. Anchored to
   *  the table's row shape, like every other parser in this file — a reshaped
   *  table makes this find nothing and the non-vacuity assertion below fails
   *  loudly. Update the parser then; never soften it into a fuzzy match. */
  function documentedRows(text: string): string[] {
    return [...text.matchAll(/^\| `bin\/([A-Za-z0-9._-]+)` \|/gm)].map((m) => m[1]);
  }

  function drift(files: string[], rows: string[]): string[] {
    const problems: string[] = [];
    const documented = new Set(rows);
    for (const f of files) {
      if (!documented.has(f)) {
        problems.push(`bin/${f} exists but CLAUDE.md's Layout table has no row for it`);
      }
    }
    for (const r of documented) {
      if (!files.includes(r)) {
        problems.push(`CLAUDE.md's Layout table has a row for bin/${r} but that file does not exist`);
      }
    }
    const seen = new Map<string, number>();
    for (const r of rows) seen.set(r, (seen.get(r) ?? 0) + 1);
    for (const [name, n] of seen) {
      if (n > 1) problems.push(`CLAUDE.md's Layout table has ${n} rows for bin/${name}`);
    }
    return problems;
  }

  it("the tree has a plausible number of helpers", () => {
    expect(helpers.length).toBeGreaterThan(5);
  });

  it("every bin/ helper has a Layout row, and no row names a file that does not exist", () => {
    const rows = documentedRows(read("CLAUDE.md"));
    expect(
      rows.length,
      "no `| `bin/…` |` Layout rows found — CLAUDE.md's Layout table was reshaped; update the parser",
    ).toBeGreaterThan(0);
    expect(drift(helpers, rows), "the bin/ roster has drifted from CLAUDE.md's Layout table").toEqual([]);
  });

  it("mutation check: a scratch helper would be reported", () => {
    // toContain, not toEqual: with a REAL drift present the corpus test above
    // already fails, and this fixture should not fail a second time over it.
    const problems = drift([...helpers, "fusion-scratch-helper"], documentedRows(read("CLAUDE.md")));
    expect(problems).toContain(
      "bin/fusion-scratch-helper exists but CLAUDE.md's Layout table has no row for it",
    );
  });
});
