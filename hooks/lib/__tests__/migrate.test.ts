import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { buildInventory } from "../legacy-import.js";
import { treeHash } from "../legacy-repair.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

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
const mig = (cwd: string, home: string, ...args: string[]) => spawnSync(BIN, args, { cwd, encoding: "utf-8", env: { PATH, HOME: home }, maxBuffer: 1 << 30 });
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

  // issue 261009-1855: a listing over Node's 1 MB spawn buffer read as no repository, or dropped
  it("lists every path of an ignored listing over 1 MB instead of dropping the listing", () => {
    const { root, wb, home } = project();
    // ~810-byte paths, 1400 of them, the sweep test's fixture: about 1.13 MB of listing
    const deep = join(wb, "bulk", ...["a", "b", "c"].map((c) => c.repeat(200)));
    mkdirSync(deep, { recursive: true });
    for (let i = 0; i < 1400; i++) writeFileSync(join(deep, `${String(i).padStart(4, "0")}${"f".repeat(196)}.txt`), "");
    writeFileSync(join(root, ".git/info/exclude"), "fusion-workbench/bulk/\n");
    edit(wb, "work-packages/260901-0900-tokenizer-handles-unicode/260901-0900-tokenizer-handles-unicode.md", "**Status:** open", "**Status:** claimed");
    const r = mig(root, home, "run");
    expect(r.stdout).not.toContain("reported=git\tnot a repository");
    expect([r.status, r.stdout.length > 1 << 20, r.stdout.split("\n").filter((l) => l.startsWith("ignored=bulk/")).length]).toEqual([6, true, 1400]);
  }, 2 * CASE_TIMEOUT);

  // issues 261009-1958: a `.git` entry decides whether a repository exists; inside one every git failure is stated, a signal too
  it("needs no git without a .git, states git missing, refusing or killed inside one, and reads a repository with no commit as untracked", () => {
    const { root, wb, home } = project();
    const [nogit, killer] = [join(root, "nogit"), join(root, "killer")];
    for (const d of [nogit, killer]) mkdirSync(d);
    symlinkSync(process.execPath, join(nogit, "node"));
    writeFileSync(join(killer, "git"), `#!/bin/sh\ncase "$*" in *ls-files*) kill -9 $$;; esac\nexec ${GIT}/git "$@"\n`, { mode: 0o755 });
    const survey = (env: Record<string, string>) => spawnSync(process.execPath, [resolve(REPO_ROOT, "hooks", "dist", "migrate.js"), "survey", wb], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home, ...env } });
    const person = (r: ReturnType<typeof survey>) => [r.status, r.stdout.split("\n").filter((l) => l.startsWith("derived=/filed_by/person")), r.stderr];
    const fault = (why: RegExp) => [3, [], expect.stringMatching(why)];
    expect(person(survey({ PATH: `${killer}:${PATH}` }))).toEqual(fault(/^fusion-migrate: git ls-files .* failed: killed by SIGKILL\n$/));
    expect(person(survey({ GIT_TEST_ASSUME_DIFFERENT_OWNER: "1", GIT_CONFIG_NOSYSTEM: "1" }))).toEqual(fault(/git rev-parse --show-toplevel .* failed: exit 128: /));
    expect(person(survey({ PATH: nogit }))).toEqual(fault(/git rev-parse --show-toplevel .* failed: ENOENT/));
    rmSync(join(root, ".git"), { recursive: true, force: true });
    expect(person(survey({ PATH: nogit }))).toEqual([0, ["derived=/filed_by/person\tunknown\tno-repository\t5"], ""]);
    git(root, "init", "-q");
    expect(person(survey({}))).toEqual([0, ["derived=/filed_by/person\tunknown\tuntracked\t5"], ""]);
  }, 2 * CASE_TIMEOUT);
});

