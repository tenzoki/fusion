/**
 * The SessionStart working-directory warning (`hooks/session-start.ts`).
 *
 * ## What is under test, and why it needs subprocesses
 *
 * The hook's entire subject is `process.cwd()`. A case written in-process could
 * only ever ask about the suite's own working directory, so each case here is a
 * real subprocess started in a real directory — the same discipline
 * `guard-harness.ts` imposes on the guard for the cached self-detect answer,
 * arrived at from the other side.
 *
 * ## The three cases, and why they are the whole set
 *
 * `findWorkbenchRoot()` walks UP from cwd, so the root it returns is always cwd
 * itself or a strict ancestor. That makes the split disjoint and complete:
 *
 *   1. no root above cwd    → not a fusion project        → silent
 *   2. root === cwd         → started at the project root → silent
 *   3. root is an ancestor  → started below it            → warn
 *
 * There is no fourth case. A root BELOW cwd cannot be returned, and the two
 * extra cases below (a two-level subdirectory, and the plugin's own repository)
 * are not new branches — they are case 3 under conditions that were previously
 * documented as failing silently.
 *
 * ## The one assumption, stated because a test should not carry a silent one
 *
 * Case 1 spawns in the `mkdtemp` base that holds the throwaway project, which
 * is a directory with no `fusion-workbench/.fusion-setup` under it. If some
 * ancestor of the system temp directory ever carried a workbench marker, this
 * case would FAIL rather than pass vacuously — the assertion is "silent", and a
 * stray workbench above tmpdir produces a warning. That is the right direction:
 * the assumption announces itself instead of hiding.
 */

import { describe, it, expect } from "vitest";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  CASE_TIMEOUT,
  runSessionStart,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

/** The warning, or `null` when the hook stayed silent. */
function warningFrom(result: {
  hookSpecificOutput?: { systemMessage?: string };
}): string | null {
  return result.hookSpecificOutput?.systemMessage ?? null;
}

describe("SessionStart warns when the session did not start at the project root", () => {
  it(
    "stays silent when the session starts AT the project root",
    () => {
      withProject((project) => {
        const result = runSessionStart(project.root);
        expect(warningFrom(result)).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "warns when the session starts in a subdirectory, naming BOTH directories",
    () => {
      withProject((project) => {
        // `fusion-workbench/` is seeded in every harness project and is where a
        // fusion session most often lands by accident, so it is the realistic
        // subdirectory rather than an invented one.
        const sub = resolve(project.root, "fusion-workbench");

        const warning = warningFrom(runSessionStart(sub));

        expect(warning, "a subdirectory start must warn").not.toBeNull();
        // Both directories, in full. A warning that names only one leaves the
        // user to work out which of the two they are standing in.
        expect(warning).toContain(project.root);
        expect(warning).toContain(sub);
        // Action first (`rules/user-facing-output.md`): the first line says what
        // to do, before any explanation of why.
        expect(warning!.split("\n")[0].toLowerCase()).toContain("restart");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stays silent when there is no workbench above the working directory",
    () => {
      withProject((project) => {
        // The `mkdtemp` base that CONTAINS the project — outside it, so no
        // `.fusion-setup` marker is reachable by walking up. See the header note
        // on the one assumption this carries.
        const outside = dirname(project.root);
        const result = runSessionStart(outside);
        expect(warningFrom(result)).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "warns from a subdirectory two levels down, not just one",
    () => {
      withProject((project) => {
        const deep = resolve(project.root, "docs", "internals");
        mkdirSync(deep, { recursive: true });

        const warning = warningFrom(runSessionStart(deep));

        expect(warning).not.toBeNull();
        expect(warning).toContain(project.root);
        expect(warning).toContain(deep);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "warns in the plugin's OWN repository too — the case documented as silent",
    () => {
      // `isFusionPluginCwd()` and `bin/fusion-plugin-cwd` both test cwd with no
      // upward walk, so a session started one directory down inside fusion's own
      // repository reads the INSTALLED plugin copy instead of the work tree, and
      // `CLAUDE.md` records that it does so silently. The stand-down that spares
      // a fusion developer the write guard must not also spare them this
      // warning: it is their case more than anyone's.
      withPluginProject((project) => {
        const sub = resolve(project.root, "fusion-workbench");

        const warning = warningFrom(runSessionStart(sub));

        expect(warning).not.toBeNull();
        expect(warning).toContain(project.root);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "delivers the warning as a systemMessage, the channel the user actually sees",
    () => {
      // Plain stdout from a SessionStart hook is `additionalContext` — read by
      // the model, invisible to the user (`CLAUDE.md`, Conventions). A warning
      // on that channel is not a warning, so the channel is asserted rather
      // than assumed.
      withProject((project) => {
        const result = runSessionStart(resolve(project.root, "fusion-workbench"));

        expect(result.hookSpecificOutput?.hookEventName).toBe("SessionStart");
        expect(typeof result.hookSpecificOutput?.systemMessage).toBe("string");
      });
    },
    CASE_TIMEOUT,
  );
});
