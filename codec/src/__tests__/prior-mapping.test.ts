// ---------------------------------------------------------------------------
// The Prior round-trip suite.
//
// Every case under `fixtures/prior/<register|plan|campaign>/<case>/` holds a
// `prior.json` (the Go aggregate as encoding/json writes it, plus underscore
// keys that are not Go fields: `_provenance`, `_provenance_note`, `_inputs`)
// and a `fusion.json` (what the import produced). For each case the suite
// proves, in this order: the import equals fusion.json; the import validates
// against the schemas inside a minimal envelope; export(import(prior)) equals
// prior after canonical re-serialisation, both structurally and as Go bytes;
// the revision recomputed from the exported aggregate equals the stored one
// (a `Form`-only plan stores none, and there the suite asserts the empty
// revision rather than computing one), as do every evidence hash, snapshot
// hash and charter hash; and, with CODEC_REQUIRE_GOLDENS=1, that the fixture
// is a Go-emitted golden.
//
// `fusion.json` is a GOLDEN written by this suite: `UPDATE_PRIOR_FIXTURES=1`
// rewrites each one from import(prior) in the serialisation below (two-space
// indent, LF, a final newline, `_provenance` first) and then asserts the
// same; an ordinary run compares the bytes and a difference fails, naming the
// case and the variable. `prior.json` is Prior's and never written here.
//
// The coverage assertion walks every prior.json by its Go type and proves
// that every `prior_key` in `contract/prior-mapping.json` occurs in at least
// one fixture, and that every Go field the serialiser knows has a row.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exportCampaignState, importCampaignState } from "../prior/campaign.js";
import { exportRegister, importRegister } from "../prior/candidates.js";
import { priorMapping, proposedPackageStatus } from "../prior/common.js";
import {
  GO_STRUCTS,
  GoMarshalError,
  computeCharterHash,
  computeEvidenceHash,
  computePriorRevision,
  computeSnapshotHash,
  goMarshal,
  goStructType,
  priorAggregateKind,
  walkGoFields,
  type PriorAggregateKind,
} from "../prior/gojson.js";
import { exportPlan, importPlan } from "../prior/packages.js";
import type { PriorCampaignState, PriorCandidate, PriorPlan, PriorRegister, PriorSnapshot } from "../prior/types.js";
import { strictParse } from "../strict-json.js";
import { validate } from "../validate.js";

const PRIOR_DIR = fileURLToPath(new URL("../../fixtures/prior/", import.meta.url));
const AGGREGATES: Array<[string, PriorAggregateKind]> = [
  ["register", "candidates.Register"],
  ["plan", "packages.Plan"],
  ["campaign", "campaign.State"],
];
const REQUIRE_GOLDENS = process.env["CODEC_REQUIRE_GOLDENS"] === "1";
const UPDATE_FIXTURES = process.env["UPDATE_PRIOR_FIXTURES"] === "1";

/** The `_provenance` line a fusion.json carries: which importer produced it. */
const FUSION_PROVENANCE: Record<PriorAggregateKind, string> = {
  "candidates.Register": "import of prior.json by codec/src/prior/candidates.ts importRegister",
  "packages.Plan": "import of prior.json by codec/src/prior/packages.ts importPlan",
  "campaign.State": "import of prior.json by codec/src/prior/campaign.ts importCampaignState",
};

/** The bytes a fusion.json is written as; the importer's own key order, which is deterministic. */
function serialiseFusion(kind: PriorAggregateKind, imported: Record<string, unknown>): string {
  return JSON.stringify({ _provenance: FUSION_PROVENANCE[kind], ...imported }, null, 2) + "\n";
}

// --- reading a case -----------------------------------------------------------

interface Case {
  aggregate: string;
  kind: PriorAggregateKind;
  name: string;
  dir: string;
  priorFile: string;
  fusionFile: string;
  provenance: string;
  /** The Go aggregate: prior.json without its underscore keys. */
  prior: Record<string, unknown>;
  /** The call inputs Prior does not persist, when the case carries them. */
  inputs: Record<string, unknown>;
  fusion: Record<string, unknown>;
}

