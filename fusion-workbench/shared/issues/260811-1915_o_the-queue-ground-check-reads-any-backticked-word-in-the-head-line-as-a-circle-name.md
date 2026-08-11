The queue-ground check reads any backtick-quoted word in the head line as a Circle name

---
The `#### Reading a queue` snippet in `agents/orchestrator.md` derives the Circle a queue was
built for with `grep -oE 'circles/[A-Za-z0-9._-]+|`[A-Za-z0-9._-]+`'`. The second alternative
matches *any* backtick-quoted token on the line, not only a Circle directory name, and `head -1`
then takes whichever comes first. A queue that correctly records "no Circle" in prose therefore
yields a Circle name, and the check reports a stale queue where the ground has not moved.

---
Measured at Setup on 260811-1900, on this repository's own queue. The head line reads:

    **Active Circle:** none — no `.active-circle` pointer exists, so `fusion-paths` emitted no
    `CIRCLE` key and every `OUT_*` resolves into `shared/`

The three alternatives that match are `` `.active-circle` ``, `` `fusion-paths` `` and
`` `CIRCLE` ``. The first wins, so `G` becomes `.active-circle`, the comparison against the empty
`.active-circle` file fails, and the check prints

    queue: STALE — built for Circle .active-circle; active is none

The correct verdict is row 4 of the ground table in the same section: the queue names no Circle,
none is active, so it is an unaffiliated backlog and current.

Two consequences, and the second is the damaging one:

1. **A false stale verdict at Setup.** `/fusion:setup` Step 3 tells the user a stale queue is the
   one thing in the summary they must act on before Phase 1 runs. Here that instruction fires on a
   queue that is fine.
2. **The same expression drives the Phase 4 retirement.** `agents/orchestrator.md` Phase 4 step 4
   reuses it to decide whether to `mv` the queue into the closing Circle's plan store, guarded by
   `[ "$G" = "$(basename "$DIR")" ]`. A spurious `G` cannot equal a real directory name, so the
   retirement silently does not fire — the failure is a queue left at the root, which is the
   condition the retirement exists to prevent.

The fix belongs in the expression, not at the call sites: the head line's value is a Circle
directory name or the literal word "none", so the derivation should read the value that follows
the label and stop at the first word, rather than scanning the whole line for backticks. Both
copies (the `#### Reading a queue` snippet and the Phase 4 step 4 block) must change together, or
the two verdicts diverge — which is itself the duplication that queue entry 29 already names.

Related: entry 29 in `fusion-workbench/tasklist.md` ("State the queue-head derivation once, and
have the retirement cite it"), and entry 30 ("Make the queue-ground lint's negative controls call
the production helpers"). This record is the concrete defect those two entries would have caught
had they landed first.

---
Also seen: 260811-1425 by the orchestrator of the KRK project, transferred here by the user on
260811-2010 as `bugreports/260811-1425_o_die-pruefung-der-warteschlange-liest-einen-circle-pfad-aus-der-prosa-ihrer-kopfzeile.md`.
Same expression, the **other** alternative, and an earlier and more damaging witness than the one
above — so this record is the merge of the two rather than a second filing (the duplicate-filing
step queue task 27 is building would have produced exactly this append).

Their measurement, 260811-1330. The head line read, in substance:

    **Active Circle:** keiner. Beim Bau dieser Schlange war kein Circle aktiv, … Die fünf Aufgaben
    aus dem Circle der Runde 1 (`circles/260802-0842-krk-mac-dateimanager-editor-git/issues/`)
    stehen auf ausdrückliche Festlegung des Nutzers in der Liste …

The `circles/[A-Za-z0-9._-]+` alternative matched the path in the subordinate clause, `head -1`
took it, and the check reported `queue: STALE — built for Circle
260802-0842-krk-mac-dateimanager-editor-git`. The word "keiner" immediately after the colon was
never read. The queue was neither stale nor built for that Circle: it was built over `shared/` and
was fully worked off at the time of the check.

Three things their case adds to the one measured here:

1. **Both alternatives are wrong, not just the backtick one.** The witness above was matched by
   `` `[A-Za-z0-9._-]+` `` picking up a prose word; theirs by `circles/…` picking up a real path
   that names a Circle the queue was not built for. A fix that tightens only one alternative
   leaves the other standing.
2. **The failure falls toward action, not toward doubt.** The wrong verdict is not "cannot tell"
   but `STALE` with a concrete Circle name — the line carrying the most pressure to act, printed
   by `/fusion:next` at the moment the user decides what to work on next. In their case it nearly
   caused a completed queue to be withdrawn on an invented ground. It was caught only because
   somebody read the head line instead of believing the check.
3. **Rows 3 and 4 of the verdict table are unreachable whenever the head line mentions any path.**
   "The head names no Circle" is the condition for both, and a prose mention passes as a naming.

Their proposed direction agrees with the one above and states it more precisely: bind the match to
what stands **immediately after** `**Active Circle:**`, and read "keiner" / "none" / an empty
remainder as "no Circle named". Severity from their filing: medium.

---

## Reconciliation 260811-2330 — the record stands, but one of its two witnesses is misattributed

**The record stays open. The expression it describes is still in the prompt — at one of the two
call sites, not both.** Re-measured at HEAD `31746d1`:

| Site | Derivation at HEAD | Verdict on this repository's queue |
|---|---|---|
| `agents/orchestrator.md:871` — the `#### Reading a queue` snippet, the canonical implementation | `sed -E 's/^\*\*Active Circle:\*\*[[:space:]]*//; s/[[:space:]].*$//; s/`//g; s\|^circles/\|\|'` | `G=none`, pointer absent, so `queue: current — unaffiliated backlog`. **Correct.** |
| `agents/orchestrator.md:829` — the Phase 4 step 4 retirement block | `grep -oE 'circles/[A-Za-z0-9._-]+\|`[A-Za-z0-9._-]+`' \| head -1` | `G=.active-circle`. **The defect, unchanged.** |

Both commands were run against `fusion-workbench/tasklist.md` as it stands; the outputs above are
what they printed.

**When the canonical copy was fixed.** Commit `b4eb4db` (2026-08-11 10:36), Turn 1 of this same
session, replaced the two-alternative `grep -oE` with the `sed` form at the `#### Reading a queue`
site and left the Phase 4 copy alone. Verified by reading `agents/orchestrator.md` at `9f84254`,
the HEAD in force at the 19:00 resume: line 747 already carried the `sed` form and line 705 the
old one.

**So the first witness in this record — "measured at Setup on 260811-1900 … the check prints
`queue: STALE — built for Circle .active-circle`" — cannot have come from the canonical snippet,
which had been fixed eight hours earlier.** Either the Phase 4 copy was read at Setup in place of
the canonical one, or the verdict was reasoned from the prompt text rather than run. The same
misattribution is repeated in the session history file's `## Resumed` section ("The check as
written in `agents/orchestrator.md` misreports it as stale"), which is where it entered the record.
This does not weaken the finding: the KRK witness (`260811-1425`) is against the same expression
and the Phase 4 copy still carries it. It changes what has to be fixed — one copy, not two.

**And that is exactly the failure `260810-0511` predicted.** That record says the queue-head
derivation is written twice in one file which calls one of them canonical. The two copies have now
in fact diverged, and the divergence produced a false measurement in a review record within one
day. Fixing the surviving copy by *deleting* it in favour of a citation (queue entry 29) closes
both records; patching it in place leaves the duplication that caused this.

Reconciled by `reconciler`, `shared/history/260811-2330-reconciliation.md`.
