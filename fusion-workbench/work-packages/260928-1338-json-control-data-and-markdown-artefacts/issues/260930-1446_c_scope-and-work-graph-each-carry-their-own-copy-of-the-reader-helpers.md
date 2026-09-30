`scope.ts` and `work-graph.ts` each carry their own copy of the reader helpers
---
The two codec readers re-spell the same five helpers: `isObject`, `refusalOf`, `problemOf`, `refusedByGate` and `isPackageRow`. `isPackageRow` is the criterion for "a row is a package of the container store", and two copies of one criterion drift silently. The first issue of this review is that drift in another helper pair: the two readers already disagree on when a package row reads.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** 260930-1446_*_scope-resolves-a-package-the-codecs-own-validation-refuses-while-the-order-reader-names-it-unreadable.md

Evidence: `hooks/lib/scope.ts` defines `isObject`, `refusalOf`, `problemOf`, `refusedByGate`, `isPackageRow`; `hooks/lib/work-graph.ts` defines each again, byte-for-byte or nearly so (`problemOf` differs only in its detail text). `isObject` has a third copy in `hooks/lib/record-client.ts`. Step 4's Done note (5) records that `refusedByGate` "was re-spelt from `scope.ts` (15 lines) because it is not exported there".

Fix direction: export the shared helpers once, from `record-client.ts` or a small `lib/codec-read.ts`, and import them in both readers. Fold the row-validity criterion of the first issue into the same place.

Acceptance: each helper has one definition under `hooks/lib/`; `grep -n "const isPackageRow\|function refusedByGate\|function problemOf" hooks/lib/*.ts` names one site each.

---
Resolved: `isObject`, `refusalOf`, `problemOf`, `refusedByGate`, `isPackageRow` and the row criterion `unreadRow` are defined once in `hooks/lib/codec-read.ts` and imported by `hooks/lib/scope.ts` and `hooks/lib/work-graph.ts`. `hooks/lib/record-client.ts` keeps its own private `isObject`: that file was outside the dispatch's file list.
