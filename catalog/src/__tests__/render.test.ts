// The catalog's contract, in five groups: the data validates and resolves;
// no neutral part carries a host token; the Claude render reproduces the
// committed prompt byte for byte; the Prior render carries no Claude token and
// no unresolved include; the bundled JSON has exactly Prior's key set.
//
// Plan step 5 of 261010-1235-plan-fusion-prior-module-bundle-explorer-then-
// four-role-repair.md. The token regexes are Finding 1 of
// 261010-1504-span-map-and-repair-correspondence.md, made concrete here.

import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  CATALOG_SCHEMA,
  INCLUDE_DIRECTIVE,
  PRIOR_ALIAS_KEYS,
  PRIOR_CATALOG_KEYS,
  PRIOR_ENTRY_KEYS,
  PRIOR_HOSTS,
  PRIOR_PROFILE_KEYS,
  PRIOR_ROLE_KEYS,
  RenderError,
  catalogRoot,
  checkCatalogDocument,
  checkEntries,
  checkPriorCatalogKeys,
  fusionCommit,
  fusionRootOf,
  loadCatalog,
  loadProfile,
  partsState,
  priorProfiles,
  provenanceLine,
  readJson,
  renderClaude,
  renderPrior,
  type Catalog,
  type CatalogEntry,
  type CatalogRole,
  type Profile,
} from "../render.js";

const CATALOG = catalogRoot();
const FUSION = fusionRootOf(CATALOG);

// The live catalog. Loaded once; when it does not load, every group that
// reads it is one failing case naming the error, and the fixture groups still
// run. That is the state between a renderer change and the data change that
// follows it, and it stays red rather than skipped.
const live: { catalog: Catalog; error: null } | { catalog: null; error: unknown } = (() => {
  try {
    return { catalog: loadCatalog(CATALOG).catalog, error: null };
  } catch (error) {
    return { catalog: null, error };
  }
})();

function describeLive(name: string, body: (catalog: Catalog) => void): void {
  describe(name, () => {
    if (live.catalog === null) {
      it("loads the live catalog.json", () => {
        throw live.error;
      });
      return;
    }
    body(live.catalog);
  });
}

const scratch: string[] = [];
function tmp(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `fusion-catalog-${label}-`));
  scratch.push(dir);
  return dir;
}
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

function keysOf(o: unknown): string[] {
  return Object.keys(o as object);
}

// ---------------------------------------------------------------------------
// Host tokens (Finding 1). The helper list is read off the live `bin/`, so a
// helper added later is a token from the day it lands.
// ---------------------------------------------------------------------------

const HELPER_SUFFIXES = readdirSync(join(FUSION, "bin"))
  .filter((n) => n.startsWith("fusion-"))
  .map((n) => n.slice("fusion-".length));

