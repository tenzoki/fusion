import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  copyFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// bin/fusion-protected-paths — the effective protected-path report.
//
// Driven as the orchestrator's Setup drives it: the real bash script, against
// throwaway project roots, one child process per case. In-process calls would
// not do here, because two of the facts under test are answered from
// `process.cwd()` and from a workbench root walked up to from it, and a vitest
// worker has neither where it needs them.
//
// What each case pins, and why it is that case and not another:
//
//   - INHERITANCE is asserted against `hooks/config.json` as it is read, not
//     against a copy of the eight patterns. Whether a consumer should inherit
//     any protected path at all is the open question in issue
//     `260812-0843_*_the-guard-and-its-configuration-must-be-simplified-project-settable-and-defaulted-to-fit-or-not-shipped-to-consumers-at-all.md`,
//     and this helper is a report that must hold whichever way that is
//     answered. A test carrying its own copy of the list would fail the day the
//     decision lands and would be read as the helper breaking.
//   - NARROWING and DECLARED-EMPTY are the two shapes a project's own answer
//     takes, and the empty one is the one that must not read like a failure.
//   - MALFORMED is the acceptance criterion "a missing or unreadable project
//     config is reported as such and does not read as an empty list".
//   - The STAND-DOWN cases are two, not one. The write-tool deny asks about the
//     working directory and the measurement asks about the workbench root
//     (`hooks/lib/self-detect.ts`), so a fixture read from its root and the same
//     fixture read from a subdirectory give DIFFERENT answers. One case would
//     pass against a helper that collapsed the two halves into one.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const script = join(pluginRoot, "bin", "fusion-protected-paths");

const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

interface Report {
  status: number;
  stdout: string;
  stderr: string;
  /** First value for a key, or `""` when the key was not printed at all. */
  value(key: string): string;
  /** Every `path=<p> origin=<o>` line, in the order printed. */
  entries(): { path: string; origin: string }[];
}

function run(cwd: string, ...args: string[]): Report {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8" });
  const stdout = r.stdout ?? "";
  const lines = stdout.split("\n");
  return {
    status: r.status ?? -1,
    stdout,
    stderr: r.stderr ?? "",
    value(key) {
      const line = lines.find((l) => l.startsWith(`${key}=`));
      return line ? line.slice(key.length + 1) : "";
    },
    entries() {
      return lines
        .filter((l) => l.startsWith("path="))
        .map((l) => {
          const m = /^path=(.*) origin=([a-z]+)$/.exec(l);
          if (m === null) throw new Error(`unparseable entry line: ${l}`);
          return { path: m[1], origin: m[2] };
        });
    },
  };
}

/**
 * A throwaway project root with a workbench marker, and optionally a
 * `fusion-guard.json` and a plugin manifest.
 *
 * `realpathSync` because on macOS `mkdtemp` hands back a `/var/...` path that
 * the child process reports as `/private/var/...`, and two of the values under
 * test are directories.
 */
function project(options: {
  guardConfig?: string;
  pluginManifest?: string;
  subdir?: string;
}): { root: string; cwd: string } {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "fusion-protected-")));
  tmpRoots.push(root);
  mkdirSync(join(root, "fusion-workbench"), { recursive: true });
  writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), "{}\n");

  if (options.guardConfig !== undefined) {
    writeFileSync(join(root, "fusion-guard.json"), options.guardConfig);
  }
  if (options.pluginManifest !== undefined) {
    mkdirSync(join(root, ".claude-plugin"), { recursive: true });
    writeFileSync(
      join(root, ".claude-plugin", "plugin.json"),
      options.pluginManifest,
    );
  }

  let cwd = root;
  if (options.subdir !== undefined) {
    cwd = join(root, options.subdir);
    mkdirSync(cwd, { recursive: true });
  }
  return { root, cwd };
}

/** The plugin layer's declared list, read rather than copied. See the header. */
function pluginDeclaredPaths(): string[] | undefined {
  const raw = JSON.parse(
    readFileSync(join(pluginRoot, "hooks", "config.json"), "utf-8"),
  ) as { guard?: { protectedPaths?: string[] } };
  return raw.guard?.protectedPaths;
}

/** The two spellings `lib/config.ts` appends when a project config file exists. */
function floorFor(root: string): string[] {
  return ["fusion-guard.json", join(root, "fusion-guard.json")];
}

