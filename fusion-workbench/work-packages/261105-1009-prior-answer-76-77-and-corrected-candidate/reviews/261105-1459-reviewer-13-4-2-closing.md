# Review: closing review of 13.4.2, the fixes, C″ and request 78

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `702294c3..1504f7c2`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/work-packages/261105-1009-prior-answer-76-77-and-corrected-candidate/plans/261105-1023-plan-fusion-13-4-2-corrected-candidate.record.json`
**Review domain:** code
**Verdict:** revise
**Plan:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

## Summary

The delivered bundle is what the tree says it is: a fresh clone at C″ rebuilt the tarball and `handover.json` byte for byte. The five closed issues meet their acceptance. Four findings are new and only one is bundle bytes: the Setup binding's sentence is still false for the helper form it names. The other three are errors in request 78's text or a gap in a test, and none forces 13.4.3.

Workbench-only changes in the range needed no opening beyond the plan: the commit `7dea2547` and the workbench files of `a3274f23` and `1504f7c2`. I read the four issue records `7dea2547` closes in the working tree, not as a diff. The two paths under `**Not-opened:**` are all that I did not read.

## Totals

| Severity | Count | Bundle bytes? | Issues |
|---|---|---|---|
| Critical | 0 | | |
| High | 0 | | |
| Medium | 2 | one yes, one no | the binding; question 3 |
| Low | 3 | no | red-row count; codec attribution; watch-list forms |

## Findings by theme

### What the binding tells a model

**Medium. Bundle bytes, remedy 13.4.3 or later.** `261105-1453-the-setup-binding-says-the-commands-it-names-use-the-six-though-it-names-the-helper-form-and-its-exit-127-clause-covers-neutral-blocks-only.md`.

"The commands this binding names use those alone" stands in 25 parts. 11 name `"$FUSION_PLUGIN_ROOT/bin/<helper>"` in the same paragraph (`analyst/parts/03-prior.md:3`) and 14 open with "every helper call" (`skill-wp/parts/01-prior.md:5`). 27 of 31 helpers call `dirname`, as request 78 itself says. The host-gap clause names a neutral block only. With `PATH` holding the six alone, simulated on macOS, a missing `dirname` gives `fusion-paths` exit 127, `fusion-rules` exit 0 and `fusion-identity` exit 3, so the "exit 127" trigger catches one of three. No run-time effect is measured on the pinned image, which carried these commands, `rm` not measured.

### What request 78 says

All three remedies are an appended correction. `REQUESTS.md` may take that, and none moves the bundle.

**Medium. Request text.** `261105-1453-request-78-question-3-understates-what-the-model-tool-does-to-a-block-and-counts-two-held-parts.md`. Question 3 states `toolLines` correctly, with the right lines. It leaves out two things Prior needs in order to answer. A multi-line block runs its first line and can report success: `bash -c 'printf first' 'printf second' 'exit 7'` printed `first` and exited 0, in plain `bash`. And `argv` is a string (`general_tools.go:63`), so the array form the parts write is refused for one line too: `api.Decode` at the pin answers `invalid module protocol`. Its "16 parts" holds two held parts; the bundle's profiles hold the form in 14.

**Low. Request text.** `261105-1453-request-78-counts-seven-red-rows-for-the-old-json-test-though-the-13-4-1-predicate-turns-six.md`. Seven rows are red under a bare suffix test. Under the predicate 13.4.1 shipped, which refuses `:`, six are, and the colon row stays green.

**Low. Request text.** `261105-1453-request-78-calls-the-whole-predicate-the-codecs-rule-though-the-character-clauses-are-priors.md`. This is the one attribution error I found, and it runs the other way from the one asked about: a clause of Prior's is attributed to fusion's codec. The names, dot and archive clauses are the codec's. The character clauses are `EntryRelativePath` and `assetPath`, Prior's. By reading; not run through the codec.

### What the guard can see

**Low. Not bundle bytes; waits for the next candidate, since the plan holds `catalog` still.** `261105-1453-the-prior-commands-watch-list-still-passes-env-with-an-assignment-timeout-sh-c-bash-lc-eval-and-a-quoted-assignment.md`. `env FOO=1 sort`, `env -i sort`, `command -p sort`, `VAR="a b" sort`, `timeout 5 mv`, `sh -c`, `bash -lc` and `eval` return no hit, and the header's limit does not name them. A scan found no live use.

## The four questions

### 1. The fixes against the closed issues

Yes, all five, and no finding reopens one. A later change is a new issue.

| Issue | Acceptance, as measured |
|---|---|
| The binding | No binding claims the whole text. The new sentence is in the same 25 parts, `BINDING_SENTENCE` is its text. Suite and render clean |
| The pending clause | The grep over `*-prior.md` prints nothing, held skills included. Suite and render clean |
| Chunk decoding | All five stdin blocks carry `setEncoding`. With a writer that splits inside `ü`, the old form printed U+FFFD and the new form `ü`. Local `node` 25, not the image |
| The watch list | See below |
| R and C | The module, its test and the README no longer attribute them to Prior. Request 78 states the difference, and its three-row table is the issue's |

The R and C close is uncommitted: its record is `closed` in the working tree only, while `7dea2547` closed the other four.

**The watch-list test catches its issue's table.** Its regexes, read out of the test at C″, hit all 15 inputs, and a row in the test holds each. On the real suite, `mv a b` appended to the exempted `skill-archive/parts/37-prior.md` turned it red, and so did `["bash", "-c", "x=1; ls|sort"]` appended to `skill-wp/parts/09-prior.md`, with hits `ls` and `sort`.

**The `skill-archive/parts/29-prior.md` exemption is right.** The text is prose: "parse the `YYMMDD` (or legacy `MMDD`) date prefix". The new `\)[ \t]+` position, needed for a case arm, reads that `date` as a command. The exemption is the exact span, and a row shows a real `date +%s` in that file is still a hit.

Beyond the issue's acceptance: the catalog suite passes, 293 of 293. A script applying the three named substitutions to each of the 30 parts of `c15aeabd` reproduced 29 exactly. The thirtieth, `skill-cadence/parts/01-prior.md`, also has the intended change to line 13, read in the diff. So I read most of those parts by script, not by eye.

### 2. The binding sentence

Not in every part: see the first finding. Its neutral-block clause is true everywhere, since "may run others" holds in all 25.

**No `prior` part tells a reader the opposite on neutral blocks.** A grep for `those alone`, `may rely`, `guarantee`, `the six`, `rely`, `six commands`, `host gap` and `exit 127` found only the binding and `skill-cadence/parts/01-prior.md:13`, which now agrees with it. The other hits are other subjects, such as six exit codes. `this text's own commands` survives nowhere in `catalog`, `adapters`, the READMEs or `docs`.

