/**
 * What prior curator runs already asked the user about a work-item edge, printed
 * for `agents/curator.md` `### The suppression read` to read instead of the
 * corpus.
 *
 * The computation is `lib/edge-answers.ts`, and this is its only caller — no
 * hook runs it, no test gates on it, no pipeline step invokes it. Read that
 * module's header for the corpus, the outcome parse and why the consequence
 * group is deliberately not a column.
 *
 * Output, one `KEY=value` per line, then one row per answered pair:
 *
 *   anchor=workbench-root
 *   run-files=15
 *   edge-entries=2
 *   pairs=2
 *   unreadable=0
 *   verdict=answers
 *   none        <dependent>.md -> <target>.md  into Cross-references
 *
 * The row is four fixed columns — the outcome value, the dependent, the target,
 * the field. `none` and `unreadable` are not outcome values: they say no answer
 * could be read, from an entry with no outcome row and from one whose row
 * carries no vocabulary word. `### The suppression read` decides what each of
 * the seven values does, and nothing here does.
 *
 * ## The `note=` line is mandatory whenever `unreadable=` is above zero
 *
 * The parse reads free-form prose and can come back with an entry it cannot
 * resolve to one value. That is a degradation which changed the answer, so it is
 * stated rather than hidden — the line kind `bin/fusion-work-order` and
 * `bin/fusion-forum` carry.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the read ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to read.
 *
 * **No exit code carries the verdict**, the stdout-verdict rule
 * `bin/fusion-work-order`, `bin/fusion-plan-size`, `bin/fusion-review-coverage`,
 * `bin/fusion-staging-drift` and `bin/fusion-citation-check` all carry. An empty
 * corpus is an answer about the project — no edge was ever proposed — and a
 * broken install must never be reported as one; that is the wrapper's exit 3.
 */
export {};
