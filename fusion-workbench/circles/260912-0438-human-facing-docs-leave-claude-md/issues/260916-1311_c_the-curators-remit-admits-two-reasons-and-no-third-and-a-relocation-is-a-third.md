The curator's Remit admits two reasons and no third, and a relocation is a third

---
`agents/curator.md` `## Remit` (lines 28-33) is the section that decides what the agent may propose
at all:

> **You change a normative statement for exactly two reasons**, and no third:
> - **Cross-surface contradiction** …
> - **History-grounded obsolescence** …
>
> Anything else that could be said about those files — that it reads long, that it duplicates a
> neighbour, that its session is over — belongs to somebody else.

`4c41d693` added relocation as a change type without touching that section. A relocation is neither
of the two reasons, and the prompt says so itself at `agents/curator.md:92`: *"Judging that a passage
is bound to a topic is a reading of the current text"*, and at line 319: *"a relocation makes no
claim about truth … what is being judged is where it belongs."* A placement judgement is the class
`## Remit` sends to somebody else in as many words.

So a curator reading its own prompt end to end meets an explicit prohibition and an implicit
permission, and nothing decides between them. `rules/critical-stance.md` §4 is the standard the
prompt is measured against here: the case split is neither disjoint nor complete once a third reason
exists and the section still says two.

Second half of the same gap: **nothing triggers a relocation proposal.** `### Pass 1 — survey`
(line 175) says to *"assign a tier and a citation per candidate change"*, and a relocation has no
tier by line 319. `## Dispatch parameters` (line 258) carries three lines and none selects placement
work. The run file's fourth section (line 287) is *"written only on a run that proposes a
relocation"*, which presupposes an answer the prompt never gives. A curator dispatched by
`/fusion:curate` with no further instruction has no way to know whether this run is one that
classifies placement.

**Acceptance test:** `agents/curator.md` `## Remit` states the reason a relocation rests on, or the
prompt states elsewhere that relocation is outside the two-reason rule and why; and a reader with
only the prompt can say, for a given dispatch, whether that run proposes relocations.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1157_*_nothing-tells-the-curator-where-the-placement-criterion-is-authored.md` (the criterion's reachability, a different gap in the same change), `260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md`.

---
Resolved: `agents/curator.md` `## Remit` now scopes its two-reason rule to *what a statement says*
and carries a new subsection, `### Moving a statement is not changing what it says`, naming the
second question the agent asks of the same three files — where a still-true statement belongs, and
how it is said. That subsection covers **both** changes that rest on a reading of the current text,
the consolidation and the relocation, which is the correction upstream of this record: a
consolidation was already authorised by `### Never permitted` while `## Remit` sent "it duplicates a
neighbour" to somebody else, so the Remit was already narrower than the prompt's own set of change
types before `4c41d693` made the gap visible. The sentence that sent those judgements away is
replaced rather than amended, because it contradicted the clause it sat above.

Disjointness is stated as a property of what an entry *claims* — a tiered entry claims the text is
wrong where it stands, a consolidation or relocation claims nothing about truth — with the overlap
case named: a passage that is both wrong and misplaced is two entries, not one of a third kind
(`rules/critical-stance.md` §4).

The second half, the trigger: `## Dispatch parameters` gains `**Placement:**` (`on` | `off`,
defaulting to `off`), on the same principle the section already states for `**Mode:**` — the pass
that takes bytes out of a surface is the one that has to be asked for. A reader with only the prompt
can now answer "does this run propose relocations" by reading one line, and the answer for
`/fusion:curate` is no, because that body passes no such line on either dispatch. The run file's
placement-classification section is keyed to the same parameter. `README-agents.md` `## Dispatch
parameters`, which the prompt names as the roster's authoring home, carries the matching row.

Deliberately NOT decided here: where the placement criterion is authored, which is
`260916-1157_*_nothing-tells-the-curator-where-the-placement-criterion-is-authored.md` and needs a
ruling. An opt-in trigger was chosen partly because it leaves that question exactly where it stood.
