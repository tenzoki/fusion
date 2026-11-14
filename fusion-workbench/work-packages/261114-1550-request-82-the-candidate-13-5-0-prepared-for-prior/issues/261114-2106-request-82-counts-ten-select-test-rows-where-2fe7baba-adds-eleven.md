Request 82 counts ten Select test rows where 2fe7baba adds eleven
---
`codec/fixtures/prior/REQUESTS.md` `## The candidate 13.5.0 (request 82)`, `### Where main differs from the candidate`, point 2, states that `controlrecord_test.go` "gains ten rows, three selected and seven refused". Fusion `2fe7baba` adds eleven rows to `TestSelectIsTheCodecsRule`: three selected and eight refused. The sentence copies the commit message of `2fe7baba` ("Ten test rows: three selected, seven refused"), which carries the same miscount.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** `git show 2fe7baba -- adapters/prior/fusionmodule/internal/controlrecord/controlrecord_test.go | grep -c '^+\s*{"fusion-workbench'` prints `11`; the same lines filtered on `true}` print `3`. The eight refused rows: `archive/campaigns/…/campaign.json`, `campaigns/.260929-0900-parser-lanes/campaign.json`, `.json-state/campaigns/x/campaign.json`, `campaigns/x/.campaign.json`, `campaigns/x/campaign.json.bak`, `campaigns/x/campaigns.json`, `campaigns/x/x.campaign.json`, `campaigns/x/campaign.JSON`. The request labels the figure "read", so Prior can check it against fusion's tree and will find it wrong.

**Fix direction.** `REQUESTS.md` is append-only. Request 82's own `### What fusion does with the answer` routes a finding on its text to "a passage of its own under this request, re-measured". Append such a passage stating the count as eleven, three selected and eight refused, with the command above. The commit message of `2fe7baba` stays as it is. One passage may also carry the correction of `261114-2106-the-81-question-1-section-states-select-has-three-names-at-a-commit-where-it-has-four.md`.

**Acceptance.** A passage appended after request 82 states eleven rows, three selected and eight refused, citing the command; `git diff --numstat` over the file prints `<n> 0`; `cd catalog && npx vitest run src/__tests__/prior-commands.test.ts` passes.
---
Resolved: appended `codec/fixtures/prior/REQUESTS.md` `### Requests 81 and 82, corrected in two statements`, statement 1: `git show 2fe7baba` over `controlrecord_test.go` adds eleven rows to `TestSelectIsTheCodecsRule`, three selected and eight refused, none removed; the ten came from the commit message of `2fe7baba`, which is not amended. Insertions only, prefix digest intact; uncommitted.