function readStrict(file: string): Record<string, unknown> {
  const r = strictParse(readFileSync(file));
  if (!r.ok) throw new Error(`${file}: ${r.reason}: ${r.detail}`);
  return r.value as Record<string, unknown>;
}

function readCases(): Case[] {
  const out: Case[] = [];
  for (const [aggregate, kind] of AGGREGATES) {
    const dir = join(PRIOR_DIR, aggregate);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      const caseDir = join(dir, name);
      const priorFile = join(caseDir, "prior.json");
      const raw = readStrict(priorFile);
      const provenance = raw["_provenance"];
      if (typeof provenance !== "string") throw new Error(`${priorFile}: no string _provenance`);
      const prior: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(raw)) if (!k.startsWith("_")) prior[k] = v;
      const inputs = (raw["_inputs"] ?? {}) as Record<string, unknown>;
      const fusionFile = join(caseDir, "fusion.json");
      // Under the writer a missing fusion.json is written by the case below, not a read error here.
      const fusionRaw = existsSync(fusionFile) || !UPDATE_FIXTURES ? readStrict(fusionFile) : {};
      const fusion: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fusionRaw)) if (!k.startsWith("_")) fusion[k] = v;
      out.push({ aggregate, kind, name, dir: caseDir, priorFile, fusionFile, provenance, prior, inputs, fusion });
    }
  }
  return out;
}

const cases = readCases();

/** Import and export for one aggregate, so the case loop below is one loop. */
function roundTrip(c: Case): { imported: Record<string, unknown>; exported: Record<string, unknown>; exportedInputs: Record<string, unknown> } {
  const must = <T>(r: { ok: true; value: T } | { ok: false; class: string; path: string; reason: string }): T => {
    if (!r.ok) throw new Error(`${c.aggregate}/${c.name}: ${r.class} at ${r.path}: ${r.reason}`);
    return r.value;
  };
  switch (c.kind) {
    case "candidates.Register": {
      const workItems = c.inputs["WorkItems"];
      const imported = must(
        importRegister(c.prior as unknown as PriorRegister, {
          policy: (c.inputs["Policy"] as never) ?? null,
          snapshot: (c.inputs["Snapshot"] as never) ?? null,
          workItems: Array.isArray(workItems) ? new Set(workItems as string[]) : undefined,
        }),
      );
      const e = must(exportRegister(imported));
      const exportedInputs: Record<string, unknown> = {};
      if (e.policy !== null) exportedInputs["Policy"] = e.policy;
      if (e.snapshot !== null) exportedInputs["Snapshot"] = e.snapshot;
      if (Array.isArray(workItems)) exportedInputs["WorkItems"] = workItems;
      return { imported: imported as unknown as Record<string, unknown>, exported: e.register as unknown as Record<string, unknown>, exportedInputs };
    }
    case "packages.Plan": {
      const workItems = c.inputs["WorkItems"];
      const imported = must(
        importPlan(c.prior as unknown as PriorPlan, {
          policy: (c.inputs["FormationPolicy"] as never) ?? null,
          workItems: Array.isArray(workItems) ? new Set(workItems as string[]) : undefined,
        }),
      );
      const e = must(exportPlan(imported));
      const exportedInputs: Record<string, unknown> = {};
      if (e.policy !== null) exportedInputs["FormationPolicy"] = e.policy;
      if (Array.isArray(workItems)) exportedInputs["WorkItems"] = workItems;
      return { imported: imported as unknown as Record<string, unknown>, exported: e.plan as unknown as Record<string, unknown>, exportedInputs };
    }
    case "campaign.State": {
      const imported = must(
        importCampaignState(c.prior as unknown as PriorCampaignState, { completionEvidence: (c.inputs["CompletionEvidence"] as never) ?? null }),
      );
      const e = must(exportCampaignState(imported));
      const exportedInputs: Record<string, unknown> = {};
      if (e.completionEvidence !== null) exportedInputs["CompletionEvidence"] = e.completionEvidence;
      return { imported: imported as unknown as Record<string, unknown>, exported: e.state as unknown as Record<string, unknown>, exportedInputs };
    }
  }
}

