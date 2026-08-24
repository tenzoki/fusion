/**
 * The orchestrator's Phase-2 Turn budget, resolved and printed for a prompt to
 * read at Setup.
 *
 * ## Why this is a program rather than a number in a prompt
 *
 * `agents/orchestrator.md` used to WRITE the budget out — `5`, in seven places
 * and four spellings ("Maximum 5 Turns", "`**Turn:** <N>/5`", "the existing
 * 5-Turn circuit breaker", "`max_turns` (default 5)", a circuit-breaker table
 * row, a YAML schema line, a dashboard example). No project could change it, and
 * one of the seven already called it a "default", which implied a source that
 * could override it. None existed, so the word was false (issue `260811-1712`).
 *
 * A prompt cannot merge configuration layers, so the budget had to become
 * something the prompt READS. This is that read: one call at Setup, one line of
 * output, and the orchestrator holds the answer for the session. It used to
 * persist it as `progress.max_turns` in `agentstate.yaml`; that field went with
 * the rest of that file's counters on 2026-08-15, so the resolved budget lives
 * only in the running session now.
 *
 * ## Where the value comes from
 *
 * `hooks/lib/config.ts`: the project's `fusion.json`, then the built-in
 * `DEFAULTS`, merged per leaf. That file is fusion's per-project configuration
 * surface, git-tracked so a change to a budget shows in a diff, with wrong
 * values dropped and named rather than silently taken.
 *
 * It used to be `fusion-guard.json`, and this docstring used to spend a
 * paragraph explaining why a setting that is not the guard's lived in the
 * guard's configuration file. That explanation retired with its subject on
 * 2026-08-16: the guard decides nothing and has no settings, so there is no
 * guard configuration for this to be an exception to. The budget is now the
 * one setting the file carries. A project upgrading over that release still has
 * the old file on disk and hears about it from the loader, on every guarded
 * tool call and on this program's stderr, until it copies the budget across
 * and deletes it (`260816-1915`, `260816-1916`).
 *
 * A project declares a different budget with:
 *
 *   {"orchestrator": {"maxTurns": 12}}
 *
 * A value that is not a whole number of 1 or more is dropped, NAMED on stderr,
 * and inherits the default — the loader's standing drop-and-advise behaviour,
 * surfaced here rather than swallowed, because this is the one call that reads
 * it and a silent drop hands the session a budget nobody chose.
 *
 * ## Output and exits
 *
 * One `KEY=value` line on stdout, in the shape `bin/fusion-paths` and
 * `bin/fusion-count-sources` use:
 *
 *   max_turns=5
 *
 * Every diagnostic the loader returned goes to stderr, one per line, whatever
 * its class, and none changes the exit code: the budget is still resolved. A
 * dropped key is one class, and there the value comes from the layer the key
 * would have overridden. The retired-file advisory is another, and the
 * costliest: a leftover `fusion-guard.json` names no dropped key because the
 * file was never read. The loop below writes `config.diagnostics` verbatim and
 * must stay that wide; narrowing it to drops would silence that line.
 *
 * Exit codes:
 *   0  resolved
 *   1  usage error
 *   2  no fusion workbench above the working directory
 *
 * Exit 2 rather than "print the plugin default anyway": without a workbench root
 * there is no project layer, so a project that declared 12 would be told 5, and
 * a wrong budget stated confidently is worse than no budget. The caller's own
 * unresolved branch handles it.
 */

import { loadConfig } from "./lib/config.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";

const USAGE = "usage: fusion-turn-budget";

function main(argv: string[]): number {
  if (argv.length > 0) {
    process.stderr.write(
      `fusion-turn-budget: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      `fusion-turn-budget: no fusion workbench found above ${process.cwd()} — run /fusion:setup at the project root.\n`,
    );
    return 2;
  }

  const config = loadConfig({ projectRoot: root });

  for (const line of config.diagnostics) {
    process.stderr.write(`fusion-turn-budget: ${line}\n`);
  }

  process.stdout.write(`max_turns=${config.orchestrator.maxTurns}\n`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