export const HOST_TOKENS: { name: string; re: RegExp; control: string }[] = [
  { name: "$FUSION_PLUGIN_ROOT", re: /\$FUSION_PLUGIN_ROOT/, control: 'Run "$FUSION_PLUGIN_ROOT/x"' },
  { name: "bin/ helper path", re: /bin\/fusion-[a-z-]+/, control: "see bin/fusion-paths" },
  { name: "bin/ helper bare word", re: new RegExp(`\\bfusion-(${HELPER_SUFFIXES.join("|")})\\b`), control: "via fusion-write create" },
  { name: "$OUT_*/$SCAN_*", re: /\$?(OUT|SCAN)_[A-Z*]/, control: "write it to $OUT_ISSUE" },
  { name: "Agent(", re: /Agent\(/, control: "Agent(fusion:reviewer)" },
  { name: "AskUserQuestion", re: /AskUserQuestion/, control: "put an AskUserQuestion" },
  { name: "slash command", re: /(^|[\s`(])\/[a-z][a-z0-9-]*:[a-z]/m, control: "run /fusion:setup first" },
];

function tokenHits(text: string): string[] {
  return HOST_TOKENS.filter((t) => t.re.test(text)).map((t) => t.name);
}

// ---------------------------------------------------------------------------
// The schemas
// ---------------------------------------------------------------------------

const ajv = new Ajv2020({ strict: false, allErrors: true });
function compile(name: string): ValidateFunction {
  return ajv.compile(readJson<object>(join(CATALOG, "schemas", name)));
}
const validCatalog = compile("catalog.schema.json");
const validProfile = compile("profile.schema.json");
const validWorkflow = compile("workflow.schema.json");

function expectValid(validate: ValidateFunction, doc: unknown, what: string): void {
  const ok = validate(doc);
  expect(ok, `${what}: ${JSON.stringify(validate.errors)}`).toBe(true);
}

const profileIds = readdirSync(join(CATALOG, "profiles"));
const workflowFiles = readdirSync(join(CATALOG, "workflows"));

/** Prior's `names` map: canonical ids and aliases, each to one role and one domain. */
function nameMap(c: Catalog): Map<string, { id: string; domain: string }> {
  const names = new Map<string, { id: string; domain: string }>();
  for (const r of c.roles) names.set(r.id, { id: r.id, domain: "" });
  for (const r of c.roles) {
    for (const a of r.aliases) {
      expect(names.has(a.id), `alias ${a.id} of ${r.id} shadows another name`).toBe(false);
      names.set(a.id, { id: r.id, domain: a.domain });
    }
  }
  return names;
}

describeLive("catalog data", (catalog) => {
  const roleById = new Map(catalog.roles.map((r) => [r.id, r]));
  const entryProfiles = new Set(catalog.entries.map((e) => e.profile));

  it("catalog.json validates against catalog.schema.json", () => {
    expectValid(validCatalog, catalog, "catalog.json");
  });

  it("catalog.json passes the document check and the entry invariants against the fusion tree", () => {
    expect(() => checkCatalogDocument(readJson(join(CATALOG, "catalog.json")))).not.toThrow();
    expect(() => checkEntries(catalog, CATALOG, FUSION)).not.toThrow();
  });

  it("every profile.json validates, names its directory and a role or an entry, and lists existing part files or none", () => {
    for (const id of profileIds) {
      const profile = loadProfile(CATALOG, id);
      expect(profile, `profiles/${id}/profile.json`).not.toBeNull();
      expectValid(validProfile, profile, `profiles/${id}/profile.json`);
      expect(roleById.has(id) || entryProfiles.has(id), `profiles/${id} is named by no role and no entry`).toBe(true);
      expect(() => partsState(CATALOG, profile!)).not.toThrow();
    }
  });

  it("every role whose prior state is not unsupported has a profile; a supported one has its schema assets", () => {
    for (const r of catalog.roles) {
      if (r.support.prior === "unsupported") continue;
      const profile = loadProfile(CATALOG, r.id);
      expect(profile, `${r.id} is ${r.support.prior} on prior and has no profile`).not.toBeNull();
      if (r.support.prior !== "supported") continue;
      for (const asset of [profile!.input_schema, profile!.result_schema]) {
        expect(existsSync(join(CATALOG, asset)), `${r.id}: ${asset} missing`).toBe(true);
      }
    }
  });

  it("every workflow validates; its step roles resolve to a role Prior may ship; its host services are in requires", () => {
    expect(workflowFiles.length).toBeGreaterThan(0);
    const names = nameMap(catalog);
    for (const file of workflowFiles) {
      const wf = readJson<{ steps: { role?: string; host_service?: string }[]; requires: string[] }>(join(CATALOG, "workflows", file));
      expectValid(validWorkflow, wf, `workflows/${file}`);
      for (const step of wf.steps) {
        if (step.role !== undefined) {
          const ref = names.get(step.role);
          expect(ref, `${file}: role ${step.role} unknown`).toBeDefined();
          expect(roleById.get(ref!.id)!.support.prior, `${file}: role ${step.role}`).not.toBe("unsupported");
        }
        if (step.host_service !== undefined) {
          expect(wf.requires, `${file}: ${step.host_service} not in requires`).toContain(step.host_service);
        }
      }
    }
  });

  it("every .v1.json schema compiles under draft 2020-12 and carries no network reference", () => {
    const v1 = readdirSync(join(CATALOG, "schemas")).filter((n) => n.endsWith(".v1.json"));
    expect(v1.length).toBeGreaterThan(0);
    for (const name of v1) {
      const text = readFileSync(join(CATALOG, "schemas", name), "utf8");
      expect(() => new Ajv2020({ strict: false }).compile(JSON.parse(text))).not.toThrow();
      // The copied Prior result schema carries its own `$id` and `$schema`
      // URLs by contract; nothing else names a network location.
      if (name !== "explorer-result.v1.json") expect(text, `${name} names a URL`).not.toMatch(/https?:\/\//);
      expect(text).not.toMatch(/"\$ref"\s*:\s*"https?:/);
    }
  });

  it("every id resolves, aliases included, each to one canonical role with one domain", () => {
    const ids = catalog.roles.map((r) => r.id);
    expect(new Set(ids).size, "duplicate canonical id").toBe(ids.length);
    const names = nameMap(catalog);
    for (const r of catalog.roles) {
      const seen = new Set<string>();
      for (const pid of r.prior_ids) {
        expect(seen.has(pid), `${r.id}: prior id ${pid} listed twice`).toBe(false);
        seen.add(pid);
        const ref = names.get(pid);
        expect(ref, `${r.id}: prior id ${pid} resolves to nothing`).toBeDefined();
        expect(ref!.id, `${r.id}: prior id ${pid} resolves to another role`).toBe(r.id);
        if (pid !== r.id) {
          expect(r.aliases.some((a) => a.id === pid), `${r.id}: prior id ${pid} is not an alias`).toBe(true);
        }
      }
      const aliasIds = r.aliases.map((a) => a.id);
      expect(new Set(aliasIds).size, `${r.id}: alias listed twice`).toBe(aliasIds.length);
      for (const a of r.aliases) expect(a.domain, `${r.id}: alias ${a.id} has no domain`).not.toBe("");
    }
    // Every Prior id of every role is in the map exactly once.
    const allPriorIds = catalog.roles.flatMap((r) => r.prior_ids);
    expect(new Set(allPriorIds).size, "a Prior id appears under two roles").toBe(allPriorIds.length);
  });

  it("the Claude agent files and the claude_name values are the same set, each name once", () => {
    const agents = readdirSync(join(FUSION, "agents")).filter((n) => n.endsWith(".md")).map((n) => n.slice(0, -3)).sort();
    const names = catalog.roles.map((r) => r.claude_name).filter((n): n is string => n !== null);
    expect(new Set(names).size, "a claude_name appears twice").toBe(names.length);
    expect([...names].sort()).toEqual(agents);
  });

  it("catalog.json carries exactly the keys Prior reads", () => {
    const raw = readJson<Record<string, unknown>>(join(CATALOG, "catalog.json"));
    expect(keysOf(raw).sort()).toEqual([...PRIOR_CATALOG_KEYS].sort());
    for (const role of raw.roles as Record<string, unknown>[]) {
      expect(keysOf(role).sort(), `role ${String(role.id)}`).toEqual([...PRIOR_ROLE_KEYS].sort());
      expect(keysOf(role.support).sort(), `role ${String(role.id)} support`).toEqual([...PRIOR_HOSTS].sort());
      for (const alias of role.aliases as Record<string, unknown>[]) {
        expect(keysOf(alias).sort()).toEqual([...PRIOR_ALIAS_KEYS].sort());
      }
    }
    for (const entry of raw.entries as Record<string, unknown>[]) {
      expect(keysOf(entry).sort(), `entry ${String(entry.id)}`).toEqual([...PRIOR_ENTRY_KEYS].sort());
    }
    expect(() => checkPriorCatalogKeys(raw)).not.toThrow();
    expect(() => checkPriorCatalogKeys({ ...raw, extra: 1 })).toThrow(RenderError);
  });
});

// ---------------------------------------------------------------------------
// Host tokens in neutral parts
// ---------------------------------------------------------------------------

function partsOf(tag: "neutral" | "claude" | "prior"): { id: string; file: string; path: string }[] {
  const out: { id: string; file: string; path: string }[] = [];
  for (const id of profileIds) {
    const profile = loadProfile(CATALOG, id)!;
    for (const p of profile.parts) {
      const path = join(CATALOG, "profiles", id, p.file);
      if (p.tag === tag && existsSync(path)) out.push({ id, file: p.file, path });
    }
  }
  return out;
}

describe("host tokens", () => {
  it("each regex fires on its positive control", () => {
    for (const t of HOST_TOKENS) expect(t.re.test(t.control), t.name).toBe(true);
  });

  it("a consuming project's own bin/ directory is not a helper hit (state-auditor span 11)", () => {
    expect(tokenHits("common locations: `scripts/`, `tools/`, `bin/`")).toEqual([]);
  });

  it("no neutral part carries a host token", () => {
    for (const part of partsOf("neutral")) {
      expect(tokenHits(readFileSync(part.path, "utf8")), `${part.id}/${part.file}`).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// The Claude render
// ---------------------------------------------------------------------------

describeLive("render claude", (catalog) => {
  const out = tmp("claude");
  const result = renderClaude(CATALOG, out);
  const converted = catalog.roles.filter((r) => r.claude_name !== null && loadProfile(CATALOG, r.id) !== null);

  for (const role of converted) {
    it(`reproduces agents/${role.claude_name}.md byte for byte (${role.id})`, () => {
      const rendered = join(out, `${role.claude_name}.md`);
      const skip = result.skipped.find((s) => s.id === role.id);
      expect(skip, `${role.id} not rendered: ${skip?.reason}`).toBeUndefined();
      const actual = readFileSync(rendered);
      const expected = readFileSync(join(FUSION, "agents", `${role.claude_name}.md`));
      expect(actual.equals(expected), `${role.claude_name}.md differs (${actual.length} vs ${expected.length} bytes)`).toBe(true);
    });
  }

  it("writes nothing for a role without a profile, and nothing outside the converted set", () => {
    const written = readdirSync(out).sort();
    const expected = converted.filter((r) => !result.skipped.some((s) => s.id === r.id)).map((r) => `${r.claude_name}.md`).sort();
    expect(written).toEqual(expected);
    for (const r of catalog.roles) {
      if (r.claude_name !== null && loadProfile(CATALOG, r.id) === null) expect(written).not.toContain(`${r.claude_name}.md`);
    }
  });
});

// ---------------------------------------------------------------------------
// The Prior render, on a fixture and on the live catalog
// ---------------------------------------------------------------------------

type State = "supported" | "planned" | "unsupported";

function fixtureEntry(id: string, kind: CatalogEntry["kind"], profile: string, prior: State, requires: string[] = []): CatalogEntry {
  return {
    id,
    kind,
    profile,
    class: requires.includes("host.question.v1") ? "asks" : "plain",
    arguments: { items: [{ name: "task", kind: "first-message", required: true }] },
    requires,
    support: { "claude-code": "supported", prior },
  };
}

/**
 * A fusion tree in a temp directory: `rules/`, the Claude files the entries
 * name (`agents/alpha.md`, `skills/note/SKILL.md`, `skills/later/SKILL.md`)
 * and a v2 catalog. Roles: alpha supported with parts, beta planned and
 * gamma supported with parts listed and none written, delta unsupported.
 * Entries: the agent `alpha` on its role's profile, the skill `note`
 * supported on `skill-note` whose prior part names one entry service, the
 * skill `later` planned with no profile.
 */
function writeFixture(): { catalogDir: string; fusionRoot: string } {
  const fusionRoot = tmp("fixture-fusion");
  const catalogDir = join(fusionRoot, "catalog");
  mkdirSync(join(fusionRoot, "rules"), { recursive: true });
  writeFileSync(join(fusionRoot, "rules", "user-facing-output.md"), "# Rule\n\nBe terse.\n");
  mkdirSync(join(fusionRoot, "agents"), { recursive: true });
  writeFileSync(join(fusionRoot, "agents", "alpha.md"), "---\nname: alpha\n---\n# Alpha\n\nDo the task.\n");
  for (const skill of ["note", "later"]) {
    mkdirSync(join(fusionRoot, "skills", skill), { recursive: true });
    writeFileSync(join(fusionRoot, "skills", skill, "SKILL.md"), `---\nname: ${skill}\n---\n`);
  }
  const role = (id: string, prior: State, claude: string | null = null): CatalogRole => ({
    id,
    claude_name: claude,
    prior_ids: [id],
    aliases: [],
    support: { "claude-code": claude === null ? "unsupported" : "supported", prior },
  });
  const fixture: Catalog = {
    schema: CATALOG_SCHEMA,
    roles: [role("alpha", "supported", "alpha"), role("beta", "planned"), role("gamma", "supported"), role("delta", "unsupported")],
    entries: [
      fixtureEntry("alpha", "agent", "alpha", "supported"),
      fixtureEntry("note", "skill", "skill-note", "supported", ["host.question.v1"]),
      fixtureEntry("later", "skill", "skill-later", "planned"),
    ],
  };
  mkdirSync(catalogDir, { recursive: true });
  writeFileSync(join(catalogDir, "catalog.json"), `${JSON.stringify(fixture, null, 2)}\n`);
  const profile = (id: string, parts: Profile["parts"]): Profile => ({
    id,
    parts,
    input_schema: "schemas/x-request.v1.json",
    result_schema: "schemas/x-result.v1.json",
    tools_ceiling: ["read"],
    may_delegate: false,
    writes_workbench: { "claude-code": false, prior: false },
    execution_policy: { "claude-code": "claude-guided", prior: "prior-enforced" },
  });
  const put = (id: string, p: Profile, files: Record<string, string>) => {
    mkdirSync(join(catalogDir, "profiles", id, "parts"), { recursive: true });
    writeFileSync(join(catalogDir, "profiles", id, "profile.json"), `${JSON.stringify(p, null, 2)}\n`);
    for (const [name, text] of Object.entries(files)) writeFileSync(join(catalogDir, "profiles", id, "parts", name), text);
  };
  put(
    "alpha",
    profile("alpha", [
      { file: "parts/01-claude.md", tag: "claude" },
      { file: "parts/01-prior.md", tag: "prior" },
      { file: "parts/02-neutral.md", tag: "neutral" },
    ]),
    {
      "01-claude.md": "---\nname: alpha\n---\n",
      "01-prior.md": "## Setup\n\n{{include rules/user-facing-output.md}}\n",
      "02-neutral.md": "# Alpha\n\nDo the task.\n",
    },
  );
  // beta: planned, parts listed, none written. gamma: supported, the same.
  put("beta", profile("beta", [{ file: "parts/01-neutral.md", tag: "neutral" }]), {});
  put("gamma", profile("gamma", [{ file: "parts/01-neutral.md", tag: "neutral" }]), {});
  put(
    "skill-note",
    profile("skill-note", [
      { file: "parts/01-neutral.md", tag: "neutral" },
      { file: "parts/02-prior.md", tag: "prior" },
    ]),
    {
      "01-neutral.md": "# Note\n\nAppend the note.\n",
      "02-prior.md": "When the content reads as both, ask through host.question.v1.\n",
    },
  );
  return { catalogDir, fusionRoot };
}

describe("render prior (fixture)", () => {
  const { catalogDir, fusionRoot } = writeFixture();
  const out = tmp("prior-fixture");
  const commit = "0123456789abcdef0123456789abcdef01234567";
  const result = renderPrior(catalogDir, out, { fusionRoot, commit });

  it("resolves the include to the file's bytes under a provenance line, so the text has no runtime include", () => {
    const md = readFileSync(join(out, "profiles", "alpha.md"), "utf8");
    const rule = readFileSync(join(fusionRoot, "rules", "user-facing-output.md"));
    expect(md).toBe(`## Setup\n\n${provenanceLine("rules/user-facing-output.md", commit, rule)}\n\n# Rule\n\nBe terse.\n# Alpha\n\nDo the task.\n`);
    expect(md).not.toMatch(/\{\{/);
    expect(md).toMatch(/sha256:[0-9a-f]{64}\)/);
    expect(md).not.toContain("name: alpha");
  });

  it("writes the profile JSON with exactly Prior's seven keys, parts dropped, in struct order", () => {
    const json = readJson<Record<string, unknown>>(join(out, "profiles", "alpha.json"));
    expect(keysOf(json)).toEqual([...PRIOR_PROFILE_KEYS]);
    expect(json).not.toHaveProperty("parts");
    expect(keysOf(json.writes_workbench).sort()).toEqual([...PRIOR_HOSTS].sort());
    expect(keysOf(json.execution_policy).sort()).toEqual([...PRIOR_HOSTS].sort());
  });

  it("writes nothing for a planned profile without parts and reports it; a supported one without parts is missing", () => {
    expect(readdirSync(join(out, "profiles")).sort()).toEqual(["alpha.json", "alpha.md", "skill-note.json", "skill-note.md"]);
    expect(result.skipped).toEqual([
      { id: "beta", reason: "parts listed, none written yet" },
      { id: "skill-later", reason: "no profile" },
    ]);
    expect(result.missing).toEqual([{ id: "gamma", reason: "parts listed, none written yet" }]);
    expect(result.written.sort()).toEqual(["catalog.json", "profiles/alpha.json", "profiles/alpha.md", "profiles/skill-note.json", "profiles/skill-note.md"]);
  });

  it("renders an entry's profile from its neutral and prior parts, and a profile an entry shares with its role once", () => {
    expect(readFileSync(join(out, "profiles", "skill-note.md"), "utf8")).toBe("# Note\n\nAppend the note.\nWhen the content reads as both, ask through host.question.v1.\n");
    expect(keysOf(readJson(join(out, "profiles", "skill-note.json")))).toEqual([...PRIOR_PROFILE_KEYS]);
    expect(result.written.filter((w) => w === "profiles/alpha.md")).toHaveLength(1);
  });

  it("copies catalog.json byte for byte, states carried through unchanged", () => {
    expect(readFileSync(join(out, "catalog.json")).equals(readFileSync(join(catalogDir, "catalog.json")))).toBe(true);
    const copied = readJson<Catalog>(join(out, "catalog.json"));
    expect(copied.roles.map((r) => [r.id, r.support.prior])).toEqual([
      ["alpha", "supported"],
      ["beta", "planned"],
      ["gamma", "supported"],
      ["delta", "unsupported"],
    ]);
  });

  it("refuses a directive line in a neutral part, an include outside rules/, and a missing include target", () => {
    const bad = (partText: string, tag: "neutral" | "prior") => {
      const dir = tmp("prior-bad");
      // The role alone ships alpha here: the entry's prior-part rule is
      // checkEntries' case, not this one's.
      const c = readJson<Catalog>(join(catalogDir, "catalog.json"));
      c.entries[0].support.prior = "unsupported";
      writeFileSync(join(dir, "catalog.json"), JSON.stringify(c));
      mkdirSync(join(dir, "profiles", "alpha", "parts"), { recursive: true });
      const p = readJson<Profile>(join(catalogDir, "profiles", "alpha", "profile.json"));
      p.parts = [{ file: "parts/01.md", tag }];
      writeFileSync(join(dir, "profiles", "alpha", "profile.json"), JSON.stringify(p));
      writeFileSync(join(dir, "profiles", "alpha", "parts", "01.md"), partText);
      return () => renderPrior(dir, tmp("prior-bad-out"), { fusionRoot, commit });
    };
    expect(bad("{{include rules/user-facing-output.md}}\n", "neutral")).toThrow(/neutral part carries a directive/);
    // A `{{` inside a sentence is not a directive: the committed reviewer
    // prompt carries `{{.X}}` as a template example, and that renders.
    expect(bad("no literal `{{.X}}` leaks\n", "neutral")).not.toThrow();
    expect(bad("{{include ../secret.md}}\n", "prior")).toThrow(/outside the rule corpus/);
    expect(bad("{{include rules/absent.md}}\n", "prior")).toThrow(/include target missing/);
    expect(bad("{{other}}\n", "prior")).toThrow(/unresolved directive/);
  });

  it("refuses a profile with some of its parts", () => {
    const dir = tmp("prior-partial");
    writeFileSync(join(dir, "catalog.json"), readFileSync(join(catalogDir, "catalog.json")));
    mkdirSync(join(dir, "profiles", "alpha", "parts"), { recursive: true });
    writeFileSync(join(dir, "profiles", "alpha", "profile.json"), readFileSync(join(catalogDir, "profiles", "alpha", "profile.json")));
    writeFileSync(join(dir, "profiles", "alpha", "parts", "02-neutral.md"), "only this one\n");
    expect(() => renderPrior(dir, tmp("prior-partial-out"), { fusionRoot, commit })).toThrow(/parts partly absent/);
  });
});

// ---------------------------------------------------------------------------
// Entries, on fixture catalogs: the document check against the shared decode
// table the Go decoder runs too, and the invariants that need a fusion tree
// ---------------------------------------------------------------------------

interface DecodeCase {
  name: string;
  valid: boolean;
  document: unknown;
}

describe("catalog entries (fixture)", () => {
  const table = readJson<{ schema: string; cases: DecodeCase[] }>(join(CATALOG, "testdata", "catalog-decode-cases.v2.json"));

  it("the shared decode table is a fusion.catalog-cases/v1 table with unique names and both verdicts", () => {
    expect(table.schema).toBe("fusion.catalog-cases/v1");
    const names = table.cases.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(table.cases.some((c) => c.valid)).toBe(true);
    expect(table.cases.some((c) => !c.valid)).toBe(true);
  });

  for (const c of table.cases) {
    it(`decode case: ${c.name} is ${c.valid ? "accepted" : "refused"}`, () => {
      if (c.valid) expect(() => checkCatalogDocument(c.document)).not.toThrow();
      else expect(() => checkCatalogDocument(c.document)).toThrow(RenderError);
    });
  }

  it("loadCatalog refuses a fusion.catalog/v1 document, and one without entries", () => {
    const dir = tmp("v1");
    writeFileSync(join(dir, "catalog.json"), JSON.stringify({ schema: "fusion.catalog/v1", roles: [] }));
    expect(() => loadCatalog(dir)).toThrow(/not a fusion\.catalog\/v2 document/);
    writeFileSync(join(dir, "catalog.json"), JSON.stringify({ schema: CATALOG_SCHEMA, roles: [] }));
    expect(() => loadCatalog(dir)).toThrow(/not a fusion\.catalog\/v2 document/);
  });

  it("priorProfiles names each profile once, roles first, supported when any referrer is, unsupported ones left out", () => {
    const c = readJson<Catalog>(join(writeFixture().catalogDir, "catalog.json"));
    expect(priorProfiles(c)).toEqual([
      { id: "alpha", state: "supported" },
      { id: "beta", state: "planned" },
      { id: "gamma", state: "supported" },
      { id: "skill-note", state: "supported" },
      { id: "skill-later", state: "planned" },
    ]);
    c.roles[0].support.prior = "planned";
    c.entries[2].profile = "beta";
    c.entries[2].support.prior = "supported";
    c.entries[1].support.prior = "unsupported";
    expect(priorProfiles(c)).toEqual([
      { id: "alpha", state: "supported" },
      { id: "beta", state: "supported" },
      { id: "gamma", state: "supported" },
    ]);
  });

  describe("checkEntries", () => {
    const fixture = () => {
      const f = writeFixture();
      return { ...f, catalog: readJson<Catalog>(join(f.catalogDir, "catalog.json")) };
    };

    it("accepts the fixture: an agent, a supported skill whose prior part names its requires, a planned skill with no profile", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).not.toThrow();
    });

    it("refuses an id that is neither a Claude agent nor a skill directory", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      catalog.entries.push(fixtureEntry("ghost", "skill", "skill-ghost", "unsupported"));
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry ghost: kind skill, but agents\/ghost\.md is absent and skills\/ghost\/SKILL\.md is absent/);
    });

    it("refuses a kind that does not match the file: agent for a skill, skill for an agent", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      catalog.entries[1].kind = "agent";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry note: kind agent/);
      catalog.entries[1].kind = "skill";
      catalog.entries[0].kind = "skill";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry alpha: kind skill/);
    });

    it("refuses an id that is both an agent and a skill, whichever kind it states", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      writeFileSync(join(fusionRoot, "agents", "note.md"), "# Note\n");
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry note: kind skill, but agents\/note\.md exists and skills\/note\/SKILL\.md exists/);
      catalog.entries[1].kind = "agent";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry note: kind agent/);
    });

    it("refuses a supported entry whose profile has parts and no prior part", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      const path = join(catalogDir, "profiles", "skill-note", "profile.json");
      const p = readJson<Profile>(path);
      p.parts = p.parts.filter((part) => part.tag !== "prior");
      writeFileSync(path, JSON.stringify(p));
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry note: supported on prior, and profile skill-note has no prior part/);
      catalog.entries[1].support.prior = "planned";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).not.toThrow();
    });

    it("refuses a supported entry whose requires differ from the services its prior parts name, either way", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      catalog.entries[1].requires = [];
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/entry note: requires nothing, and the prior parts of skill-note name host\.question\.v1/);
      catalog.entries[1].requires = ["host.exec.v1", "host.question.v1"];
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).toThrow(/requires host\.question\.v1,host\.exec\.v1, and the prior parts of skill-note name host\.question\.v1$/);
      // A planned entry declares what its future text will need; nothing reads it yet.
      catalog.entries[1].support.prior = "planned";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).not.toThrow();
    });

    it("leaves a supported entry with no profile to renderPrior, which reports it missing", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      catalog.entries[2].support.prior = "supported";
      expect(() => checkEntries(catalog, catalogDir, fusionRoot)).not.toThrow();
      writeFileSync(join(catalogDir, "catalog.json"), JSON.stringify(catalog));
      const r = renderPrior(catalogDir, tmp("prior-entry-missing"), { fusionRoot, commit: "0".repeat(40) });
      expect(r.missing).toContainEqual({ id: "skill-later", reason: "no profile" });
    });

    it("renderPrior runs both checks before writing anything", () => {
      const { catalog, catalogDir, fusionRoot } = fixture();
      const out = tmp("prior-entry-refused");
      writeFileSync(join(catalogDir, "catalog.json"), JSON.stringify({ ...catalog, entries: [{ ...catalog.entries[0], start: "x" }] }));
      expect(() => renderPrior(catalogDir, out, { fusionRoot, commit: "0".repeat(40) })).toThrow(/entry alpha keys are not/);
      catalog.entries[1].requires = [];
      writeFileSync(join(catalogDir, "catalog.json"), JSON.stringify(catalog));
      expect(() => renderPrior(catalogDir, out, { fusionRoot, commit: "0".repeat(40) })).toThrow(/entry note: requires nothing/);
      expect(readdirSync(out)).toEqual([]);
    });
  });
});

