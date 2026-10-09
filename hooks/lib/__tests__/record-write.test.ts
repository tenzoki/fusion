import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ask, gate, type Answer, type Ask, type CodecRequest } from "../record-client.js";
import { INITIAL_CONTROL, initialize, PAYLOAD_FIELDS, parseFlags, SETUP_MARKER, write, type Identity, type Init, type Outcome } from "../record-write.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";
import { BUNDLE, claim, createPackage, must, place, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// The write client: the gate, the show, the ownership check of response 22
// (a), one mutation and its rows, against the real bundle. `through` stands in
// for the codec only where a case needs an answer no workbench can give: a
// write landing between the show and the mutation, and an answer that never
// arrives. The plan step's note records each case red against a broken copy.
// ---------------------------------------------------------------------------

const ME = "5e8248d7";
const OTHER = "0b0b0b0b";
const real: Ask = (w, r) => ask(w, r, { bundle: BUNDLE });
const UNANSWERED: Answer = { kind: "unanswered", cause: "timeout", detail: "stopped" };
const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
type Wrote = Outcome & { kind: "landed" };

/** One call as `bin/fusion-write` makes it, and every request it sent. */
function run(p: JsonProject, sub: string, args: string[], identity: Identity = { checkout: ME }, through: Ask = real): { o: Outcome; sent: CodecRequest[] } {
  const sent: CodecRequest[] = [];
  const parsed = parseFlags(sub, args);
  if ("usage" in parsed) return { o: { kind: "usage", detail: parsed.usage }, sent };
  return { o: write({ ...parsed.call, workbench: p.workbench, identity, roleVersion: "12.0.0" }, (w, r) => (sent.push(r), through(w, r))), sent };
}
const mutations = (sent: CodecRequest[]): string[] => sent.map((r) => r.op).filter((op) => op !== "inspect" && op !== "show");
const rows = (p: JsonProject): Record<string, unknown>[] => {
  const log = resolve(p.workbench, "orchestrator-events.jsonl");
  return existsSync(log) ? readFileSync(log, "utf-8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l)) : [];
};
const shown = (p: JsonProject, path: string): Record<string, any> => must(p, { op: "show", record: { path } }).result;
const put = (p: JsonProject, rel: string, body = `# ${rel}\n`): string => (mkdirSync(dirname(resolve(p.workbench, rel)), { recursive: true }), writeFileSync(resolve(p.workbench, rel), body), rel);
const schema = (f: string) => JSON.parse(readFileSync(resolve(REPO_ROOT, "codec", "schemas", f), "utf-8"));
const repo = (p: JsonProject) => [["init", "-q"], ["config", "user.email", "s@example.com"], ["config", "user.name", "Scratch"], ["commit", "-q", "--allow-empty", "-m", "base"]].forEach((a) => spawnSync("git", a, { cwd: p.root, env: GIT_ENV }));

describe("ownership, response 22 (a)", () => {
  it("the owner releases; another checkout, an unreadable identity and a non-claimed source each take their own branch; a claim is written for this checkout alone", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const on = ["--record", pkg.path, "--actor", "user"];
      const release = (id: Identity) => run(p, "release", [...on, "--reason", "set aside"], id);
      // Not claimed: no claim to check, so the codec refuses; an unreadable identity cannot claim.
      expect(release({}).o).toMatchObject({ kind: "refused", refusal: { class: "conflict", reason: "not-claimed" } });
      expect(run(p, "claim", on, {}).o.kind).toBe("ownership");
      expect(run(p, "claim", on).o).toMatchObject({ kind: "landed", event: "logged" });
      const refused = [release({ checkout: OTHER }), release({}), run(p, "transition", [...on, "--to", "paused", "--reason", "r"], { checkout: OTHER })];
      expect(refused.map((r) => [r.o.kind, /could not be read/.test((r.o as { detail: string }).detail), mutations(r.sent)])).toEqual([["ownership", false, []], ["ownership", true, []], ["ownership", false, []]]);
      expect(release({ checkout: ME, person: "Test Person <t@example.com>" }).o).toMatchObject({ kind: "landed", event: "logged" });
      const into = (id: Identity, holder: string) => run(p, "transition", [...on, "--to", "claimed", "--reason", "r", "--claim", JSON.stringify({ checkout_id: holder, person: null, claimed_at: "2026-10-01T09:00:00Z" })], id);
      expect([into({ checkout: ME }, OTHER), into({}, ME)].map((r) => [r.o.kind, mutations(r.sent)])).toEqual([["ownership", []], ["ownership", []]]);
      expect([into({ checkout: ME }, ME).o.kind, run(p, "transition", [...on, "--to", "open", "--reason", "r", "--claim", "null"]).o.kind]).toEqual(["landed", "landed"]);
      // Out of `open` there is no claim to hold, so no identity is read.
      expect(run(p, "transition", [...on, "--to", "paused", "--reason", "r"], {}).o.kind).toBe("landed");
      expect(rows(p).map((r) => [r.op, r.checkout, r.change])).toEqual([["claim", ME, { from: "open", to: "claimed" }], ["release", ME, { from: "claimed", to: "open" }],
        ["transition", ME, { from: "open", to: "claimed" }], ["transition", ME, { from: "claimed", to: "open" }], ["transition", undefined, { from: "open", to: "paused" }]]);
    });
  });
});

