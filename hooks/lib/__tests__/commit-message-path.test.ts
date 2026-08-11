/**
 * The commit-message file belongs under `/tmp` — enforced, not only prescribed.
 *
 * ## The defect
 *
 * `fusion-workbench/.commit-msg-tmp` held the message of commit `d169b0d` and
 * sat at the workbench root as an untracked leftover. Two facts about it
 * (issue `260811-0114`):
 *
 *   1. `agents/orchestrator.md` Step 3b step 3 already prescribed
 *      `/tmp/fusion-commit-msg-<task-id>.txt`, and
 *      `grep -rn commit-msg-tmp` over `agents/`, `skills/`, `bin/` and `hooks/`
 *      returned nothing — no helper wrote that path, it was improvised at
 *      commit time.
 *   2. It is a root-anchored file in a tree whose root-anchored surfaces are
 *      enumerated and whose enumeration calls itself exhaustive.
 *
 * `/tmp` is swept and the workbench is not, and the workbench is the tree
 * `git status` reports on. So the location is not a matter of taste: it decides
 * whether the file becomes a leftover.
 *
 * ## The two halves of the enforcement, and what each can prove
 *
 * **Run time** — `lib/staging-drift.ts` reads a commit-message-shaped file
 * under the workbench as a fault of its own class, whatever its spelling, so
 * long as no artifact store owns the path, and names the prescribed path back
 * to the model. The store scoping is issue `260811-1141`: unscoped, the same
 * name test claimed authored records whose topic slug says "commit message" and
 * the model was told to delete them. That is exercised against real project
 * roots in `staging-drift.test.ts`; here it is asserted only that the classifier
 * and the prompts agree on the path.
 *
 * **Test time** — this file. It pins the prescription: the prompts must name a
 * `/tmp` path, the module constant must be that same path, and no shipped
 * prompt may name a commit-message file inside `fusion-workbench/`.
 *
 * What it cannot do (`rules/critical-stance.md` §3): prove that a session wrote
 * its message to the prescribed path. Nothing here executes at session time —
 * that is the run-time half's job, and it reports rather than blocks. The two
 * halves together mean an improvised path is loud instead of silent, which is
 * the whole of the improvement.
 *
 * The negative controls call the SAME helpers as the assertions above them,
 * with a fixture in place of the real file — never a re-implementation of what
 * they claim to test.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { PRESCRIBED_MESSAGE_PATH, classify } from "../staging-drift.js";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const orchestrator = () => read("agents", "orchestrator.md");
const commitSkill = () => read("skills", "commit", "SKILL.md");

/** Every `/tmp/…` path a text names. */
function tmpPaths(text: string): string[] {
  return [...text.matchAll(/\/tmp\/[A-Za-z0-9._<>-]+/g)].map((m) => m[0]);
}

/**
 * Every commit-message-shaped path a text names that sits inside the workbench
 * where no artifact store owns it.
 *
 * The name pattern is the module's own — `COMMIT_MESSAGE` in
 * `lib/staging-drift.ts` — reached through `classify` rather than transcribed,
 * so the gate and the classifier cannot disagree about what counts as one.
 *
 * Reaching through `classify` means this inherits `classify`'s scoping, and
 * since issue `260811-1141` that scoping is narrower: the name test runs last,
 * over only what the stores decline to claim. So a prompt line naming
 * `fusion-workbench/shared/issues/…commit-message….md` is no longer flagged.
 * That is the intended reading and not a hole — such a path IS an artifact
 * store's own, a prompt naming one is naming a record, and the over-match it
 * replaces is what told the model to delete three real records. What this gate
 * exists to catch is a prompt PRESCRIBING a message file inside the workbench,
 * and the place a prescription puts one is where no store owns it. Both
 * controls at the bottom of this file are pinned against that boundary.
 */
function workbenchMessagePaths(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/fusion-workbench\/[A-Za-z0-9._/<>-]+/g)) {
    const rel = m[0].slice("fusion-workbench/".length);
    if (rel === "") continue;
    if (classify(rel, "").klass === "commit-message") out.push(m[0]);
  }
  return out;
}