### 3. C″

**It touches what step 6 allows.** Seven shipped files, the plan's list, plus `fusion-workbench/orchestrator-events.jsonl`, which is workbench and not on that list.

**The version tokens agree.** `13.4.2` at `plugin.json:3`, `install.sh:29`, `README.md:30`, and in the bundle's `module.json`. The two `21` parts carry the same ordered token list. No `13.4.1` is left in the shipped paths outside the help notes. The label "Coming from 13.0.0 to 13.4.1" follows the older paragraph's form, which names the version before the newest.

**Checks at C″, in a clone:**

- render for `claude`: no diff
- `claude plugin validate .`: passed with warnings, which the release step allows
- catalog suite: 293 of 293
- hooks suite: 1 216 passed, 14 skipped
- `FROZEN` diff and codec digest: hold

The first hooks run showed 104 failures. That run had a long `TMPDIR`, under which `tsx` could not open its pipe in the same command, and it overlapped my other measurements. I kept only its last lines, so the cause is *inference*. Alone, with a short `TMPDIR`, the suite is green.

The commit's smoke run was not repeated.

### 4. Request 78

**Mostly true. Three corrections are the findings above; nothing else failed.** Stated as run and reproduced, unless marked:

| Statement | Measured |
|---|---|
| Digest, tarball, sidecar, `handover.json`, three binaries, modes, sizes | Equal. A rebuild from a fresh clone at C″ gave the same digest and is byte-identical in tarball and `handover.json`. `build.sh verify` on it: "1616 files … 61 data files" |
| 1 616 entries, 35 and 1 581, each path segment, 61 data files, 1 549 install-tree files, the one git link | Equal |
| Eight `FROZEN` files, eleven `WITHDRAWN` absent, `catalog.json`, `hooks.json`, codec | Equal |
| Bundle's `REQUESTS.md`: 6 713 lines, 1 143 513 bytes, `ae7021e6…`; `36947f8e…` at `aa4277d8` | Equal |
| 94 tests and 249 subtests by package, against the delivered bundle | Equal, 0 failed |
| `a_class-L_file…` against the 13.4.1 directory | Red, `refused`, `host-permission-denied`, `record:.guard-state/staging-drift.json` |
| Four red last-status rows; the four files the hook sessions wrote | Equal |
| Delta: 79 files, 693 and 175, and each table row's sum | Equal |
| Inventory table | The analysis' script at C″: 26 rows, 0 differences |
| The image output against the analysis, and `rm` not measured | The opening lines and the `rm` passage read equal; the rest not compared line by line. Docker not re-run, since any `docker run --rm` contains `rm` |
| Prior's lines at `d04f457` (`EW`, `ESW`, `exec.go`, `general_tools.go`, `entry_catalog.go`, `entry_policy.go`, `workbench.go`, `entry_services.go`, both `UPSTREAM.json`) | Each line right. `general_tools.go` is outside the request's diff pathspec and is also unchanged |
| Frozen lines of `entry.v2` and `result.v2`; `hostsvc.go:100`, `entry.go:439`, `store.ts:446`, `:454` | Right |
| The standing table | Against Prior's answer at `52a2703`, every item is accepted there, and the left-out items are 76 question 4 (deferred), 6 (corrected), 77.3 and 77 question 12 (corrected) |
| Quotes of Prior: the six, "may rely on the six only", v3 "can", the three guard-state files, inference under G4 | Exact or fair |
| Prior's four issues | All open at `d04f457`, as the section implies. S63-2's phrase is not in the assets or above the section |

