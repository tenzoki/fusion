/**
 * The write entry: one codec mutation per run, for `bin/fusion-write` and
 * nothing else.
 *
 *   write.js <subcommand> <workbench> <person> <checkout> [flags]
 *
 * `<workbench>` is the absolute path of `fusion-workbench/`, and `<person>`
 * and `<checkout>` are what `bin/fusion-identity` printed, each "" when
 * unread: the wrapper keeps the workbench and identity branches, and this
 * program decides nothing about either. The subcommands, their flags and the
 * exit table are the wrapper's header; the sequence is `lib/record-write.ts`.
 * `log-repair` sends no request: it appends rows an earlier call retained.
 * `initialize` is Setup's: `<workbench>` is the target it names, and
 * `<person>` and `<checkout>` are "" because nothing it sends carries them.
 *
 * Output: `KEY=value` lines on stdout, reasons on stderr prefixed
 * `fusion-write:`. The library is imported inside the `try`, so a module
 * missing from an install is exit 3 like any internal fault, never Node's
 * own 1, which the wrapper uses for "stop". No automatic hook runs this entry.
 */
export {};
