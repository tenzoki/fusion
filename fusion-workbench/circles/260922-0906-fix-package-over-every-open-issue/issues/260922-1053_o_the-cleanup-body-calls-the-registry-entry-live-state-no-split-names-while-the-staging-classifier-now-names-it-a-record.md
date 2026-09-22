The cleanup body calls the registry entry live state no split names, while the staging classifier now names it a record
---
`skills/cleanup/SKILL.md`, the push paragraph (line 83 at the commit that files this): "`.fusion-setup` and this checkout's registry entry are live state a session dirties and no split names (`rules/workbench-tracking.md`)". Since step 24 of `260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md` put `checkouts` into `RECORD_STORES` (`hooks/lib/stores.ts`), `bin/fusion-staging-drift` classifies a modified `shared/checkouts/<hex>.md` as `record … UNSTAGED`, the same class as an uncommitted decision record, on the reading `rules/workbench-tracking.md` gives it (class R1, tracked). The skill body and the classifier now state opposite things about one file: the body says no split names it, the classifier says a split has to.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Found while landing step 24: the widened path-literal lint caught the same sentence's `shared/checkouts/<id>.md` literal, and the reword that cleared it left the sentence's claim standing. The claim was not step 24's to change, and the plan's design note for that step chose the classifier's reading (a `register` rewrite is a staging obligation) without naming the cleanup body as a consumer of the opposite one.

The `.fusion-setup` half of the sentence is not in question: it is live state (class L in `rules/workbench-tracking.md`) and the classifier reports it `in-flight`.

**Acceptance.** Either the cleanup body's push paragraph names only `.fusion-setup` as the live state no split names, and its commit-split step names the registry entry where it names other records; or `rules/workbench-tracking.md` and `hooks/lib/staging-drift.ts` say why a registry entry is dirtied and not committed, and the classifier stops reporting it `UNSTAGED`. One reading, stated in both places.
