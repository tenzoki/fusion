import { describe, it, expect, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
}

function run(cwd: string, ...args: string[]): Counts {
  let status = 0;
  let stdout = "";
  try {
    stdout = execFileSync(script, args, {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    status = e.status ?? -1;
    stdout = e.stdout ?? "";
  }
  const value = (key: string): string => {
    const line = stdout.split("\n").find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1) : "";
  };
  return { status, code: value("code_files"), data: value("data_files"), countedBy: value("counted_by") };
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
});
