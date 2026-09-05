# A record citing another project's workbench record is reported dangling forever, and no citation form expresses it

---
The citation grammar resolves a record name by one lookup inside *this* workbench. A fusion
record that names a record held in a consuming project's workbench therefore dangles by
construction, and it will dangle at every future run: there is nothing on disk to find and no
form in the vocabulary that says "this one is somebody else's".
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

## The defect

`bin/fusion-citation-check` at `7be624e7` reports one violation row inside a file this session
wrote. The citing line is `260830-1801-orchestrator-session.md:26`, and the row reads
`dangling  no record anywhere in the workbench matches this citation`.

The line is correct prose. It names the consuming project's own record as the source of the
claims this session verified, and it says in the same sentence that the record sits in that
project's workbench. The token it names is fenced here because a bare copy of it would file a
second instance of this very defect:

```
260829-0932_*_which-half-of-the-citation-mechanism-is-fusions-and-which-stays-here.md
```

`find "$WORKBENCH" -name '<basename>'` is the resolution rule
(`rules/fusion-workbench-conventions.md` `## Filename Patterns`), and it can only ever answer
"no" here. The row is not a mistake the writer can correct by rewriting the citation: every
accepted form resolves against this workbench and only this workbench.

## Why it is not covered by what is already filed

Three adjacent records, and none of them reaches this shape.

- `260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md`
  (`_i_`) answers the mirror image: fusion's **shipped** text citing fusion's **own** records,
  read by an agent in a consumer. Its answer, provenance rather than pointer, was realised by
  making those lines say the record is fusion's own. That repair does not apply here, because
  the record named is genuinely not fusion's and the line already says so.
- `260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
  (`_o_`) covers a token that names **nothing at all** — a probe or test fixture. This token
  names something real, held elsewhere.
- `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`
  (`_c_`) is about a resolver key in shipped prompt text, not about a workbench record.

## Why it will recur

fusion now takes defect reports from consuming projects and repairs them
(`260830-1841_*_citation-mechanism-four-defect-repair.md` is the first worked instance). Every
such session has a source record in somebody else's workbench, and the honest way to record
where a claim came from is to name it. So the shape arrives once per cross-project session, and
the workaround available today, fencing the token, hides the pointer from the reader in order to
satisfy a checker.

## What an answer would have to decide

Whether a foreign record is expressible at all, and if so on what decidable property. Three
directions, none recommended here, because this record states the defect and stops:

1. A sixth exemption keyed on a syntactic marker the writer supplies (a project qualifier in
   front of the basename), so the token is read as deliberately foreign rather than as broken.
2. No form, and the convention says to fence such a token and name the project in prose. That is
   what happens today by accident; it would become the written rule, and the cost is that a
   reader cannot follow the pointer and no gate helps them.
3. Nothing, and the row is accepted as permanent noise in the `dangling` figure.

Direction 1 is the one that has to answer `rules/critical-stance.md` §4: "is this token foreign"
must be decided from the token's own text, not guessed from the fact that it failed to resolve.
A failed lookup is exactly the evidence a genuinely dangling citation produces, so resolution
failure cannot be the criterion.

## Acceptance

Either a citation form that names a record in another project's workbench and is judged as
something other than `dangling`, with the decidable property it keys on stated; or a written
decision that no such form exists, carried where a writer about to cite one will read it.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved.

The exemption chain in `hooks/lib/citation-scan.ts:890-913` runs seven reasons — `retired-layout-file`,
`fenced-code`, `blockquote`, `announced-illustration`, `footer-template`, `placeholder`,
`fabricated-name`, `glob` and `head-field` — and none of them expresses a foreign record. Resolution is
still one lookup against this workbench's own index, so a real record held elsewhere can only answer
"no". No decision record proposes a form.

The prediction the record made has held: the workaround it named, fencing the token and naming the
project in prose, is what every cross-project session has done since, including the two records filed
on 260831 from a consuming project's report, both of which fence the reporter's stamps for exactly
this reason.
