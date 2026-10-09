Three takeover flag branches of the write client's parser have no test
---
The step-7 regression (`8bb82215`) was a `parseFlags` branch that reached a route its tests did not send. Three more branches in the same block are reached by no test.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** low
**Found by:** review G-B, `261009-1448-reviewer-g-b-closing-review-of-the-13-0-0-takeover-revision.md`

**Evidence.** `hooks/lib/record-write.ts` `parseFlags`, at `4e1e1b47`:
- line 277: `if (!takeover && flags.has("--previous-claim"))` is a usage error for `--previous-claim` on an ordinary claim. No case sends it.
- line 278-279: `--previous-claim` that is not a JSON object is a usage error. Only `--source` is tested for this (`"not json"`, `"null"`, in `record-write.test.ts` `describe("takeover, request 62")`).
- line 281-282, with `resendFlags(s, true)`: a takeover re-send that gives `--operation-id`, `--expected-revision` and `--claimed-at` but omits `--previous-claim` is a usage error. No case omits it. The one re-send case passes all three, and its "bent" variant changes the value, not the presence.

`grep -n 'previous-claim' hooks/lib/__tests__/*.ts` finds lines 130 and 136 only.

There is also one edge in behaviour, which is not a test gap: `--take-over-from ""` passes `parseFlags`, reaches `takeover()`, and is refused as ownership (exit 5, "not by "). A malformed argument would read better as a usage error (exit 2). Inference: this is harmless, because nothing is sent either way.

None of these is wrong today. Each of them is the shape `8bb82215` had to repair after the fact.

**Acceptance.** `record-write.test.ts` gains the three cases. Each one asserts `usage` and that no mutation was sent. Optionally, an empty `--take-over-from` is a usage error. The hooks suite stays green within its growth room.

---
Resolved: `hooks/lib/__tests__/record-write.test.ts` `describe("takeover, request 62")` gains the three cases (`--previous-claim` on an ordinary claim, a `--previous-claim` that is not a JSON object, a takeover re-send without `--previous-claim`), each asserting `usage`, no mutation sent, and the usage text of its own branch. `--take-over-from ""` is now a usage error in `hooks/lib/record-write.ts` `parseFlags` (it was ownership, exit 5), with a fourth case; that case was red against the parser without the new line. `hooks/dist/` rebuilt.