describe("commit-message path: the prescription is pinned", () => {
  it("Step 3b step 3 names a /tmp path, and step 5 reads the same one", () => {
    const text = orchestrator();
    const paths = tmpPaths(text).filter((p) => p.includes("commit-msg"));
    expect(
      paths.length,
      "agents/orchestrator.md names no /tmp commit-message path — Step 3b step 3 was reworded; update this parser or restore the path",
    ).toBeGreaterThan(0);

    // The message must reach git as `-F <that path>`, not as a `-m` argument:
    // the file exists so the shell never sees the prose (commit 045a14f, cut
    // off at an apostrophe).
    expect(text).toMatch(/git commit -F \/tmp\/fusion-commit-msg-[^\s'"]+/);
  });

  it("the module constant is the path the prompt names", () => {
    // Two spellings of one fact. The sentence the hook hands back quotes this
    // constant, so a prompt that moved the path while the constant stayed would
    // have the mechanism telling the model to use a path nothing prescribes.
    expect(orchestrator()).toContain(PRESCRIBED_MESSAGE_PATH);
    expect(PRESCRIBED_MESSAGE_PATH.startsWith("/tmp/")).toBe(true);
  });

  it("Step 3b states WHY the location is /tmp, not merely that it is", () => {
    // A prescription with no reason is one an agent improvises around, which is
    // exactly what happened. The two facts that decide it: /tmp is swept, and
    // the workbench is the tree git status reports on.
    const text = orchestrator();
    expect(text).toMatch(/`?\/tmp`? is swept/);
    expect(text).toMatch(/is the tree `?git status`? reports on/);
  });

  it("the commit skill pins its own <msg-file> to /tmp", () => {
    // /fusion:commit runs the same stage-and-commit shape and left `<msg-file>`
    // an unbounded placeholder. /fusion:cleanup defers to it, so pinning it here
    // covers both.
    const text = commitSkill();
    expect(text).toMatch(/`?\/tmp\/fusion-commit-msg-/);
    expect(text).toMatch(/[Nn]ever inside\s+`?fusion-workbench\/`?/);
  });
});

describe("commit-message path: no shipped prompt names one inside the workbench", () => {
  const promptFiles = (): string[] => {
    const files = readdirSync(join(pluginRoot, "agents"))
      .filter((f) => f.endsWith(".md"))
      .map((f) => join("agents", f));
    for (const d of readdirSync(join(pluginRoot, "skills"))) {
      const rel = join("skills", d, "SKILL.md");
      if (existsSync(join(pluginRoot, rel))) files.push(rel);
    }
    return files;
  };

  it("finds none", () => {
    const offenders: string[] = [];
    for (const rel of promptFiles()) {
      // The prohibition is about a prompt PRESCRIBING such a path. Prose that
      // names the leftover as the defect is the point of the record, so a line
      // is only an offence when it does not also say the path is wrong.
      for (const line of read(rel).split("\n")) {
        const hits = workbenchMessagePaths(line);
        if (hits.length === 0) continue;
        if (/Never inside|never inside|leftover|Measured|improvised|fault/.test(line)) continue;
        offenders.push(`${rel}: ${hits.join(", ")}`);
      }
    }
    expect(
      offenders,
      "a shipped prompt names a commit-message file inside fusion-workbench/ without marking it as the defect",
    ).toEqual([]);
  });

  it("negative control: the same helper flags the path that actually appeared", () => {
    // `.commit-msg-tmp` is the real file, at the real root. If this returned
    // nothing, the assertion above would be passing because it looks for the
    // wrong thing.
    expect(workbenchMessagePaths("wrote it to fusion-workbench/.commit-msg-tmp instead")).toEqual([
      "fusion-workbench/.commit-msg-tmp",
    ]);
    expect(classify(".commit-msg-tmp", "").klass).toBe("commit-message");
    expect(classify("tasklist.md", "").klass).toBe("record");
  });

  it("negative control: a fixture prescribing the path fails the same check", () => {
    const fixture = "Write the message to `fusion-workbench/commit-message.txt` before committing.";
    expect(workbenchMessagePaths(fixture)).toEqual(["fusion-workbench/commit-message.txt"]);
  });

  it("positive control: a record ABOUT commit messages is not one, so a prompt may cite it", () => {
    // The over-match this file inherited (issue `260811-1141`). Every path below
    // is a real artifact of this workbench; under the old ordering each was a
    // `commit-message`, so a prompt citing the issue record by name would have
    // been reported as prescribing a message file inside the workbench.
    const cited = [
      "fusion-workbench/shared/history/260810-1810-coder-commit-message-out-of-the-shell.md",
      "fusion-workbench/shared/issues/260811-1149_o_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md",
    ];
    for (const path of cited) {
      expect(workbenchMessagePaths(`see \`${path}\` for the record`), path).toEqual([]);
      expect(classify(path.slice("fusion-workbench/".length), "").klass, path).toBe("record");
    }
    // And the boundary holds in the other direction: same slug, no store.
    expect(classify("commit-message-notes.md", "").klass).toBe("commit-message");
  });
});
