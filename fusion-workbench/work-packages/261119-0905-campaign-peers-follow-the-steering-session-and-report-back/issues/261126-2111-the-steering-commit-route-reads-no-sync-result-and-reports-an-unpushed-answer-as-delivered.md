# The steering commit route reads no sync result and reports an unpushed answer as delivered

---
`skills/campaign/SKILL.md` Step 6 ends the commit route with "then `sync`, which pushes", and Step 8 then tells the user "the peer reads it within about 5 minutes". Neither step reads what `sync` printed.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`; spec `261119-1102-spec-campaign-peers-follow-the-steering-session-and-report-back.md` C3 criterion 3

**Evidence:** `catalog/profiles/skill-campaign/parts/07-claude.md:17` (rendered `skills/campaign/SKILL.md:137`), `parts/08-claude.md:10` (rendered `:156`). `sync` can end without a push: `state=rejected` exit 11 (`hooks/lib/campaign-sync.ts:324-325`), `state=conflict` exit 10 (`:316`), `fetch-failed` exit 6, and `deferred=` rows with the rebase skipped while another tracked path is dirty (`:295`, `:309`), after which a fast-forward push to a remote that peers moved is rejected. `agents/orchestrator.md` Step 4 sub-step 5a handles every one of these; the skill handles none. `docs/campaign.md` (`## Questions go to the steering session`) repeats the unconditional sentence.

**Acceptance:** Steps 6 and 8 read `sync`'s `state=` and `pushed=` lines. Only `state=ok` with the commit in `pushed=` leads to "the peer reads it within about 5 minutes". Every other state is reported to the user in git's words, as 5a does, with the act or answer standing committed but not pushed. The skill stays within `SKILL_HEAD_ROOM`.