describeLive("render prior (live catalog)", (catalog) => {
  const out = tmp("prior-live");
  const commit = fusionCommit(FUSION);
  const result = renderPrior(CATALOG, out);

  it("names HEAD as the fusion commit of every inlined rule", () => {
    expect(commit).toMatch(/^[0-9a-f]{40}$/);
    for (const file of result.written.filter((w) => w.endsWith(".md"))) {
      const md = readFileSync(join(out, file), "utf8");
      for (const line of md.split("\n").filter((l) => l.startsWith("Included from fusion: "))) {
        expect(line).toContain(`(commit ${commit}, sha256:`);
      }
    }
  });

  // The inlined rule file is Claude Code's own text, carried with its bytes
  // preserved and its provenance hashed (Prior answer 67.2 (iv)), so it names
  // Claude surfaces by their names. The token lint reads the overlay around
  // it: what the overlay says about those surfaces is the prior part's job.
  const inlined = partsOf("prior").flatMap((p) =>
    readFileSync(p.path, "utf8")
      .split("\n")
      .map((line) => INCLUDE_DIRECTIVE.exec(line)?.[1].trim())
      .filter((path): path is string => path !== undefined)
      .map((path) => readFileSync(join(FUSION, path), "utf8").replace(/\n$/, "")),
  );

  it("no rendered profile carries a Claude token outside an inlined rule, or an unresolved include", () => {
    for (const file of result.written.filter((w) => w.endsWith(".md"))) {
      const md = readFileSync(join(out, file), "utf8");
      let overlay = md;
      for (const body of inlined) overlay = overlay.split(body).join("");
      expect(tokenHits(overlay), file).toEqual([]);
      expect(md, file).not.toMatch(/\{\{include/);
    }
  });

  it("every rendered profile JSON has exactly Prior's key set, and catalog.json is the source's bytes", () => {
    for (const file of result.written.filter((w) => w.endsWith(".json") && w !== "catalog.json")) {
      expect(keysOf(readJson(join(out, file))), file).toEqual([...PRIOR_PROFILE_KEYS]);
    }
    expect(readFileSync(join(out, "catalog.json")).equals(readFileSync(join(CATALOG, "catalog.json")))).toBe(true);
  });

  it("writes nothing for a planned profile without parts, and never a placeholder", () => {
    const states = new Map(priorProfiles(catalog).map((p) => [p.id, p.state]));
    for (const s of result.skipped) {
      expect(states.get(s.id)).toBe("planned");
      expect(existsSync(join(out, "profiles", `${s.id}.md`))).toBe(false);
      expect(existsSync(join(out, "profiles", `${s.id}.json`))).toBe(false);
    }
  });

  it("every supported role and entry profile renders (Prior refuses a bundle whose supported role has no text)", () => {
    expect(result.missing, "supported profiles without parts").toEqual([]);
  });
});
