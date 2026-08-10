import { describe, it, expect, afterAll } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// bin/fusion-count-sources is a bash script, so these tests drive the real
// script through child_process against throwaway project fixtures — the same
// way the orchestrator's Setup Step 5 calls it.
//
// What the fixtures are for: the mechanism this helper replaced was a `find`
// walk bounded to "top-level + 1 subdir deep". Every fixture below is a layout
// that walk returned zero (or nonsense) for, so each case is a regression test
// against a real reported defect, not a hypothetical.
// Decision: shared/decisions/260809-1731_*_how-should-the-domain-heuristic-
// count-a-projects-source-files.md.
//
// The failure fixtures are the second half of the same contract. What the
// caller consumes is `counted_by`, so a count that failed must never leave the
// helper wearing `counted_by=git-ls-files`; the two cases below drive a broken
// git and a broken filter and assert the helper does not claim to have counted.
// Issue: shared/issues/260810-0459_*_fusion-count-sources-reports-a-measured-
// zero-when-git-fails-which-its-own-header-forbids.md.
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const script = join(pluginRoot, "bin", "fusion-count-sources");

const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

interface Counts {
  status: number;
  code: string;
  data: string;
  countedBy: string;
  stderr: string;
}

/**
 * `spawnSync` rather than `execFileSync` because stderr is part of what is
 * asserted here: a failed count says why on stderr, and an absent one — no work
 * tree, which is a real answer and not an error — says nothing there.
 * `extraEnv` exists for the one test that shadows a command on PATH.
 */
function runEnv(cwd: string, args: string[], extraEnv: Record<string, string> = {}): Counts {
  const r = spawnSync(script, args, {
    cwd,
    encoding: "utf-8",
    env: { ...process.env, ...extraEnv },
  });
  const stdout = r.stdout ?? "";
  const value = (key: string): string => {
    const line = stdout.split("\n").find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1) : "";
  };
  return {
    status: r.status ?? -1,
    code: value("code_files"),
    data: value("data_files"),
    countedBy: value("counted_by"),
    stderr: r.stderr ?? "",
  };
}

function run(cwd: string, ...args: string[]): Counts {
  return runEnv(cwd, args);
}

/**
 * The extension alternations, read out of the script rather than copied into
 * this file. A copy would drift the moment somebody adds a language — which the
 * script's header explicitly invites ("Adding a language is one word in
 * CODE_EXT") — and the coverage test below would keep passing while covering
 * less. Read from the source, it covers whatever the source currently lists.
 */
function extensions(varName: string): string[] {
  const src = readFileSync(script, "utf-8");
  const assignment = new RegExp(`^${varName}="(?:\\$${varName}\\|)?(.+)"$`);
  const found: string[] = [];
  for (const line of src.split("\n")) {
    const m = line.match(assignment);
    if (m) found.push(...m[1].split("|"));
  }
  return found;
}

/**
 * A throwaway project directory. Files are given as relative paths, empty
 * unless `contents` names them. Anything git-relevant — .gitignore above all —
 * must be written BEFORE the initial commit, or it is committed as the empty
 * file it was and never excludes anything.
 */
function project(files: string[], opts: { git?: boolean; contents?: Record<string, string> } = {}): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-count-"));
  tmpRoots.push(root);
  for (const rel of files) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, opts.contents?.[rel] ?? "");
  }
  if (opts.git !== false) {
    const git = (...args: string[]) =>
      execFileSync("git", ["-C", root, "-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args], {
        stdio: "ignore",
      });
    git("init", "-q");
    git("add", "-A");
    git("commit", "-qm", "init");
  }
  return root;
}

/** The bound the old mechanism applied, so the fixtures can show what it saw. */
function depthTwoWalk(root: string, exts: string[]): number {
  const args = ["."], parts: string[] = [];
  for (const e of exts) parts.push("-name", `*.${e}`, "-o");
  parts.pop();
  const out = execFileSync("find", [...args, "-maxdepth", "2", "-type", "f", "(", ...parts, ")"], {
    cwd: root,
    encoding: "utf-8",
  });
  return out.split("\n").filter(Boolean).length;
}

