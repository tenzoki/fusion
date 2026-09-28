// ---------------------------------------------------------------------------
// The transition and dependency rules, enumerated from the tables.
//
// Every state pair below is built from the table's own state list, never from
// a list written here, so the enumeration is exhaustive by construction. The
// expectation for each pair is re-derived in this file from the table's
// edges, claim rules and outcome classes: what the suite proves is that
// `allowed` answers exactly what the table says. The table itself is then
// proven against the spec's matrix (section 4.2) and the conventions'
// vocabularies, which are written out here by value.
// ---------------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import {
  allowed,
  dependencies,
  dependencySatisfied,
  kinds,
  stepAllowed,
  transitions,
  type DependencyTarget,
  type Outcome,
  type RuleResult,
  type TransitionPayload,
} from "../transitions.js";

const CLAIM = { checkout_id: "a216a4b9", person: null, claimed_at: null };
const table = transitions();

const pairs = (states: string[]): Array<[string, string]> => states.flatMap((from) => states.map((to): [string, string] => [from, to]));
const hasEdge = (kind: string, from: string, to: string): boolean => table.kinds[kind]!.edges.some((e) => e.from === from && e.to === to);

function expectResult(r: RuleResult, ok: boolean, cls?: string, label = ""): void {
  expect(r.ok, `${label}: ${JSON.stringify(r)}`).toBe(ok);
  if (!r.ok && cls !== undefined) expect(r.class, label).toBe(cls);
}

// --- the table against the spec and the conventions ---------------------------

describe("contract/transitions.json carries the spec matrix and the conventions' vocabularies", () => {
  it("controls the five kinds", () => {
    expect(kinds()).toEqual(["package", "issue", "plan", "discussion", "decision"]);
  });

  it("package: the five statuses, two terminal, the ten edges of spec section 4.2, the claim rule and the outcome classes", () => {
    const p = table.kinds["package"]!;
    expect(p.states).toEqual(["open", "claimed", "paused", "done", "dropped"]);
    expect(p.terminal).toEqual(["done", "dropped"]);
    const spec = [
      ["open", "claimed"], ["open", "paused"], ["open", "dropped"],
      ["claimed", "open"], ["claimed", "paused"], ["claimed", "done"], ["claimed", "dropped"],
      ["paused", "open"], ["paused", "claimed"], ["paused", "dropped"],
    ];
    expect(p.edges.map((e) => [e.from, e.to])).toEqual(spec);
    expect(p.claim).toEqual({ open: "forbidden", claimed: "required", paused: "forbidden", done: "optional", dropped: "optional" });
    expect(p.outcome_classes).toEqual({
      open: [], claimed: [], paused: [],
      done: ["completed", "legacy-completed"],
      dropped: ["bounded", "cancelled", "failed", "dropped"],
    });
    for (const t of p.terminal) expect(p.edges.some((e) => e.from === t), `${t} is left by no edge`).toBe(false);
  });

  it("issue and plan: _o_ _p_ _c_ _d_, closed and deferred terminal, no edge back from a terminal state", () => {
    for (const kind of ["issue", "plan"]) {
      const k = table.kinds[kind]!;
      expect(k.markers).toEqual({ open: "_o_", in_progress: "_p_", closed: "_c_", deferred: "_d_" });
      expect(k.states).toEqual(["open", "in_progress", "closed", "deferred"]);
      expect(k.terminal).toEqual(["closed", "deferred"]);
      expect(k.edges.map((e) => `${e.from}>${e.to}`).sort()).toEqual(
        ["open>in_progress", "open>closed", "open>deferred", "in_progress>closed", "in_progress>deferred"].sort(),
      );
    }
  });

  it("discussion: _o_ and _c_ only, closed terminal, the single edge open to closed", () => {
    const d = table.kinds["discussion"]!;
    expect(d.markers).toEqual({ open: "_o_", closed: "_c_" });
    expect(d.states).toEqual(["open", "closed"]);
    expect(d.terminal).toEqual(["closed"]);
    expect(d.edges).toEqual([{ from: "open", to: "closed" }]);
  });

  it("decision: _o_ _a_ _i_ _s_ _d_ with _d_ deferred, three terminal, implemented to superseded the one terminal-to-terminal edge in the whole table", () => {
    const d = table.kinds["decision"]!;
    expect(d.markers).toEqual({ open: "_o_", answered: "_a_", implemented: "_i_", superseded: "_s_", deferred: "_d_" });
    expect(d.states).toEqual(["open", "answered", "implemented", "superseded", "deferred"]);
    expect(d.terminal).toEqual(["implemented", "superseded", "deferred"]);
    expect(d.edges.map((e) => `${e.from}>${e.to}`).sort()).toEqual(
      ["open>answered", "open>implemented", "open>deferred", "answered>implemented", "answered>deferred", "answered>superseded", "implemented>superseded"].sort(),
    );
    const terminalLeaves = kinds().flatMap((kind) =>
      table.kinds[kind]!.edges.filter((e) => table.kinds[kind]!.terminal.includes(e.from)).map((e) => `${kind}:${e.from}>${e.to}`),
    );
    expect(terminalLeaves).toEqual(["decision:implemented>superseded"]);
  });

  it("plan steps: open, in_progress, done with three edges", () => {
    const p = table.kinds["plan"]!;
    expect(p.step_states).toEqual(["open", "in_progress", "done"]);
    expect(p.step_edges!.map((e) => `${e.from}>${e.to}`).sort()).toEqual(["open>in_progress", "in_progress>done", "open>done"].sort());
  });
});

