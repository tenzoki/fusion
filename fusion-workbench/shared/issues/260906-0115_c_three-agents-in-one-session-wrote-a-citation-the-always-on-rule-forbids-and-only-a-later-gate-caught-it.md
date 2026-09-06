Three agents in one session wrote a citation the always-on rule forbids, and only a later gate caught it

---
The citation form is mandated in `rules/fusion-workbench-conventions.md`, which `bin/fusion-rules`
emits to every agent on every dispatch. In one session three different agents violated it in
three freshly written records. Each was caught by a release gate minutes to hours later, after
the record had been written and in one case committed, never at the moment of writing.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**The three, all on 2026-09-05 in session `260905-2008-orchestrator-session.md`.**

| writer | record | what it wrote | caught by |
|---|---|---|---|
| coder | `260905-2110-coder-the-pins-entry-chain-recovers-its-three-breaks.md` | the state marker spelled out instead of wildcarded | the sweep, before its commit |
| orchestrator | `260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md` | a store-prefixed path into another project's workbench | the citation gate, one commit after it landed |
| analyst | `260906-0026-what-shared-state-the-hook-suite-reaches.md` | five store-prefixed paths in its Sources section | the sweep, while the suite was red for it |

The middle one left the release gate red at `cd623b6f` and was repaired at `4db7dddb`. The last
one left it red for every agent in the checkout until repaired by hand.

**Severity is in the second-order cost, not the repair.** Each repair is seconds. What each cost
was a diagnosis: a red suite that has to be attributed before it can be acted on, twice while
this session was also chasing an unrelated intermittent failure. One of those diagnoses produced
a wrong hypothesis that survived two messages.

**This is the second rule in this session measured to be loaded and missed.**
`260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`
found the same shape for the `**Filed by:**` field: mandated in the same always-on file, missed
in 6 of 99 September records, including one written by this session. Its repair was a header
template, and the coder who wrote that template said in the same report that it would not close
the gap alone, because the field was already mandated in a file every dispatch loads. This record
is the evidence for that judgement, from a different rule in the same file.

**What this record does not claim.** It does not claim the rule is unclear; it is stated with
worked cases and a closing paragraph on the pointer-versus-statement distinction. It does not
claim these agents were careless. Three writers with the text in context violating it in one
session is a property of where the rule sits relative to the act, not of who read it.

**Acceptance.** A citation that violates the form is reported to the writer at the moment the
record is written, not at the next gate run. `hooks/tracker.ts` already speaks to the model on a
narrow PostToolUse trigger when a review file lands, so the mechanism exists and the trigger is
the question: a record file landing in a workbench store is the analogous moment. Failing that,
the record states why write-time detection was rejected and what a session should do instead.

Closing this on "the three instances are repaired" is not acceptance. All three are repaired
already, and the next session will produce the fourth.

**Cross-references:**
`260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`
(the same shape, a different rule in the same file);
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
(undecidable as posed, and its diagnosis also ends at moving the check to write time).

---
Resolved: b462d55d — the check runs at the write. A `.md` file landing under the workbench outside the frozen stores is scanned, and the hits are filtered to the lines that call actually wrote, so a writer is told about its own text and not about the corpus. It follows the review-file trigger already in the tracker rather than inventing a shape, and it calls the existing grammar instead of adding a second detector. Deliberately wider than the release gate own corpus, because two of this record three instances were a history file and an analysis, which that corpus excludes. The real instance was replayed: the orchestrator record as it stood at cd623b6f produces one violation at the right line with the correct spelling offered. Measured cost on the commonest path: of 1863 workbench records, 17 would report anything at all.
Not covered, and each is a decision rather than an omission. Only store-prefixed and stale-marker are reported; dangling is excluded wholesale, because a failed lookup is what a dead pointer, a probe fixture in prose, an unqualified foreign record and a record about to be written all produce alike, and reporting it would make the check noise on precisely the records that discuss citation form. The fabricated-name record case is therefore not reached: a fixture in prose is silent here, but silent because its class is excluded and not because anything can tell a fixture from a dead pointer. A token carrying an exemption reason is not reported either, following the sweep rather than the gate, so such a token still reaches the release gate unannounced. And the report sentence carries a fusion record identifier into a consuming project session, filed as 260906-0322_*_the-write-time-citation-sentence-carries-a-fusion-record-identifier-into-a-consuming-projects-session.md rather than left in the module header.

---
Reconciled 260906-0335 (reconciler, HEAD `b462d55d`): the closure holds, and both figures in the note
were re-taken rather than trusted.

**The 17-of-1863 measurement reproduces exactly.** Re-run over this tree by calling
`workbenchRecordPath`, `writtenLines` and `measureCitationForm` from the committed build over every
`.md` under the workbench, as a whole-file `Write`: **1865 considered, 17 reportable, 41 rows.** The
denominator is two higher than the note's because two records were filed since; the numerator is
identical. So the note's "on the commonest path it reports nothing" is a measured claim and it holds.

**One property of that 17 the note does not state and a reader should have.** All 41 rows are
`stale-marker` and none is `store-prefixed`, and 16 of the 17 files are history, analysis and review
files whose citations went stale when the cited record's marker later moved. Under the real trigger
those 16 are quieter still, because the report is scoped to the lines the call wrote: appending to an
old history file says nothing about a violation on a line somebody else wrote years-of-commits ago.
The figure is therefore a ceiling on the firing rate, not the rate.

**The replay reproduces exactly.** The orchestrator record as it stood at `cd623b6f`, put through the
same path, returns **one** violation, at line 18, `store-prefixed`, offering the store segment
stripped from the foreign project's reconciliation file as the storeless spelling — named that way
rather than spelled, because spelling it is the very fault the replayed record was repaired for. The
note's claim is precise.

**Verified against the acceptance, which asked for the moment to move and not for the three instances
to be repaired.** It cannot fail a tool call: it runs in `PostToolUse`, each of the three measurements
is wrapped in `bestEffort`, and `main`'s catch calls `respond()` before it reports. It rewrites
nothing — the only writes are its throttle record under `.guard-state/` and one `citation_form` event
row. And it stands down nowhere: the trigger is anchored at the workbench root, which in this
repository is fusion's own, so the measurement was taken where the defect was.

**Cost, measured because nothing else states it.** On a workbench `.md` write the scanner builds a
recursive index of the whole workbench; over this tree (2553 files) the whole measurement takes 30-46
ms in a warm process, and the hook is a fresh process per tool call, so the index is rebuilt each
time. Modest, stated rather than assumed, and it scales with the consuming project's workbench.

`bin/fusion-citation-check` at HEAD reads `files=2553 dangling=301 edited-violations=0
unedited-violations=696 verdict=clean`, which is the `edited-violations=0` the module header cites as
its second qualifying test.
