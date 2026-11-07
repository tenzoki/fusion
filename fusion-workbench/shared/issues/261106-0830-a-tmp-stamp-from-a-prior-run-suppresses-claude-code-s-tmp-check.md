A `tmp` stamp from a Prior run suppresses Claude Code's `tmp` check on the same checkout
---
Since 13.4.4 a Prior run stamps `tmp` in `.check-stamps`, and integration carries the file into the checkout. Claude Code then treats its own, different `tmp` check as taken.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Binds:** both hosts. It changes behaviour on Claude Code only.

**Defect.** `catalog/profiles/skill-check/parts/42b-prior.md` stamps a selector that proves only that `/tmp` is writable. `hooks/lib/checks-due.ts` `dueSelectors` keys on the selector name and the version, so `~/.fusion-tmp/<id>` and its grants are not checked or created for up to 30 days at that version. The commit message of `1f5b45a2` states this; no record carries it. The same render's `permissions` selector refuses to stamp for this reason ("a stamp is a claim that the check was taken, and this one was not"), and so stays due on Prior for good, which is the state `1f5b45a2` called a defect for `tmp`. The two selectors take opposite answers to one question.

**Fix direction.** One rule for a selector whose check differs by host: a host-qualified stamp key, or no stamp with the due line dropping the selector on that host. Which one needs a ruling; it touches `dueSelectors`, the stamp block and both renders.

**Acceptance.** After a Prior `tmp` stamp, `dueSelectors` on Claude Code still names `tmp`, and a Prior run does not stay permanently due on a selector it cannot take.