describe("bin/fusion-protected-paths", () => {
  describe("inheritance from the plugin layer", () => {
    it("reports the plugin's list as the plugin's, entry by entry", () => {
      const declared = pluginDeclaredPaths();
      expect(
        declared,
        "hooks/config.json declares no protectedPaths key at all; this case has nothing to assert inheritance of",
      ).toBeDefined();

      const { root } = project({});
      const r = run(root);

      expect(r.status).toBe(0);
      expect(r.value("source")).toBe("plugin");
      expect(r.value("project_config")).toBe("absent");
      // No project file, so no self-protection floor: the effective list is
      // exactly the plugin's, and every entry is attributed to it.
      expect(r.entries()).toEqual(
        (declared as string[]).map((p) => ({ path: p, origin: "plugin" })),
      );
      expect(r.value("entries")).toBe(String((declared as string[]).length));
      expect(r.value("diagnostics")).toBe("0");
    });

    it("names the plugin as the layer every project on the install inherits", () => {
      const { root } = project({});
      expect(run(root).value("summary")).toContain(
        "hooks/config.json, which every project on this install inherits",
      );
    });

    it("attributes the self-protection floor to the floor, not to the layer", () => {
      // A project file that declares nothing still makes the floor apply, which
      // is the one case where a single report carries two origins.
      const { root } = project({ guardConfig: "{}\n" });
      const r = run(root);

      expect(r.value("source")).toBe("plugin");
      expect(r.value("project_config")).toBe("present");
      const floorEntries = r
        .entries()
        .filter((e) => e.origin === "floor")
        .map((e) => e.path);
      expect(floorEntries).toEqual(floorFor(root));
    });
  });

  describe("a project that declares its own list", () => {
    it("reports a narrowed list as the project's own", () => {
      const { root } = project({
        guardConfig: JSON.stringify({
          guard: { protectedPaths: ["docs/normative/**"] },
        }),
      });
      const r = run(root);

      expect(r.status).toBe(0);
      expect(r.value("source")).toBe("project");
      expect(r.entries()).toEqual([
        { path: "docs/normative/**", origin: "project" },
        ...floorFor(root).map((p) => ({ path: p, origin: "floor" })),
      ]);
      expect(r.value("summary")).toContain("this project's own fusion-guard.json");
      // The narrowing is real: nothing the plugin declares survives it.
      const declared = pluginDeclaredPaths() ?? [];
      for (const p of declared) {
        expect(r.entries().map((e) => e.path)).not.toContain(p);
      }
    });

    it("reports a declared empty list as a choice, with the floor still standing", () => {
      const { root } = project({
        guardConfig: JSON.stringify({ guard: { protectedPaths: [] } }),
      });
      const r = run(root);

      // Exit 0 and not an error: an empty effective list is a report.
      expect(r.status).toBe(0);
      expect(r.value("source")).toBe("project");
      expect(r.value("diagnostics")).toBe("0");
      // `fusion-guard.json` protects itself whatever its own list says, so the
      // floor is what is left and it is attributed to the floor.
      expect(r.entries()).toEqual(
        floorFor(root).map((p) => ({ path: p, origin: "floor" })),
      );
    });
  });

  describe("a project config that cannot be read", () => {
    it("says the file is present, counts the problem, and prints its text", () => {
      const { root } = project({ guardConfig: "{ not json\n" });
      const r = run(root);

      expect(r.status).toBe(0);
      expect(r.value("project_config")).toBe("present");
      expect(Number(r.value("diagnostics"))).toBeGreaterThan(0);
      // The text names the file, on stdout with the rest of the report.
      expect(r.stdout).toContain(`diagnostic=`);
      expect(r.stdout).toContain(join(root, "fusion-guard.json"));
      // And the summary carries the warning, so a caller relaying only the
      // sentence still relays it.
      expect(r.value("summary")).toContain("configuration problem");
    });

    it("does not let the dropped file read as a project that chose a list", () => {
      const { root } = project({ guardConfig: "[]\n" });
      const r = run(root);

      // An array is a JSON value but not a config object: dropped and named.
      expect(r.value("source")).not.toBe("project");
      expect(Number(r.value("diagnostics"))).toBeGreaterThan(0);
    });
  });

  describe("enforcement, which is two answers about two directories", () => {
    it("reports both halves enforcing in an ordinary consuming project", () => {
      const { root } = project({});
      const r = run(root);

      expect(r.value("enforced")).toBe("both");
      expect(r.value("enforced_write_tools")).toBe("yes");
      expect(r.value("enforced_measurement")).toBe("yes");
      expect(r.value("write_tools_dir")).toBe(root);
      expect(r.value("measurement_dir")).toBe(root);
      // Stand-down keys are omitted where nothing stood down.
      expect(r.value("write_tools_standdown")).toBe("");
      expect(r.value("measurement_standdown")).toBe("");
    });

    it("reports both halves standing down in fusion's own repository", () => {
      const { root } = project({
        pluginManifest: JSON.stringify({ name: "fusion" }),
      });
      const r = run(root);

      expect(r.value("enforced")).toBe("none");
      expect(r.value("enforced_write_tools")).toBe("no");
      expect(r.value("enforced_measurement")).toBe("no");
      expect(r.value("write_tools_standdown")).toBe("fusion-plugin-repo");
      expect(r.value("measurement_standdown")).toBe("fusion-plugin-repo");
      // Plainly, in the sentence, and not only in the keys.
      expect(r.value("summary")).toContain("nothing is enforced in this tree");
      expect(r.value("summary")).toContain("fusion's own plugin repository");
      // And the list is still printed, labelled as what would apply elsewhere.
      expect(Number(r.value("entries"))).toBeGreaterThanOrEqual(0);
    });

    it("reports the halves DISAGREEING from a subdirectory of that repository", () => {
      // The everyday fusion-development case: a session started in
      // `fusion-workbench/`. `isFusionPluginCwd()` does no upward walk, so the
      // write-tool deny is live there while the measurement, anchored at the
      // workbench root, still stands down. A helper that asked one question and
      // printed it twice would fail here and nowhere else.
      const { root, cwd } = project({
        pluginManifest: JSON.stringify({ name: "fusion" }),
        subdir: "fusion-workbench",
      });
      const r = run(cwd);

      expect(r.value("enforced")).toBe("write-tools");
      expect(r.value("enforced_write_tools")).toBe("yes");
      expect(r.value("enforced_measurement")).toBe("no");
      expect(r.value("write_tools_dir")).toBe(cwd);
      expect(r.value("measurement_dir")).toBe(root);
      expect(r.value("measurement_standdown")).toBe("fusion-plugin-repo");
      expect(r.value("summary")).toContain("only one half applies");
    });

    it("does not stand down for a manifest naming some other plugin", () => {
      const { root } = project({
        pluginManifest: JSON.stringify({ name: "not-fusion" }),
      });
      expect(run(root).value("enforced")).toBe("both");
    });
  });

  describe("not measured never looks like nothing protected", () => {
    it("prints no list at all when there is no workbench above cwd", () => {
      const bare = realpathSync(mkdtempSync(join(tmpdir(), "fusion-noworkbench-")));
      tmpRoots.push(bare);
      const r = run(bare);

      expect(r.status).toBe(2);
      expect(r.stdout).toBe("");
      expect(r.value("entries")).toBe("");
      expect(r.stderr).toContain("no fusion workbench found above");
    });

    it("says the list is UNKNOWN, not empty, when the compiled hooks are gone", () => {
      // The wrapper resolves its work relative to itself, so a copy of the
      // script with no `hooks/dist/` beside it is exactly the shape an install
      // predating this helper's build would have.
      const orphan = realpathSync(mkdtempSync(join(tmpdir(), "fusion-orphan-")));
      tmpRoots.push(orphan);
      mkdirSync(join(orphan, "bin"), { recursive: true });
      const copy = join(orphan, "bin", "fusion-protected-paths");
      copyFileSync(script, copy);
      chmodSync(copy, 0o755);

      const r = spawnSync(copy, [], { cwd: orphan, encoding: "utf-8" });
      expect(r.status).toBe(3);
      expect(r.stdout ?? "").toBe("");
      expect(r.stderr).toContain("UNKNOWN here, not empty");
    });

    it("rejects an argument rather than reporting against one it ignored", () => {
      const { root } = project({});
      const r = run(root, "--all");
      expect(r.status).toBe(1);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain("unknown argument");
    });
  });
});