describe("fusion-count-sources", () => {
  it("counts a Cargo workspace's crates/<name>/src tree, which the depth-2 walk saw as zero", () => {
    const root = project([
      "Cargo.toml",
      ".gitignore",
      "crates/core/src/lib.rs",
      "crates/core/src/ablage/store.rs",
      "crates/core/src/operation/run.rs",
      "crates/cli/src/main.rs",
      "target/debug/deps/build_script.rs",
    ], { contents: { ".gitignore": "target/\n" } });
    expect(depthTwoWalk(root, ["rs"])).toBe(0);

    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.countedBy).toBe("git-ls-files");
    expect(Number(r.code)).toBe(4);
  });

  it("counts a Go internal/<pkg>/ tree and a src/components/<thing>/ frontend", () => {
    const go = project(["go.mod", "internal/store/db.go", "internal/store/handler/get.go", "cmd/serve/main.go"]);
    expect(depthTwoWalk(go, ["go"])).toBe(0);
    expect(Number(run(go).code)).toBe(3);

    const fe = project([
      "package.json",
      "src/components/Button/index.tsx",
      "src/components/Button/Button.tsx",
      "src/views/Home.vue",
      "src/views/App.svelte",
    ]);
    expect(Number(run(fe).code)).toBe(4);
  });

  it("excludes build output and vendored dependencies through .gitignore, with no prune list", () => {
    const root = project([
      ".gitignore",
      "src/app/main.ts",
      "node_modules/react/index.js",
      "node_modules/react/lib/deep.js",
      "dist/bundle.js",
    ], { contents: { ".gitignore": "node_modules/\ndist/\n" } });
    // The old walk counted dist/bundle.js as project source; this one does not.
    expect(depthTwoWalk(root, ["js", "ts"])).toBeGreaterThan(0);
    expect(Number(run(root).code)).toBe(1);
  });

  it("sees a source tree that has not been git-added yet, but still not an ignored one", () => {
    const root = project([".gitignore", "src/tracked.py"], { contents: { ".gitignore": "build/\n" } });
    mkdirSync(join(root, "src", "new"), { recursive: true });
    writeFileSync(join(root, "src", "new", "untracked.py"), "");
    mkdirSync(join(root, "build"), { recursive: true });
    writeFileSync(join(root, "build", "generated.py"), "");

    expect(Number(run(root).code)).toBe(2); // tracked + untracked-not-ignored
  });

  it("counts the languages the old extension list made invisible at any depth", () => {
    const root = project([
      "app/Main.kt",
      "ios/App.swift",
      "native/core.c",
      "native/core.h",
      "native/engine.cpp",
      "svc/Program.cs",
      "web/app.rb",
      "web/index.php",
      "jvm/Job.scala",
      "beam/server.ex",
      "ui/Card.vue",
      "ui/Card.svelte",
    ]);
    expect(Number(run(root).code)).toBe(12);
  });

  it("counts data files by the same mechanism, so the data-vs-code ratio compares like with like", () => {
    // An ontology project: data nested well below the old four fixed directory
    // names, source shallow. `data_files > code_files * 2` has to fire here.
    const files = ["tools/build.py", "tools/validate.py"];
    for (let i = 0; i < 20; i++) files.push(`ontology/terms/group${i % 4}/term${i}.yaml`);
    for (let i = 0; i < 10; i++) files.push(`catalog/v1/entries/e${i}.ttl`);
    const root = project(files);

    const r = run(root);
    expect(Number(r.code)).toBe(2);
    expect(Number(r.data)).toBe(30);
    expect(Number(r.data)).toBeGreaterThan(Number(r.code) * 2);
  });

  it("leaves fusion's own workbench out of both counts", () => {
    const root = project([
      "src/main.go",
      "fusion-workbench/.fusion-setup",
      "fusion-workbench/.guard-state/churn.json",
      "fusion-workbench/shared/notes/tool.py",
    ]);
    const r = run(root);
    expect(Number(r.code)).toBe(1);
    expect(Number(r.data)).toBe(0);
  });

  it("reports an absent count as `unavailable`, never as zero, when there is no git repository", () => {
    const root = project(["src/deep/deeper/a.py", "ontology/x.yaml"], { git: false });
    const r = run(root);
    expect(r.status).toBe(2);
    expect(r.code).toBe("unavailable");
    expect(r.data).toBe("unavailable");
    expect(r.countedBy).toBe("none");
  });

  it("counts an empty repository as a real zero, distinguishable from `unavailable`", () => {
    const root = project(["README.md"]);
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.code).toBe("0");
    expect(r.countedBy).toBe("git-ls-files");
  });

  it("takes the project root as an argument and defaults to the working directory", () => {
    const root = project(["src/pkg/mod/a.py"]);
    expect(run(pluginRoot, root).code).toBe(run(root).code);
  });

  it("exits 1 and says so when the named root is not a directory", () => {
    const r = run(pluginRoot, join(tmpdir(), "fusion-count-does-not-exist"));
    expect(r.status).toBe(1);
  });

  it("counts every extension both lists name, so a language added to one is covered here too", () => {
    for (const [varName, other, floor] of [
      ["CODE_EXT", "DATA_EXT", 50],
      ["DATA_EXT", "CODE_EXT", 15],
    ] as const) {
      const exts = extensions(varName);
      // Guards the parse itself: an empty or tiny list would make the
      // assertions below vacuously true.
      expect(exts.length).toBeGreaterThan(floor);
      expect(new Set(exts).size).toBe(exts.length);

      const root = project(exts.map((e, i) => `src/unit${i}/f${i}.${e}`));
      const r = run(root);
      expect(r.status).toBe(0);
      const [counted, shouldBeZero] =
        varName === "CODE_EXT" ? [r.code, r.data] : [r.data, r.code];
      expect(Number(counted)).toBe(exts.length);
      // The two lists are disjoint, so neither fixture may leak into the other
      // count — that disjointness is what makes the data-vs-code ratio mean
      // anything.
      expect(Number(shouldBeZero)).toBe(0);
    }
  });

  it("matches extensions case-insensitively, as the header says it does", () => {
    const root = project(["src/Legacy.PY", "src/Old.Rs", "src/Mixed.TsX", "conf/Settings.YAML", "conf/Feed.Json"]);
    const r = run(root);
    expect(Number(r.code)).toBe(3);
    expect(Number(r.data)).toBe(2);
  });

  it("counts only its own subtree when the project is nested inside a larger repository", () => {
    // The pathspec is `-- .` relative to <project-root>, which is what makes a
    // monorepo package answerable on its own rather than for the whole repo.
    const root = project([
      "top.py",
      "sibling/other.py",
      "sibling/conf.yaml",
      "pkg/src/deep/a.py",
      "pkg/src/deep/b.py",
      "pkg/schema/t.yaml",
    ]);
    const whole = run(root);
    expect(Number(whole.code)).toBe(4);

    const nested = run(pluginRoot, join(root, "pkg"));
    expect(nested.status).toBe(0);
    expect(nested.countedBy).toBe("git-ls-files");
    expect(Number(nested.code)).toBe(2);
    expect(Number(nested.data)).toBe(1);
  });

  it("reports no count, not a zero, when git fails after the work-tree probe passed", () => {
    // The reviewer's route: a corrupt index leaves `rev-parse
    // --is-inside-work-tree` answering `true` while `ls-files` exits 128. Piped
    // into `sort`, that status was lost and the helper printed
    // `code_files=0 data_files=0 counted_by=git-ls-files`, exit 0 — a failure
    // wearing the label that asserts a measurement, which is the one input the
    // orchestrator's `counted_by == "none"` branch exists to intercept.
    const root = project(["src/deep/deeper/a.py", "ontology/x.yaml"]);
    expect(run(root).countedBy).toBe("git-ls-files"); // healthy first
    writeFileSync(join(root, ".git", "index"), "GARBAGE");

    const probe = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], { encoding: "utf-8" });
    expect(probe.status).toBe(0); // the existing guard does not catch this

    const r = run(root);
    expect(r.countedBy).toBe("none");
    expect(r.code).toBe("unavailable");
    expect(r.data).toBe("unavailable");
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/ls-files failed/);
  });

  it("reports no count when the filter over the listing fails, rather than an empty labelled value", () => {
    // The same defect one step later: `grep` exits >1 on its own errors, and a
    // blanket `|| true` turned that into an empty value still labelled
    // `git-ls-files`. Driven by shadowing `grep` on PATH, because grep's error
    // statuses have no fixture that provokes them from the outside.
    const shim = mkdtempSync(join(tmpdir(), "fusion-count-shim-"));
    tmpRoots.push(shim);
    writeFileSync(join(shim, "grep"), "#!/bin/sh\nexit 2\n", { mode: 0o755 });

    const root = project(["src/a.py"]);
    const r = runEnv(root, [], { PATH: `${shim}:${process.env.PATH ?? ""}` });
    expect(r.countedBy).toBe("none");
    expect(r.code).toBe("unavailable");
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/filter failed/);
  });

  it("says nothing on stderr when not counting is the answer rather than a failure", () => {
    // The absent count has one stdout shape for both causes; stderr is what
    // separates "there was nothing to count" from "counting broke".
    const r = run(project(["src/a.py"], { git: false }));
    expect(r.countedBy).toBe("none");
    expect(r.stderr).toBe("");
  });
});
