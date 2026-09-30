/**
 * The scope entry: the work package this checkout holds, or whether a named
 * directory is a package, answered from JSON control data through the codec.
 *
 * Two subcommands, each run by one `bin/` helper and by nothing else:
 *
 *   scope.js claimed <workbench> <checkout>    for `bin/fusion-claimed-package`
 *   scope.js item    <workbench> <dir>         for `bin/fusion-paths`
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, resolved by the
 * caller, and `<checkout>` the eight hex characters `bin/fusion-identity`
 * printed: the wrapper keeps its own workbench and identity branches, exit
 * codes included, and this program decides nothing about either.
 *
 * Output: `claimed` prints `PACKAGE=` and `CONTAINER=` (workbench-relative)
 * for the one package held, or nothing at all when none is; `item` prints
 * nothing. Every reason goes to stderr, prefixed with the calling helper's
 * name, since that is the program the reader ran.
 *
 * Exit codes:
 *   0  answered. For `claimed` either both lines or nothing: an empty answer
 *      is "no item in scope" and it is a real answer. For `item` the
 *      directory names a package.
 *   1  `item` only: the directory names no package record the codec finds, a
 *      caller's mistake and not a workbench fault.
 *   2  usage error.
 *   3  the item in scope cannot be determined. Nothing on stdout and NEVER a
 *      fall back to the shared store. The cause is named on stderr, and it is
 *      one of: two or more packages carry a claim naming this checkout (each
 *      named); the workbench is `legacy` or `unsupported`; the codec refused a
 *      read (`recovery-blocked` among them) or gave no answer; a package row
 *      did not read; the store changed under the read twice over. The
 *      computation and what each cause means is `lib/scope.ts`.
 *
 * No exit code carries the codec's own; the answers are read, not the child's
 * status. No automatic hook runs this entry: `lib/record-client.ts`
 * `## The recovery declaration`.
 */
export {};