// --- the validation envelope ---------------------------------------------------

const WORKBENCH_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const backup = (name: string) => ({ path: `archive/migrations/migration-20260928-prior/${name}.json`, sha256: "sha256:" + "0".repeat(64), kind: "json" });

/** A charter and state to host a register or formation block: the discard case's own import. */
function hostCampaign(): { charter: unknown; state: unknown } {
  const host = cases.find((c) => c.kind === "campaign.State");
  if (host === undefined) throw new Error("no campaign fixture to host a register or formation block");
  return { charter: host.fusion["charter"], state: host.fusion["state"] };
}

function campaignRecord(fields: Record<string, unknown>, provenance: Record<string, unknown>): Record<string, unknown> {
  return {
    schema: "fusion.campaign/v1",
    id: uuid(1),
    workbench_id: WORKBENCH_ID,
    ...hostCampaign(),
    register: null,
    formation: null,
    ...fields,
    provenance: { ...provenance, backup: backup("campaign") },
    extensions: {},
  };
}

function issueRecord(n: number, candidate: unknown, provenance: Record<string, unknown>): Record<string, unknown> {
  return {
    schema: "fusion.record/v1",
    id: uuid(100 + n),
    workbench_id: WORKBENCH_ID,
    kind: "issue",
    narrative: { path: `shared/issues/260928-1200_o_candidate-${n}.md` },
    filed_by: { actor: "user", person: null },
    references: [],
    provenance: { ...provenance, backup: backup(`candidate-${n}`) },
    extensions: {},
    control: { state: "open", disposition: null, candidate },
  };
}

function expectValid(schema: string, value: unknown, what: string): void {
  const r = validate(schema, value);
  expect(r, `${what}: ${JSON.stringify(r, null, 2)}`).toEqual({ ok: true });
}

// --- the cases ----------------------------------------------------------------

