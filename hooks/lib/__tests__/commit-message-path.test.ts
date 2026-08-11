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
 * prompt may name a commit-message file inside `fusion-workbench/`, wherever
 * inside it that path points.
 *
 * The two halves ask different questions of the same string, and since issue
 * `260811-1410` they say so in code rather than by accident. The run-time half
 * asks *"is this file on disk a leftover?"* and decides by location first; this
 * half asks *"does a prompt PRESCRIBE one?"* and decides by name alone, because
 * a prescription may point anywhere — including into a store, the case that
 * passed silently while this file reached its answer through `classify`. What
 * they share is the one thing they must not disagree about: `COMMIT_MESSAGE`,
 * reached here through `hasCommitMessageName` and never transcribed.
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
import { PRESCRIBED_MESSAGE_PATH, classify, hasCommitMessageName } from "../staging-drift.js";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const orchestrator = () => read("agents", "orchestrator.md");
const commitSkill = () => read("skills", "commit", "SKILL.md");

/** Every `/tmp/…` path a text names. */
function tmpPaths(text: string): string[] {
  return [...text.matchAll(/\/tmp\/[A-Za-z0-9._<>-]+/g)].map((m) => m[0]);
}

/**
 * Every commit-message-shaped path a text names inside the workbench, wherever
 * it points.
 *
 * The name pattern is the module's own — `COMMIT_MESSAGE` in
 * `lib/staging-drift.ts`, reached through its `hasCommitMessageName` export
 * rather than transcribed here, so the gate and the classifier cannot disagree
 * about what counts as a commit-message name.
 *
 * ## Why it reaches the predicate and not `classify`
 *
 * It reached `classify` until issue `260811-1410`, and thereby inherited the
 * store scoping issue `260811-1141` added — correctly, for `classify`'s
 * question. The two callers do not share a question:
 *
 *   - `classify` asks *"is this file on disk a leftover commit message?"*, and
 *     since `337c01b` answers it by location first: a path a store owns is a
 *     `record` whatever its name.
 *   - this gate asks *"does a shipped prompt PRESCRIBE a message file inside
 *     the workbench?"*, which is a question about an instruction. A line
 *     prescribing `fusion-workbench/shared/consult/commit-message.txt` is
 *     exactly what it exists to catch, and reaching through `classify` let that
 *     line pass silently as a `record`.
 *
 * So the scoping is dropped here and kept there. What is NOT duplicated is the
 * pattern: one regex, one module, two callers composing it with the scoping
 * each needs. Transcribing it into this file would have been the cheaper repair
 * and the `260810-0510` trap — two spellings of one concept, free to drift.
 *
 * ## What dropping the scoping costs, stated rather than glossed
 *
 * A prompt citing a workbench record whose topic slug says "commit message" is
 * flagged by this helper again. Nothing in `agents/` or `skills/` is affected
 * today (both lines that name the leftover carry a defect word), and the run
 * time half is untouched — `classify` still reads such a record as a `record`,
 * so no model is told to delete anything. The load therefore falls on the
 * line-level exemption in "finds none" below, whose breadth is separately filed
 * as issue `260811-1149`. The positive control at the foot of this file pins
 * both halves of that split so neither can move unnoticed.
 */
function workbenchMessagePaths(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/fusion-workbench\/[A-Za-z0-9._/<>-]+/g)) {
    const rel = m[0].slice("fusion-workbench/".length);
    if (rel === "") continue;
    if (hasCommitMessageName(rel)) out.push(m[0]);
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

  it("negative control: a prescription INSIDE a store fails it too", () => {
    // Issue `260811-1410`, and the reason this gate no longer reaches through
    // `classify`. While it did, this exact line passed silently: a path a store
    // owns is a `record`, which is the right answer to the classifier's
    // question and the wrong one to this gate's. Assuming a prescription lands
    // only where no store reaches was a guess about the next improvisation's
    // directory, and the one this whole family exists for — `.commit-msg-tmp`
    // at the workbench root — landed where nobody predicted.
    const fixture =
      "Write the message to `fusion-workbench/shared/consult/commit-message.txt` first.";
    expect(workbenchMessagePaths(fixture)).toEqual([
      "fusion-workbench/shared/consult/commit-message.txt",
    ]);
    // The run-time half is deliberately NOT widened with it: the same path on
    // disk is still an unstaged `record`, so the model is told to stage it,
    // never to delete it.
    expect(classify("shared/consult/commit-message.txt", "").klass).toBe("record");
  });

  it("positive control: a record ABOUT commit messages is a `record` to the classifier", () => {
    // The over-match issue `260811-1141` fixed. Every path below is a real
    // artifact of this workbench; under the ordering that fix replaced each was
    // a `commit-message`, and `stagingSentence` told the model to delete it.
    // That is `classify`'s question, `classify` still answers it by location,
    // and widening this gate did not touch it.
    const cited = [
      "fusion-workbench/shared/history/260810-1810-coder-commit-message-out-of-the-shell.md",
      "fusion-workbench/shared/issues/260811-1149_o_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md",
    ];
    for (const path of cited) {
      expect(classify(path.slice("fusion-workbench/".length), "").klass, path).toBe("record");
    }
    // And the boundary holds in the other direction: same slug, no store.
    expect(classify("commit-message-notes.md", "").klass).toBe("commit-message");

    // This gate asks the other question, so it DOES flag such a citation. What
    // spares a prompt that cites a record by full path is the line-level
    // exemption in "finds none" above, not the name test — pinned here because
    // that is now a load-bearing dependency, and because issue `260811-1149` is
    // open against exactly that exemption's breadth.
    expect(workbenchMessagePaths(`see \`${cited[1]}\` for the record`)).toEqual([cited[1]]);
  });
});