/** A plugin copy whose bundle is a stand-in: the real codec answers, then the process dies before its answer is read when kill.json names the request. */
function killPlugin(): { plugin: string; kill: (rule: object | null) => void } {
  const plugin = join(base, "plugin");
  if (!existsSync(plugin)) {
    for (const p of ["bin", "hooks/dist", "hooks/package.json", "codec/package.json", ".claude-plugin"]) cpSync(join(REPO_ROOT, p), join(plugin, p), { recursive: true });
    mkdirSync(join(plugin, "codec/dist"));
    cpSync(join(REPO_ROOT, "codec/dist/fusion-record.js"), join(plugin, "real/dist/fusion-record.js"));
    cpSync(join(REPO_ROOT, "codec/package.json"), join(plugin, "real/package.json"));
    writeFileSync(join(plugin, "codec/dist/fusion-record.js"), `import { spawnSync } from "node:child_process"; import { existsSync, readFileSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname, input = readFileSync(0), q = JSON.parse(input);
const r = spawnSync(process.execPath, [here + "../../real/dist/fusion-record.js"], { input });
const k = existsSync(here + "kill.json") ? JSON.parse(readFileSync(here + "kill.json", "utf-8")) : null;
if (k && q.phase === k.phase && q.chunk === k.chunk) process.exit(9);
process.stdout.write(r.stdout); process.exit(r.status ?? 1);\n`);
  }
  return { plugin, kill: (rule) => (rule ? writeFileSync(join(plugin, "codec/dist/kill.json"), JSON.stringify(rule)) : rmSync(join(plugin, "codec/dist/kill.json"), { force: true })) };
}

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

  it("a rollback refused after a create ends the fence it began, and the next create lands (issue 261004-1516)", () => {
    const { root, wb, home } = project();
    const create = (stem: string) => {
      writeFileSync(join(wb, `shared/issues/${stem}.md`), `# ${stem}\n\nBody.\n`);
      return spawnSync(resolve(REPO_ROOT, "bin", "fusion-write"), ["create", "--kind", "issue", "--narrative-file", `shared/issues/${stem}.md`, "--origin", "user-request", "--actor", "user"], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    };
    expect(mig(root, home, "run").status).toBe(0);
    expect(create("261004-1600-after-activation").status).toBe(0);
    const back = mig(root, home, "rollback");
    expect([back.status, back.stderr]).toEqual([8, expect.stringMatching(/after-state-changed[\s\S]*Work stored since the plan[\s\S]*fence .* is ended/)]);
    expect([value(mig(root, home, "status").stdout, "fence"), mig(root, home, "rollback").status]).toEqual(["-", 8]);
    const after = create("261004-1601-after-refusal");
    expect([after.status, value(mig(root, home, "status").stdout, "fence")], after.stderr).toEqual([0, "-"]);
  }, 4 * CASE_TIMEOUT);

  it("a refusal a restore clears leaves the fence: an edited narrative put back rolls back; a deleted receipt takes --end-fence (issue 261004-1807, C1)", () => {
    const edited = project();
    expect(mig(edited.root, edited.home, "run").status).toBe(0);
    const bytes = read(edited.wb, BENCH);
    writeFileSync(join(edited.wb, BENCH), `${bytes}\nA hand edit, no codec operation.\n`);
    const refused = mig(edited.root, edited.home, "rollback");
    expect([refused.status, refused.stderr]).toEqual([8, expect.stringMatching(/after-state-changed[\s\S]*fence .* stands[\s\S]*rollback --end-fence/)]);
    expect(value(mig(edited.root, edited.home, "status").stdout, "fence")).not.toBe("-");
    writeFileSync(join(edited.wb, BENCH), bytes);
    const back = mig(edited.root, edited.home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);

    const { root, wb, home } = project();
    expect(mig(root, home, "run").status).toBe(0);
    const receipt = JSON.parse(read(wb, "workbench.json")).migration.receipt as string;
    rmSync(join(wb, receipt));
    const unverified = mig(root, home, "rollback");
    expect([unverified.status, unverified.stderr]).toEqual([8, expect.stringMatching(/receipt-unverified[\s\S]*fence .* stands/)]);
    const ended = mig(root, home, "rollback", "--end-fence");
    expect([ended.status, value(mig(root, home, "status").stdout, "fence"), mig(root, home, "rollback", "--end-fence").status], ended.stderr).toEqual([0, "-", 5]);
  }, 6 * CASE_TIMEOUT);

  it("resumes after a kill following each chunk and one inside a chunk", () => {
    const { plugin, kill } = killPlugin();
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

  // Resume, rollback and run refuse without a write, and set-aside --consent is the way out; Step 7's route over this tree is store-name-migration.test.ts case (i).
  it("a done session over a tree reset with git: resume, rollback and run refuse it unchanged, set-aside --consent moves it aside, and run then migrates (issue 261015-2223)", () => {
    const { root, wb, home } = project();
    writeFileSync(join(root, ".git/info/exclude"), "home/\n", { flag: "a" }); // the session must survive the reset
    expect(mig(root, home, "run").status).toBe(0);
    git(root, "add", "-A");
    git(root, "commit", "-qm", "migrated");
    expect(git(root, "reset", "-q", "--hard", "HEAD~1").status).toBe(0);
    const status = mig(root, home, "status").stdout;
    expect(["state", "done", "rolled_back", "record"].map((k) => value(status, k))).toEqual(["legacy", "true", "false", "stale"]);
    const session = value(status, "session")!;
    const bytes = () => readFileSync(join(session, "state.json"), "utf-8");
    const refuse = (before: string) => {
      for (const sub of ["resume", "rollback", "run"]) expect([sub, ...((r) => [r.status, r.stderr])(mig(root, home, sub)), bytes()]).toEqual([sub, 5, expect.stringMatching(/does not carry it[\s\S]*`bin\/fusion-migrate set-aside --consent`[\s\S]*--session .*\.stale-/), before]);
    };
    refuse(bytes());
    // 13.1.3's refused rollback wrote its ids before the codec refused: the record stays stale with them.
    const s = JSON.parse(bytes());
    writeFileSync(join(session, "state.json"), JSON.stringify({ ...s, rollback: { begin_id: "b", end_id: "e" } }));
    refuse(bytes());
    expect([mig(root, home, "set-aside").status, existsSync(session)]).toEqual([5, true]);
    const aside = mig(root, home, "set-aside", "--consent");
    const moved = value(aside.stdout, "set-aside")!;
    expect([aside.status, moved, value(aside.stdout, "result"), existsSync(session), value(mig(root, home, "status", "--session", moved).stdout, "record")], aside.stderr).toEqual([0, expect.stringMatching(/\.stale-\d{8}T\d{6}Z$/), "no-record", false, "stale"]);
    const again = mig(root, home, "run");
    expect([again.status, value(again.stdout, "result"), value(mig(root, home, "status").stdout, "record")], again.stderr).toEqual([0, "json-control", "current"]);
  }, 6 * CASE_TIMEOUT);

  // status's record= reads the tree against the record's last write: (b) migrated here and (c) a rollback cut after chunk 0 are current, (d) an overtaken copy is stale.
  it("record=current over a migrated tree and a rollback interrupted after chunk 0, record=stale over a copy no plan of the record produced", () => {
    const { root, wb, home } = project();
    expect(mig(root, home, "run").status).toBe(0);
    const record = (...a: string[]) => value(mig(root, home, "status", ...a).stdout, "record");
    expect([record(), mig(root, home, "set-aside", "--consent").status, existsSync(value(mig(root, home, "status").stdout, "session")!)]).toEqual(["current", 5, true]);
    cpSync(root, `${root}-copy`, { recursive: true, verbatimSymlinks: true });
    const session = value(mig(root, home, "status").stdout, "session")!;
    const real = JSON.parse(readFileSync(join(session, "state.json"), "utf-8"));
    mkdirSync(join(home, "overtaken"));
    for (const plan of [null, { path: real.plan.path, sha256: sha("other bytes") }]) {
      writeFileSync(join(home, "overtaken", "state.json"), JSON.stringify({ ...real, workbench: join(`${root}-copy`, "fusion-workbench"), plan, done: false, rollback: null }));
      const at = (sub: string) => mig(`${root}-copy`, home, sub, "--session", join(home, "overtaken"));
      const run = at("run");
      expect([value(at("status").stdout, "record"), run.status, run.stderr.includes(`set-aside --consent --session ${join(home, "overtaken")}\``), at("resume").status], JSON.stringify(plan)).toEqual(["stale", 5, true, 5]);
    }
    expect(mig(root, home, "rollback").status).toBe(0);
    const kept = mig(root, home, "set-aside", "--consent"); // a rolled-back record is current, and run is what acts on it (issue 261016-1052)
    expect([kept.status, /`run` starts a new migration/.test(kept.stderr), kept.stderr.includes("`resume`")], kept.stderr).toEqual([5, true, false]);
    const cut = JSON.parse(readFileSync(join(session, "state.json"), "utf-8"));
    writeFileSync(join(session, "state.json"), JSON.stringify({ ...cut, rolled_back: false }));
    const chunk0 = cut.schedule.rollback.find((r: { chunk: number }) => r.chunk === 0).operation_id;
    expect([existsSync(join(wb, cut.plan.path)), existsSync(join(wb, `.json-state/ops/${chunk0}.json`)), cut.rollback, record()]).toEqual([false, true, expect.anything(), "current"]);
    const back = mig(root, home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);
  }, 4 * CASE_TIMEOUT);

  // Chunk 0's intent removes the index last and its answer lands under ops/ only after that, so a cut between the two holds the answer in the intent alone.
  it("record=current over a rollback cut inside chunk 0's intent, the index gone and the answer not yet stored", () => {
    const plugin = join(base, "plugin-cut0");
    for (const p of ["bin", "hooks/dist", "hooks/package.json", "codec/package.json", ".claude-plugin"]) cpSync(join(REPO_ROOT, p), join(plugin, p), { recursive: true });
    mkdirSync(join(plugin, "codec/dist"));
    cpSync(join(REPO_ROOT, "codec/dist/fusion-record.js"), join(plugin, "real/dist/fusion-record.js"));
    cpSync(join(REPO_ROOT, "codec/package.json"), join(plugin, "real/package.json"));
    // The stand-in makes ops/ read-only before the real codec takes chunk 0, so every write lands and the answer cannot.
    writeFileSync(join(plugin, "codec/dist/fusion-record.js"), `import { spawnSync } from "node:child_process"; import { chmodSync, readFileSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname, input = readFileSync(0), q = JSON.parse(input);
if (q.op === "migration" && q.phase === "rollback" && q.chunk === 0) chmodSync(q.workbench + "/.json-state/ops", 0o555);
const r = spawnSync(process.execPath, [here + "../../real/dist/fusion-record.js"], { input });
process.stdout.write(r.stdout); process.exit(r.status ?? 1);\n`);
    const { root, wb, home } = project();
    expect(mig(root, home, "run").status).toBe(0);
    const cut = spawnSync(join(plugin, "bin", "fusion-migrate"), ["rollback"], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    chmodSync(join(wb, ".json-state/ops"), 0o755);
    const s = JSON.parse(readFileSync(join(value(mig(root, home, "status").stdout, "session")!, "state.json"), "utf-8"));
    const chunk0 = s.schedule.rollback.find((r: { chunk: number }) => r.chunk === 0).operation_id;
    expect([cut.status, existsSync(join(wb, s.plan.path)), existsSync(join(wb, `.json-state/ops/${chunk0}.json`)), existsSync(join(wb, ".json-state/journal", chunk0)), value(mig(root, home, "status").stdout, "record")], cut.stderr).toEqual([7, false, false, true, "current"]);
    const back = mig(root, home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);
  }, 4 * CASE_TIMEOUT);

  // issue 261016-1052, cells C, A and D of decision 261016-1436: C's idle fence is ended by rollback --end-fence (option 1); A and D keep their fence.
  const FENCE = ".json-state/maintenance.json";
  /** Cell C: a migration committed, a first rollback chunk refused over a hand edit, then a git reset back to Markdown. */
  function cellC(): { root: string; wb: string; home: string; session: string; fence: string } {
    const { root, wb, home } = project();
    writeFileSync(join(root, ".git/info/exclude"), "home/\n", { flag: "a" });
    expect(mig(root, home, "run").status).toBe(0);
    git(root, "add", "-A");
    git(root, "commit", "-qm", "migrated");
    writeFileSync(join(wb, BENCH), `${read(wb, BENCH)}\nA hand edit, no codec operation.\n`);
    const refused = mig(root, home, "rollback");
    expect([refused.status, refused.stderr]).toEqual([8, expect.stringMatching(/after-state-changed[\s\S]*fence .* stands/)]);
    expect(git(root, "reset", "-q", "--hard", "HEAD~1").status).toBe(0);
    const status = mig(root, home, "status").stdout;
    expect([value(status, "state"), value(status, "fence") !== "-", value(status, "record")], status).toEqual(["legacy", true, "stale"]);
    return { root, wb, home, session: value(status, "session")!, fence: read(wb, FENCE) };
  }

  it("cell C: set-aside refuses and names rollback --end-fence, which ends the idle fence (not while write.lock stands), and run then migrates (issue 261016-1052)", () => {
    const { root, wb, home, session, fence } = cellC();
    const survey = () => spawnSync("bash", ["-c", extractBashBlock(readFileSync(join(REPO_ROOT, "skills/migrate/SKILL.md"), "utf-8"), "**Survey.**")], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home, FUSION_PLUGIN_ROOT: REPO_ROOT } }).stdout;
    expect(survey()).toMatch(/^ROUTE=stale$/m); // the shipped Step 7 routes the idle fence to its stale line
    const stuck = mig(root, home, "set-aside", "--consent");
    expect([stuck.status, stuck.stderr, existsSync(session)]).toEqual([5, expect.stringMatching(/no rollback chunk landed under it; `bin\/fusion-migrate rollback --end-fence` ends it, then `bin\/fusion-migrate set-aside --consent`/), true]);
    expect(mig(root, home, "run").stderr).toMatch(/does not carry it[\s\S]*first, the fence .* `bin\/fusion-migrate rollback --end-fence` ends it; then `bin\/fusion-migrate set-aside --consent`/);
    writeFileSync(join(wb, ".json-state/write.lock"), "");
    const locked = mig(root, home, "rollback", "--end-fence");
    rmSync(join(wb, ".json-state/write.lock"));
    expect([locked.status, locked.stderr, read(wb, FENCE)]).toEqual([5, expect.stringMatching(/write\.lock stands[\s\S]*Nothing was removed/), fence]);
    const ended = mig(root, home, "rollback", "--end-fence");
    expect([ended.status, value(ended.stdout, "fence-ended"), value(ended.stdout, "result"), value(ended.stdout, "note"), value(mig(root, home, "status").stdout, "fence")], ended.stderr).toEqual([0, JSON.parse(fence).operation_id, "legacy", "no rollback chunk landed under it, and the codec refuses every later rollback of this migration; set-aside --consent, then run", "-"]);
    const aside = mig(root, home, "set-aside", "--consent");
    expect([aside.status, survey()], aside.stderr).toEqual([0, expect.stringMatching(/^ROUTE=survey$/m)]); // exit 0: the survey block again
    const again = mig(root, home, "run");
    expect([again.status, value(again.stdout, "result")], again.stderr).toEqual([0, "json-control"]);
  }, 6 * CASE_TIMEOUT);

  it("cell C set aside under 13.1.4: run's fence refusal names rollback --end-fence under that record's --session, and run then migrates (issue 261016-1052)", () => {
    const { root, home, session } = cellC();
    const aside = `${session}.stale-20261016T000000Z`;
    renameSync(session, aside);
    const run = mig(root, home, "run");
    expect([run.status, run.stderr.includes("a fence or a pending intent stands"), run.stderr.includes(`\`bin/fusion-migrate rollback --end-fence --session ${aside}\` ends it`)], run.stderr).toEqual([5, true, true]);
    const ended = mig(root, home, "rollback", "--end-fence", "--session", aside);
    expect([ended.status, value(ended.stdout, "note")], ended.stderr).toEqual([0, "no rollback chunk landed under it, and the codec refuses every later rollback of this migration; run"]);
    const again = mig(root, home, "run");
    expect([again.status, value(again.stdout, "result")], again.stderr).toEqual([0, "json-control"]);
  }, 6 * CASE_TIMEOUT);

  it("cell A: a rollback cut after its first chunk over a legacy tree is current, --end-fence leaves its fence, and rollback completes (issue 261016-1052)", () => {
    const { plugin, kill } = killPlugin();
    const { root, wb, home } = project();
    const cut = (...a: string[]) => spawnSync(join(plugin, "bin", "fusion-migrate"), a, { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    kill(null);
    expect(cut("run").status).toBe(0);
    kill({ phase: "rollback", chunk: 2 });
    expect(cut("rollback").status).toBe(7);
    kill(null);
    const status = cut("status").stdout;
    expect([value(status, "state"), value(status, "fence") !== "-", value(status, "record")], status).toEqual(["legacy", true, "current"]);
    const s = JSON.parse(readFileSync(join(value(status, "session")!, "state.json"), "utf-8"));
    const chunk2 = s.schedule.rollback.find((r: { chunk: number }) => r.chunk === 2).operation_id;
    const fence = read(wb, ".json-state/maintenance.json");
    expect([existsSync(join(wb, `.json-state/ops/${chunk2}.json`)), cut("rollback", "--end-fence").status, read(wb, ".json-state/maintenance.json")]).toEqual([true, 5, fence]);
    // `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md`: the same cell made stale by hand, no reset.
    const index = readFileSync(join(wb, s.plan.path));
    rmSync(join(wb, s.plan.path));
    const byHand = cut("set-aside", "--consent");
    expect([value(cut("status").stdout, "record"), byHand.status, byHand.stderr, /the tree was reset|so its plan index is gone/.test(byHand.stderr), byHand.stderr.includes("nothing was written or lost"), byHand.stderr.includes("rollback chunk 0's answer"), byHand.stderr.includes("maintenance.json` by hand"), existsSync(value(status, "session")!), read(wb, FENCE)], byHand.stderr).toEqual(["stale", 5, expect.stringMatching(/rollback chunks? 2/), false, false, true, false, true, fence]);
    writeFileSync(join(wb, s.plan.path), index);
    expect(value(cut("status").stdout, "record")).toBe("current");
    const back = cut("rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);
  }, 4 * CASE_TIMEOUT);

  it("cell A reset with git and cell C with a fence of another id: --end-fence leaves either fence byte-identical (issue 261016-1052)", () => {
    const { plugin, kill } = killPlugin();
    const { root, wb, home } = project();
    const cut = (...a: string[]) => spawnSync(join(plugin, "bin", "fusion-migrate"), a, { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
    writeFileSync(join(root, ".git/info/exclude"), "home/\n", { flag: "a" });
    kill(null);
    expect(cut("run").status).toBe(0);
    [["add", "-A"], ["commit", "-qm", "migrated"]].forEach((a) => git(root, ...a));
    kill({ phase: "rollback", chunk: 2 });
    expect(cut("rollback").status).toBe(7);
    kill(null);
    expect(git(root, "reset", "-q", "--hard", "HEAD~1").status).toBe(0);
    const fence = read(wb, FENCE);
    // Issue 261016-1807: every refusal over this cell names the rollback chunks that landed and the reset, never a step that refuses.
    const st = cut("status").stdout;
    expect(["state", "record"].map((k) => value(st, k))).toEqual(["legacy", "stale"]);
    expect(value(st, "fence")).not.toBe("-");
    const session = value(st, "session")!;
    const s = JSON.parse(readFileSync(join(session, "state.json"), "utf-8"));
    const chunk2 = s.schedule.rollback.find((r: { chunk: number }) => r.chunk === 2).operation_id;
    expect(existsSync(join(wb, ".json-state/ops", `${chunk2}.json`))).toBe(true);
    const named = { status: 5, stderr: expect.stringMatching(/rollback chunks? 2[\s\S]*reset/) };
    for (const sub of ["rollback", "resume", "run"]) {
      const r = cut(sub);
      expect([r, r.stderr.includes("set-aside --consent")], r.stderr).toMatchObject([named, false]);
    }
    const aside = cut("set-aside", "--consent");
    expect([aside, aside.stderr.includes("the tool that set it"), existsSync(session)], aside.stderr).toMatchObject([named, false, true]);
    const end = cut("rollback", "--end-fence");
    expect([end, end.stderr.includes("no fence of a refused rollback stands")], end.stderr).toMatchObject([named, false]);
    expect(read(wb, FENCE)).toBe(fence);
    expect([value(cut("status").stdout, "record"), cut("rollback", "--end-fence").status, read(wb, FENCE)]).toEqual(["stale", 5, fence]);
    // A record 13.1.4 set aside over this cell: run's refusal names the situation under its --session.
    const old = `${session}.stale-20261016T000000Z`;
    renameSync(session, old);
    const again = cut("run");
    expect([again, again.stderr.includes(`--session ${old}`), again.stderr.includes("once no rollback chunk of that record landed"), read(wb, FENCE)], again.stderr).toMatchObject([named, true, false, fence]);
    // `261016-1958-is-a-rollback-fence-ended-when-the-rollback-landed-chunks-and-a-git-reset-then-took-the-tree-back-to-markdown.md`, option 2: the refusal names the hand deletion and its conditions; taking it is the way out.
    renameSync(old, session);
    const prop = JSON.parse(readFileSync(join(wb, s.proposal.path), "utf-8"));
    const ctl = (Object.values(prop.records) as { control_path: string }[]).map((r) => r.control_path).find((p) => existsSync(join(wb, dirname(p))))!;
    writeFileSync(join(wb, ctl), "{}\n");
    const held = cut("set-aside", "--consent");
    expect([held.status, held.stderr.includes("maintenance.json"), held.stderr.includes("(1 of the"), read(wb, FENCE)], held.stderr).toEqual([5, false, true, fence]);
    rmSync(join(wb, ctl));
    // `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md`: a proposal at other bytes names no deletion; put back, it names it.
    const bytes = readFileSync(join(wb, s.proposal.path));
    writeFileSync(join(wb, s.proposal.path), Buffer.concat([bytes, Buffer.from("\n")]));
    const unverified = cut("set-aside", "--consent");
    expect([unverified.status, unverified.stderr.includes(`the proposal ${s.proposal.path} is missing or at other bytes`), unverified.stderr.includes("maintenance.json` by hand"), read(wb, FENCE)], unverified.stderr).toEqual([5, true, false, fence]);
    writeFileSync(join(wb, s.proposal.path), bytes);
    const verified = cut("set-aside", "--consent");
    expect([verified.status, verified.stderr.includes("maintenance.json` by hand")], verified.stderr).toEqual([5, true]);
    expect(aside.stderr).toMatch(/Deleting `\.json-state\/maintenance\.json` by hand ends it once `bin\/fusion-migrate status` shows `record=stale`, `\.json-state\/journal\/` is empty and none of the [1-9]\d* control paths the proposal lists stands \(none stands now\)/);
    rmSync(join(wb, FENCE));
    const moved = cut("set-aside", "--consent");
    expect(moved.status, moved.stderr).toBe(0);
    const done = cut("run");
    expect([done.status, value(done.stdout, "result")], done.stderr).toEqual([0, "json-control"]);
    const c = cellC();
    const other = `${JSON.stringify({ ...JSON.parse(c.fence), operation_id: randomUUID() })}\n`;
    writeFileSync(join(c.wb, FENCE), other);
    expect([mig(c.root, c.home, "rollback", "--end-fence").status, read(c.wb, FENCE)]).toEqual([5, other]);
  }, 8 * CASE_TIMEOUT);

  it("cell D: a fence this record did not begin, over a tree reset with git, is left by --end-fence (issue 261016-1052)", () => {
    const { root, wb, home } = project();
    writeFileSync(join(root, ".git/info/exclude"), "home/\n", { flag: "a" });
    expect(mig(root, home, "run").status).toBe(0);
    git(root, "add", "-A");
    git(root, "commit", "-qm", "migrated");
    const id = randomUUID();
    const begin = spawnSync(resolve(REPO_ROOT, "bin", "fusion-record"), [], { cwd: wb, encoding: "utf-8", env: { PATH, HOME: home }, input: JSON.stringify({ op: "maintenance", operation_id: id, action: "begin" }) });
    expect(begin.status, begin.stdout + begin.stderr).toBe(0);
    const fence = read(wb, ".json-state/maintenance.json");
    expect(git(root, "reset", "-q", "--hard", "HEAD~1").status).toBe(0);
    const end = mig(root, home, "rollback", "--end-fence");
    expect([end.status, read(wb, ".json-state/maintenance.json"), value(mig(root, home, "status").stdout, "fence")], end.stderr).toEqual([5, fence, id]);
  }, 4 * CASE_TIMEOUT);
});

// Package 261019-0906: a legacy workbench holding no record migrates as one chunk with no write, and the record a refused plan left has two ways out.
describe("bin/fusion-migrate over a legacy workbench holding no record", () => {
  function empty(): { root: string; wb: string; home: string } {
    const root = join(base, `e${n++}`), wb = join(root, "fusion-workbench");
    mkdirSync(join(wb, "shared/memos"), { recursive: true });
    mkdirSync(join(root, "home"));
    writeFileSync(join(wb, ".fusion-setup"), '{"setup_at":"t"}\n');
    writeFileSync(join(wb, "shared/memos/notes-fixture-person.md"), "# Notes\n\nA memo, and no record.\n");
    return { root, wb, home: join(root, "home") };
  }
  const files = (d: string) => buildInventory(d).files.filter((f) => !f.path.startsWith(".json-state/")).map((f) => `${f.path} ${f.sha256}`);
  const paths = (root: string, home: string) => spawnSync(resolve(REPO_ROOT, "bin", "fusion-paths"), ["implementation-planner"], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } }).status;

  it("survey counts 0, run reaches json-control in one chunk, the readers answer, and rollback puts back the backup's files", () => {
    const { root, wb, home } = empty();
    expect(paths(root, home)).toBe(3);
    const survey = mig(root, home, "survey");
    expect([survey.status, survey.stdout.split("\n").filter((l) => l.startsWith("count=")).map((l) => l.split("\t")[1])], survey.stderr).toEqual([0, ["0", "0", "0", "0", "0", "0"]]);
    const run = mig(root, home, "run");
    expect([run.status, value(run.stdout, "result")], run.stderr).toEqual([0, "json-control"]);
    const status = mig(root, home, "status").stdout;
    expect(["chunks", "verified", "done"].map((k) => value(status, k))).toEqual(["1/1", "yes", "true"]);
    const inspect = spawnSync(resolve(REPO_ROOT, "bin", "fusion-record"), [], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home }, input: '{"op":"inspect"}' });
    expect([JSON.parse(inspect.stdout).result.state, paths(root, home)]).toEqual(["json-control", 0]);
    const back = mig(root, home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "legacy"]);
    // The files are the backup's; the migration's directories under archive/ stay, empty.
    const id = value(status, "migration")!;
    expect([files(wb), buildInventory(wb).dirs.filter((d) => d.startsWith("archive"))]).toEqual([files(join(value(status, "session")!, "backup")), ["archive", "archive/migrations", `archive/migrations/${id}`, `archive/migrations/${id}/chunks`, `archive/migrations/${id}/parts`]]);
  }, 4 * CASE_TIMEOUT);

  it("the record the old refusal left: resume reaches json-control, and rollback then run does too", () => {
    const plugin = join(base, "plugin-refuse");
    for (const p of ["bin", "hooks/dist", "hooks/package.json", "codec/package.json", ".claude-plugin"]) cpSync(join(REPO_ROOT, p), join(plugin, p), { recursive: true });
    mkdirSync(join(plugin, "codec/dist"));
    cpSync(join(REPO_ROOT, "codec/dist/fusion-record.js"), join(plugin, "real/dist/fusion-record.js"));
    cpSync(join(REPO_ROOT, "codec/package.json"), join(plugin, "real/package.json"));
    // The stand-in answers plan as the codec before a9ac4fe4 did, storing no answer; every other request reaches the real codec.
    writeFileSync(join(plugin, "codec/dist/fusion-record.js"), `import { spawnSync } from "node:child_process"; import { readFileSync } from "node:fs";
const here = new URL(".", import.meta.url).pathname, input = readFileSync(0), q = JSON.parse(input);
if (q.op === "migration" && q.phase === "plan") { process.stdout.write(JSON.stringify({ ok: false, error: { class: "schema-invalid", reason: "proposal-invalid", detail: q.proposal.path + " names no record; a migration converts at least one pair" } }) + "\\n"); process.exit(0); }
const r = spawnSync(process.execPath, [here + "../../real/dist/fusion-record.js"], { input });
process.stdout.write(r.stdout); process.exit(r.status ?? 1);\n`);
    const refused = (root: string, home: string) => {
      const r = spawnSync(join(plugin, "bin", "fusion-migrate"), ["run"], { cwd: root, encoding: "utf-8", env: { PATH, HOME: home } });
      const status = mig(root, home, "status").stdout;
      expect([r.status, r.stderr, ["planned", "done", "record"].map((k) => value(status, k))]).toEqual([8, expect.stringContaining("names no record; a migration converts at least one pair"), ["no", "false", "current"]]);
    };
    const one = empty();
    refused(one.root, one.home);
    const resumed = mig(one.root, one.home, "resume");
    expect([resumed.status, value(resumed.stdout, "result")], resumed.stderr).toEqual([0, "json-control"]);
    const two = empty();
    refused(two.root, two.home);
    const back = mig(two.root, two.home, "rollback");
    expect([back.status, value(back.stdout, "result")], back.stderr).toEqual([0, "nothing-planned"]);
    const again = mig(two.root, two.home, "run");
    expect([again.status, value(again.stdout, "result")], again.stderr).toEqual([0, "json-control"]);
  }, 6 * CASE_TIMEOUT);
});
