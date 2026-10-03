import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync, copyFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { agentNames, pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { claim, createPackage, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// Context-manifest tests (Circle B).
//
// The mechanism and its load-bearing guarantee, HYG-NO-REGRESS, are authored in
// `rules/context-manifest.md`. This suite drives the real script as an agent's
// Setup does; the no-regress baseline is its own output from a manifest-less cwd.
// ---------------------------------------------------------------------------

const fusionRules = join(pluginRoot, "bin", "fusion-rules");

const AGENTS = [
  "orchestrator", "code-implementer", "data-implementer", "reviewer",
  "implementation-planner", "requirements-designer", "state-auditor", "analyst",
  "consultant", "document-editor", "policy-curator",
];

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

/**
 * Run a `fusion-rules` executable and capture BOTH streams on every path.
 * Never throws. `spawnSync` rather than `execFileSync`, which returns stdout
 * alone: a clean run's stderr was discarded, and that is exactly where the
 * claim helper's reasons arrive for a case below to read.
 */
function runAt(script: string, cwd: string, root: string, args: string[]): RunResult {
  const r = spawnSync(script, args, {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, FUSION_PLUGIN_ROOT: root },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const run = (cwd: string, ...args: string[]) => runAt(fusionRules, cwd, pluginRoot, args);

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

/** `rules/` and the files a `path` unit may point at (existence is not required
 *  by the helper, but keeping them real mirrors a genuine project). */
function seed(p: string): void {
  mkdirSync(join(p, "rules"), { recursive: true });
  mkdirSync(join(p, ".claude", "rules"), { recursive: true });
  for (const f of ["ONTO-ENG-RULES.md", "READER.md", "CODING-HYGIENE.md"]) {
    writeFileSync(join(p, ".claude", "rules", f), `# ${f}\n`);
  }
}

beforeEach(() => {
  emptyProject = mkdtempSync(join(tmpdir(), "ctx-empty-"));
  manifestProject = mkdtempSync(join(tmpdir(), "ctx-manifest-"));
  for (const p of [emptyProject, manifestProject]) seed(p);
});

afterEach(() => {
  for (const p of [emptyProject, manifestProject]) {
    rmSync(p, { recursive: true, force: true });
  }
});

/**
 * A consuming project with the sample manifest whose workbench is
 * JSON-controlled, so that `bin/fusion-claimed-package` reads the claim off the
 * package's JSON record through the codec. Two properties of the setup are
 * load-bearing: the checkout identifier is pinned rather than minted, because
 * the claim is compared by equality on those eight hex characters and a test
 * that let `bin/fusion-identity` mint one would assert against a value it does
 * not know; and the tree is a git work tree WITH an identity, because outside
 * one that helper exits 4 and the claim is never read at all — a true answer
 * that would make every case below pass for the wrong reason.
 */
const CHECKOUT = "a1b2c3d4";

function withClaimProject<T>(fn: (p: JsonProject) => T, options: { legacy?: boolean } = {}): T {
  return withJsonProject((p) => {
    seed(p.root);
    writeManifest(p.root, SAMPLE_MANIFEST);
    writeFileSync(join(p.workbench, ".checkout-id"), `${CHECKOUT}\n`);
    for (const a of [["init", "-q"], ["config", "user.email", "t@e.com"], ["config", "user.name", "T"]])
      execFileSync("git", a, { cwd: p.root, stdio: "ignore" });
    return fn(p);
  }, options);
}

/** A package the kernel wrote, claimed by `by`. `head` is appended to its narrative, the file the
 *  helper reads a `Topic:`/`Tags:` line from, as a person editing it would; the control record is untouched. */
function claimed(p: JsonProject, slug: string, by = CHECKOUT, head = ""): void {
  const pkg = createPackage(p, slug);
  claim(p, pkg, by);
  if (head !== "") appendFileSync(join(p.workbench, pkg.narrative), head);
}

const SAMPLE_MANIFEST = [
  "# fixture manifest",
  "units:",
  "  - path: .claude/rules/ONTO-ENG-RULES.md   # loaded rule",
  "    agents: [data-implementer, reviewer, implementation-planner]",
  "    topics: [ontology]",
  '    note: "UEOF/UIF engineering rules"',
  "  - path: .claude/rules/READER.md",
  "    agents: [code-implementer, implementation-planner]",
  "    topics: [llm-pipeline]",
  "  - skill: unite-bok-sc-skill",
  '    agents: ["*"]',
  "    topics: [unite-framework]",
  "  - path: .claude/rules/CODING-HYGIENE.md",
  "    agents: [code-implementer, reviewer]",
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
    for (const agent of ["code-implementer", "data-implementer", "implementation-planner", "orchestrator"]) {
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
  // agent-setup.md, the single authoring home for the Setup contract, is emitted
  // for every agent with no manifest, and FIRST, so "how Setup works" is read
  // before the conventions. Extending the always-on set is intended, not a
  // HYG-NO-REGRESS break (that guard protects only the manifest-absent output).
  const setup = "agent-setup.md";
  const conventions = "fusion-workbench-conventions.md";

  it(`emits ${setup} for every agent (no manifest)`, () => {
    // Derived, not written: a literal count beside the fixture goes stale on the
    // next agent added or removed. This asserts the fixture still covers the tree.
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
    const out = lines(run(manifestProject, "data-implementer", "ontology").stdout);
    expect(out).toContain(".claude/rules/ONTO-ENG-RULES.md");
  });

  it("excludes a unit whose topic does not match, even when the agent matches", () => {
    // code-implementer matches READER's agent set, but topic 'ontology' != 'llm-pipeline'.
    const out = lines(run(manifestProject, "code-implementer", "ontology").stdout);
    expect(out).not.toContain(".claude/rules/READER.md");
  });

  it("excludes a unit whose agent does not match, even when the topic matches", () => {
    // data-implementer is not in READER's agent set; topic llm-pipeline matches nothing else for it.
    const out = lines(run(manifestProject, "data-implementer", "llm-pipeline").stdout);
    expect(out).not.toContain(".claude/rules/READER.md");
  });

  it("[always] units emit for a matching agent regardless of the topic", () => {
    const withOther = lines(run(manifestProject, "code-implementer", "unrelated-topic").stdout);
    expect(withOther, "CODING-HYGIENE is [always] for code-implementer").toContain(".claude/rules/CODING-HYGIENE.md");
    const noTopic = lines(run(manifestProject, "code-implementer").stdout);
    expect(noTopic).toContain(".claude/rules/CODING-HYGIENE.md");
  });

  it("[always] units do NOT emit for a non-matching agent", () => {
    // CODING-HYGIENE is [always] but only for [code-implementer, reviewer].
    const out = lines(run(manifestProject, "data-implementer", "ontology").stdout);
    expect(out).not.toContain(".claude/rules/CODING-HYGIENE.md");
  });

  it("agents: [*] wildcard matches every agent", () => {
    for (const agent of ["state-auditor", "policy-curator", "code-implementer"]) {
      const out = lines(run(manifestProject, agent, "unite-framework").stdout);
      expect(out, `${agent} should get the [*] skill unit`).toContain("skill:unite-bok-sc-skill");
    }
  });

  it("a pre-v12 agent name matches nothing since 13.0.0, like an unknown name", () => {
    writeManifest(manifestProject, "units:\n  - path: A.md\n    agents: [coder]\n    topics: [always]\n" +
      "  - path: B.md\n    agents: [no-such-agent]\n    topics: [always]\n");
    const r = run(manifestProject, "code-implementer");
    expect(lines(r.stdout), "agents: [coder] no longer reaches code-implementer").not.toContain("A.md");
    expect(lines(r.stdout), "an unknown name is not aliased").not.toContain("B.md");
    expect(r.stderr).not.toContain("coder");
  });

  it("a skill unit emits a `skill:<name>` pointer, not a file path", () => {
    const out = lines(run(manifestProject, "code-implementer", "unite-framework").stdout);
    expect(out).toContain("skill:unite-bok-sc-skill");
    // no bare skill path leaked
    expect(out.some((l) => l.endsWith("unite-bok-sc-skill") && !l.startsWith("skill:"))).toBe(false);
  });

  it("per-agent-AND-per-topic: a topic pulls a unit the agent would never get by pattern alone", () => {
    // state-auditor is a conventions-only agent — no domain rule pattern. It has no
    // path by which it would ever load a UNITE skill, yet the topic axis pulls it.
    const withTopic = lines(run(manifestProject, "state-auditor", "unite-framework").stdout);
    const withoutTopic = lines(run(manifestProject, "state-auditor").stdout);
    expect(withTopic).toContain("skill:unite-bok-sc-skill");
    expect(withoutTopic).not.toContain("skill:unite-bok-sc-skill");
  });

  it("manifest units are appended AFTER the existing always-on plugin rules", () => {
    const out = lines(run(manifestProject, "data-implementer", "ontology").stdout);
    const conventionsIdx = out.findIndex((l) => l.includes("fusion-workbench-conventions.md"));
    const unitIdx = out.findIndex((l) => l === ".claude/rules/ONTO-ENG-RULES.md");
    expect(conventionsIdx).toBeGreaterThanOrEqual(0);
    expect(unitIdx).toBeGreaterThan(conventionsIdx);
  });
});

describe("context-manifest: topic resolution from the claimed work item", () => {
  const ONTO = ".claude/rules/ONTO-ENG-RULES.md";

  it("derives topic keywords from the item's slug when no CLI topic is given", () => {
    // slug 'ontology-refactor' → keywords {ontology, refactor} → matches the ontology unit.
    withClaimProject((p) => {
      claimed(p, "260718-1924-ontology-refactor");
      expect(lines(run(p.root, "data-implementer").stdout)).toContain(ONTO);
      // Ask for llm-pipeline as code-implementer → READER, NOT the slug-derived ontology unit.
      expect(lines(run(p.root, "code-implementer", "llm-pipeline").stdout), "an explicit CLI topic overrides the slug").toContain(".claude/rules/READER.md");
    });
  }, CASE_TIMEOUT);

  it("an explicit Topic: line in the narrative overrides the slug, and a Tags: line resolves each tag", () => {
    // slug says 'plain' (no keyword match), but the narrative pins topic unite-framework.
    withClaimProject((p) => {
      claimed(p, "260718-1924-plain", CHECKOUT, "**Topic:** unite-framework\n");
      expect(lines(run(p.root, "code-implementer").stdout)).toContain("skill:unite-bok-sc-skill");
    });
    withClaimProject((p) => {
      claimed(p, "260718-1924-plain", CHECKOUT, "**Tags:** ontology, unite-framework\n");
      expect(lines(run(p.root, "implementation-planner").stdout), "implementation-planner in ontology unit").toContain(ONTO);
      expect(lines(run(p.root, "code-implementer").stdout), "code-implementer in unite-framework skill").toContain("skill:unite-bok-sc-skill");
    });
  }, CASE_TIMEOUT);

  it("nothing claimed → only [always] units match (empty topic set)", () => {
    // A manifest and no package at all.
    withClaimProject((p) => {
      const out = lines(run(p.root, "code-implementer").stdout);
      expect(out).toContain(".claude/rules/CODING-HYGIENE.md"); // [always]
      expect(out).not.toContain(".claude/rules/READER.md");     // topic'd, no topic resolved
    });
  }, CASE_TIMEOUT);

  it("an item claimed by another checkout resolves no topic, and an unclaimed one neither", () => {
    // The whole reason the claim is compared on the checkout: what is resolved is what THIS checkout
    // is working on. Another checkout's claim is not an answer about this one, and reading it would
    // hand an agent somebody else's rules. Both halves are tested, not just the status.
    withClaimProject((p) => {
      claimed(p, "260718-1924-ontology-refactor", "99887766");
      createPackage(p, "260718-1925-ontology-cleanup");
      const r = run(p.root, "data-implementer");
      expect(r.status, "a foreign claim is an ordinary answer, not a fault").toBe(0);
      expect(lines(r.stdout)).not.toContain(ONTO);
      // And the store DOES resolve for the checkout that holds a package in it,
      // so the absence above is the comparison working rather than the read failing.
      claimed(p, "260718-1926-ontology-review");
      expect(lines(run(p.root, "data-implementer").stdout)).toContain(ONTO);
    });
  }, CASE_TIMEOUT);

  it("two claimed items resolve no topic, and the helper's reason is not swallowed", () => {
    // `bin/fusion-paths` refuses this case with exit 3 rather than picking one.
    // Here the same 3 resolves NO topic and the emission carries on, because a
    // topic buys optional units while a path decides where an artifact lands.
    // And it is NOT re-raised as this script's exit 3, which means a malformed
    // manifest and nothing else.
    withClaimProject((p) => {
      claimed(p, "260718-1924-ontology-refactor");
      claimed(p, "260718-1930-second-claim");
      const r = run(p.root, "data-implementer");
      expect(r.status, "a refused claim is not this script's own failure").toBe(0);
      expect(lines(r.stdout), "the slug of one of them must not become the topic").not.toContain(ONTO);
      expect(r.stderr, "the helper's own reason must reach the user").toContain("which one is in scope cannot be determined");
    });
  }, CASE_TIMEOUT);

  it("a workbench the helper refuses by name resolves no topic: exit 0, the state on stderr", () => {
    // The same asymmetry: a legacy workbench is the resolver's exit 3 and a degraded topic here.
    withClaimProject((p) => {
      const r = run(p.root, "code-implementer");
      expect(r.status).toBe(0);
      expect(lines(r.stdout)).toContain(".claude/rules/CODING-HYGIENE.md");
      expect(r.stderr).toContain("legacy");
    }, { legacy: true });
  }, CASE_TIMEOUT);
});

describe("context-manifest: HYG-NO-SILENT-FAIL — malformed manifest fails loudly (exit 3)", () => {
  const MALFORMED: [string, string][] = [
    [
      "unit missing topics:",
      ["units:", "  - path: .claude/rules/A.md", "    agents: [code-implementer]"].join("\n"),
    ],
    [
      "agents: not an array",
      ["units:", "  - path: .claude/rules/A.md", "    agents: code-implementer", "    topics: [x]"].join("\n"),
    ],
    [
      "topics: not an array",
      ["units:", "  - path: .claude/rules/A.md", "    agents: [code-implementer]", "    topics: x"].join("\n"),
    ],
    [
      "empty path value",
      ["units:", "  - path:", "    agents: [code-implementer]", "    topics: [x]"].join("\n"),
    ],
    [
      "list item is neither path nor skill",
      ["units:", "  - foo: bar", "    agents: [code-implementer]", "    topics: [x]"].join("\n"),
    ],
    [
      "content with no units: key",
      ["hello: world", "random: stuff"].join("\n"),
    ],
  ];

  for (const [label, body] of MALFORMED) {
    it(`exits 3 with a stderr reason: ${label}`, () => {
      writeManifest(manifestProject, body);
      const r = run(manifestProject, "code-implementer");
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
      "    agents: [code-implementer]",
      "    topics: [always]",
      "  - path: .claude/rules/READER.md",
      "    agents: [code-implementer]",
      // topics: deliberately missing → malformed
    ].join("\n");
    writeManifest(manifestProject, body);
    const r = run(manifestProject, "code-implementer");
    expect(r.status).toBe(3);
    // The first unit WOULD have matched (code-implementer, always), but the run must abort clean.
    expect(r.stdout).not.toContain(".claude/rules/CODING-HYGIENE.md");
  });
});

describe("emit_if_exists: a missing always-on rule file is skipped silently (set -eu regression)", () => {
  // rules/agent-setup.md promises "missing files are skipped silently" under
  // `set -eu`; a bare `[ -f ] && printf` once returned 1 on a miss and killed the
  // emission mid-stream. Run against a plugin copy with one always-on file removed.
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

  const runStripped = (agent: string): RunResult =>
    runAt(join(strippedPlugin, "bin", "fusion-rules"), emptyProject, strippedPlugin, [agent]);

  it("exits 0 and emits every remaining always-on path when one file is missing", () => {
    const r = runStripped("code-implementer");
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
    const r = runStripped("state-auditor");
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
    const r = run(manifestProject, "code-implementer");
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("unit '.claude/rules/A.md' is missing 'agents:'");
    expect(r.stderr, "hex-escape greed must not garble the message").not.toContain("zgents");
  });

  it("unit missing topics: → stderr carries `is missing 'topics:'` verbatim", () => {
    writeManifest(
      manifestProject,
      ["units:", "  - path: .claude/rules/A.md", "    agents: [code-implementer]"].join("\n"),
    );
    const r = run(manifestProject, "code-implementer");
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("unit '.claude/rules/A.md' is missing 'topics:'");
  });
});

describe("context-manifest: a valid empty manifest is not an error", () => {
  it("units: [] → exit 0, no extra units, existing set intact", () => {
    writeManifest(manifestProject, "# nothing here\nunits: []\n");
    const withEmpty = run(manifestProject, "code-implementer");
    const baseline = run(emptyProject, "code-implementer");
    expect(withEmpty.status).toBe(0);
    expect(withEmpty.stdout).toBe(baseline.stdout);
  });

  it("a comments-only file → exit 0, byte-identical to no manifest", () => {
    writeManifest(manifestProject, "# just a comment\n");
    const r = run(manifestProject, "code-implementer");
    expect(r.status).toBe(0);
    expect(r.stdout).toBe(run(emptyProject, "code-implementer").stdout);
  });
});