describe("one request, and no retry", () => {
  it("a write landed between show and the mutation is revision-mismatch: one request, no row", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const racing: Ask = (w, r) => (r.op === "set-mode" && claim(p, pkg, OTHER), real(w, r));
      const r = run(p, "set-mode", ["--record", pkg.path, "--actor", "user", "--value", "ordinary"], { checkout: ME }, racing);
      expect(r.o).toMatchObject({ kind: "refused", refusal: { class: "conflict", reason: "revision-mismatch" } });
      expect([mutations(r.sent), rows(p)]).toEqual([["set-mode"], []]);
    });
  });

  it("an unanswered mutation is unknown and not retried; the re-send answers the stored bytes and writes no row", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const args = ["--record", pkg.path, "--actor", "user"];
      const lost = run(p, "claim", args, { checkout: ME }, (w, r) => (r.op === "claim" ? (real(w, r), UNANSWERED) : real(w, r)));
      expect([lost.o.kind, mutations(lost.sent), rows(p)]).toEqual(["unknown", ["claim"], []]);
      const u = lost.o as Outcome & { kind: "unknown" };
      const again = () => run(p, "claim", [...args, "--operation-id", u.operationId, ...Object.entries(u.resend).flat()]).o;
      const expected = { kind: "landed", operationId: u.operationId, revisions: { [pkg.path]: shown(p, pkg.path).revision }, event: "unlogged" };
      expect([again(), again(), rows(p)]).toMatchObject([expected, expected, []]);
    });
  });
});

describe("takeover, request 62", () => {
  /** A package OTHER holds, and a decision record in its container whose id is the `--source` that resolves. */
  function orphaned(p: JsonProject): { pkg: string; source: string } {
    const pkg = createPackage(p, "261009-1400-t");
    claim(p, pkg, OTHER);
    const word = Object.keys((run(p, "create", ["--kind", "decision", "--narrative-file", put(p, `${pkg.dir}/decisions/261009-1401-t.md`, "# Take over\n\nThe user: take it over from 0b0b0b0b, it is gone.\n"), "--origin", pkg.path, "--actor", "user"]).o as Wrote).revisions)[0];
    return { pkg: pkg.path, source: JSON.stringify({ workbench_id: must(p, { op: "inspect" }).result.id, record_id: shown(p, word).control.id }) };
  }

  it("composes previous_claim and expected_revision from show and the claim for this checkout; five usage errors and two refusals land nothing; the row names both holders", () => {
    withJsonProject((p) => {
      const { pkg, source } = orphaned(p);
      const on = ["--record", pkg, "--actor", "orchestrator"];
      const take = (from: string, src: string | null, id: Identity = { checkout: ME }) => run(p, "claim", [...on, "--take-over-from", from, ...(src === null ? [] : ["--source", src])], id);
      const usages = [take(OTHER, null), run(p, "claim", [...on, "--source", source]), take(ME, source), take(OTHER, "not json"), take(OTHER, "null")];
      expect(usages.map((r) => [r.o.kind, mutations(r.sent)])).toEqual(Array(5).fill(["usage", []]));
      const before = shown(p, pkg);
      // The holder is not the one named: exit 5, nothing sent. A source that does not resolve: evidence validation refuses it, nothing written.
      const wrongHolder = take("0c0c0c0c", source);
      const unresolved = take(OTHER, JSON.stringify({ ...JSON.parse(source), record_id: "f03a0000-0000-4000-8000-0000000000ff" }));
      expect([wrongHolder.o.kind, mutations(wrongHolder.sent), unresolved.o]).toMatchObject(["ownership", [], { kind: "refused", refusal: { class: "unresolved-reference", reason: "record-not-found" } }]);
      expect(shown(p, pkg).revision).toBe(before.revision);
      const landed = take(OTHER, source, { checkout: ME, person: "P" });
      const sent = landed.sent.find((r) => r.op === "claim") as Record<string, any>;
      expect([landed.o.kind, sent.expected_revision, sent.takeover, sent.claim]).toEqual(["landed", before.revision, { previous_claim: before.control.claim, source: JSON.parse(source) }, { checkout_id: ME, person: "P", claimed_at: expect.any(String) }]);
      expect(shown(p, pkg).control.provenance.claim_transfers).toEqual([expect.objectContaining({ previous_claim: before.control.claim, claim: sent.claim, inspected_revision: before.revision })]);
      expect(rows(p).filter((r) => r.op === "claim").map((r) => r.change)).toEqual([{ from: "claimed", to: "claimed", previous_checkout_id: OTHER, checkout_id: ME }]);
      // The new holder is the holder: release lands, and OTHER's no longer would.
      expect([run(p, "release", [...on, "--reason", "r"], { checkout: OTHER }).o.kind, run(p, "release", [...on, "--reason", "r"]).o.kind]).toEqual(["ownership", "landed"]);
    });
  }, CASE_TIMEOUT);

  it("after an unknown outcome the re-send repeats the frozen request byte for byte and reads no show; the history keeps one entry", () => {
    withJsonProject((p) => {
      const { pkg, source } = orphaned(p);
      const args = ["--record", pkg, "--actor", "orchestrator", "--take-over-from", OTHER, "--source", source];
      const lost = run(p, "claim", args, { checkout: ME }, (w, r) => (r.op === "claim" ? (real(w, r), UNANSWERED) : real(w, r)));
      const u = lost.o as Outcome & { kind: "unknown" };
      expect([u.kind, Object.keys(u.resend)]).toEqual(["unknown", ["--expected-revision", "--claimed-at", "--previous-claim"]]);
      const again = run(p, "claim", [...args, "--operation-id", u.operationId, ...Object.entries(u.resend).flat()]);
      const first = lost.sent.find((r) => r.op === "claim");
      expect([again.o.kind, again.sent.map((r) => r.op), JSON.stringify(again.sent.at(-1))]).toEqual(["landed", ["inspect", "claim"], JSON.stringify(first)]);
      expect([shown(p, pkg).control.provenance.claim_transfers.length, rows(p).filter((r) => r.op === "claim")]).toEqual([1, []]);
      // A re-send whose frozen previous claim names another checkout than --take-over-from is a usage error.
      const bent = Object.entries({ ...u.resend, "--previous-claim": JSON.stringify({ checkout_id: ME, person: null, claimed_at: null }) }).flat();
      expect(run(p, "claim", [...args, "--operation-id", u.operationId, ...bent]).o.kind).toBe("usage");
    });
  }, CASE_TIMEOUT);
});

