import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { buildInventory } from "../legacy-import.js";
import { treeHash } from "../legacy-repair.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// `bin/fusion-migrate` against the real bundle, over copies of the legacy
// fixture (`codec/fixtures/legacy-v12/README.md`) grown to two chunks, its history
// a commit under the v11 store name renamed by another author. Every
// helper call runs with PATH (node, git, the system) and HOME alone: no other
// runtime, checkout or variable. The plan step's note records each guard red
// against a copy without it.
// ---------------------------------------------------------------------------

const FIX = resolve(REPO_ROOT, "codec", "fixtures", "legacy-v12");
const BIN = resolve(REPO_ROOT, "bin", "fusion-migrate");
const GIT = dirname(spawnSync("/bin/sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim());
const PATH = [dirname(process.execPath), GIT, "/usr/bin", "/bin"].join(":");
const BENCH = "shared/plans/260905-0900_o_plan-benchmark-suite.md";
const TRIVIA = "shared/decisions/260905-1200_o_should-the-ast-keep-trivia.md";
const CLOSURE = "work-packages/260903-1200-streaming-input/plans/260903-1230_c_plan-streaming-input-first-cut.md";
const PLAN = "work-packages/260902-1000-parser-error-recovery/plans/260902-1100_p_plan-parser-error-recovery.md";
const SPEC = "work-packages/260902-1000-parser-error-recovery/plans/260902-1030_p_spec-parser-error-recovery.md";
const UNTRACKED = "shared/issues/260906-1500_o_parser-panics-on-empty-file.md";
let base: string;
let n = 0;
beforeAll(() => void (base = realpathSync(mkdtempSync(join(tmpdir(), "fusion-migrate-")))));
afterAll(() => rmSync(base, { recursive: true, force: true }));

const sha = (s: string | Buffer) => "sha256:" + createHash("sha256").update(s).digest("hex");
const canonical = (v: unknown): string => (Array.isArray(v) ? `[${v.map(canonical).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v));
const git = (cwd: string, ...a: string[]) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", ...a], { cwd });
const read = (wb: string, p: string) => readFileSync(join(wb, p), "utf-8");
const edit = (wb: string, p: string, a: string, b: string) => writeFileSync(join(wb, p), read(wb, p).replace(a, b));

/** A copy as the fixture README recreates it, with twenty more live issues (two chunks), two citations of the duplicated step, and an untracked issue with no filer. */
function project(): { root: string; wb: string; home: string } {
  const root = join(base, `p${n++}`);
  const wb = join(root, "fusion-workbench");
  cpSync(join(FIX, "workbench"), wb, { recursive: true, verbatimSymlinks: true });
  writeFileSync(join(wb, ".fusion-setup"), '{"setup_at":"t"}\n');
  for (let i = 10; i < 30; i++) writeFileSync(join(wb, `shared/issues/260907-10${i}_o_extra-issue-${i}.md`), `# Extra issue ${i}\n\n**Filed by:** user\n\nBody.\n`);
  edit(wb, BENCH, "## Where", "Step 2 times the lexer.\n\n## Where");
  writeFileSync(join(wb, TRIVIA), `${read(wb, TRIVIA)}\nThe parser timings are \`260905-0900_*_plan-benchmark-suite.md\` step 2.\n`);
  // First added under the v11 store name with the plan at its earlier marker; both renames are a later commit by another author.
  const moves = [["work-packages", "circles"], [`circles/${PLAN.slice(14)}`, `circles/${PLAN.slice(14).replace("_p_", "_o_")}`]];
  for (const [a, b] of moves) renameSync(join(wb, a), join(wb, b));
  git(root, "init", "-q");
  for (const [k, v] of [["user.name", "t"], ["user.email", "t@example.invalid"]]) git(root, "config", k, v);
  git(root, "add", "-A");
  git(root, "commit", "-qm", "fixture");
  for (const [a, b] of moves.reverse()) renameSync(join(wb, b), join(wb, a));
  git(root, "add", "-A");
  git(root, "-c", "user.name=u", "-c", "user.email=u@example.invalid", "commit", "-qm", "rename");
  cpSync(join(FIX, "untracked/shared/issues"), join(wb, "shared/issues"), { recursive: true });
  edit(wb, UNTRACKED, "**Filed by:** code-implementer, Fixture Person <fixture@example.invalid>\n", "");
  mkdirSync(join(root, "home"));
  return { root, wb, home: join(root, "home") };
}
const mig = (cwd: string, home: string, ...args: string[]) => spawnSync(BIN, args, { cwd, encoding: "utf-8", env: { PATH, HOME: home } });
const value = (out: string, key: string) => out.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);

describe("bin/fusion-migrate refuses without Node, and before anything else", () => {
  it("a PATH without node and a node reporting v20.11.0 are each refused, the tree byte-identical and no backup", () => {
    const { root, wb, home } = project();
    const before = treeHash(wb);
    const stub = join(root, "stub");
    mkdirSync(stub);
    writeFileSync(join(stub, "node"), `#!/bin/sh\n[ "$1" = --version ] && { echo v20.11.0; exit 0; }\nexec ${process.execPath} "$@"\n`, { mode: 0o755 });
    for (const [path, why] of [["/usr/bin:/bin", "`node` is not on PATH"], [`${stub}:/usr/bin:/bin`, "`node` reports 20.11.0"]]) {
      const r = spawnSync(BIN, ["run"], { cwd: root, encoding: "utf-8", env: { PATH: path, HOME: home } });
      expect([r.status, r.stderr]).toEqual([4, `fusion-migrate: Node 20.12.0 or later is required${why === "`node` is not on PATH" ? " and " : "; "}${why}. Nothing was read or written.\n`]);
    }
    expect([treeHash(wb), existsSync(join(home, ".fusion-migrate"))]).toEqual([before, false]);
  });

  it("refuses the v11-named twin with the route to the rename, and a backup that does not verify stops the first repair", () => {
    const { root, wb, home } = project();
    renameSync(join(wb, "work-packages"), join(wb, "circles"));
    const twin = mig(root, home, "run");
    expect([twin.status, twin.stderr, existsSync(join(home, ".fusion-migrate"))]).toEqual([5, expect.stringContaining("/fusion:migrate"), false]);
    renameSync(join(wb, "circles"), join(wb, "work-packages"));
    const session = join(home, "s");
    mkdirSync(join(session, "backup"), { recursive: true });
    writeFileSync(join(session, "backup", "stray.md"), "left by an interrupted copy\n");
    const id = mig(root, home, "repair", "--list", "--optional", "--session", session).stdout.split("\n").find((l) => l.includes("\tcircle-deferred\t"))!.slice(8).split("\t")[0];
    const before = treeHash(wb);
    const r = mig(root, home, "repair", "--apply", id, "--value", "status=paused", "--consent", "--session", session);
    expect([r.status, r.stderr, treeHash(wb), existsSync(join(session, "repair-log.jsonl"))]).toEqual([9, expect.stringContaining("does not verify"), before, false]);
  }, CASE_TIMEOUT);

  it("takes the person from git's first add, through a staged rename too, else carries it unknown with the reason, and run prints its reported lines before refusing", () => {
    const { root, wb, home } = project();
    const person = (cwd: string) => mig(cwd, home, "survey").stdout.split("\n").filter((l) => l.startsWith("derived=/filed_by/person"));
    for (const mv of [[], ["mv", `fusion-workbench/${PLAN}`, `fusion-workbench/${PLAN.replace("_p_", "_o_")}`]]) expect([mv.length ? git(root, ...mv).status : 0, person(root)]).toEqual([0, ["derived=/filed_by/person\tgit-first-add\t*\t4", "derived=/filed_by/person\tunknown\tuntracked\t1"]]);
    expect(git(base, "clone", "-q", "--depth", "1", `file://${root}`, `${root}-shallow`).status).toBe(0);
    expect(person(`${root}-shallow`)).toEqual(["derived=/filed_by/person\tunknown\tshallow-history\t4"]);
    rmSync(join(root, ".git"), { recursive: true, force: true });
    edit(wb, "work-packages/260901-0900-tokenizer-handles-unicode/260901-0900-tokenizer-handles-unicode.md", "**Status:** open", "**Status:** claimed");
    expect(person(root)).toEqual(["derived=/filed_by/person\tunknown\tno-repository\t5"]);
    const r = mig(root, home, "run");
    expect([r.status, r.stdout, r.stderr]).toEqual([6, expect.stringContaining("reported=git\tnot a repository"), expect.stringContaining("blocking invalid-claim")]);
  }, 2 * CASE_TIMEOUT);
});

describe("bin/fusion-migrate migrates, rolls back and restores with the plugin and Node alone", () => {
  it("needs no repair, applies an optional one with consent, migrates through canonical paths, reads back, rolls back after activation and restores the backup", () => {
    const { root, wb, home } = project();
    const original = treeHash(wb);
    const closure = read(wb, CLOSURE);
    const list = mig(root, home, "repair", "--list").stdout;
    expect([value(list, "blocking"), list.includes("ask=")]).toEqual(["0", false]);
    // C16, optional now: the in-file and the incoming citation of the duplicated step would be put to the owner.
    const opt = mig(root, home, "repair", "--list", "--optional").stdout.split("\n");
    const id = opt.find((l) => l.includes("\tduplicate-step-number\t"))!.slice(8).split("\t")[0];
    expect(opt.filter((l) => l.startsWith(`ask=${id}\t`)).map((l) => l.split("\t")[3].split(" line ")[0])).toEqual([BENCH, TRIVIA]);
    // Decision 261003-2045: a reported filer finding, answered with consent, reaches the frozen plan as reported.
    const filer = opt.find((l) => l.endsWith(`\tfiled-by-not-owed\t${SPEC}\tnull`))!.slice(8).split("\t")[0];
    const answered = { actor: "implementation-planner", person: "Fixture Person <fixture@example.invalid>" };
    expect(mig(root, home, "repair", "--apply", filer, "--value", `actor=${answered.actor}`, "--value", `person=${answered.person}`, "--consent").status).toBe(0);
    const stores = () => sha(buildInventory(wb).files.filter((f) => /^(work-packages|shared)\//.test(f.path)).map((f) => `${f.path} ${f.sha256}`).join("\n"));
    const before = stores();
    // Sent through a symlinked spelling of the workbench: every request must still name its real path.
    symlinkSync(root, join(base, `link${n}`));
    const r = spawnSync(process.execPath, [resolve(REPO_ROOT, "hooks", "dist", "migrate.js"), "run", join(base, `link${n}`, "fusion-workbench")], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    expect([r.status, value(r.stdout, "result")], r.stderr).toEqual([0, "json-control"]);
    const session = value(mig(root, home, "status").stdout, "session")!;
    const s = JSON.parse(readFileSync(join(session, "state.json"), "utf-8"));
    expect([s.schedule.apply.length, s.workbench]).toEqual([2, wb]);
    const end = JSON.parse(read(wb, `.json-state/ops/${s.end_id}.json`));
    expect(JSON.parse(read(wb, `archive/migrations/${s.migration_id}/parts/repairs-1.json`)).repairs.map((x: { finding: object; answers: object }) => [x.finding, x.answers])).toEqual([[{ class: "filed-by-not-owed", severity: "reported", path: SPEC, detail: "null" }, answered]]);
    expect(end.request_digest).toBe(sha(canonical({ op: "maintenance", operation_id: s.end_id, action: "end", fence: s.schedule.apply[0].operation_id, workbench: wb })));
    // The duplicated step 2 anchors neither of its lines. A filer nobody recorded is legacy-unknown, its person git's first add through both renames; a terminal record's Markdown stays as it is.
    const control = (p: string) => JSON.parse(read(wb, p.replace(/\.md$/, ".record.json")));
    expect([control(BENCH).control.steps, control(BENCH).provenance.legacy_fields.derived["/control/steps"]]).toEqual([[{ id: "1", state: "open" }], { rule: "duplicate-numbers-unanchored", evidence: "2" }]);
    const first = git(root, "rev-list", "--max-parents=0", "HEAD").stdout.toString().trim();
    const show = (p: string) => JSON.parse(spawnSync(resolve(REPO_ROOT, "bin", "fusion-record"), [], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home }, input: JSON.stringify({ op: "show", record: { path: p.replace(/\.md$/, ".record.json") } }) }).stdout).result.control;
    const shown = show(CLOSURE);
    expect([read(wb, CLOSURE), shown.filed_by, shown.provenance.legacy_fields.derived]).toEqual([closure, { actor: "legacy-unknown", person: "t <t@example.invalid>" }, { "/filed_by/actor": { rule: "unknown" }, "/filed_by/person": { rule: "git-first-add", evidence: first } }]);
    expect(control(PLAN).provenance.legacy_fields.derived["/filed_by/person"]).toEqual({ rule: "git-first-add", evidence: first });
    const repaired = show(SPEC);
    expect([repaired.filed_by, Object.keys(repaired.provenance.legacy_fields.derived ?? {}).filter((k) => k.startsWith("/filed_by"))]).toEqual([answered, []]);
    for (const reader of [["fusion-claimed-package"], ["fusion-work-order"], ["fusion-citation-check"], ["fusion-citation-sweep", "--dry-run"]]) {
      const x = spawnSync(resolve(REPO_ROOT, "bin", reader[0]), reader.slice(1), { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
      expect(x.status, `${reader.join(" ")}: ${x.stderr}`).toBe(0);
    }
    expect(value(mig(root, home, "run").stdout, "result")).toBe("no-op");
    const back = mig(root, home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);
    expect([stores(), existsSync(join(wb, "workbench.json")), read(wb, ".fusion-setup")]).toEqual([before, false, '{"setup_at":"t"}\n']);
    const restored = mig(root, home, "restore-backup", "--consent");
    expect([restored.status, value(restored.stdout, "tree")], restored.stderr).toEqual([0, original]);
  }, 4 * CASE_TIMEOUT);

  it("resumes after a kill following each chunk and one inside a chunk", () => {
    const plugin = join(base, "plugin");
    if (!existsSync(plugin)) {
      for (const p of ["bin", "hooks/dist", "hooks/package.json", "codec/package.json", ".claude-plugin"]) cpSync(join(REPO_ROOT, p), join(plugin, p), { recursive: true });
      mkdirSync(join(plugin, "codec/dist"));
      cpSync(join(REPO_ROOT, "codec/dist/fusion-record.js"), join(plugin, "real/dist/fusion-record.js"));
      cpSync(join(REPO_ROOT, "codec/package.json"), join(plugin, "real/package.json"));
      // The bundle's stand-in: the real one answers, then the process dies before its answer is read when kill.json names the request.
      writeFileSync(join(plugin, "codec/dist/fusion-record.js"), `import { spawnSync } from "node:child_process"; import { existsSync, readFileSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname, input = readFileSync(0), q = JSON.parse(input);
const r = spawnSync(process.execPath, [here + "../../real/dist/fusion-record.js"], { input });
const k = existsSync(here + "kill.json") ? JSON.parse(readFileSync(here + "kill.json", "utf-8")) : null;
if (k && q.phase === k.phase && q.chunk === k.chunk) process.exit(9);
process.stdout.write(r.stdout); process.exit(r.status ?? 1);\n`);
    }
    const kill = (rule: object | null) => (rule ? writeFileSync(join(plugin, "codec/dist/kill.json"), JSON.stringify(rule)) : rmSync(join(plugin, "codec/dist/kill.json"), { force: true }));
    const { root, wb, home } = project();
    const cut = (sub: string) => spawnSync(join(plugin, "bin", "fusion-migrate"), [sub], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    kill({ phase: "apply", chunk: 1 });
    expect([cut("run").status, cut("status").stdout]).toEqual([7, expect.stringContaining("chunks=1/2")]);
    kill(null);
    const s = JSON.parse(readFileSync(join(value(cut("status").stdout, "session")!, "state.json"), "utf-8"));
    const writes = JSON.parse(read(wb, `archive/migrations/${s.migration_id}/chunks/2.json`)).writes as { kind: string; path: string }[];
    const dir = join(wb, dirname(writes.find((w) => w.kind === "control")!.path));
    chmodSync(dir, 0o555);
    const inside = cut("resume");
    chmodSync(dir, 0o755);
    expect([inside.status, existsSync(join(wb, ".json-state/journal", s.schedule.apply[1].operation_id))], inside.stderr).toEqual([7, true]);
    kill({ phase: "apply", chunk: 2 });
    expect([cut("resume").status, existsSync(join(wb, ".json-state/ops", `${s.schedule.apply[1].operation_id}.json`))]).toEqual([7, true]);
    kill(null);
    const done = cut("resume");
    expect([done.status, value(done.stdout, "result"), existsSync(join(wb, "workbench.json"))], done.stderr).toEqual([0, "json-control", true]);
  }, 4 * CASE_TIMEOUT);
});
