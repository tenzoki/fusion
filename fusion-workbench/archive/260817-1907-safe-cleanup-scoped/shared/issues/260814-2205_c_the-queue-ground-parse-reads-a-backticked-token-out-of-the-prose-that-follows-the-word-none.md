The queue-ground parse reads a backticked token out of the prose that follows the word `none`

---
`agents/orchestrator.md` `#### Reading a queue` and the retirement block in Phase 4 both extract the queue's ground from its `**Active Circle:**` head line with `grep -oE 'circles/[A-Za-z0-9._-]+|`[A-Za-z0-9._-]+`' | head -1`. That expression takes the first match anywhere on the line, not the first token after the label. A head line that says `none` and then explains why in prose containing a backticked token yields that token as the ground.

---
**Found by:** `orchestrator`, at Phase 4 of session `260813-2345-orchestrator-session.md` (resumed 260814-2009), while clearing the pointer for the closure of Circle `260801-1244-curator`.
**Owner:** `coder`.
**Severity:** Low — the wrong value was harmless in the case observed, and the failure needs a coincidence to bite. Recorded because the consequence when it does bite is a destructive move.
**Affects:** `agents/orchestrator.md`, the `#### Reading a queue` snippet and the retirement block in `### Phase 4 — Portfolio sync` step 4; `skills/setup/SKILL.md` Step 3 and `skills/next/SKILL.md` Step 5, which both cite the first of those as canonical.

## What was observed

`fusion-workbench/tasklist.md` carries this head line, written by `taskplanner` exactly as its Step 4 mandates:

```
**Active Circle:** none — no `.active-circle` pointer exists, so `fusion-paths` emitted no `CIRCLE` key and every `OUT_*` resolves into `shared/`
```

The ground extracted from it was `.active-circle`, not `none`. The comparison against the closing Circle's directory name was therefore false, the queue was correctly left in place, and the outcome was right. It was right by luck rather than by the parse.

## Why it matters despite the harmless outcome

The two call sites differ in what a wrong answer costs.

At the **reading** site the cost is a misreported verdict: a queue whose head says `none` is reported as built for a Circle named in its own explanatory prose, so a current backlog reads as stale or the reverse. Confusing, recoverable.

At the **retirement** site in Phase 4 the extracted value is compared against the closing Circle's directory name, and equality moves `tasklist.md` into that Circle's plan store under a `_c_` marker. For the bad parse to reach that branch, the prose after `none` would have to contain a backticked token equal to the closing Circle's directory name. That is unlikely and it is not impossible: a queue head explaining *why* no Circle is active is exactly the place a Circle's name might be mentioned, and `taskplanner` writes that prose freely. The result would be a backlog silently archived into a closed Circle.

## The fix

Anchor the extraction to the label rather than searching the whole line. The head line's format is fixed by `agents/taskplanner.md` Step 4 in two spellings, a backticked `circles/<dirname>` and the bare word `none`, so the parse can require the value to be the first token after `**Active Circle:**` and accept only those two shapes. Anything else is neither, and should be reported as unparseable rather than resolved to whatever the line happens to contain — the `no ground recorded` branch already exists for a head that cannot be read, and an unparseable value belongs in it.

`hooks/lib/__tests__/queue-ground-producer.test.ts` already feeds the producer's documented spellings through the consumer snippet. A case whose `none` line carries trailing prose with a backticked token would have caught this and does not exist; add it with the fix.

---
Resolved: moot, not fixed. All four cited surfaces lost the parse in `dd312eb` (step 10): `agents/orchestrator.md`'s `#### Reading a queue` snippet and its Phase-4 retirement block were deleted whole, and the `skills/setup/SKILL.md` Step 3 and `skills/next/SKILL.md` Step 5 citations of them went with the apparatus. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913. The `**Active Circle:**` line surviving at `skills/next/SKILL.md:248` is the dashboard head line, a different surface with no such parse behind it.