describe("what is sent", () => {
  it("a flag outside the subcommand, or a payload field the record's kind does not carry, is a usage error and sends nothing", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const on = ["--record", pkg.path, "--actor", "user"];
      for (const [sub, extra] of [["release", ["--reason", "r", "--force", "x"]], ["set-mode", ["--value", "autonomous"]], ["transition", ["--to", "dropped", "--reason", "r", "--disposition", "null"]]] as const) {
        const r = run(p, sub, [...on, ...extra]);
        expect([r.o.kind, mutations(r.sent)], `${sub} ${extra.join(" ")}`).toEqual(["usage", []]);
      }
      for (const extra of [["--kind", "package"], ["--kind", "issue", "--domain", "code"], ["--kind", "campaign"]]) expect(run(p, "create", [...extra, "--narrative-file", "x.md", "--origin", "user-request", "--actor", "user"]).o.kind, extra.join(" ")).toBe("usage");
    });
  });

  it("PAYLOAD_FIELDS is the transition payload read against each kind's control fields in the codec's schemas", () => {
    const payload = schema("protocol.schema.json").oneOf.find((b: { properties: { op: { const?: string } } }) => b.properties.op.const === "transition").properties.payload.properties;
    const kinds: Record<string, object> = { package: schema("package.schema.json").properties };
    for (const k of ["issue", "plan", "decision", "discussion"]) kinds[k] = schema("record.schema.json").$defs[`${k}_control`].properties;
    expect(Object.fromEntries(Object.entries(kinds).map(([k, props]) => [k, Object.keys(payload).filter((f) => f in props)]))).toEqual(PAYLOAD_FIELDS);
  });

  it("legacy with a pending initialize is refused and names Setup: only inspect is sent, and the failed repair of a retained row is reported", () => {
    withJsonProject((p) => {
      cpSync(resolve(REPO_ROOT, "codec", "fixtures", "protocol-session-initialize", "seed", "16-inspect", "pending"), p.workbench, { recursive: true });
      // The seed carries a placeholder for its request's digest; inspect reads the intent and not the request, so any digest serves.
      const intent = resolve(p.workbench, ".json-state", "journal", "1a1e0017-0000-4000-8000-000000000017", "intent.json");
      writeFileSync(intent, readFileSync(intent, "utf-8").replace(/<request-digest:[^>]+>/, `sha256:${"0".repeat(64)}`));
      put(p, ".guard-state/record-change-pending.jsonl", `${JSON.stringify({ event: "record_change" })}\n`); chmodSync(resolve(p.workbench, put(p, "orchestrator-events.jsonl", "")), 0o444);
      const r = run(p, "claim", ["--record", "work-packages/x/package.json", "--actor", "user"]);
      expect(r.o).toMatchObject({ kind: "unread", detail: expect.stringContaining("Run /fusion:setup"), repair: { retained: 1, detail: expect.stringContaining("the log append failed") } });
      expect(r.sent.map((q) => q.op)).toEqual(["inspect"]);
    }, { legacy: true });
  });
});

