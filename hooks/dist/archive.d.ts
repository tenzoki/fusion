/**
 * The archive entry: the host's archive move over a JSON-controlled
 * workbench, for `bin/fusion-archive` and nothing else.
 *
 *   archive.js survey  <workbench> --candidates <file>
 *   archive.js move    <workbench> --survey <file> --into <YYMMDD-HHMM>-<slug>
 *   archive.js resume  <workbench> --inventory <file>
 *   archive.js abandon <workbench> --inventory <file>
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, found by the
 * wrapper. The units, the holds, the move and the recovery are
 * `lib/record-archive.ts`; the exit table is the wrapper's header.
 *
 * Output: `KEY=value` lines on stdout, the reason on stderr prefixed
 * `fusion-archive:`. The library is imported inside the `try`, so a module
 * missing from an install is exit 3 like any internal fault, never Node's own
 * 1, which the wrapper uses for "no workbench". No automatic hook runs this
 * entry.
 */
export {};
