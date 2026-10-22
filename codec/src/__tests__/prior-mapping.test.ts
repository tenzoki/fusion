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
import { emptyToNull, guarded, nonEmpty, priorMapping, proposedPackageStatus } from "../prior/common.js";
import {
  GO_STRUCTS,
  GoMarshalError,
  computeCharterHash,
  computeEvidenceHash,
  computePriorRevision,
  computeSnapshotHash,
  goMarshal,
  goQuote,
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

function campaignRecord(fields: Record<string, unknown>, provenance: object): Record<string, unknown> {
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

function issueRecord(n: number, candidate: unknown, provenance: object): Record<string, unknown> {
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

  it("the table has 163 field rows and 7 state rows, every one confirmed by Prior's ruling", () => {
    const stateRows = priorMapping().state_mapping.rows;
    expect(rows).toHaveLength(163);
    expect(stateRows).toHaveLength(7);
    const unconfirmed = [
      ...rows.filter((r) => r.confirmed !== true).map((r) => `${r.aggregate}.${r.prior_key}`),
      ...stateRows.filter((r) => r.confirmed !== true).map((r) => `state:${r.prior_value}`),
    ];
    expect(unconfirmed, "rows the ruling did not confirm").toEqual([]);
    // The ruling is pinned to the Prior commit that reviewed the table, beside the one the table was read from.
    const stamps = priorMapping() as unknown as Record<string, unknown>;
    expect(stamps["prior_review_commit"]).toBe("dbd1aa1");
    expect(stamps["prior_commit"]).toBe("12d8424");
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

  it("the state rows are read, not applied: every Prior package state resolves to its proposal, confirmed", () => {
    for (const row of priorMapping().state_mapping.rows) {
      expect(proposedPackageStatus(row.prior_value)).toEqual({ fusion_status: row.fusion_status, outcome_class: row.outcome_class, confirmed: true });
    }
    expect(proposedPackageStatus("unknown")).toBeUndefined();
    // "Not applied" is asserted over the sources, not stated: the only call of
    // proposedPackageStatus under src/prior/ is its own definition in common.ts
    // (packages.ts re-exports the name and calls nothing). Whether a fusion
    // package is created from a row is FJ04's, and no importer decides it here.
    const priorSrc = fileURLToPath(new URL("../prior/", import.meta.url));
    const calls: Record<string, number> = {};
    for (const file of readdirSync(priorSrc).filter((f) => f.endsWith(".ts")).sort()) {
      const n = readFileSync(join(priorSrc, file), "utf-8").split("proposedPackageStatus(").length - 1;
      if (n > 0) calls[file] = n;
    }
    expect(calls).toEqual({ "common.ts": 1 });
  });
});

// --- refusals ----------------------------------------------------------------

function fixture<T>(aggregate: string, name: string): T {
  const c = cases.find((x) => x.aggregate === aggregate && x.name === name);
  if (c === undefined) throw new Error(`no fixture ${aggregate}/${name}`);
  return structuredClone(c.prior) as T;
}

/**
 * Re-stamps an aggregate a test has changed, as Prior's own write would: the
 * importer recomputes `Revision` and refuses a stale one, so a case that means
 * to test something else must hand it a value Prior could have stored.
 */
function restamp<T extends PriorRegister | PriorPlan | PriorCampaignState>(aggregate: T): T {
  if (aggregate.Revision !== "") aggregate.Revision = computePriorRevision(aggregate);
  return aggregate;
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

  it("a merge target without the outcome merged is a legacy inconsistency, and the reverse is schema-invalid", () => {
    // Qualify on a merged candidate clears Disposition without clearing MergeInto (FJ00 response 2):
    // the class stays schema-invalid, the reason names it as a migration finding to reconcile.
    const reg = fixture<PriorRegister>("register", "merge-chains-resolve-and-cycles-rollback");
    reg.Candidates!["c"]!.MergeInto = "a";
    const r = importRegister(reg);
    expect(r).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c].MergeInto" });
    expect((r as { reason: string }).reason.startsWith("legacy-inconsistency:")).toBe(true);
    const reg2 = fixture<PriorRegister>("register", "merge-chains-resolve-and-cycles-rollback");
    reg2.Candidates!["a"]!.MergeInto = "";
    const r2 = importRegister(reg2);
    expect(r2).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[a].MergeInto" });
    expect((r2 as { reason: string }).reason.startsWith("legacy-inconsistency:")).toBe(false);
  });

  it("the inventory mode is returned beside the blocks: checked refuses an unknown id, carry-only carries it and says so", () => {
    const reg = fixture<PriorRegister>("register", "admission-persists-stable-item-and-current-attempt");
    const refused = importRegister(reg, { workItems: new Set(["item-2"]) });
    expect(refused).toMatchObject({ ok: false, class: "unresolved-reference", inventory: { work_items: "checked" } });
    const checked = importRegister(reg, { workItems: new Set(["item-1"]) });
    expect(checked).toMatchObject({ ok: true, inventory: { work_items: "checked" } });
    const carried = importRegister(reg);
    expect(carried).toMatchObject({ ok: true, inventory: { work_items: "carry-only" } });
    expect(carried.ok && carried.value.candidates[0]!.candidate.admission).toMatchObject({ work_item_id: "item-1" });
    // The mode is a fact about the call, never a field of the blocks: the carried value equals the checked one.
    expect(carried.ok && carried.value).toEqual(checked.ok && checked.value);

    const plan = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    expect(importPlan(plan, { workItems: new Set(["item-a"]) })).toMatchObject({ ok: false, inventory: { work_items: "checked" } });
    expect(importPlan(plan, { workItems: new Set(["item-a", "item-b"]) })).toMatchObject({ ok: true, inventory: { work_items: "checked" } });
    expect(importPlan(plan)).toMatchObject({ ok: true, inventory: { work_items: "carry-only" } });
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

// --- the input checked against GO_STRUCTS, the blocks against the schemas, the hashes recomputed ---

describe("an import refuses what its schemas refuse, with the Go path, and never throws", () => {
  const ADMITTED = "admission-persists-stable-item-and-current-attempt";
  const SELECTED = "frozen-selection-replays-explanation-and-stale-prevents-admission";
  const CAMPAIGN = "revocation-amendment-and-terminal-outcomes";
  const PLAN = "failed-package-does-not-block-unrelated-package";

  it("a candidate lacking MergeInto is refused at that field (GO_STRUCTS)", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    delete (reg.Candidates!["c1"] as Partial<PriorCandidate>).MergeInto;
    const r = importRegister(reg);
    expect(r).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].MergeInto" });
    expect((r as { reason: string }).reason).toMatch(/missing/);
  });

  it("a candidate with Source null is refused at Source, not with a TypeError (GO_STRUCTS)", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    (reg.Candidates!["c1"] as unknown as Record<string, unknown>)["Source"] = null;
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Source" });
  });

  it("a field Go does not have, a mistyped field and a mistyped side input are refused with their Go paths", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    (reg.Candidates!["c1"] as unknown as Record<string, unknown>)["Extra"] = 1;
    expect(importRegister(reg)).toMatchObject({ ok: false, path: "Candidates[c1].Extra" });
    const reg2 = fixture<PriorRegister>("register", SELECTED);
    (reg2 as unknown as Record<string, unknown>)["IntakeClosed"] = "yes";
    expect(importRegister(reg2)).toMatchObject({ ok: false, path: "IntakeClosed" });
    const plan = fixture<PriorPlan>("plan", PLAN);
    expect(importPlan(plan, { policy: { Version: "v", MaxRisk: 1, MaxValidationCost: 1, MaxSize: 1 } as never })).toMatchObject({ ok: false, path: "Policy.Budget" });
    const st = fixture<PriorCampaignState>("campaign", CAMPAIGN);
    (st.Counters as unknown as Record<string, unknown>)["Attempts"] = "3";
    expect(importCampaignState(st)).toMatchObject({ ok: false, path: "Counters.Attempts" });
  });

  it("an admitted candidate with no qualification is refused at Qualification (the candidate schema)", () => {
    const reg = fixture<PriorRegister>("register", ADMITTED);
    reg.Candidates!["c1"]!.Qualification = null;
    const r = importRegister(restamp(reg));
    expect(r).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Qualification" });
    expect((r as { reason: string }).reason).toMatch(/candidate block/);
  });

  it("an admitted candidate with no work item is refused at Disposition (the candidate schema)", () => {
    const reg = fixture<PriorRegister>("register", ADMITTED);
    reg.Candidates!["c1"]!.Disposition!.WorkItemID = "";
    reg.Candidates!["c1"]!.Disposition!.CurrentAttempt = 0;
    expect(importRegister(restamp(reg))).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Disposition" });
  });

  it("a policy-evaluated outcome without a policy version is refused at Disposition.PolicyVersion (the candidate schema)", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    reg.Candidates!["c1"]!.Disposition!.PolicyVersion = "";
    expect(importRegister(restamp(reg))).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Disposition.PolicyVersion" });
  });

  it("an admitted package carrying an accepted revision is refused at that package's field (the formation schema)", () => {
    const plan = fixture<PriorPlan>("plan", "admission-crash-requires-observation-before-dispatch");
    const [key, pkg] = Object.entries(plan.Packages ?? {}).find(([, p]) => ["formed", "admitting", "admitted"].includes(p.State)) ?? [];
    expect(pkg, "a fixture package in formed, admitting or admitted").toBeDefined();
    pkg!.AcceptedRevision = "rev-x";
    expect(importPlan(restamp(plan))).toMatchObject({ ok: false, class: "schema-invalid", path: `Packages[${key}].AcceptedRevision` });
  });

  it("a wrong CharterHash is refused (computeCharterHash)", () => {
    const st = fixture<PriorCampaignState>("campaign", CAMPAIGN);
    st.CharterHash = "0".repeat(64);
    const r = importCampaignState(restamp(st));
    expect(r).toMatchObject({ ok: false, class: "schema-invalid", path: "CharterHash" });
    expect((r as { reason: string }).reason).toContain(computeCharterHash(st.Charter));
  });

  it("a changed charter under its old CharterHash is refused", () => {
    const st = fixture<PriorCampaignState>("campaign", CAMPAIGN);
    st.Charter.Objective = st.Charter.Objective + " (amended)";
    expect(importCampaignState(restamp(st))).toMatchObject({ ok: false, path: "CharterHash" });
  });

  it("a stale Revision is refused on each aggregate (computePriorRevision)", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    reg.Candidates!["c1"]!.Severity += 1;
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Revision" });
    const plan = fixture<PriorPlan>("plan", PLAN);
    expect(plan.Revision, "the plan fixture stores a revision").not.toBe("");
    plan.RemainingBudget += 1;
    expect(importPlan(plan)).toMatchObject({ ok: false, class: "schema-invalid", path: "Revision" });
    const st = fixture<PriorCampaignState>("campaign", CAMPAIGN);
    st.Counters.Reviews += 1;
    expect(importCampaignState(st)).toMatchObject({ ok: false, class: "schema-invalid", path: "Revision" });
  });

  it("a qualification whose EvidenceHash is not evidenceHash over the candidate is refused (computeEvidenceHash)", () => {
    const reg = fixture<PriorRegister>("register", SELECTED);
    reg.Candidates!["c1"]!.Reproduction = [...(reg.Candidates!["c1"]!.Reproduction ?? []), "one more step"];
    expect(importRegister(restamp(reg))).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Qualification.EvidenceHash" });
  });

  it("nonEmpty and emptyToNull refuse a non-string with the path they are given", () => {
    expect(guarded(() => nonEmpty("Candidates[c1].ID", 7 as never))).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].ID" });
    expect(guarded(() => emptyToNull("Candidates[c1].MergeInto", undefined as never))).toMatchObject({ ok: false, path: "Candidates[c1].MergeInto" });
    expect(guarded(() => emptyToNull("Reason", null as never))).toMatchObject({ ok: false, path: "Reason" });
    expect(guarded(() => emptyToNull("Reason", ""))).toEqual({ ok: true, value: null });
  });
});

