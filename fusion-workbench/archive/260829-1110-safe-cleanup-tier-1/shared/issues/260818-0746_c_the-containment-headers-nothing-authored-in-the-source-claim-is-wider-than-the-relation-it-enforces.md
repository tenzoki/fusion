The containment header's "nothing authored in the source" claim is wider than the relation it enforces

---

`hooks/lib/__tests__/sentence-identifier-containment.test.ts:14` states the invariant as:

> Nothing authored in the source may contribute an identifier.

The relation actually enforced is narrower. `supplied()` at `:76` draws the permitted set from the
whole report, `identifiers(JSON.stringify(input))`, and a `StagingReport` carries fusion-authored
prose in its own fields. `hooks/lib/staging-drift.ts:181-193`, `:219-220` and `:400-437` are all
hand-written `why` literals that travel inside the input:

```ts
{ path: ".session-marker", why: "the orchestrator heartbeat — mtime is the signal" },
…
why: "a stash snapshot left by the removed stash skills — not a record this session authored",
```

An identifier authored into one of those would be "supplied by the input" by construction, and a
`parts.push` that emitted `r.why` would ship it to a consuming project with the gate green. The same
holds for `StagingReport.why` (`lib/staging-drift.ts:473`, `:483`) and for `CoverageReport.why`.

---

## Status: latent, not live

I grepped both modules for a `YYMMDD-HHMM` stamp or a 7-40 character hex token inside any string
literal that reaches a report field. **There is none.** Neither builder emits a `why` field today —
`coverageSentence` (`lib/review-coverage.ts:673-700`) reads `since`, `head`, `uncovered`, `carried`
and `carriedFrom`; `stagingSentence` (`lib/staging-drift.ts:621-663`) reads `faults[].path`,
`.code` and `.klass`. Every one of those is derived from the consuming project. So the gate is
correct over the code as it stands, and this record is about what the header promises a future reader,
not about a defect in behaviour at HEAD.

It matters because the header is the file's contract with whoever adds the next `parts.push`. Someone
who reads `:14` and then writes `parts.push(r.why)` has been told the gate covers them, and it does
not.

## Suggested fix

Do **not** narrow `supplied()` to an allowlist of project-derived fields — a per-field allowlist is
the maintenance burden the containment design exists to avoid, and it would have to be extended on the
day a field is added, which is the failure this gate was built against.

Fix the sentence instead. One clause at `:14`, and one line in the `WHAT IT DOES NOT COVER` list at
`:25-33`: the relation is `identifiers(builder(report)) ⊆ identifiers(report)`, so an identifier
authored into a REPORT field rather than into the builder is contained by construction; no report
field carries one today, and a builder that begins emitting `why` would need that checked by hand.

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review `260818-0748-coderev-turn-1-range-1dc062d-33645a2.md` (range `1dc062d..33645a2`)
**Cross-references:** `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` finding 5 and `## Residual: what still gets through`

---
Resolved: the sentence was corrected, the relation was not touched. The header now states what the
relation actually catches — an identifier a BUILDER authors, which is how the incident happened —
and states plainly that an identifier authored into a REPORT FIELD is contained by construction and
passes, naming `StagingRow.why`, `StagingReport.why` and `CoverageReport.why` as the fusion-authored
prose that travels inside the input. The latency is stated where the claim is made: no `why` literal
in either module carries a stamp or a hash today and neither builder emits a `why` field, so a
builder that starts emitting one needs its literals read by hand. The rejected fix is recorded in the
same paragraph, so the next reader learns why `supplied()` is not narrowed: a per-field allowlist
would have to be extended on the day a field is added, which is the failure the gate exists to
survive. The `WHAT IT DOES NOT COVER` list carries the same residual in one clause.

`hooks/lib/staging-drift.ts` and `hooks/lib/review-coverage.ts` were read and not edited. No
assertion changed; the file's 19 cases are the 12 that stood plus the 7 this Turn added for
`260818-0745_*_the-registry-completeness-parse-misses-an-aliased-and-a-namespace-import-so-a-named-builder-still-escapes.md`, and none of them was affected by this correction.