**Not reproduced, stated as earlier measurements:** the 3 000 000, 500 000 and 1 343 630 runs, from the earlier review. Their inputs have not moved at Prior's cited paths. "Twice into fresh directories" and "`git rev-parse HEAD`" are not checkable after the fact, though my rebuild and the commit's parent agree with them.

**Honest about what did not run.** The section says no party ran the bundle on Prior, marks its inferences, and says no record shows the `setEncoding` edits in the image. I ran those locally only, so that stays true.

**Now stale, not an error.** `### Stated and not asked` says "The closing review has not run". An appended line should name this review.

## Not run

Prior, its host, its image and any `docker run`. The smoke run of `claude --agent`. The stdin blocks in the pinned image.

## Cross-cutting observations

- **The same narrowing error twice.** The previous sentence claimed too much for "this text", and this one claims too much for "this binding", because the paragraph holds helper calls. A sentence about what runs needs to name the thing that runs.
- **The array form spreads wider than question 3.** Every `["bash", "-c", …]` in the parts is a notation the model must translate into the tool's one-argument-per-line string. Multi-line loss follows from that translation. Prior's answer to question 3 may change the binding, which is why the binding's rewording should wait for it.

## Recommended sequencing

1. **Now, before naming the request to Prior:** one appended passage in `REQUESTS.md` with the three text corrections and a line naming this review. `1504f7c2` holds the file at `sha256:bc95a43939b2ffb9033afb17da4ebc0eb8c88034b9370651809c715dc8695293`, 7 088 lines, 1 192 576 bytes; the appended commit gets a new digest, and that is the one to report. The bundle's digest stays `439142d7…`.
2. **Not a blocker for handing over 13.4.2:** the binding finding. Prior reads the true scope in the request's own table, and the measured image shows no effect. Whether it alone justifies 13.4.3 is the user's call; my recommendation is no.
3. **In the next candidate, after Prior's answer to questions 2 and 3:** the binding's wording and the watch-list forms.
