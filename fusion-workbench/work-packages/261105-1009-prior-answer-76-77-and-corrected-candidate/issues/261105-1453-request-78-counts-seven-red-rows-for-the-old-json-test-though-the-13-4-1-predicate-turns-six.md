Request 78 counts seven red rows for the old .json test, though the 13.4.1 predicate turns six
---
Under `### D-F1 and the last status`, the colon row is red only for a bare suffix test. The 13.4.1 test refused a colon, so that row stays green under it. Severity: Low; request text only.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer, by an appended correction in `codec/fixtures/prior/REQUESTS.md`
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Bundle bytes:** no.

**Evidence.** Request 78 says "with `Select` replaced by the old `.json` test in `controlRecords`, turns seven rows red", and lists "a colon in a record's name". The old test at `67cece9a` was `!strings.HasSuffix(record, ".json") || !fs.ValidPath(record) || strings.ContainsAny(record, "\\:\x00\r\n")`.

Run in a scratch copy of the module at C″, test `TestControlRecordsAreTheCodecsNamesByLastStatus`:

| Mutation of `controlRecords` | Rows red |
|---|---|
| prefix and `.json` suffix alone | 7, the colon row among them |
| prefix, `.json` suffix and the old forbidden characters (`fs.ValidPath` dropped, for which no row has an input) | 6, the colon row green |

The request's claim holds for the first and "old" names the second. The other red-test statements reproduced: the 13.4.1 bundle's refusal, and the four last-status rows.

**Fix direction.** Append one sentence: seven rows for a bare `.json` test, six for the predicate 13.4.1 shipped.

**Acceptance.** The appended sentence states both counts. `git diff --numstat` on the file shows additions only.