// --- the corrections Prior ruled (FJ00 response 2) ------------------------------

describe("corrections Prior ruled", () => {
  const REGISTER = "frozen-selection-replays-explanation-and-stale-prevents-admission";
  const must = <T>(r: { ok: true; value: T } | { ok: false; class: string; path: string; reason: string }): T => {
    if (!r.ok) throw new Error(`${r.class} at ${r.path}: ${r.reason}`);
    return r.value;
  };
  const goBytes = (kind: PriorAggregateKind, v: unknown): string => goMarshal(v, goStructType(kind));

  it("signed Score, Severity and EstimatedScope import, validate against record.schema.json and export the same bytes", () => {
    const reg = fixture<PriorRegister>("register", REGISTER);
    const c1 = reg.Candidates!["c1"]!;
    c1.Severity = -1;
    c1.EstimatedScope = -2;
    c1.Disposition!.Score = -3;
    const imported = must(importRegister(restamp(reg)));
    const cand = imported.candidates[0]!;
    expect(cand.candidate).toMatchObject({ severity: -1, estimated_scope: -2, selection: { score: -3 } });
    expectValid("urn:fusion:schema:fusion.record/v1", issueRecord(0, cand.candidate, cand.provenance), "signed ratings");
    const exported = must(exportRegister(imported)).register;
    expect(goBytes("candidates.Register", exported)).toBe(goBytes("candidates.Register", reg));
    // Confidence and Risk keep the bound Prior validates at intake.
    const reg2 = fixture<PriorRegister>("register", REGISTER);
    reg2.Candidates!["c1"]!.Risk = -1;
    expect(importRegister(reg2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Risk" });
  });

  it("duplicate evidence entries survive the round trip and computeEvidenceHash still equals the stored hash", () => {
    const reg = fixture<PriorRegister>("register", REGISTER);
    const c1 = reg.Candidates!["c1"]!;
    c1.Evidence = [{ ...c1.Evidence![0]! }, { ...c1.Evidence![0]! }];
    c1.Qualification!.EvidenceHash = computeEvidenceHash(c1);
    const imported = must(importRegister(restamp(reg)));
    const cand = imported.candidates[0]!;
    expect(cand.candidate.evidence).toHaveLength(2);
    expect(cand.candidate.evidence[0]).toEqual(cand.candidate.evidence[1]);
    expectValid("urn:fusion:schema:fusion.record/v1", issueRecord(0, cand.candidate, cand.provenance), "duplicate evidence");
    const exported = must(exportRegister(imported)).register;
    expect(goBytes("candidates.Register", exported)).toBe(goBytes("candidates.Register", reg));
    expect(computeEvidenceHash(exported.Candidates!["c1"]!)).toBe(c1.Qualification!.EvidenceHash);
  });

  it("an empty Evidence Ref or Revision imports as null, exports as the empty string, and a failed qualification is never promoted", () => {
    const reg = fixture<PriorRegister>("register", REGISTER);
    const c1 = reg.Candidates!["c1"]!;
    c1.Evidence = [
      { Ref: "", Revision: "rev-1" },
      { Ref: "report", Revision: "" },
    ];
    c1.Qualification!.Passed = false;
    c1.Qualification!.Reasons = ["evidence reference is empty"];
    c1.Qualification!.EvidenceHash = computeEvidenceHash(c1);
    const imported = must(importRegister(restamp(reg)));
    const cand = imported.candidates[0]!;
    expect(cand.candidate.evidence).toEqual([
      { ref: null, revision: "prior-opaque:rev-1" },
      { ref: "report", revision: null },
    ]);
    expect(cand.candidate.qualification?.passed).toBe(false);
    expectValid("urn:fusion:schema:fusion.record/v1", issueRecord(0, cand.candidate, cand.provenance), "unversioned evidence");
    const exported = must(exportRegister(imported)).register;
    const back = exported.Candidates!["c1"]!;
    expect(back.Evidence).toEqual(c1.Evidence);
    expect(back.Qualification?.Passed).toBe(false);
    expect(goBytes("candidates.Register", exported)).toBe(goBytes("candidates.Register", reg));
    expect(computeEvidenceHash(back)).toBe(c1.Qualification!.EvidenceHash);
  });

  it("a charter with a repeated ItemKinds entry round-trips with computeCharterHash equal", () => {
    const st = fixture<PriorCampaignState>("campaign", "revocation-amendment-and-terminal-outcomes");
    st.Charter.ItemKinds = [...st.Charter.ItemKinds!, st.Charter.ItemKinds![0]!];
    st.Charter.DataBoundary = ["scope", "scope"];
    st.CharterHash = computeCharterHash(st.Charter);
    const imported = must(importCampaignState(restamp(st)));
    expect(imported.charter.item_kinds).toEqual(st.Charter.ItemKinds);
    expect(imported.charter.data_boundary).toEqual(["scope", "scope"]);
    expectValid("urn:fusion:schema:fusion.campaign/v1", campaignRecord({ charter: imported.charter, state: imported.state }, imported.provenance), "charter duplicates");
    const exported = must(exportCampaignState(imported)).state;
    expect(exported.Charter).toEqual(st.Charter);
    expect(computeCharterHash(exported.Charter)).toBe(st.CharterHash);
    // Charter.Validate still requires the first three lists non-empty.
    const st2 = fixture<PriorCampaignState>("campaign", "revocation-amendment-and-terminal-outcomes");
    st2.Charter.WorkflowTemplates = [];
    expect(importCampaignState(st2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Charter.WorkflowTemplates" });
  });

  it("a package in stale with a FailureReason imports and exports", () => {
    const plan = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    const p1 = plan.Packages!["package-1"]!;
    expect(p1.State).toBe("failed");
    p1.State = "stale";
    p1.Risk = -1; // the signed formation metric, on the same package
    const imported = must(importPlan(restamp(plan)));
    const stale = imported.formation.packages.find((p) => p.id === "package-1")!;
    expect(stale).toMatchObject({ state: "stale", failure_reason: p1.FailureReason, risk: -1 });
    expectValid("urn:fusion:schema:fusion.campaign/v1", campaignRecord({ formation: imported.formation }, imported.provenance), "stale with reason");
    const exported = must(exportPlan(imported)).plan;
    expect(goBytes("packages.Plan", exported)).toBe(goBytes("packages.Plan", plan));
    // `failed` without a reason stays refused.
    const plan2 = fixture<PriorPlan>("plan", "failed-package-does-not-block-unrelated-package");
    plan2.Packages!["package-1"]!.FailureReason = "";
    expect(importPlan(plan2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Packages[package-1].FailureReason" });
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

  it("admits only the times Go writes: no trailing-zero fraction, Z rather than +00:00", () => {
    const at = (CheckedAt: string) => () =>
      goMarshal({ CandidateVersion: 1, SourceRevision: "r", EvidenceHash: "h", Passed: true, Reasons: null, CheckedAt }, goStructType("candidates.Qualification"));
    for (const refused of ["2026-09-28T00:00:00.10Z", "2026-09-28T00:00:00.0Z", "2026-09-28T00:00:00.000000000Z", "2026-09-28T00:00:00+00:00", "2026-09-28T00:00:00-00:00", "2026-09-28T00:00:00.1234567891Z"]) {
      expect(at(refused), refused).toThrow(/RFC 3339/);
    }
    for (const admitted of ["2026-09-28T00:00:00Z", "2026-09-28T00:00:00.1Z", "2026-09-28T00:00:00.000000001Z", "2026-09-28T00:00:00.105-05:30", "2026-09-28T00:00:00+02:00"]) {
      expect(at(admitted), admitted).not.toThrow();
    }
  });

  it("refuses a lone surrogate in a string or a map key, and goQuote writes one as U+FFFD", () => {
    const lone = "a" + ch(0xd800) + "b";
    expect(() => goMarshal({ Ref: lone, Revision: "r" }, goStructType("candidates.Evidence"))).toThrow(/surrogate/);
    expect(() => goMarshal({ Ref: ch(0xdc00), Revision: "r" }, goStructType("candidates.Evidence"))).toThrow(GoMarshalError);
    expect(() => goMarshal({ Watermark: "w", Versions: { [lone]: 1 }, SourceRevisions: null }, goStructType("candidates.Snapshot"))).toThrow(/surrogate/);
    expect(goQuote(lone)).toBe('"a' + ch(0xfffd) + 'b"');
    expect(goQuote(ch(0xdc00))).toBe('"' + ch(0xfffd) + '"');
    // A pair is one code point, written raw as Go writes it.
    const pair = ch(0xd83d) + ch(0xde00);
    expect(goQuote(pair)).toBe('"' + pair + '"');
    expect(goMarshal({ Ref: pair, Revision: "r" }, goStructType("candidates.Evidence"))).toBe('{"Ref":"' + pair + '","Revision":"r"}');
  });

  it("an import refuses a lone surrogate or a non-Go time with the Go path", () => {
    const reg = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg.Candidates!["c1"]!.Statement = "x" + ch(0xd800);
    expect(importRegister(reg)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Statement" });
    const reg2 = fixture<PriorRegister>("register", "frozen-selection-replays-explanation-and-stale-prevents-admission");
    reg2.Candidates!["c1"]!.Qualification!.CheckedAt = "2026-09-28T00:00:00.10Z";
    expect(importRegister(reg2)).toMatchObject({ ok: false, class: "schema-invalid", path: "Candidates[c1].Qualification.CheckedAt" });
  });

  it("names the aggregate by its own fields and refuses anything else", () => {
    expect(() => priorAggregateKind({ ID: "x" })).toThrow(GoMarshalError);
    expect(() => computePriorRevision({} as never)).toThrow(GoMarshalError);
  });
});