describe("creation", () => {
  const KINDS = Object.keys(INITIAL_CONTROL);
  it("INITIAL_CONTROL is each record kind's one state no edge of transitions.json enters, with every control field its schema requires", () => {
    const { kinds } = JSON.parse(readFileSync(resolve(REPO_ROOT, "codec", "contract", "transitions.json"), "utf-8"));
    const create = schema("protocol.schema.json").oneOf.find((b: { properties: { op: { const?: string }; kind: { enum?: string[] } } }) => b.properties.op.const === "create" && b.properties.kind.enum);
    expect(["package", ...KINDS]).toEqual(create.properties.kind.enum);
    for (const [k, control] of Object.entries(INITIAL_CONTROL)) {
      const entered = kinds[k].states.filter((s: string) => !kinds[k].edges.some((e: { to: string }) => e.to === s));
      expect([entered, Object.keys(control).sort()], k).toEqual([[control.state], [...schema("record.schema.json").$defs[`${k}_control`].required].sort()]);
    }
  });

  it("creates a pair of each kind in its initial state, filed by this checkout's person, each with a {created} row", () => {
    withJsonProject((p) => {
      const W = "work-packages/261001-0900-w";
      const create = (kind: string, rel: string, origin: string, ...extra: string[]) => run(p, "create", ["--kind", kind, "--narrative-file", put(p, rel), "--origin", origin, "--actor", "user", ...extra], { checkout: ME, person: "P" }).o as Wrote;
      const made = [create("package", `${W}/261001-0900-w.md`, "user-request", "--domain", "code"), ...KINDS.map((k) => create(k, `${W}/${k}s/261001-0901-${k}.md`, `${W}/package.json`))];
      expect(made.map((o) => o.kind)).toEqual(Array(5).fill("landed"));
      const control = made.map((o) => shown(p, Object.keys(o.revisions)[0]).control);
      expect(control.map((c) => [c.filed_by, c.status ?? c.control.state])).toEqual(Array(5).fill([{ actor: "user", person: "P" }, "open"]));
      expect(rows(p).map((r) => [r.kind, r.change, r.person])).toEqual(["package", ...KINDS].map((k) => [k, { created: "open" }, "P"]));
    });
  });

  it("a plan filed by create anchors each numbered step under ## Implementation Steps, and transition --steps records one; a plan without the section is filed with no steps", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "261005-0900-s");
      const file = (name: string, body: string) => Object.keys((run(p, "create", ["--kind", "plan", "--narrative-file", put(p, `${pkg.dir}/plans/${name}`, body), "--origin", pkg.path, "--actor", "user"]).o as Wrote).revisions)[0];
      const stepped = file("261005-0901-s.md", "# plan\n\n## Context\n\n1. not a step\n\n## Implementation Steps\n\n1. first\n\n### 2. second\n\n```\n3. fenced\n```\n\n## Risks\n\n4. not a step\n1. [HIGH] tagged, and no step\n");
      const bare = file("261005-0902-t.md", "# plan\n\n## Approach\n\n1. no section\n");
      expect([shown(p, stepped).control.control.steps, shown(p, bare).control.control.steps]).toEqual([[{ id: "1", state: "open" }, { id: "2", state: "open" }], []]);
      const done = run(p, "transition", ["--record", stepped, "--to", "in_progress", "--reason", "step 1", "--steps", JSON.stringify([{ id: "1", state: "done" }]), "--actor", "user"]).o;
      expect([done.kind, shown(p, stepped).control.control.steps]).toEqual(["landed", [{ id: "1", state: "done" }, { id: "2", state: "open" }]]);
    });
  });

  it("a plan whose steps section repeats a number is refused as usage, naming the number and its lines, and nothing is sent", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "261005-1600-r");
      const twice = put(p, `${pkg.dir}/plans/261005-1601-r.md`, "# plan\n\n## Implementation Steps\n\n### Part A\n\n1. a\n2. b\n\n### Part B\n\n1. c\n3. d\n");
      const r = run(p, "create", ["--kind", "plan", "--narrative-file", twice, "--origin", pkg.path, "--actor", "user"]);
      expect([r.o.kind, mutations(r.sent), existsSync(resolve(p.workbench, twice.replace(/\.md$/, ".record.json")))]).toEqual(["usage", [], false]);
      expect((r.o as { detail: string }).detail).toMatch(/step number 1 .*lines 7 and 12/);
    });
  });

  it("evidence binds the package's brief, its plan and the report's bytes: an edited report is report-changed, and its row is {created_kind: evidence}", () => {
    withJsonProject((p) => {
      repo(p);
      const pkg = createPackage(p, "261001-0900-e");
      const plan = run(p, "create", ["--kind", "plan", "--narrative-file", put(p, `${pkg.dir}/plans/261001-0901-e.md`), "--origin", pkg.path, "--actor", "user"]).o as Wrote;
      expect(run(p, "adopt-plan", ["--record", pkg.path, "--plan", Object.keys(plan.revisions)[0], "--actor", "user"]).o.kind).toBe("landed");
      const report = put(p, `${pkg.dir}/reviews/261001-1000-e-review.md`, "# review\n");
      const ev = Object.keys((run(p, "evidence", ["--record", pkg.path, "--report", report, "--verdict", "accept", "--actor", "reviewer"]).o as Wrote).revisions)[0];
      const record = shown(p, ev).control;
      expect([record.plan_revision, record.role, record.host, record.execution_policy]).toEqual([shown(p, pkg.path).control.active_documents[0].revision, { profile: "reviewer", version: "12.0.0" }, "claude-code", "claude-guided"]);
      const attach = () => run(p, "attach-evidence", ["--record", pkg.path, "--evidence", ev, "--actor", "user"]).o;
      writeFileSync(resolve(p.workbench, report), "# review, edited\n");
      expect(attach()).toMatchObject({ kind: "refused", refusal: { class: "missing-evidence", reason: "report-changed" } });
      writeFileSync(resolve(p.workbench, report), "# review\n");
      expect(attach().kind).toBe("landed");
      expect(rows(p).filter((r) => r.kind === "evidence").map((r) => r.change)).toEqual([{ created_kind: "evidence" }]);
    });
  });
});

