# Does request 77 supersede request 76, or amend it?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md`; `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md` (`## Where this work stops`); `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`; `foreign:F09-Prior:261027-1519-fusion-request76-reading.md`; `foreign:F09-Prior:261024-0900-does-repair-move-onto-the-general-entry-model.md`

---

## Question

Request 76 (fusion `cd4970b5`) hands over bundle 13.4.0 (`sha256:90961e04…`) and asks Prior for a verdict on 76.1 to 76.4, each of H1 to H9, the six carry items, six decisions and nineteen questions. Fusion 13.4.1 replaces the bundle and the proposed entry assets, and under the user's ruling on repair (cross-referenced above, option 3 as stated) it also stops serving `fusion.repair.v1`, which Prior qualified at request 70. Request 76's own rule says a correction is "a new candidate under 13.4.1, a rebuild and a new digest, put to Prior in a new request; never an edit of this section". Prior has not answered 76 yet. Its analysis `261027-1519` read 76 and found every row met or deliberately different, except condition (b). The relation between 77 and 76 decides what request 77 restates, what Prior answers, and what the `#### Requests …, as they stand` table records, so it has to be settled before step 10 of the plan is written.

Revised on 2026-10-27 at the plan review, before any answer: request 77 now also announces repair's removal. That widens the list of what 77 replaces and adds questions about repair. The relation between the two requests does not change.

## Options

1. **77 amends 76.** 77 replaces these parts of 76: the bundle and its identity items (76.1 to 76.4, `### The bundle`); the entry assets and the service list (`### Host services required`, the H6 and H7 rows, 76.2's asset names); every statement that the bundle serves or carries repair (76.2's "explorer and repair workflows resolve as at 70", the "6 repair cases" of the conformance table, the H3 row's repair text beside the entry branch, H7's "beside the explorer and repair"); decision 3 (D5) as far as it keeps the repair schemas in three profiles; and decision 5 (`261024-2111`), which repair's removal makes moot. 77 states fusion's adoption of ruling `261024-0807` with the questions it opens. It announces that fusion withdraws repair, asks Prior to revisit `261024-0900` on its side, and asks what Prior needs (the 13.1.0 bundle's status and old-run readability, the request-69 services fusion no longer calls, the request-70 qualification). Every other part of 76 stands as written: H1, H2, H4, H5, H8 and H9, the carry items, the B2 ruling, decisions 1, 2, 4 and 6, and questions 1 to 19 except where 77 restates one. Prior answers 76 and 77 in one response that names the 13.4.1 digest. The state table records 76 as "asked, its bundle, entry assets and repair statements replaced by 77".
   - Pros: Prior's reading of 76 stays valid for every row that did not move. 77 carries only the delta, which is what Prior's analysis asks for ("a diff limited to the corrections"). Shipped `prior` parts keep citing "(request 76, question N)", whose numbers do not change.
   - Cons: the answer has to reconcile two sections, so 77 must list exactly which parts of 76 it replaces.
2. **77 supersedes 76 whole and restates everything.**
   - Pros: one self-contained section to answer.
   - Cons: about 230 lines are repeated, and every "(request 76, question N)" citation in the shipped `prior` parts would point at a superseded section, or would have to move in the same release.
3. **Withdraw 76 and treat 77 as the first hand-over.**
   - Pros: none beyond option 2.
   - Cons: it discards a request Prior has already read row by row, against fusion's rule that no line of the file is edited.

## Constraints

- `codec/fixtures/prior/REQUESTS.md` is append-only, and no line above a new section is edited.
- Only an answer naming the delivered digest closes a request. 76's own `### What fusion does with the answer` says an answer naming another digest does not close 76.
- Revising Prior's ruling `261024-0900` is Prior's user's act. 77 asks for it and records nothing on Prior's behalf.

## Recommendation

Option 1, with request 77 stating that an answer naming `sha256:90961e04…` closes neither request.