describe("fixtures/prior round trips", () => {
  it("has the cases plan FJ00 step 9 names", () => {
    expect(cases.length).toBeGreaterThanOrEqual(9);
    const names = cases.map((c) => `${c.aggregate}/${c.name}`);
    for (const needed of [
      "register/duplicate-intake-and-source-change-require-requalification",
      "register/frozen-selection-replays-explanation-and-stale-prevents-admission",
      "register/admission-persists-stable-item-and-current-attempt",
      "register/merge-chains-resolve-and-cycles-rollback",
      "register/policy-records-every-exclusion-reason-and-closed-watermark",
      "plan/adaptive-formation-records-merge-split-and-deferral",
      "plan/admission-crash-requires-observation-before-dispatch",
      "plan/dependency-cycle-is-deferred",
      "plan/failed-package-does-not-block-unrelated-package",
    ]) {
      expect(names).toContain(needed);
    }
    console.log(`fixtures/prior: ${cases.length} round-trip cases (${AGGREGATES.map(([a]) => `${a} ${cases.filter((c) => c.aggregate === a).length}`).join(", ")})`);
  });

  for (const c of cases) {
    describe(`${c.aggregate}/${c.name}`, () => {
      it("is the aggregate its directory says", () => {
        expect(priorAggregateKind(c.prior)).toBe(c.kind);
      });

      it("imports to exactly fusion.json (UPDATE_PRIOR_FIXTURES=1 rewrites it)", () => {
        const { imported } = roundTrip(c);
        expect((imported["provenance"] as { source: string }).source).toBe("imported");
        const fresh = serialiseFusion(c.kind, imported);
        const differs = `${c.aggregate}/${c.name}: fusion.json differs from import(prior.json). If the mapping changed on purpose, regenerate with UPDATE_PRIOR_FIXTURES=1 and commit the file.`;
        if (UPDATE_FIXTURES) writeFileSync(c.fusionFile, fresh);
        else expect(imported, differs).toEqual(c.fusion); // the structural diff first: it reads better than a byte diff
        expect(readFileSync(c.fusionFile, "utf-8"), differs).toBe(fresh);
      });

      it("validates against the schemas through validate()", () => {
        const { imported } = roundTrip(c);
        const provenance = imported["provenance"] as Record<string, unknown>;
        switch (c.kind) {
          case "candidates.Register": {
            expectValid("urn:fusion:schema:fusion.campaign/v1", campaignRecord({ register: imported["register"] }, provenance), "campaign with register");
            const candidates = imported["candidates"] as Array<{ candidate: unknown; provenance: Record<string, unknown> }>;
            candidates.forEach((cand, i) => {
              expectValid("urn:fusion:schema:fusion.record/v1", issueRecord(i, cand.candidate, cand.provenance), `issue ${i}`);
            });
            break;
          }
          case "packages.Plan":
            expectValid("urn:fusion:schema:fusion.campaign/v1", campaignRecord({ formation: imported["formation"] }, provenance), "campaign with formation");
            break;
          case "campaign.State":
            expectValid(
              "urn:fusion:schema:fusion.campaign/v1",
              campaignRecord({ charter: imported["charter"], state: imported["state"] }, provenance),
              "campaign",
            );
        }
      });

      it("export(import(prior)) equals prior after canonical re-serialisation", () => {
        const { exported, exportedInputs } = roundTrip(c);
        expect(exported).toEqual(c.prior);
        expect(goMarshal(exported, goStructType(c.kind))).toBe(goMarshal(c.prior, goStructType(c.kind)));
        expect(exportedInputs).toEqual(c.inputs);
      });

      it("the recomputed revision and hashes equal the stored ones", () => {
        const { imported, exported } = roundTrip(c);
        const stored = c.prior["Revision"];
        if (stored === "") {
          // A plan that only `Form` produced carries no revision yet: nothing to recompute, and never one to invent.
          expect(c.kind).toBe("packages.Plan");
          expect((imported["formation"] as { revision: unknown }).revision).toBeNull();
          expect(exported["Revision"]).toBe("");
        } else {
          expect(computePriorRevision(exported as never)).toBe(stored);
        }
        if (c.kind === "candidates.Register") {
          const snapshot = c.inputs["Snapshot"] as PriorSnapshot | undefined;
          for (const [id, cand] of Object.entries((c.prior["Candidates"] as Record<string, PriorCandidate>) ?? {})) {
            if (cand.Qualification !== null) {
              expect(computeEvidenceHash(cand), `EvidenceHash of ${id}`).toBe(cand.Qualification.EvidenceHash);
            }
            if (cand.Disposition !== null && cand.Disposition.SnapshotHash !== "") {
              expect(snapshot, `${id} carries a SnapshotHash, so _inputs.Snapshot must say what was hashed`).toBeDefined();
              expect(computeSnapshotHash(snapshot as PriorSnapshot), `SnapshotHash of ${id}`).toBe(cand.Disposition.SnapshotHash);
            }
          }
        }
        if (c.kind === "campaign.State") {
          const s = c.prior as unknown as PriorCampaignState;
          expect(computeCharterHash(s.Charter)).toBe(s.CharterHash);
        }
      });

      it.skipIf(!REQUIRE_GOLDENS)("is a Go-emitted golden (CODEC_REQUIRE_GOLDENS=1)", () => {
        if (c.provenance.startsWith("derived-from-source")) {
          throw new Error(`${c.priorFile}: still "${c.provenance}"; a golden emitted by Prior's Go code is required`);
        }
      });
    });
  }

  it("every derived fixture is stamped with the Prior commit it was derived from", () => {
    for (const c of cases) {
      expect(c.provenance, c.priorFile).toMatch(/^(derived-from-source@[0-9a-f]{7,40}|go-golden@[0-9a-f]{7,40})/);
    }
    const derived = cases.filter((c) => c.provenance.startsWith("derived-from-source")).length;
    console.log(`fixtures/prior: ${derived} derived-from-source, ${cases.length - derived} Go-emitted golden(s)`);
  });
});