describe("initialize, one case per row of Setup's table", () => {
  const init = (p: JsonProject, through: Ask = real) => {
    const sent: CodecRequest[] = [];
    return { o: initialize(p.workbench, (w, r) => (sent.push(r), through(w, r))), ops: () => sent.map((r) => r.op), sent };
  };
  /** The first `inspect` answers with `pending` set, as a committed intent would make it. */
  const pendingOnce = (pending: object): Ask => { let n = 0; return (w, r) => { const a = real(w, r); return r.op === "inspect" && n++ === 0 && a.kind === "result" ? { ...a, result: { ...(a.result as object), pending } } : a; }; };
  const bare = (p: JsonProject) => rmSync(resolve(p.workbench, SETUP_MARKER));
  const SEED_OP = "1a1e0017-0000-4000-8000-000000000017", SEED_ID = "1a1ebe17-0000-4000-8000-000000000017";

  it("json-control is reused, the marker there or not, and nothing is sent", () => withJsonProject((p) => {
    const first = init(p); bare(p);
    expect([first.o, first.ops(), init(p).o]).toEqual([{ kind: "ready", how: "reused", workbenchId: must(p, { op: "inspect" }).result.id }, ["inspect"], first.o]);
  }));

  it("legacy with its marker is a workbench set up before the cutover: legacy, nothing sent, nothing written", () => withJsonProject((p) => {
    const r = init(p);
    expect([r.o, r.ops(), readdirSync(p.workbench)]).toEqual([{ kind: "ready", how: "legacy", workbenchId: null }, ["inspect"], [SETUP_MARKER]]);
  }, { legacy: true }));

  it("legacy, no marker, empty: a new workbench, and the re-inspect names its id; .DS_Store is refused by name, and a store without its marker is legacy", () => withJsonProject((p) => {
    bare(p); const r = init(p); const o = r.o as Init & { kind: "ready" };
    expect([o.how, r.ops(), gate(p.workbench, { bundle: BUNDLE })]).toEqual(["initialized", ["inspect", "initialize", "inspect"], { state: "json-control", id: o.workbenchId }]);
    for (const entry of [".DS_Store", "work-packages"]) {
      rmSync(p.workbench, { recursive: true }); mkdirSync(resolve(p.workbench, entry === ".DS_Store" ? "" : entry), { recursive: true }); if (entry === ".DS_Store") put(p, entry);
      expect([init(p).o, readdirSync(p.workbench)], entry).toMatchObject([entry === ".DS_Store" ? { kind: "refused", detail: expect.stringMatching(/target-not-empty.*\.DS_Store/) } : { kind: "ready", how: "legacy", workbenchId: null }, [entry]]);
    }
  }, { legacy: true }));

  it("legacy with a pending intent resends it once; blocked, it stops", () => withJsonProject((p) => {
    bare(p); cpSync(resolve(REPO_ROOT, "codec", "fixtures", "protocol-session-initialize", "seed", "16-inspect", "pending"), p.workbench, { recursive: true });
    const intent = resolve(p.workbench, ".json-state", "journal", SEED_OP, "intent.json");
    const digest = `sha256:${createHash("sha256").update(JSON.stringify({ id: SEED_ID, op: "initialize", operation_id: SEED_OP, workbench: p.workbench })).digest("hex")}`;
    writeFileSync(intent, readFileSync(intent, "utf-8").replace(/<request-digest:[^>]+>/, digest));
    const blocked = init(p, pendingOnce({ operation_id: SEED_OP, id: SEED_ID, blocked: true }));
    expect([blocked.o.kind, blocked.ops(), gate(p.workbench, { bundle: BUNDLE })]).toEqual(["unread", ["inspect"], { state: "legacy", pending: { operation_id: SEED_OP, id: SEED_ID, blocked: false } }]);
    const r = init(p);
    expect([r.o, r.ops(), r.sent[1]]).toMatchObject([{ kind: "ready", how: "initialized", workbenchId: SEED_ID, operationId: SEED_OP }, ["inspect", "initialize", "inspect"], { operation_id: SEED_OP, id: SEED_ID }]);
  }, { legacy: true }));

  it("unsupported, a refused or unanswered inspect, and an unanswered initialize stop, and nothing is retried", () => withJsonProject((p) => {
    const unreadable: Answer = { kind: "refused", class: "operation-unknown", reason: "pending-initialize-ambiguous", detail: "d" };
    expect([init(p, () => unreadable).o, init(p, () => UNANSWERED).o].map((o) => o.kind)).toEqual(["unread", "unread"]);
    place(p, "workbench.json", "{}\n");
    expect(init(p).o).toMatchObject({ kind: "unread", detail: expect.stringContaining("unsupported") });
    rmSync(resolve(p.workbench, "workbench.json")); bare(p);
    const lost = init(p, (w, r) => (r.op === "initialize" ? (real(w, r), UNANSWERED) : real(w, r)));
    expect([lost.o.kind, lost.ops()]).toEqual(["unknown", ["inspect", "initialize"]]);
    // The intent landed; Setup run again finds json-control and reuses it.
    expect(init(p).o).toMatchObject({ kind: "ready", how: "reused" });
  }));

  it("the re-inspect catches a replay answered after workbench.json was deleted", () => withJsonProject((p) => {
    bare(p); const o = init(p).o as Init & { kind: "ready" };
    rmSync(resolve(p.workbench, "workbench.json"));
    const replay = init(p, pendingOnce({ operation_id: o.operationId, id: o.workbenchId, blocked: false }));
    expect([replay.o, replay.ops()]).toMatchObject([{ kind: "unread", detail: expect.stringContaining("not json-control") }, ["inspect", "initialize", "inspect"]]);
  }, { legacy: true }));

  it("bin/fusion-write initialize needs no marker and exits by the header's table", () => withJsonProject((p) => {
    bare(p);
    const cli = (...a: string[]) => spawnSync(resolve(REPO_ROOT, "bin", "fusion-write"), ["initialize", ...a], { cwd: p.root, encoding: "utf-8" });
    mkdirSync(resolve(p.root, "crowded", "x"), { recursive: true });
    const runs = [cli("--workbench", "fusion-workbench"), cli("--workbench", "fusion-workbench"), cli("--workbench"), cli("--workbench", "elsewhere"), cli("--workbench", "crowded")];
    expect(runs.map((r) => [r.status, r.stdout.split("\n")[0]])).toEqual([[0, "result=initialized"], [0, "result=reused"], [2, ""], [4, "result=unread"], [6, "result=refused"]]);
  }, { legacy: true }));
});

