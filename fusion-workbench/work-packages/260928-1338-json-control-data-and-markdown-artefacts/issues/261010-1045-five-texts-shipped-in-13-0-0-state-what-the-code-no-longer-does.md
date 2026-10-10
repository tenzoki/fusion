Five texts shipped in 13.0.0 state what the code no longer does
---
**Severity:** Low. Documentation drift; no behaviour is wrong.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect and evidence** (all read at 468d8e87):

1. `hooks/lib/record-write.ts` header, `bin/fusion-write` header (`initialize`) and `README-hooks.md` row `lib/record-write.ts` say a markerless target counts as legacy when it holds a fusion store "`work-packages`, `circles`, `shared`". The code is `FUSION_STORES = [...CONTAINER_ROOT_NAMES, "shared"]`, and since 13.0.0 `CONTAINER_ROOT_NAMES` (`hooks/lib/stores.ts`) no longer contains `circles`.
2. `hooks/lib/record-archive.ts` header ("No skill calls it before step 13 … which waits on Prior's qualification") and `bin/fusion-archive` header ("no skill calls it before the archive revision is qualified"). `/fusion:archive` has called the helper since 3fdb9886 (`skills/archive/SKILL.md`, Steps 4 and 7), and Prior qualified the revision.
3. `README-hooks.md` row `lib/record-client.ts`: "measured at 2 500 records for every operation but `reconcile`, whose quadratic growth the header names". The header (`hooks/lib/record-client.ts`) now says `reconcile` "is inside it too … linear in the record count". This is the README half the fix of the closed `260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md` left.
4. `hooks/lib/record-change.ts` header: "That file is not yet named in `rules/workbench-tracking.md`". It is named there now.

**Acceptance test.** Each of the sites above states what the code does at the fixing commit; `grep -n circles` over the three record-write texts finds no store-list hit.