// --- allowed: packages, every ordered pair with and without a claim -------------

describe("allowed(package, ...) over every ordered pair of states", () => {
  const p = table.kinds["package"]!;
  const outcomeFor = (to: string): Outcome | null => (p.terminal.includes(to) ? { class: p.outcome_classes![to]![0]!, reason: "recorded", evidence: [] } : null);

  for (const [from, to] of pairs(p.states)) {
    for (const claim of [null, CLAIM]) {
      const label = `${from} -> ${to} ${claim === null ? "without" : "with"} a claim`;
      it(label, () => {
        const r = allowed("package", from, to, { claim, outcome: outcomeFor(to) });
        if (!hasEdge("package", from, to)) return expectResult(r, false, "conflict", label);
        const rule = p.claim![to];
        if (rule === "required" && claim === null) return expectResult(r, false, "schema-invalid", label);
        if (rule === "forbidden" && claim !== null) return expectResult(r, false, "schema-invalid", label);
        expectResult(r, true, undefined, label);
      });
    }
  }

  it("counts the pairs it enumerated", () => {
    expect(pairs(p.states)).toHaveLength(p.states.length ** 2);
    expect(p.states.length ** 2).toBe(25);
  });
});

describe("allowed(package, ...) outcome rules on the target state", () => {
  const p = table.kinds["package"]!;
  const allClasses = [...new Set(Object.values(p.outcome_classes!).flat())];

  for (const to of p.terminal) {
    const from = p.edges.find((e) => e.to === to)!.from;
    const claim = p.claim![from] === "required" ? CLAIM : null;
    for (const cls of allClasses) {
      it(`${from} -> ${to} with outcome class ${cls} is ${p.outcome_classes![to]!.includes(cls) ? "allowed" : "schema-invalid"}`, () => {
        const r = allowed("package", from, to, { claim, outcome: { class: cls, reason: "r", evidence: [] } });
        expectResult(r, p.outcome_classes![to]!.includes(cls), "schema-invalid");
      });
    }
    it(`${from} -> ${to} without an outcome is schema-invalid`, () => {
      expectResult(allowed("package", from, to, { claim, outcome: null }), false, "schema-invalid");
    });
  }

  it("an outcome on a live target state is schema-invalid", () => {
    expectResult(allowed("package", "open", "paused", { claim: null, outcome: { class: "completed", reason: "", evidence: [] } }), false, "schema-invalid");
  });

  it("a second claim on a claimed package is a conflict: claimed -> claimed is no edge", () => {
    expectResult(allowed("package", "claimed", "claimed", { claim: CLAIM }), false, "conflict");
  });

  it("an unknown kind or state is schema-invalid", () => {
    expectResult(allowed("campaign", "open", "done"), false, "schema-invalid");
    expectResult(allowed("package", "open", "archived"), false, "schema-invalid");
    expectResult(allowed("package", "formed", "open"), false, "schema-invalid");
  });
});