describe("bin/fusion-write", () => {
  it("prints KEY=value lines and exits by the header's table; the --outcome value the conventions spell finishes a package", () => {
    withJsonProject((p) => {
      repo(p);
      const [mine, theirs] = [createPackage(p, "260930-1300-a"), createPackage(p, "260930-1301-b")];
      claim(p, theirs, OTHER);
      const cli = (...args: string[]) => spawnSync(resolve(REPO_ROOT, "bin", "fusion-write"), args, { cwd: p.root, env: GIT_ENV, encoding: "utf-8" });
      const ok = cli("claim", "--record", mine.path, "--actor", "user");
      expect(ok.stdout.split("\n").map((l) => l.split("=")[0])).toEqual(["result", "operation_id", "path", "revision", "event", ""]);
      const codes = [ok, cli("claim", "--record", mine.path, "--actor", "user"), cli("release", "--record", theirs.path, "--actor", "user", "--reason", "r"), cli("claim", "--bogus"), cli("log-repair")];
      codes.push(cli("create", "--kind", "issue", "--narrative-file", put(p, `${mine.dir}/issues/261001-0902-i.md`), "--origin", mine.path, "--actor", "user"), cli("evidence", "--record", mine.path, "--report", put(p, `${mine.dir}/reviews/261001-1000-r.md`), "--verdict", "accept", "--actor", "reviewer"));
      const outcome = /`--outcome` takes[^`]*`(\{[^`]+\})` into `done`/.exec(readFileSync(resolve(REPO_ROOT, "rules", "fusion-workbench-conventions.md"), "utf-8"))?.[1] ?? "the rule spells no --outcome value";
      codes.push(cli("transition", "--record", mine.path, "--to", "done", "--reason", "r", "--outcome", outcome, "--actor", "orchestrator"));
      expect([codes.map((r) => r.status), shown(p, mine.path).control.outcome]).toEqual([[0, 6, 5, 2, 0, 0, 0, 0], JSON.parse(outcome)]);
    });
  }, CASE_TIMEOUT);
});

// ---------------------------------------------------------------------------
// `transition --evidence`: the closing review's evidence bound into the
// finish's outcome, which is the one field `succeeded` reads (decision
// 261007-1836, option 1).
// ---------------------------------------------------------------------------

const FINISHED = JSON.stringify({ class: "completed", reason: "landed", evidence: [] });

describe("transition --evidence", () => {
  it("composes each entry exactly as attach-evidence composes its one, and appends it to the outcome's evidence", () => {
    withJsonProject((p) => {
      repo(p);
      const pkg = createPackage(p, "261007-1900-c");
      expect(run(p, "claim", ["--record", pkg.path, "--actor", "user"]).o.kind).toBe("landed");
      const ev = Object.keys((run(p, "evidence", ["--record", pkg.path, "--report", put(p, `${pkg.dir}/reviews/261007-1901-c-review.md`), "--verdict", "accept", "--actor", "reviewer"]).o as Wrote).revisions)[0];
      const attached = run(p, "attach-evidence", ["--record", pkg.path, "--evidence", ev, "--actor", "user"]);
      const finish = run(p, "transition", ["--record", pkg.path, "--to", "done", "--reason", "r", "--outcome", FINISHED, "--evidence", ev, "--actor", "orchestrator"]);
      expect([attached.o.kind, finish.o.kind]).toEqual(["landed", "landed"]);
      const sentOf = (r: { sent: CodecRequest[] }, op: string) => r.sent.find((q) => q.op === op) as Record<string, any>;
      const entry = sentOf(attached, "attach-evidence").evidence;
      expect(sentOf(finish, "transition").payload.outcome).toEqual({ class: "completed", reason: "landed", evidence: [entry] });
      expect(shown(p, pkg.path).control.outcome.evidence).toEqual([entry]);
    });
  }, CASE_TIMEOUT);

  it("is a usage error without --outcome, on a record that is not a package, and naming a record that is not evidence; nothing is sent", () => {
    withJsonProject((p) => {
      repo(p);
      const pkg = createPackage(p, "261007-1910-u");
      const issue = Object.keys((run(p, "create", ["--kind", "issue", "--narrative-file", put(p, `${pkg.dir}/issues/261007-1911-u.md`), "--origin", pkg.path, "--actor", "user"]).o as Wrote).revisions)[0];
      const ev = Object.keys((run(p, "evidence", ["--record", pkg.path, "--report", put(p, `${pkg.dir}/reviews/261007-1912-u-review.md`), "--verdict", "accept", "--actor", "reviewer"]).o as Wrote).revisions)[0];
      const finish = (record: string, ...extra: string[]) => run(p, "transition", ["--record", record, "--to", "done", "--reason", "r", ...extra, "--actor", "orchestrator"]);
      const refused = [finish(pkg.path, "--evidence", ev), finish(issue, "--outcome", FINISHED, "--evidence", ev), finish(pkg.path, "--outcome", FINISHED, "--evidence", issue)];
      expect(refused.map((r) => [r.o.kind, mutations(r.sent)])).toEqual(Array(3).fill(["usage", []]));
      expect(refused.map((r) => (r.o as { detail: string }).detail)).toEqual([expect.stringContaining("with --outcome"), expect.stringContaining("is a issue record"), expect.stringContaining("is a issue record")]);
      expect(refused[2].o).toMatchObject({ detail: expect.stringContaining("names an evidence record") });
    });
  }, CASE_TIMEOUT);
});

// ---------------------------------------------------------------------------
// The shipped helpers, end to end: a successor waiting `succeeded` on a
// package becomes ready once that package is finished with its closing
// review's evidence bound, through `bin/fusion-write` and
// `bin/fusion-work-order` alone. The three controls pin the conditions the
// orchestrator's closure states: no evidence, a verdict other than accept,
// and a closure note written into the brief before the finish.
// ---------------------------------------------------------------------------

describe("a succeeded edge, through bin/fusion-write and bin/fusion-work-order", () => {
  const BIN = (name: string) => resolve(REPO_ROOT, "bin", name);
  const cli = (p: JsonProject, ...args: string[]) => spawnSync(BIN("fusion-write"), args, { cwd: p.root, env: GIT_ENV, encoding: "utf-8" });
  const order = (p: JsonProject) => spawnSync(BIN("fusion-work-order"), [], { cwd: p.root, encoding: "utf-8" }).stdout;
  const readiness = (out: string, stem: string) => new RegExp(`^\\s*\\d+\\s+\\d+\\s+\\d+\\s+(\\w+)\\s+${stem}$`, "m").exec(out)?.[1];
  const unmet = (out: string) => out.split("\n").filter((l) => l.startsWith("unmet="));

  /** A claimed by this checkout, B waiting `succeeded` on it, and A's review filed with `verdict`; returns A, B's stem and the evidence path. */
  function closing(p: JsonProject, verdict: string): { a: string; aDir: string; b: string; ev: string } {
    repo(p);
    const [a, b] = [createPackage(p, "261007-2000-a"), createPackage(p, "261007-2001-b")];
    const steps = [cli(p, "claim", "--record", a.path, "--actor", "orchestrator"), cli(p, "set-dependencies", "--record", b.path, "--on", `succeeded:${a.path}`, "--actor", "user")];
    const ev = cli(p, "evidence", "--record", a.path, "--report", put(p, `${a.dir}/reviews/261007-2002-a-review.md`, "# review\n"), "--verdict", verdict, "--actor", "reviewer");
    expect([...steps, ev].map((r) => r.status)).toEqual([0, 0, 0]);
    return { a: a.path, aDir: a.dir, b: "261007-2001-b", ev: /^path=(.+)$/m.exec(ev.stdout)![1] };
  }
  const finish = (p: JsonProject, a: string, ...extra: string[]) => cli(p, "transition", "--record", a, "--to", "done", "--reason", "closed", "--outcome", FINISHED, ...extra, "--actor", "orchestrator");

  it("B is blocked while A is live, and ready with no unmet row once A is finished with --evidence naming its accepted review, the closure note appended after it included", () => {
    withJsonProject((p) => {
      const { a, aDir, b, ev } = closing(p, "accept");
      const before = order(p);
      expect([readiness(before, b), unmet(before)]).toEqual(["blocked", []]);
      expect(finish(p, a, "--evidence", ev).status).toBe(0);
      const after = order(p);
      expect([shown(p, a).control.status, readiness(after, b), unmet(after)]).toEqual(["done", "ready", []]);
      // The closure note follows the status write; the edge stays met once the brief moves.
      const brief = resolve(p.workbench, aDir, "261007-2000-a.md");
      writeFileSync(brief, `${readFileSync(brief, "utf-8")}\nClosed: the note, after the finish.\n`);
      const noted = order(p);
      expect([readiness(noted, b), unmet(noted)]).toEqual(["ready", []]);
    });
  }, 4 * CASE_TIMEOUT);

  it("control: a finish without --evidence leaves B blocked on an unmet row naming the missing evidence", () => {
    withJsonProject((p) => {
      const { a, b } = closing(p, "accept");
      expect(finish(p, a).status).toBe(0);
      const after = order(p);
      expect([readiness(after, b), unmet(after)]).toEqual(["blocked", [expect.stringMatching(new RegExp(`^unmet=${b} wants 261007-2000-a under succeeded: succeeded: 0 accepted evidence binding`))]]);
    });
  }, 4 * CASE_TIMEOUT);

  it("control: a revise verdict bound the same way lands and leaves B blocked on an unmet row", () => {
    withJsonProject((p) => {
      const { a, b, ev } = closing(p, "revise");
      expect(finish(p, a, "--evidence", ev).status).toBe(0);
      const after = order(p);
      expect([shown(p, a).control.outcome.evidence.length, readiness(after, b), unmet(after)]).toEqual([1, "blocked", [expect.stringMatching(new RegExp(`^unmet=${b} wants 261007-2000-a under succeeded: succeeded: 0 accepted evidence binding`))]]);
    });
  }, 4 * CASE_TIMEOUT);

  it("control: a closure note appended to A's brief before the finish makes the finish refused brief-changed, exit 6, and A stays claimed", () => {
    withJsonProject((p) => {
      const { a, aDir, ev } = closing(p, "accept");
      const brief = resolve(p.workbench, aDir, "261007-2000-a.md");
      writeFileSync(brief, `${readFileSync(brief, "utf-8")}\nClosed: a note written too early.\n`);
      const r = finish(p, a, "--evidence", ev);
      expect([r.status, /brief-changed/.test(r.stderr), shown(p, a).control.status]).toEqual([6, true, "claimed"]);
    });
  }, 4 * CASE_TIMEOUT);
});
