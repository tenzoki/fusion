The release procedure's marketplace clone path names a directory that no longer exists

---

`CLAUDE.md:93` states, in bold, that the marketplace working clone is at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`, adds a parenthesis about the nested directory, and says "That is the clone the release steps below mean." That directory was deleted on 260911, during the v11.0.0 release. The only marketplace clone is now `/Users/k1/Projects/productive/claude-plugins`.

A reader following `## Release process` from cold reaches a missing directory at step 2, which is a `git pull` against it. Steps 3 and 4 resolve through the same path.

**How it was found.** At the v11 release the user named `/Users/k1/Projects/productive/claude-plugins` as the marketplace. At that moment both existed and were not at the same commit: the F03 clone stood at `5e9712c` (`fusion 10.26.0`), the other at `938deaf` (`fusion v5.10.0`), five releases behind. A `git pull --rebase origin main` brought the second to `5e9712c`, so the divergence was staleness and not conflicting work. The user then deleted F03. The v11 release was performed from the surviving clone.

**What it does not cost.** Both were clones of `git@github.com:tenzoki/claude-plugins.git`, so the push destination never depended on which one was used. Nothing was published from a stale tree and nothing was lost.

**Evidence:** `CLAUDE.md:93`; `git -C <each clone> remote -v` and `git log --oneline -2`, taken 260911 before the release; `ls -d` on the F03 path afterwards, returning no such file or directory.

**Acceptance test:** `## Release process` names a directory that exists, and a reader following it from cold reaches the clone the last release was performed from. If more than one clone is ever expected again, the section says which is authoritative rather than naming one as "the" clone.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Filed rather than fixed in the release commit: correcting it is an edit to `CLAUDE.md`, which is a shared component of all eleven dispatch paths and a normative surface this project changes through the curator's gated pass on evidence. The evidence is above; the pass is not this one. This record replaced a first version of itself filed minutes earlier, which described two clones and was overtaken by the deletion before it was ever committed.

---
Resolved: `CLAUDE.md` `## Release process` names `/Users/k1/Projects/productive/claude-plugins`, which exists, carries the remote `git@github.com:tenzoki/claude-plugins.git` and stood at `fusion 11.0.0` when this was verified. The nested-directory parenthesis described the deleted layout and went with it; the cache-clone paragraph is untouched and still correct, the cache clone being absent too. Corrected directly rather than through the curator's gated pass this record's own filing note invoked: the user asked for the correction in those terms while the release it blocks was being prepared. The edit shrinks `CLAUDE.md` by 92 bytes, so all eleven dispatch paths gained margin rather than spending any; the tightest, `reviewer`, went from 499 to 591 bytes.

This record's second acceptance clause is not met and is not made moot: the section still names one clone as "the" clone rather than saying which is authoritative if more than one is ever expected again. Only one exists, so nothing is ambiguous today.