// --- allowed: the record kinds, every edge -------------------------------------

/** A payload that satisfies whatever the target state of `kind` demands. */
function satisfying(kind: string, to: string): TransitionPayload {
  const k = table.kinds[kind]!;
  const payload: TransitionPayload = {};
  if (kind === "issue" && k.terminal.includes(to)) payload.disposition = { kind: "fixed", reason_ref: null };
  if (kind === "decision") {
    const ref = { workbench_id: "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964", record_id: "00000000-0000-4000-8000-000000000001" };
    if (to === "answered") payload.answer_ref = ref;
    if (to === "implemented") payload.implementation_ref = "12d8424";
    if (to === "superseded") payload.superseded_by = ref;
    // As fixtures/valid/record/decision-deferred.json carries it: an external target and who ruled.
    if (to === "deferred") payload.deferral = { target: { kind: "external", name: "v1.x" }, ruled_by: { actor: "user", person: "kai" } };
  }
  return payload;
}

for (const kind of ["issue", "plan", "discussion", "decision"]) {
  describe(`allowed(${kind}, ...) over every ordered pair of states`, () => {
    const k = table.kinds[kind]!;
    for (const [from, to] of pairs(k.states)) {
      it(`${from} -> ${to} is ${hasEdge(kind, from, to) ? "an edge" : "a conflict"}`, () => {
        const r = allowed(kind, from, to, satisfying(kind, to));
        expectResult(r, hasEdge(kind, from, to), "conflict");
      });
    }
    it("the package matrix is never applied to this kind", () => {
      expectResult(allowed(kind, "open", "claimed"), false, "schema-invalid");
    });
  });
}

describe("allowed on the record kinds: what the target state requires", () => {
  it("issue: closed or deferred requires a disposition; open or in_progress carries none", () => {
    expectResult(allowed("issue", "open", "closed", {}), false, "schema-invalid");
    expectResult(allowed("issue", "in_progress", "deferred", { disposition: null }), false, "schema-invalid");
    expectResult(allowed("issue", "open", "in_progress", { disposition: { kind: "x", reason_ref: null } }), false, "schema-invalid");
    expectResult(allowed("issue", "open", "in_progress", { disposition: null }), true);
  });

  it("decision: every edge with a requires field refuses the move without that reference", () => {
    const d = table.kinds["decision"]!;
    const requiring = d.edges.filter((e) => e.requires !== undefined);
    expect(requiring.map((e) => `${e.from}>${e.to}:${e.requires}`)).toEqual([
      "open>answered:answer_ref",
      "open>implemented:implementation_ref",
      "open>deferred:deferral",
      "answered>implemented:implementation_ref",
      "answered>deferred:deferral",
      "answered>superseded:superseded_by",
      "implemented>superseded:superseded_by",
    ]);
    for (const e of requiring) {
      const without = allowed("decision", e.from, e.to, {});
      expectResult(without, false, "schema-invalid", `${e.from} -> ${e.to} without ${e.requires}`);
      if (!without.ok) expect(without.reason).toBe(`decision: ${e.to} requires ${e.requires}`);
      expectResult(allowed("decision", e.from, e.to, { [e.requires!]: null }), false, "schema-invalid");
      expectResult(allowed("decision", e.from, e.to, satisfying("decision", e.to)), true);
    }
  });

  it("plan steps: every ordered pair of step states", () => {
    const p = table.kinds["plan"]!;
    for (const [from, to] of pairs(p.step_states!)) {
      const isEdge = p.step_edges!.some((e) => e.from === from && e.to === to);
      expectResult(stepAllowed(from, to), isEdge, "conflict", `step ${from} -> ${to}`);
    }
    expectResult(stepAllowed("open", "closed"), false, "schema-invalid");
  });
});

// --- dependencySatisfied -------------------------------------------------------

