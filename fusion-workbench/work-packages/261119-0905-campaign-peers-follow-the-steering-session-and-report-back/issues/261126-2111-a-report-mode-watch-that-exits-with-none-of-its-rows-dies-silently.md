# A report-mode watch that exits with none of its rows dies silently

---
`watch --report` can end with no `failed=`, no row and no `head=`: any throw inside the delta exits 1, and a malformed call exits 2. Both texts give such a wake "no text" and no restart, so the watch stops while the session believes it runs. This is the class of issue `261126-0900-a-watch-that-exits-on-failed-is-not-restarted-because-the-text-restarts-only-from-a-printed-head.md`, for the exits that fix did not cover.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`; spec C5 criterion 7

**Evidence:** `hooks/lib/campaign-watch.ts:255-267` `reportRows` calls `fetchRef` (`mustGit` at `hooks/lib/campaign.ts:494`, `realpathSync(mustGit(…))` at `:507`), `withScratch` (`tmpPath` throws `HelperFailure`, `campaign.ts:418-425`) and `sideAt` (`mustGit ls-tree` at `campaign-watch.ts:206`, `extractAt`'s `git archive` and `tar` at `campaign.ts:528-540`). None is caught in `reportLoop` (`campaign-watch.ts:298-327`), so a throw reaches `hooks/campaign.ts:476-479`: exit 1, stdout empty. Exit 2 is a `--since` outside 7 to 64 hex (`hooks/campaign.ts:141`), which a session with no `head=` read could send. Texts: `skills/campaign/SKILL.md:160` ("Else restart it `--since` the printed `head=`. Any other wake: no text.") and `agents/orchestrator.md:380` (same pair). The two clauses overlap ("Else" and "any other wake"), and neither names an exit with an empty stdout.

**Acceptance:** a throw inside the delta counts as a failed probe under the outage rule (a `failed=` state the header names), with a test that makes the extraction fail. Both texts give an exit that printed none of the listed rows one sentence and say whether it restarts. The case list in each text is disjoint and complete.
