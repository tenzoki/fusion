/**
 * The scope entry: the work package this checkout holds, or whether a named
 * directory is a package, answered from JSON control data through the codec.
 *
 * Three subcommands, each run by one `bin/` helper and by nothing else:
 *
 *   scope.js claimed <workbench> <checkout>    for `bin/fusion-claimed-package`
 *   scope.js gate    <workbench>               for `bin/fusion-claimed-package`
 *                                              outside a git work tree
 *   scope.js item    <workbench> <dir>         for `bin/fusion-paths`
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, resolved by the
 * caller, and `<checkout>` the eight hex characters `bin/fusion-identity`
 * printed: the wrapper keeps its own workbench and identity branches, exit
 * codes included, and this program decides nothing about either.
 *
 * Output: `claimed` prints `PACKAGE=` and `CONTAINER=` (workbench-relative)
 * for the one package held, or nothing at all when none is; `gate` and
 * `item` print nothing. Every reason goes to stderr, prefixed with the calling helper's
 * name, since that is the program the reader ran.
 *
 * Exit codes:
 *   0  answered. For `claimed` either both lines or nothing: an empty answer
 *      is "no item in scope" and it is a real answer. For `gate` the
 *      workbench is JSON-controlled. For `item` the directory names a
 *      package.
 *   1  `item` only: the directory names no package record the codec finds, a
 *      caller's mistake and not a workbench fault.
 *   2  usage error.
 *   3  the item in scope cannot be determined. Nothing on stdout and NEVER a
 *      fall back to the shared store. The cause is named on stderr, and it is
 *      one of: two or more packages carry a claim naming this checkout (each
 *      named); the workbench is `legacy` or `unsupported`; the codec refused a
 *      read (`recovery-blocked` among them) or gave no answer; a package row
 *      did not read; the store changed under the read twice over; an internal
 *      fault stopped this program (a throw, or a compiled module missing from
 *      an incomplete install), which is a fusion bug and names its stack. The
 *      computation and what each cause means is `lib/scope.ts`.
 *
 * The internal fault is 3 and never Node's own 1, because 1 is a caller's
 * mistake on the `item` route and "stop" on the `claimed` one. So the library
 * is imported inside the `try` below, where a module missing from an install
 * is caught like any throw.
 *
 * No exit code carries the codec's own; the answers are read, not the child's
 * status. No automatic hook runs this entry: `lib/record-client.ts`
 * `## The recovery declaration`.
 */

import type { Unknown } from "./lib/scope.js";

type Lib = typeof import("./lib/scope.js");

const USAGE = "usage: scope.js claimed <workbench> <checkout> | scope.js gate <workbench> | scope.js item <workbench> <dir>";
const NO_FALLBACK = "Nothing is resolved and nothing falls back to the shared store.";

/** One line naming why the item in scope is unknown. */
function reason(u: Unknown, workbench: string): string {
  const refusal = (r: { class: string; reason: string; detail?: string }): string => `${r.class}/${r.reason}${r.detail === undefined ? "" : `: ${r.detail}`}`;
  switch (u.cause) {
    case "legacy":
      return `the workbench at ${workbench} is legacy (no workbench.json: its control data is Markdown), which this version reads only once it has been migrated to JSON, so the item in scope is unknown.`;
    case "unsupported":
      return `the workbench at ${workbench} is unsupported by this version's codec${u.diagnosis === null ? "" : ` (${refusal(u.diagnosis)})`}, so the item in scope is unknown.`;
    case "unanswered":
      return `the codec gave no answer to ${u.op} (${u.how}: ${u.detail}), so the item in scope is unknown.`;
    case "refused":
      return `the codec refused ${u.op} (${refusal(u.refusal)}), so the item in scope is unknown.`;
    case "unreadable-package":
      return `${u.path} does not read (${refusal(u.problem)}), so which packages are claimed cannot be determined.`;
    case "store-changing":
      return `${u.path} was listed at revision ${u.listed} and shown at ${u.shown}, and once more after a second read, so the store is changing under this read and the item in scope is unknown. Ask again.`;
  }
}

/** The program a reader ran, which is the name every line of stderr carries. */
const tagOf = (sub: string | undefined): string => (sub === "item" ? "fusion-paths" : "fusion-claimed-package");

function main(argv: string[], { claimedBy, isPackage, formatOf }: Lib): number {
  const [sub, workbench, arg] = argv;
  const arity = sub === "gate" ? 2 : 3;
  if (argv.length !== arity || (sub !== "claimed" && sub !== "gate" && sub !== "item") || workbench === "" || arg === "") {
    process.stderr.write(`${USAGE}\n`);
    return 2;
  }
  const err = (line: string): void => {
    process.stderr.write(`${tagOf(sub)}: ${line}\n`);
  };

  if (sub === "gate") {
    const refused = formatOf(workbench);
    if (refused === null) return 0;
    err(`${reason(refused, workbench)} ${NO_FALLBACK}`);
    return 3;
  }

  if (sub === "item") {
    const item = isPackage(workbench, arg);
    if (item.kind === "package") return 0;
    if (item.kind === "no-package") {
      // Exit 1 and not 3: the scope is determinable, the caller named a
      // directory that holds no package record.
      err(`no work package '${arg}' in the container store under ${workbench}: ${item.detail}. The second argument names a package that must already exist.`);
      return 1;
    }
    err(`${reason(item, workbench)} ${NO_FALLBACK}`);
    return 3;
  }

  const scope = claimedBy(workbench, arg);
  switch (scope.kind) {
    case "none":
      return 0;
    case "one":
      process.stdout.write(`PACKAGE=${scope.package}\nCONTAINER=${scope.container}\n`);
      return 0;
    case "ambiguous":
      err(`${scope.held.length} work packages carry a claim naming this checkout (${arg}), so which one is in scope cannot be determined:`);
      for (const h of scope.held) process.stderr.write(`  ${h.package}\n`);
      err(`${NO_FALLBACK} Release all but one.`);
      return 3;
    case "unknown":
      err(`${reason(scope, workbench)} ${NO_FALLBACK}`);
      return 3;
  }
}

try {
  const [lib, { exitZeroOnStdoutEpipe }] = await Promise.all([import("./lib/scope.js"), import("./lib/fail-open.js")]);
  exitZeroOnStdoutEpipe();
  process.exitCode = main(process.argv.slice(2), lib);
} catch (e) {
  process.stderr.write(`${tagOf(process.argv[2])}: an internal fault stopped the scope entry, a fusion bug or an incomplete install and not the workbench's, so the item in scope is unknown. ${NO_FALLBACK}\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