describe("dependencySatisfied over both conditions", () => {
  const d = dependencies();
  const EVIDENCE_ID = "00000000-0000-4000-8000-000000000042";
  const REV = "sha256:" + "a".repeat(64);
  const STALE = "sha256:" + "b".repeat(64);
  const binding = (revision: string) => ({ ref: { workbench_id: "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964", record_id: EVIDENCE_ID, revision }, policy: "prior-enforced" });
  const packageStates = transitions().kinds["package"]!.states;
  const terminal = transitions().kinds["package"]!.terminal;
  const classOf: Record<string, string> = { done: "completed", dropped: "failed" };

  const target = (status: string, opts: { cls?: string; evidence?: ReturnType<typeof binding>[]; records?: DependencyTarget["evidence_records"] } = {}): DependencyTarget => ({
    status,
    outcome: terminal.includes(status) ? { class: opts.cls ?? classOf[status]!, reason: "r", evidence: opts.evidence ?? [] } : null,
    evidence_records: opts.records,
  });
  const accepted = { [EVIDENCE_ID]: { verdict: "accept", revision: REV } };
  const revised = { [EVIDENCE_ID]: { verdict: "revise", revision: REV } };

  it("the table defines terminal (the legacy default) and succeeded", () => {
    expect(Object.keys(d.conditions).sort()).toEqual(["succeeded", "terminal"]);
    expect(d.legacy_edge_condition).toBe("terminal");
    expect(d.conditions["terminal"]!.legacy_default).toBe(true);
    expect(d.conditions["succeeded"]!.legacy_default).toBe(false);
    expect(d.conditions["terminal"]!.target_status).toEqual(["done", "dropped"]);
    expect(d.conditions["succeeded"]!.target_status).toEqual(["done"]);
    expect(d.conditions["succeeded"]!.outcome_class).toEqual(["completed"]);
  });

  for (const condition of Object.keys(d.conditions)) {
    for (const status of packageStates) {
      for (const withEvidence of [false, true]) {
        const label = `${condition}: target ${status} ${withEvidence ? "with" : "without"} accepted evidence`;
        it(label, () => {
          const t = target(status, withEvidence ? { evidence: [binding(REV)], records: accepted } : {});
          const r = dependencySatisfied(condition, t);
          const rule = d.conditions[condition]!;
          if (!rule.target_status.includes(status)) return expectResult(r, false, "conflict", label);
          if (rule.evidence === null) return expectResult(r, true, undefined, label);
          expectResult(r, withEvidence, "missing-evidence", label);
        });
      }
    }
  }

  it("succeeded: a dropped predecessor never satisfies it, whatever its evidence", () => {
    expectResult(dependencySatisfied("succeeded", target("dropped", { evidence: [binding(REV)], records: accepted })), false, "conflict");
  });

  it("succeeded: legacy-completed never satisfies it", () => {
    expectResult(dependencySatisfied("succeeded", target("done", { cls: "legacy-completed", evidence: [binding(REV)], records: accepted })), false, "missing-evidence");
  });

  it("succeeded: a binding at a stale revision, or with verdict revise, is missing-evidence", () => {
    expectResult(dependencySatisfied("succeeded", target("done", { evidence: [binding(STALE)], records: accepted })), false, "missing-evidence");
    expectResult(dependencySatisfied("succeeded", target("done", { evidence: [binding(REV)], records: revised })), false, "missing-evidence");
  });

  it("succeeded: a binding whose evidence record was not supplied is unresolved-reference", () => {
    expectResult(dependencySatisfied("succeeded", target("done", { evidence: [binding(REV)] })), false, "unresolved-reference");
  });

  it("terminal reads no evidence at all", () => {
    expectResult(dependencySatisfied("terminal", target("done", { cls: "legacy-completed" })), true);
    expectResult(dependencySatisfied("terminal", target("dropped", { evidence: [binding(STALE)] })), true);
  });

  it("an unknown condition is schema-invalid, as the table's refusals say", () => {
    expect(d.refusals["unknown_condition"]).toBe("schema-invalid");
    expectResult(dependencySatisfied("finished", target("done")), false, "schema-invalid");
  });
});
