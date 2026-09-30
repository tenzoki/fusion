import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  it("the owner releases; another checkout, an unreadable identity and a non-claimed source each take their own branch", () => {
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
      // Out of `open` there is no claim to hold, so no identity is read.
      expect(run(p, "transition", [...on, "--to", "paused", "--reason", "r"], {}).o.kind).toBe("landed");
      expect(rows(p).map((r) => [r.op, r.checkout, r.change])).toEqual([
        ["claim", ME, { from: "open", to: "claimed" }],
        ["release", ME, { from: "claimed", to: "open" }],
        ["transition", undefined, { from: "open", to: "paused" }],
      ]);
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

  it("legacy with a pending initialize is refused and names Setup: only inspect is sent", () => {
    withJsonProject((p) => {
      cpSync(resolve(REPO_ROOT, "codec", "fixtures", "protocol-session-initialize", "seed", "16-inspect", "pending"), p.workbench, { recursive: true });
      // The seed carries a placeholder for its request's digest; inspect reads the intent and not the request, so any digest serves.
      const intent = resolve(p.workbench, ".json-state", "journal", "1a1e0017-0000-4000-8000-000000000017", "intent.json");
      writeFileSync(intent, readFileSync(intent, "utf-8").replace(/<request-digest:[^>]+>/, `sha256:${"0".repeat(64)}`));
      const r = run(p, "claim", ["--record", "work-packages/x/package.json", "--actor", "user"]);
      expect(r.o).toMatchObject({ kind: "unread", detail: expect.stringContaining("Run /fusion:setup") });
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

  it("legacy, no marker, empty: a new workbench, and the re-inspect names its id; .DS_Store and a store are refused by name", () => withJsonProject((p) => {
    bare(p); const r = init(p); const o = r.o as Init & { kind: "ready" };
    expect([o.how, r.ops(), gate(p.workbench, { bundle: BUNDLE })]).toEqual(["initialized", ["inspect", "initialize", "inspect"], { state: "json-control", id: o.workbenchId }]);
    for (const entry of [".DS_Store", "work-packages"]) {
      rmSync(p.workbench, { recursive: true }); mkdirSync(resolve(p.workbench, entry === ".DS_Store" ? "" : entry), { recursive: true }); if (entry === ".DS_Store") put(p, entry);
      expect([init(p).o, readdirSync(p.workbench)], entry).toMatchObject([{ kind: "refused", detail: expect.stringMatching(new RegExp(`target-not-empty.*${entry}`)) }, [entry]]);
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
  it("prints KEY=value lines and exits by the header's table", () => {
    withJsonProject((p) => {
      repo(p);
      const [mine, theirs] = [createPackage(p, "260930-1300-a"), createPackage(p, "260930-1301-b")];
      claim(p, theirs, OTHER);
      const cli = (...args: string[]) => spawnSync(resolve(REPO_ROOT, "bin", "fusion-write"), args, { cwd: p.root, env: GIT_ENV, encoding: "utf-8" });
      const ok = cli("claim", "--record", mine.path, "--actor", "user");
      expect(ok.stdout.split("\n").map((l) => l.split("=")[0])).toEqual(["result", "operation_id", "path", "revision", "event", ""]);
      const codes = [ok, cli("claim", "--record", mine.path, "--actor", "user"), cli("release", "--record", theirs.path, "--actor", "user", "--reason", "r"), cli("claim", "--bogus"), cli("log-repair")];
      codes.push(cli("create", "--kind", "issue", "--narrative-file", put(p, `${mine.dir}/issues/261001-0902-i.md`), "--origin", mine.path, "--actor", "user"), cli("evidence", "--record", mine.path, "--report", put(p, `${mine.dir}/reviews/261001-1000-r.md`), "--verdict", "accept", "--actor", "reviewer"));
      expect(codes.map((r) => r.status)).toEqual([0, 6, 5, 2, 0, 0, 0]);
    });
  }, CASE_TIMEOUT);
});