// --- coverage of contract/prior-mapping.json ---------------------------------

describe("contract/prior-mapping.json coverage", () => {
  const rows = priorMapping().rows;
  const rowKeys = new Set(rows.map((r) => `${r.aggregate}.${r.prior_key}`));

  /** Every `<struct>.<field>` some fixture (or its _inputs) carries a value for. */
  function exercised(): Set<string> {
    const seen = new Set<string>();
    const visit = (struct: string, field: string): void => {
      seen.add(`${struct}.${field}`);
    };
    const inputTypes: Record<string, string> = {
      Policy: "candidates.Policy",
      Snapshot: "candidates.Snapshot",
      FormationPolicy: "packages.FormationPolicy",
      CompletionEvidence: "campaign.CompletionEvidence",
    };
    for (const c of cases) {
      walkGoFields(c.prior, goStructType(c.kind), visit);
      for (const [name, value] of Object.entries(c.inputs)) {
        const type = inputTypes[name];
        if (type !== undefined) walkGoFields(value, goStructType(type), visit);
      }
    }
    return seen;
  }

  it("the table has 163 field rows and 7 state rows, none confirmed yet", () => {
    expect(rows).toHaveLength(163);
    expect(priorMapping().state_mapping.rows).toHaveLength(7);
    expect(rows.every((r) => r.confirmed === false)).toBe(true);
  });

  it("every prior_key is exercised by at least one fixture", () => {
    const seen = exercised();
    const missing = [...rowKeys].filter((k) => !seen.has(k)).sort();
    expect(missing, "prior_keys no fixture exercises").toEqual([]);
    console.log(`fixtures/prior: ${rowKeys.size - missing.length} of ${rowKeys.size} prior_keys exercised`);
  });

  it("every Go field the serialiser knows has a row (the table names every field of the three aggregates)", () => {
    const missing: string[] = [];
    for (const s of GO_STRUCTS.values()) {
      if (s.name.endsWith("HashInput")) continue; // anonymous hash inputs, not persisted fields
      for (const [f] of s.fields) if (!rowKeys.has(`${s.name}.${f}`)) missing.push(`${s.name}.${f}`);
    }
    expect(missing).toEqual([]);
  });

  it("the state rows are read, not applied: every Prior package state resolves to its proposal, unconfirmed", () => {
    for (const row of priorMapping().state_mapping.rows) {
      expect(proposedPackageStatus(row.prior_value)).toEqual({ fusion_status: row.fusion_status, outcome_class: row.outcome_class, confirmed: false });
    }
    expect(proposedPackageStatus("unknown")).toBeUndefined();
  });
});

// --- refusals ----------------------------------------------------------------

function fixture<T>(aggregate: string, name: string): T {
  const c = cases.find((x) => x.aggregate === aggregate && x.name === name);
  if (c === undefined) throw new Error(`no fixture ${aggregate}/${name}`);
  return structuredClone(c.prior) as T;
}

