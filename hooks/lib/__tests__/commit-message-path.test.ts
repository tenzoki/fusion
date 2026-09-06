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
 *
 * ## The second half of the prescription: whose file is it
 *
 * `/tmp` fixed the leftover and left the path machine-global. Under
 * `/tmp/fusion-commit-msg-<task-id>.txt` the only varying part was a task id,
 * which is short and conventional, so two sessions in two projects wrote one
 * file whenever their ids agreed — measured, and made looser still by a
 * case-insensitive filesystem folding `L1-RECONCILE` onto `L1-reconcile`
 * (issue `260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md`).
 * So this file pins two properties of the same path and not one: it is under
 * `/tmp`, AND it carries a per-session discriminator. A future edit that keeps
 * the prefix and drops the discriminator restores a defect that already
 * happened, so it fails here as loudly as a move into the workbench does.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot, shippedPrompts } from "./helpers/citation-scan.js";
import {
  PRESCRIBED_MESSAGE_PATH,
  classify,
  hasCommitMessageName,
} from "../staging-drift.js";

const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const orchestrator = () => read("agents", "orchestrator.md");
const commitSkill = () => read("skills", "commit", "SKILL.md");

/** Every `/tmp/…` path a text names. */
function tmpPaths(text: string): string[] {
  return [...text.matchAll(/\/tmp\/[A-Za-z0-9._<>-]+/g)].map((m) => m[0]);
}

/**
 * The per-session discriminator the path has to carry.
 *
 * Spelled exactly, and deliberately so. The property — "unique per session" —
 * is not decidable from a path template: `<task-id>` and `<session-id>` are
 * both placeholders, and nothing in the string says which of them varies per
 * session. What IS decidable is whether the prompt still names the value it was
 * changed to name, and that is what this pins. Choosing a different
 * discriminator (the checkout id, a `mkdtemp` directory) is then an edit to
 * this constant that somebody makes on purpose, which is the same shape
 * `NAMEABLE_LEFTOVER` below uses for the same reason.
 */
const SESSION_DISCRIMINATOR = "<session-id>";

