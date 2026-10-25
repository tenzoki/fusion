3. **Apply nothing.** The default-safe answer, and an ordinary one — record it in a line and stop.

Below the options, one line invites per-entry approval by id: the user may instead reply with the ids the ledger carries, comma-separated (`L01,L04`), to approve exactly those. Ids run `L01` upward and the survey pass wrote them into the file, which is what lets per-entry granularity survive a prompt that never shows a single entry.

**Two questions at most, the second strictly narrowing the first.** Do not re-put an entry the user declined, do not ask them to confirm a set they have just marked, and do not open a question about anything other than what is in the ledger.

## Step 6 — Dispatch the policy-curator to apply

Only when at least one entry was approved. On a rejection, or on an empty follow-up selection, **dispatch nothing at all** — an empty approval set is a rejection, not an omission to be interpreted.