describe("typed refusals, never defaults", () => {
  it("an unknown Package.State is schema-invalid, naming the path", () => {
    const plan = fixture<PriorPlan>("plan", "dependency-cycle-is-deferred");
    plan.Packages!["package-1"]!.State = "in-flight";
    const r = importPlan(plan);
    expect(r).toMatchObject({ ok: false, class: "schema-invalid", path: "Packages[package-1].State" });
  });

  it("a map key that differs from the entry's ID is schema-invalid", () => {
    const plan = fixture<PriorPlan>("plan", "dependency-cycle-is-deferred");
    plan.Candidates = { ...plan.Candidates, other: plan.Candidates!["a"]! };
    expect(importPlan(plan)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[other]" });
  });

  it("a WorkItemID naming no known work item is unresolved-reference", () => {
    const reg = fixture<PriorRegister>("register", "admission-persists-stable-item-and-current-attempt");
    expect(importRegister(reg, { workItems: new Set(["item-2"]) })).toMatchObject({
      ok: false,
      class: "unresolved-reference",
      path: "Candidates[c1].Disposition.WorkItemID",
    });
    expect(importRegister(reg, { workItems: new Set(["item-1"]) }).ok).toBe(true);
    expect(importRegister(reg).ok).toBe(true); // without the set the check is the caller's
  });

  it("a package member, an attempt, a deferral or an active item naming nothing is unresolved-reference", () => {
    const plan = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    plan.Packages!["package-1"]!.Members = ["ghost"];
    expect(importPlan(plan)).toMatchObject({ ok: false, class: "unresolved-reference", path: "Packages[package-1].Members[0]" });
    const plan2 = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    plan2.ActiveItems = { "item-b": "intent-9" };
    expect(importPlan(plan2)).toMatchObject({ ok: false, class: "unresolved-reference", path: "ActiveItems[item-b]" });
  });

  it("an attempt's ItemID or an active item naming no known work item is unresolved-reference", () => {
    const plan = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    // Admissions are read before ActiveItems, so the attempt naming item-b is the first refusal.
    expect(importPlan(plan, { workItems: new Set(["item-a"]) })).toMatchObject({
      ok: false,
      class: "unresolved-reference",
      path: "Admissions[intent-1].Attempts[0].ItemID",
    });
    const plan2 = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    plan2.ActiveItems = { "item-c": "intent-1" };
    expect(importPlan(plan2, { workItems: new Set(["item-a", "item-b"]) })).toMatchObject({
      ok: false,
      class: "unresolved-reference",
      path: "ActiveItems[item-c]",
    });
    expect(importPlan(plan, { workItems: new Set(["item-a", "item-b"]) }).ok).toBe(true);
    expect(importPlan(plan).ok).toBe(true); // without the set the check is the caller's
  });

  it("Version 0, an empty required string and Go's zero time are schema-invalid", () => {
    const reg = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg.Candidates!["c1"]!.Version = 0;
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Version" });
    const reg2 = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg2.Candidates!["c1"]!.Source.Watermark = "";
    expect(importRegister(reg2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Source.Watermark" });
    const reg3 = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg3.Candidates!["c1"]!.Qualification!.CheckedAt = "0001-01-01T00:00:00Z";
    expect(importRegister(reg3)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Qualification.CheckedAt" });
  });

  it("a merge target without the outcome merged, and the reverse, are schema-invalid", () => {
    const reg = fixture<PriorRegister>("register", "merge-chains-resolve-and-cycles-rollback");
    reg.Candidates!["c"]!.MergeInto = "a";
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c].MergeInto" });
  });

  it("an unknown disposition outcome or refresh policy is schema-invalid", () => {
    const reg = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg.Candidates!["c1"]!.Disposition!.Outcome = "stale";
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Disposition.Outcome" });
    const reg2 = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg2.Candidates!["c1"]!.Source.RefreshPolicy = "live";
    expect(importRegister(reg2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Source.RefreshPolicy" });
  });

  it("intake closed without a watermark, and archived without a previous terminal, are schema-invalid", () => {
    const reg = fixture<PriorRegister>("register", "admission-persists-stable-item-and-current-attempt");
    reg.ClosedWatermark = "";
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "ClosedWatermark" });
    const st = fixture<PriorCampaignState>("campaign", "revocation-amendment-and-terminal-outcomes");
    st.PreviousTerminal = "";
    expect(importCampaignState(st)).toMatchObject({ ok: false, class: "schema-invalid", path: "PreviousTerminal" });
  });

  it("an admission without a selection has no Disposition to export to", () => {
    const c = cases.find((x) => x.name === "admission-persists-stable-item-and-current-attempt");
    const imported = structuredClone(c!.fusion) as never as Parameters<typeof exportRegister>[0];
    imported.candidates[0]!.candidate.selection = null;
    expect(exportRegister(imported)).toMatchObject({ ok: false, class: "schema-invalid", path: "candidates[c1].admission" });
  });
});

// --- the serialiser against Go -----------------------------------------------

describe("gojson reproduces encoding/json", () => {
  // Expected bytes recorded from Go 1.26 `json.Marshal` over the same values
  // (candidates.Snapshot and a Reasons/CheckedAt pair), so that the string
  // escaping, the byte-wise key order, the time forms and the nil/empty
  // distinction are pinned to what Go writes, not to what JSON.stringify does.
  const U = (hex: string): string => "\\" + "u" + hex;
  const ch = (code: number): string => String.fromCharCode(code);

  it("escapes the HTML-safe set and the line separators as Go does, and keeps DEL and non-ASCII raw", () => {
    const watermark = "<a>&\"\\\n\t" + ch(0x01) + ch(0x7f) + ch(0xe9) + ch(0x2028) + "\b\f";
    const snapshot: PriorSnapshot = {
      Watermark: watermark,
      Versions: { b: 2, a: 1, [ch(0xe9)]: 3, Z: 4, aa: 5, "": 6 },
      SourceRevisions: {},
    };
    const expected =
      '{"Watermark":"' + U("003c") + "a" + U("003e") + U("0026") + '\\"\\\\\\n\\t' + U("0001") + ch(0x7f) + ch(0xe9) + U("2028") + '\\b\\f"' +
      ',"Versions":{"":6,"Z":4,"a":1,"aa":5,"b":2,"' + ch(0xe9) + '":3},"SourceRevisions":{}}';
    expect(goMarshal(snapshot, goStructType("candidates.Snapshot"))).toBe(expected);
  });

  it("writes nil as null, empty as [], and the time string verbatim", () => {
    const q = (Reasons: string[] | null, CheckedAt: string) => ({ CandidateVersion: 1, SourceRevision: "r", EvidenceHash: "h", Passed: Reasons !== null, Reasons, CheckedAt });
    expect(goMarshal(q([], "2026-09-28T12:00:00.5Z"), goStructType("candidates.Qualification"))).toBe(
      '{"CandidateVersion":1,"SourceRevision":"r","EvidenceHash":"h","Passed":true,"Reasons":[],"CheckedAt":"2026-09-28T12:00:00.5Z"}',
    );
    expect(goMarshal(q(null, "2026-09-28T12:00:00.123456789+02:00"), goStructType("candidates.Qualification"))).toBe(
      '{"CandidateVersion":1,"SourceRevision":"r","EvidenceHash":"h","Passed":false,"Reasons":null,"CheckedAt":"2026-09-28T12:00:00.123456789+02:00"}',
    );
  });

  it("refuses what Go could not have written: a missing field, a non-integer, a non-Go time, an unsafe integer", () => {
    expect(() => goMarshal({ Ref: "r" }, goStructType("candidates.Evidence"))).toThrow(GoMarshalError);
    expect(() => goMarshal({ Field: "x", Operator: "eq", Value: 1.5 }, goStructType("candidates.Predicate"))).toThrow(/integer/);
    expect(() => goMarshal({ Field: "x", Operator: "eq", Value: 2 ** 53 }, goStructType("candidates.Predicate"))).toThrow(/2\^53/);
    expect(() => goMarshal({ Field: "x", Operator: "eq", Value: 1, Extra: 1 }, goStructType("candidates.Predicate"))).toThrow(/not a field/);
    const q = { CandidateVersion: 1, SourceRevision: "r", EvidenceHash: "h", Passed: true, Reasons: [], CheckedAt: "2026-09-28 12:00" };
    expect(() => goMarshal(q, goStructType("candidates.Qualification"))).toThrow(/RFC 3339/);
  });

  it("names the aggregate by its own fields and refuses anything else", () => {
    expect(() => priorAggregateKind({ ID: "x" })).toThrow(GoMarshalError);
    expect(() => computePriorRevision({} as never)).toThrow(GoMarshalError);
  });
});