/** Does a prescribed message path carry it? */
function carriesSessionDiscriminator(path: string): boolean {
  return path.includes(SESSION_DISCRIMINATOR);
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
 * The two callers do not share a question. `classify` asks whether a file on
 * disk is a leftover commit message, and answers by location first: a path a
 * store owns is a `record` whatever its name. This gate asks whether a shipped
 * prompt PRESCRIBES a message file inside the workbench, which is a question
 * about an instruction, and reaching through `classify` let a prescribed
 * store-owned path pass silently (issue `260811-1410`). So the store scoping
 * is dropped here and kept there; what is NOT duplicated is the pattern. The
 * cost: a prompt citing a workbench record whose slug says "commit message" is
 * flagged again, and the load falls on `NAMEABLE_LEFTOVER` below.
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

/**
 * The one workbench-internal commit-message path a shipped prompt may name.
 *
 * Two lines name it, both as the defect: `agents/orchestrator.md` in Step 3b's
 * reason for `/tmp`, and `skills/commit/SKILL.md` in the shorter form of the
 * same sentence. Every other workbench-internal commit-message path is an
 * offence, with no reading of the prose around it.
 *
 * ## Why an exact allow-list and not a word list
 *
 * Until issue `260811-1149` the sparing was a keyword exemption over the line,
 * a blacklist standing in for an allow-list. Whether a line names the path as
 * a defect or as an instruction is prose classification, not decidable from a
 * keyword set (`rules/critical-stance.md` §4); one literal path compared
 * exactly is, and widening it is an edit somebody makes on purpose. A prompt
 * that PRESCRIBED writing to this path would pass the gate; the run-time half
 * catches the resulting file by location whatever a prompt says
 * (`lib/staging-drift.ts`, `classify`).
 */
const NAMEABLE_LEFTOVER = "fusion-workbench/.commit-msg-tmp";

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
    expect(text).toMatch(
      /git commit -F \/tmp\/fusion-commit-msg-<session-id>-[^\s'"]+/,
    );
  });

  it("every /tmp path it names carries the per-session discriminator", () => {
    // `/tmp` alone was the first half of the answer and is not the whole of it:
    // the path is machine-global, so without a per-session part two projects'
    // sessions write one file whenever their task ids agree (issue
    // `260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md`).
    // Every occurrence, not just one — the write at step 3 and the `-F` read at
    // step 5 must name the same file, and a path that keeps only one of them
    // discriminated is the same collision at half the frequency.
    const paths = tmpPaths(orchestrator()).filter((p) =>
      p.includes("commit-msg"),
    );
    const bare = paths.filter((p) => !carriesSessionDiscriminator(p));
    expect(
      bare,
      `agents/orchestrator.md names a commit-message path with no per-session discriminator (\`${SESSION_DISCRIMINATOR}\`). Under a task id alone the path collides across projects — the defect this pin exists for. If the discriminator was deliberately changed, change \`SESSION_DISCRIMINATOR\` and \`PRESCRIBED_MESSAGE_PATH\` with it.`,
    ).toEqual([]);
  });

  it("Step 3b states WHY the path is per-session, not merely that it is", () => {
    // Same reasoning as the `/tmp` justification below: a prescription with no
    // reason is one an agent improvises around. The two facts that decide this
    // one are that `/tmp` is shared machine-wide and that the task id is not a
    // discriminator.
    const text = orchestrator();
    expect(text).toMatch(/`?\/tmp`? is machine-global/);
    expect(text).toMatch(/task ids are short and conventional/);
  });

  it("the module constant is the path the prompt names", () => {
    // Two spellings of one fact. The sentence the hook hands back quotes this
    // constant, so a prompt that moved the path while the constant stayed would
    // have the mechanism telling the model to use a path nothing prescribes.
    expect(orchestrator()).toContain(PRESCRIBED_MESSAGE_PATH);
    expect(PRESCRIBED_MESSAGE_PATH.startsWith("/tmp/")).toBe(true);
    // Both halves of the prescription, in the constant the hook quotes back.
    expect(carriesSessionDiscriminator(PRESCRIBED_MESSAGE_PATH)).toBe(true);
  });

  it("negative control: the pre-fix path fails the same predicate", () => {
    // The exact string the prompt carried until issue `260905-2213`. If this
    // passed, the assertions above would be green against a path that collides.
    expect(
      carriesSessionDiscriminator("/tmp/fusion-commit-msg-<task-id>.txt"),
    ).toBe(false);
    expect(
      carriesSessionDiscriminator(
        "/tmp/fusion-commit-msg-<session-id>-<task-id>.txt",
      ),
    ).toBe(true);
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
  /**
   * Every shipped prompt line the name test flags, with the paths it flagged.
   *
   * One scan, two callers composing it differently, the same shape
   * `workbenchMessagePaths` and `classify` already have. "finds none" subtracts
   * the allow-list and expects nothing left. The positive control below asserts
   * the scan is not empty and that `NAMEABLE_LEFTOVER` is the only path in it,
   * which is the pair of facts that jointly keep "finds none" green.
   */
  const flaggedLines = (): { where: string; hits: string[] }[] => {
    const out: { where: string; hits: string[] }[] = [];
    for (const rel of shippedPrompts().map((f) => f.rel)) {
      read(rel)
        .split("\n")
        .forEach((line, i) => {
          const hits = workbenchMessagePaths(line);
          if (hits.length > 0) out.push({ where: `${rel}:${i + 1}`, hits });
        });
    }
    return out;
  };

  it("finds none", () => {
    // The prohibition is about a prompt PRESCRIBING such a path. The one path
    // the prompts legitimately name is the leftover that actually appeared, and
    // it is spared by name (`NAMEABLE_LEFTOVER`) rather than by the prose
    // around it — issue `260811-1149`, and the reason there is no keyword list
    // here any more.
    const offenders = flaggedLines()
      .map((f) => ({
        where: f.where,
        hits: f.hits.filter((h) => h !== NAMEABLE_LEFTOVER),
      }))
      .filter((f) => f.hits.length > 0)
      .map((f) => `${f.where}: ${f.hits.join(", ")}`);
    expect(
      offenders,
      `a shipped prompt names a commit-message path inside fusion-workbench/ other than the one allow-listed in \`NAMEABLE_LEFTOVER\` (${NAMEABLE_LEFTOVER}). Either the line prescribes a message file in the workbench and must be reworded, or it cites a workbench record whose slug says "commit message" — which this gate flags by name, deliberately, since issue \`260811-1410\`.`,
    ).toEqual([]);
  });

  it("negative control: the same helper flags the path that actually appeared", () => {
    // `.commit-msg-tmp` is the real file, at the real root. If this returned
    // nothing, the assertion above would be passing because it looks for the
    // wrong thing.
    expect(
      workbenchMessagePaths(
        "wrote it to fusion-workbench/.commit-msg-tmp instead",
      ),
    ).toEqual(["fusion-workbench/.commit-msg-tmp"]);
    expect(classify(".commit-msg-tmp", "").klass).toBe("commit-message");
    expect(classify("shared/issues/260811-0100_o_x.md", "").klass).toBe("record");
  });

  it("negative control: a fixture prescribing the path fails the same check", () => {
    const fixture =
      "Write the message to `fusion-workbench/commit-message.txt` before committing.";
    expect(workbenchMessagePaths(fixture)).toEqual([
      "fusion-workbench/commit-message.txt",
    ]);
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
    expect(classify("shared/consult/commit-message.txt", "").klass).toBe(
      "record",
    );
  });

  it("positive control: a record ABOUT commit messages is a `record` to the classifier", () => {
    // The over-match issue `260811-1141` fixed. Every path below is a real
    // artifact of this workbench; under the ordering that fix replaced each was
    // a `commit-message`, and `stagingSentence` told the model to delete it.
    // That is `classify`'s question, `classify` still answers it by location,
    // and widening this gate did not touch it.
    const cited = [
      "fusion-workbench/shared/history/260810-1810-coder-commit-message-out-of-the-shell.md",
      "fusion-workbench/shared/issues/260811-1149_c_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md",
    ];
    for (const path of cited) {
      expect(
        classify(path.slice("fusion-workbench/".length), "").klass,
        path,
      ).toBe("record");
    }
    // And the boundary holds in the other direction: same slug, no store.
    expect(classify("commit-message-notes.md", "").klass).toBe(
      "commit-message",
    );

    // This gate asks the other question, so it would flag such a citation by
    // name. Nothing spares it: the allow-list carries one path and this is not
    // it. No shipped prompt cites one today, and the control below measures
    // that rather than asserting it against a fixture (issue `260811-1611`).
  });

  it("positive control: the allow-list is live, and it is the only thing sparing the shipped lines", () => {
    // Issue `260811-1611`. Two facts jointly keep "finds none" green, and
    // neither was read off the shipped files before this test existed:
    //
    //   1. `workbenchMessagePaths` flags real lines in `agents/` and
    //      `skills/`. Reword the two that name the leftover and the gate keeps
    //      passing while measuring nothing, which is the failure a green test
    //      cannot report about itself.
    //   2. What spares those lines is `NAMEABLE_LEFTOVER` and nothing else.
    //
    // Both are asserted against the shipped prompts themselves, so a change to
    // either fails here with the mechanism named rather than surfacing as an
    // unexplained red in "finds none".
    //
    // Measured, so the first assertion is not oversold: narrowing the helper
    // back to `classify` (the `260811-1410` regression) does NOT make it fail.
    // Both shipped lines name a root-anchored path no store owns, so `classify`
    // still calls it a `commit-message`. What catches that narrowing is the
    // store-prescription negative control above, and that is the division of
    // labour between the two.
    const flagged = flaggedLines();

    expect(
      flagged.map((f) => f.where),
      "no line in any shipped prompt is flagged by `workbenchMessagePaths`, so `finds none` is green by looking at nothing. Either the two lines naming `fusion-workbench/.commit-msg-tmp` were reworded (in which case `NAMEABLE_LEFTOVER` is now dead and should go with them), or the helper stopped reaching the prompt files at all",
    ).not.toEqual([]);

    const distinct = [...new Set(flagged.flatMap((f) => f.hits))].sort();
    expect(
      distinct,
      `the set of workbench commit-message paths the shipped prompts name is no longer exactly the one allow-listed in \`NAMEABLE_LEFTOVER\`. Flagged at: ${flagged.map((f) => f.where).join(", ")}`,
    ).toEqual([NAMEABLE_LEFTOVER]);
  });
});
