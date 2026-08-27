/**
 * The review-coverage measurement, printed for a human or an agent to read.
 *
 * The computation is `lib/review-coverage.ts`; this is one of its two callers.
 * The other is `hooks/tracker.ts`, which runs it unasked when a review file
 * lands under a reviews store. Read that module's header for the defect
 * (issue `260810-1205` — seven commits reached a pushed tag unreviewed while
 * the session reported one) and for why the ranges had to be mandated in
 * `agents/coderev.md` and `agents/ontorev.md` before anything could read them.
 *
 * Called through `bin/fusion-review-coverage` by `agents/orchestrator.md` at
 * Step 3c (to widen the next review dispatch's scope) and at Phase 4 (to state
 * the session's coverage), and by anyone at a terminal who wants to know which
 * commits no reviewer has opened.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-paths` uses, then
 * one line per uncovered commit and one per review considered:
 *
 *   anchor=workbench-root
 *   since=8a49fd5
 *   head=HEAD
 *   commits=22
 *   reviews=3
 *   unusable=1
 *   uncovered=7
 *   verdict=uncovered
 *     uncovered 7785330 chore(workbench): the reconciler's annotations land
 *     review shared/reviews/260810-2110-…md range=da8c9db..b3cc034 not-opened=none covers=5
 *     review shared/reviews/260731-2247-…md range=(none recorded) … UNUSABLE (no **Reviewed-range:** line)
 *   carried=agents/orchestrator.md, skills/next/SKILL.md
 *   carried-from=shared/reviews/260810-2110-…md
 *
 * `carried=` is the acceptance criterion's second half: the files the last
 * review declared it did not open, which are the next dispatch's scope rather
 * than a footnote. It prints `none` when the last review opened everything, and
 * `(not recorded)` when no review carried the field at all — a recorded absence
 * and a missing line are different facts and are not merged.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **Finding an uncovered range is not an error exit**, and the reason is the
 * one the deleted session-state drift reader established: its predecessor
 * handed a verdict to an exit code and cried wolf on its commonest path (issue
 * `260810-0710`), and a check whose status is ignored is the failure it exists
 * to catch arriving one level up. Nor is it a release gate — whether a release
 * may go out over an uncovered range is an unfiled decision belonging beside
 * `shared/decisions/260810-0710_*_…`, and this program blocks nothing.
 */

import {
  measureReviewCoverage,
  renderReview,
  renderUncovered,
} from "./lib/review-coverage.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";

// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();

const USAGE = "usage: fusion-review-coverage [--since <ref>] [--head <ref>]";

function main(argv: string[]): number {
  let since: string | undefined;
  let head: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--since" || arg === "--head") {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        process.stderr.write(`fusion-review-coverage: ${arg} needs a value\n${USAGE}\n`);
        return 1;
      }
      if (arg === "--since") since = value;
      else head = value;
      i++;
      continue;
    }
    process.stderr.write(
      `fusion-review-coverage: unknown argument ${JSON.stringify(arg)}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-review-coverage: no fusion workbench above the working directory — nothing to check.\n",
    );
    return 2;
  }

  const report = measureReviewCoverage(root, { since, head });

  const out: string[] = ["anchor=workbench-root"];

  // An undecidable window is reported as such, with the reason, and never as a
  // clean one: a coverage check that exists to catch a silent omission must not
  // perform one (`rules/fusion-workbench-conventions.md` `## Path Resolution`).
  if (report.why !== "") {
    out.push(
      `since=`,
      `head=${head ?? "HEAD"}`,
      "commits=0",
      "reviews=0",
      "unusable=0",
      "uncovered=0",
      "verdict=unchecked",
      `why=${report.why}`,
    );
    process.stdout.write(out.join("\n") + "\n");
    return 0;
  }

  const unusable = report.reviews.filter((r) => r.why !== "").length;

  out.push(
    `since=${report.since}`,
    `head=${report.head}`,
    `commits=${report.commits.length}`,
    `reviews=${report.reviews.length}`,
    `unusable=${unusable}`,
    `uncovered=${report.uncovered.length}`,
    `verdict=${report.uncovered.length > 0 ? "uncovered" : "covered"}`,
  );

  // Commit by commit, never a count. The session that produced issue
  // `260810-1205` reported one unreviewed commit where there were seven.
  for (const c of report.uncovered) out.push(renderUncovered(c));
  for (const r of report.reviews) out.push(renderReview(r));

  out.push(
    `carried=${
      report.carriedFrom === null
        ? "(not recorded)"
        : report.carried.length === 0
          ? "none"
          : report.carried.join(", ")
    }`,
    `carried-from=${report.carriedFrom ?? ""}`,
  );

  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
