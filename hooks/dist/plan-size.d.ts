/**
 * The plan-size check, printed for a human or an agent to read.
 *
 * The computation is `lib/plan-size.ts`, and this is its only caller — no hook
 * runs it, no test gates on it, no pipeline step invokes it. Read that module's
 * header for the ceiling's provenance and for why it is carried in no exit code.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-staging-drift` and
 * `bin/fusion-review-coverage` use, then one line per live plan, largest first:
 *
 *   anchor=workbench-root
 *   ceiling=40000
 *   plans=4
 *   over=3
 *   largest=57891
 *   total=195402
 *   skipped-specs=4
 *   verdict=over
 *     over      57891  circles/<dir>/planning/…_p_….md  (17891 over — …)
 *     under     33472  shared/planning/…_o_….md
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **A plan over the ceiling is not an error exit**, for the reason
 * `bin/fusion-review-coverage` gives at the same place: a check that hands its
 * verdict to an exit code teaches its reader to ignore that code. Here it is
 * also the user's ruling rather than a convention — see the library header.
 *
 * `verdict=empty` is a real answer and not a failure: a workbench with no live
 * plan has nothing over any ceiling, and it reaches exit 0 like the other two.
 */
export {};
