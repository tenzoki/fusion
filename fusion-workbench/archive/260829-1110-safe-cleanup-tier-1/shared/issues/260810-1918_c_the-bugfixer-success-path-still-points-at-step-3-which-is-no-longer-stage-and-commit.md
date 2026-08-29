The bugfixer-success path still points at "step 3 (stage + commit)", which is no longer that step

---

The Step 3b renumbering moved staging. `agents/orchestrator.md:402` was not moved with it:

> c. If bugfixer reports success (verification passes): **proceed to step 3 (stage + commit)**. Emit
> `bugfix_success` event.

Under the new numbering, step 3 (`agents/orchestrator.md:405`) is *"Write the commit message to a
file — the shell never sees the message"*. Staging and committing are step 4 (`:419`). The old
step 4 ("Stage files") and step 5 ("Commit message format") were merged away by the same edit, and
the parenthetical is what is left pointing at the pair that no longer exists under that number.

The cross-reference one paragraph further down was updated correctly — `:429` says "the bugfixer
retry in step 2c above", which is right — so this is an isolated miss, not a systematic one.

---

**Failure scenario.** An agent that trusts the parenthetical over the number (or the number over the
parenthetical) does one of two things after a successful bugfix: skips step 3 and stages with no
message file written, then has nothing to pass to `git commit -F`; or jumps to step 3, writes the
message, and treats the label "(stage + commit)" as meaning that step 3 also stages — which is the
`-m`/heredoc habit the whole change exists to remove. Either way the branch that reaches step 3b
*through a bugfix* is the one branch reading a stale map, and it is also the branch where a leaked
commit lock is most likely (see `260810-1918_*_step-3b-drops-the-lock-form…`).

**Fix.** `agents/orchestrator.md:402` → "proceed to step 3 (write the message, then stage and commit
at step 4)". One line.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 1, range `5ef92eb..940d522`.

---

**Resolved:** `agents/orchestrator.md:402` now reads "proceed to step 3 (write the message; staging
and committing follow at steps 4 and 5)". The numbering it points into shifted by one in the same
change — staging is now its own step 4 and the locked stage+commit is step 5 — so the pointer names
both rather than the single step the old parenthetical claimed.
