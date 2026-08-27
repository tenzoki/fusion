import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, copyFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentNames, pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Context-manifest tests (Circle B).
//
// `bin/fusion-rules` gained an optional topic argument and an optional read of
// a consuming project's `./rules/context-manifest.yaml`. This suite drives the
// real script through child_process — the same thing an agent's Setup does, and
// the same pattern `fusion-paths.test.ts` / `path-literal-lint.test.ts` use.
//
// The load-bearing guarantee is HYG-NO-REGRESS: with no manifest and no topic,
// the output is BYTE-IDENTICAL to the pre-change helper for every agent. The
// baseline for that assertion is the helper's own no-manifest output captured
// from a clean cwd (the plugin ships no manifest), so the test is self-checking:
// it compares the helper against itself run in a directory with no manifest.
// ---------------------------------------------------------------------------

const fusionRules = join(pluginRoot, "bin", "fusion-rules");

const AGENTS = [
  "orchestrator", "coder", "ontocoder", "bugfixer", "coderev",
  "ontorev", "planner", "shaper", "taskplanner",
  "reconciler", "analyst", "consultant", "playmaker",
  "editor", "curator",
];

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

/** Run fusion-rules with `cwd` as the working directory. Never throws. */
function run(cwd: string, ...args: string[]): RunResult {
  try {
    const stdout = execFileSync(fusionRules, args, {
      cwd,
      encoding: "utf-8",
      env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err: any) {
    return {
      status: err.status ?? -1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

/** The emitted set as an array of non-empty lines. */
function lines(stdout: string): string[] {
  return stdout.split("\n").filter((l) => l.trim() !== "");
}

// A throwaway consuming project. `emptyProject` has no manifest (the
// byte-identical baseline source). Tests that need a manifest write it into a
// second throwaway dir.
let emptyProject: string;
let manifestProject: string;

function writeManifest(dir: string, body: string): void {
  writeFileSync(join(dir, "rules", "context-manifest.yaml"), body);
}

beforeEach(() => {
  emptyProject = mkdtempSync(join(tmpdir(), "ctx-empty-"));
  manifestProject = mkdtempSync(join(tmpdir(), "ctx-manifest-"));
  for (const p of [emptyProject, manifestProject]) {
    mkdirSync(join(p, "rules"), { recursive: true });
    mkdirSync(join(p, ".claude", "rules"), { recursive: true });
    // Files a `path` unit may point at (existence is not required by the helper,
    // but keeping them real mirrors a genuine project).
    for (const f of ["ONTO-ENG-RULES.md", "READER.md", "CODING-HYGIENE.md"]) {
      writeFileSync(join(p, ".claude", "rules", f), `# ${f}\n`);
    }
  }
});

afterEach(() => {
  for (const p of [emptyProject, manifestProject]) {
    rmSync(p, { recursive: true, force: true });
  }
});

/** Stand up an active Circle in `dir`'s workbench with the given slug + record. */
function makeCircle(dir: string, slug: string, record: string): void {
  const wb = join(dir, "fusion-workbench");
  const circle = join(wb, "circles", slug);
  mkdirSync(circle, { recursive: true });
  writeFileSync(join(wb, ".fusion-setup"), "{}\n");
  writeFileSync(join(wb, ".active-circle"), `${slug}\n`);
  writeFileSync(join(circle, "_t_circle.md"), record);
}

const SAMPLE_MANIFEST = [
  "# fixture manifest",
  "units:",
  "  - path: .claude/rules/ONTO-ENG-RULES.md   # loaded rule",
  "    agents: [ontocoder, ontorev, planner]",
  "    topics: [ontology]",
  '    note: "UEOF/UIF engineering rules"',
  "  - path: .claude/rules/READER.md",
  "    agents: [coder, planner]",
  "    topics: [llm-pipeline]",
  "  - skill: unite-bok-sc-skill",
  '    agents: ["*"]',
  "    topics: [unite-framework]",
  "  - path: .claude/rules/CODING-HYGIENE.md",
  "    agents: [coder, coderev]",
  "    topics: [always]",
  "",
].join("\n");

// ---------------------------------------------------------------------------

describe("context-manifest: HYG-NO-REGRESS — byte-identical when absent", () => {
  it("no manifest, no topic → output identical to the baseline for every agent", () => {
    for (const agent of AGENTS) {
      const base = run(emptyProject, agent);
      const again = run(manifestProject, agent); // manifestProject has no manifest yet
      expect(base.status, `${agent} baseline exit`).toBe(0);
      expect(again.stdout, `${agent} must be byte-identical with no manifest`).toBe(base.stdout);
    }
  });

  it("no manifest, WITH a topic argument → still byte-identical (topic is a no-op absent a manifest)", () => {
    for (const agent of ["coder", "ontocoder", "planner", "orchestrator"]) {
      const noTopic = run(emptyProject, agent);
      const withTopic = run(emptyProject, agent, "ontology");
      expect(withTopic.stdout, `${agent} topic must not change no-manifest output`).toBe(noTopic.stdout);
      expect(withTopic.status).toBe(0);
    }
  });

  it("preserves the exit-code contract: unknown agent → 2, no arg → 1", () => {
    expect(run(emptyProject, "no-such-agent").status).toBe(2);   // genuinely unknown agent
    expect(run(emptyProject).status).toBe(1);
  });
});

describe("agent-setup.md is emitted always-on, first, for every agent (Circle D Bundle 0)", () => {
  // agent-setup.md is a plugin-shipped always-on framework rule (the sixth), the
  // single authoring home for the Setup contract. It must be emitted for every
  // agent, with no manifest, and emitted FIRST — before the detailed
  // fusion-workbench-conventions.md — so an agent reads "how Setup works" before
  // the conventions. This is an intended extension of the always-on set, NOT a
  // HYG-NO-REGRESS break (that guard protects the manifest-absent==pre-manifest
  // property; the always-on set is deliberately extended here).
  const setup = "agent-setup.md";
  const conventions = "fusion-workbench-conventions.md";

  it(`emits ${setup} for every agent (no manifest)`, () => {
    // Derived, not written: the list above is a fixture, and a literal count
    // beside it is a second statement of the same fact that goes stale on the
    // next agent added or removed (it did, when `conceptrev` left on
    // 2026-08-15). What this asserts is that the fixture still covers the tree.
    const onDisk = agentNames();
    expect([...AGENTS].sort()).toEqual(onDisk);
    for (const agent of AGENTS) {
      const out = lines(run(emptyProject, agent).stdout);
      expect(
        out.some((l) => l.endsWith(`/rules/${setup}`)),
        `${agent} must emit ${setup}`,
      ).toBe(true);
    }
  });

  it(`emits ${setup} before ${conventions}`, () => {
    for (const agent of AGENTS) {
      const out = lines(run(emptyProject, agent).stdout);
      const setupIdx = out.findIndex((l) => l.endsWith(`/rules/${setup}`));
      const convIdx = out.findIndex((l) => l.endsWith(`/rules/${conventions}`));
      expect(setupIdx, `${agent} emits ${setup}`).toBeGreaterThanOrEqual(0);
      expect(convIdx, `${agent} emits ${conventions}`).toBeGreaterThanOrEqual(0);
      expect(setupIdx, `${agent}: ${setup} before ${conventions}`).toBeLessThan(convIdx);
    }
  });
});

describe("context-manifest: emit predicate (agent-match AND topic-match)", () => {
  beforeEach(() => writeManifest(manifestProject, SAMPLE_MANIFEST));

  it("emits a path unit when the agent and the explicit topic both match", () => {
    const out = lines(run(manifestProject, "ontocoder", "ontology").stdout);
    expect(out).toContain(".claude/rules/ONTO-ENG-RULES.md");
  });

  it("excludes a unit whose topic does not match, even when the agent matches", () => {
    // coder matches READER's agent set, but topic 'ontology' != 'llm-pipeline'.
    const out = lines(run(manifestProject, "coder", "ontology").stdout);
    expect(out).not.toContain(".claude/rules/READER.md");
  });

  it("excludes a unit whose agent does not match, even when the topic matches", () => {
    // ontocoder is not in READER's agent set; topic llm-pipeline matches nothing else for it.
    const out = lines(run(manifestProject, "ontocoder", "llm-pipeline").stdout);
    expect(out).not.toContain(".claude/rules/READER.md");
  });

  it("[always] units emit for a matching agent regardless of the topic", () => {
    const withOther = lines(run(manifestProject, "coder", "unrelated-topic").stdout);
    expect(withOther, "CODING-HYGIENE is [always] for coder").toContain(".claude/rules/CODING-HYGIENE.md");
    const noTopic = lines(run(manifestProject, "coder").stdout);
    expect(noTopic).toContain(".claude/rules/CODING-HYGIENE.md");
  });

  it("[always] units do NOT emit for a non-matching agent", () => {
    // CODING-HYGIENE is [always] but only for [coder, coderev].
    const out = lines(run(manifestProject, "ontocoder", "ontology").stdout);
    expect(out).not.toContain(".claude/rules/CODING-HYGIENE.md");
  });

  it("agents: [*] wildcard matches every agent", () => {
    for (const agent of ["reconciler", "playmaker", "coder"]) {
      const out = lines(run(manifestProject, agent, "unite-framework").stdout);
      expect(out, `${agent} should get the [*] skill unit`).toContain("skill:unite-bok-sc-skill");
    }
  });

  it("a skill unit emits a `skill:<name>` pointer, not a file path", () => {
    const out = lines(run(manifestProject, "coder", "unite-framework").stdout);
    expect(out).toContain("skill:unite-bok-sc-skill");
    // no bare skill path leaked
    expect(out.some((l) => l.endsWith("unite-bok-sc-skill") && !l.startsWith("skill:"))).toBe(false);
  });

  it("per-agent-AND-per-topic: a topic pulls a unit the agent would never get by pattern alone", () => {
    // reconciler is a conventions-only agent — no domain rule pattern. It has no
    // path by which it would ever load a UNITE skill, yet the topic axis pulls it.
    const withTopic = lines(run(manifestProject, "reconciler", "unite-framework").stdout);
    const withoutTopic = lines(run(manifestProject, "reconciler").stdout);
    expect(withTopic).toContain("skill:unite-bok-sc-skill");
    expect(withoutTopic).not.toContain("skill:unite-bok-sc-skill");
  });

  it("manifest units are appended AFTER the existing always-on plugin rules", () => {
    const out = lines(run(manifestProject, "ontocoder", "ontology").stdout);
    const conventionsIdx = out.findIndex((l) => l.includes("fusion-workbench-conventions.md"));
    const unitIdx = out.findIndex((l) => l === ".claude/rules/ONTO-ENG-RULES.md");
    expect(conventionsIdx).toBeGreaterThanOrEqual(0);
    expect(unitIdx).toBeGreaterThan(conventionsIdx);
  });
});

describe("context-manifest: topic resolution from the active Circle", () => {
  beforeEach(() => writeManifest(manifestProject, SAMPLE_MANIFEST));

  it("derives topic keywords from the Circle slug when no CLI topic is given", () => {
    // slug 'ontology-refactor' → keywords {ontology, refactor} → matches the ontology unit.
    makeCircle(manifestProject, "260718-1924-ontology-refactor", "# c\n**Domain:** data\n");
    const out = lines(run(manifestProject, "ontocoder").stdout);
    expect(out).toContain(".claude/rules/ONTO-ENG-RULES.md");
  });

  it("an explicit CLI topic overrides the Circle slug", () => {
    makeCircle(manifestProject, "260718-1924-ontology-refactor", "# c\n**Domain:** data\n");
    // Ask for llm-pipeline as coder → READER, NOT the slug-derived ontology unit.
    const out = lines(run(manifestProject, "coder", "llm-pipeline").stdout);
    expect(out).toContain(".claude/rules/READER.md");
  });

  it("an explicit Topic: line on the Circle record overrides the slug", () => {
    // slug says 'plain' (no keyword match), but the record pins topic unite-framework.
    makeCircle(
      manifestProject,
      "260718-1924-plain",
      "# c\n**Domain:** code\n**Topic:** unite-framework\n",
    );
    const out = lines(run(manifestProject, "coder").stdout);
    expect(out).toContain("skill:unite-bok-sc-skill");
  });

  it("a Tags: line (multi-value) on the record resolves each tag", () => {
    makeCircle(
      manifestProject,
      "260718-1924-plain",
      "# c\n**Tags:** ontology, unite-framework\n",
    );
    const planner = lines(run(manifestProject, "planner").stdout);
    expect(planner, "planner in ontology unit").toContain(".claude/rules/ONTO-ENG-RULES.md");
    const coder = lines(run(manifestProject, "coder").stdout);
    expect(coder, "coder in unite-framework skill").toContain("skill:unite-bok-sc-skill");
  });

  it("no active Circle → only [always] units match (empty topic set)", () => {
    // manifestProject has a manifest but no workbench/.active-circle.
    const out = lines(run(manifestProject, "coder").stdout);
    expect(out).toContain(".claude/rules/CODING-HYGIENE.md"); // [always]
    expect(out).not.toContain(".claude/rules/READER.md");     // topic'd, no topic resolved
  });
});

describe("context-manifest: HYG-NO-SILENT-FAIL — malformed manifest fails loudly (exit 3)", () => {
  const MALFORMED: [string, string][] = [
    [
      "unit missing topics:",
      ["units:", "  - path: .claude/rules/A.md", "    agents: [coder]"].join("\n"),
    ],
    [
      "agents: not an array",
      ["units:", "  - path: .claude/rules/A.md", "    agents: coder", "    topics: [x]"].join("\n"),
    ],
    [
      "topics: not an array",
      ["units:", "  - path: .claude/rules/A.md", "    agents: [coder]", "    topics: x"].join("\n"),
    ],
    [
      "empty path value",
      ["units:", "  - path:", "    agents: [coder]", "    topics: [x]"].join("\n"),
    ],
    [
      "list item is neither path nor skill",
      ["units:", "  - foo: bar", "    agents: [coder]", "    topics: [x]"].join("\n"),
    ],
    [
      "content with no units: key",
      ["hello: world", "random: stuff"].join("\n"),
    ],
  ];

  for (const [label, body] of MALFORMED) {
    it(`exits 3 with a stderr reason: ${label}`, () => {
      writeManifest(manifestProject, body);
      const r = run(manifestProject, "coder");
      expect(r.status, `${label} must exit 3`).toBe(3);
      expect(r.stderr).toContain("malformed context-manifest.yaml");
      // fail-closed: no partial unit set on stdout
      expect(lines(r.stdout).some((l) => l.startsWith(".claude/rules/") || l.startsWith("skill:"))).toBe(false);
    });
  }

  it("does NOT emit any earlier-listed unit when a later unit is malformed (all-or-nothing)", () => {
    const body = [
      "units:",
      "  - path: .claude/rules/CODING-HYGIENE.md",
      "    agents: [coder]",
      "    topics: [always]",
      "  - path: .claude/rules/READER.md",
      "    agents: [coder]",
      // topics: deliberately missing → malformed
    ].join("\n");
    writeManifest(manifestProject, body);
    const r = run(manifestProject, "coder");
    expect(r.status).toBe(3);
    // The first unit WOULD have matched (coder, always), but the run must abort clean.
    expect(r.stdout).not.toContain(".claude/rules/CODING-HYGIENE.md");
  });
});

describe("emit_if_exists: a missing always-on rule file is skipped silently (set -eu regression)", () => {
  // The documented contract (rules/agent-setup.md: "missing files are skipped
  // silently") must hold under `set -eu`. Before the fix, emit_if_exists was a
  // bare `[ -f ] && printf`, returning 1 on a miss — which killed the emission
  // mid-stream with partial output and exit 1. This suite runs the real script
  // against a stripped plugin copy with one always-on file removed.
  let strippedPlugin: string;

  beforeEach(() => {
    strippedPlugin = mkdtempSync(join(tmpdir(), "ctx-stripped-plugin-"));
    mkdirSync(join(strippedPlugin, "bin"), { recursive: true });
    copyFileSync(fusionRules, join(strippedPlugin, "bin", "fusion-rules"));
    chmodSync(join(strippedPlugin, "bin", "fusion-rules"), 0o755);
    // The repo-context sibling the script probes at startup (bin/fusion-plugin-cwd).
    // Staged so the probe is the real one rather than a noisy command-not-found.
    copyFileSync(
      join(pluginRoot, "bin", "fusion-plugin-cwd"),
      join(strippedPlugin, "bin", "fusion-plugin-cwd"),
    );
    chmodSync(join(strippedPlugin, "bin", "fusion-plugin-cwd"), 0o755);
    cpSync(join(pluginRoot, "rules"), join(strippedPlugin, "rules"), { recursive: true });
    // Remove one always-on file from the middle of the emit_if_exists block.
    rmSync(join(strippedPlugin, "rules", "decision-record-examples.md"));
  });

  afterEach(() => {
    rmSync(strippedPlugin, { recursive: true, force: true });
  });

  function runStripped(agent: string): RunResult {
    try {
      const stdout = execFileSync(join(strippedPlugin, "bin", "fusion-rules"), [agent], {
        cwd: emptyProject,
        encoding: "utf-8",
        env: { ...process.env, FUSION_PLUGIN_ROOT: strippedPlugin },
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { status: 0, stdout, stderr: "" };
    } catch (err: any) {
      return {
        status: err.status ?? -1,
        stdout: err.stdout?.toString() ?? "",
        stderr: err.stderr?.toString() ?? "",
      };
    }
  }

  it("exits 0 and emits every remaining always-on path when one file is missing", () => {
    const r = runStripped("coder");
    expect(r.status, "missing always-on file must not abort the emission").toBe(0);
    const out = lines(r.stdout);
    // Everything after the missing file in the emit block must still be there.
    for (const f of [
      "agent-setup.md",
      "fusion-workbench-conventions.md",
      "critical-stance.md",
    ]) {
      expect(out.some((l) => l.endsWith(`/rules/${f}`)), `emits ${f}`).toBe(true);
    }
    expect(out.some((l) => l.endsWith("/rules/decision-record-examples.md"))).toBe(false);
    expect(out.some((l) => l.endsWith("/rules/user-facing-output.md"))).toBe(false);
  });

  it("holds for a conventions-only agent too", () => {
    const r = runStripped("reconciler");
    expect(r.status).toBe(0);
    const out = lines(r.stdout);
    // The LAST always-on emission, so its presence proves the block ran to the
    // end rather than dying partway after the missing file.
    expect(out.some((l) => l.endsWith("/rules/critical-stance.md"))).toBe(true);
  });
});

describe("malformed-manifest error message is verbatim (awk quote-escape regression)", () => {
  // The fail strings used \x27 for the single quote. BWK awk (macOS
  // /usr/bin/awk) consumes trailing hex digits greedily, so "\x27agents"
  // parsed as \x27a + "gents" and printed "zgents". The fix uses the octal
  // \047, which is bounded at three digits. Assert the message byte-exactly.
  it("unit missing agents: → stderr carries `is missing 'agents:'` verbatim", () => {
    writeManifest(
      manifestProject,
      ["units:", "  - path: .claude/rules/A.md", "    topics: [x]"].join("\n"),
    );
    const r = run(manifestProject, "coder");
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("unit '.claude/rules/A.md' is missing 'agents:'");
    expect(r.stderr, "hex-escape greed must not garble the message").not.toContain("zgents");
  });

  it("unit missing topics: → stderr carries `is missing 'topics:'` verbatim", () => {
    writeManifest(
      manifestProject,
      ["units:", "  - path: .claude/rules/A.md", "    agents: [coder]"].join("\n"),
    );
    const r = run(manifestProject, "coder");
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("unit '.claude/rules/A.md' is missing 'topics:'");
  });
});

describe("context-manifest: a valid empty manifest is not an error", () => {
  it("units: [] → exit 0, no extra units, existing set intact", () => {
    writeManifest(manifestProject, "# nothing here\nunits: []\n");
    const withEmpty = run(manifestProject, "coder");
    const baseline = run(emptyProject, "coder");
    expect(withEmpty.status).toBe(0);
    expect(withEmpty.stdout).toBe(baseline.stdout);
  });

  it("a comments-only file → exit 0, byte-identical to no manifest", () => {
    writeManifest(manifestProject, "# just a comment\n");
    const r = run(manifestProject, "coder");
    expect(r.status).toBe(0);
    expect(r.stdout).toBe(run(emptyProject, "coder").stdout);
  });
});
