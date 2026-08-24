# Circle records carry the same silent citation form, and a third of their citations are already stale

---
**Severity:** Low
**Domain:** code
**Filed by:** coder, session 260811-2105 (the measurement asked for by the portfolio-citation dispatch)
**Affects:** `rules/circle-records.md` `## Circle record template`, and the three agents that write into a Circle record — `shaper` (`## Grounding snapshot`), `orchestrator` (`## Turn log`, `## Closure note`, the two `**Active …:**` fields), `playmaker` (its three appended sections)
**Cross-references:** `shared/issues/260810-1730_*_die-erzeugung-von-portfolio-md-schreibt-den-zustandsmarker-aus-und-macht-jede-handkorrektur-zunichte.md` (the portfolio defect whose `speculation:` asked for this measurement, now closed); `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md` (the ratified wildcard form)

---

The portfolio record ended with a `speculation:` — that the Circle-record template is equally
silent on citation form, and that `shaper` and `orchestrator` write there too. It is silent.
The rest was measured on 260811-2105 against this workbench, and the measurement changes the
shape of the finding rather than confirming it.

## What was measured, and how

Twelve Circle records under `fusion-workbench/circles/*/*circle.md` (one `_a_`, ten `_c_`, one
`_s_`). Every `YYMMDD-HHMM_<letter>_<slug>.md` token in them was resolved against a basename
index of the whole workbench, excluding the frozen stores (`archive/`, `stashes/`,
`.migration-v2-backup/`). A token that did not resolve was retried with the marker position
wildcarded; a hit there means the record still exists and the citation names its old marker.

| Record state | Records | Literal citations | Already stale | Wildcarded |
|---|---|---|---|---|
| `_a_` | 1 | 8 | 3 | 4 |
| `_c_` | 10 | 34 | 5 | 34 |
| `_s_` | 1 | 18 | 13 | 0 |
| **total** | **12** | **60** | **21** | **38** |

Two further tokens resolve to nothing at all rather than to a moved marker: a fabricated `topic.md`
example inside a record, at the stamp `260716-1847`, and a `rag-sanitisation.md` reference from
another project, at the stamp `260430-1900`. Neither is this defect.

**21 of 60, thirty-five per cent, name a marker their target no longer carries.** The single
live (`_a_`) record — `circles/260801-1244-curator/_*_circle.md` — carries eight literal
citations, three of them stale, *and* four already in the wildcard form. The form is not
uniformly wrong; it is inconsistent inside one file, which is what a silent template produces.

## Why this is a different defect from the portfolio one, and weaker

The portfolio record's own reasoning holds: Circle records are **append-only**. Playmaker
appends three section kinds and rewrites nothing; shaper writes the Grounding snapshot;
the orchestrator appends Turn-log bullets and the Closure note. Nothing regenerates a Circle
record, so a hand correction there **does** hold — which is exactly what the portfolio's did
not. That removes the portfolio defect's sharpest edge: there is no mechanism here that undoes
the fix on the next run.

What remains is a slower leak with a large standing balance: a silent template, three writing
agents, 21 dead pointers already on disk, and no gate that reads them. The concentration is
telling — 13 of the 21 sit in the one superseded record, which cited thirteen open issues
during a Circle that was itself superseded while they were closed elsewhere. A record's
citations rot fastest exactly when its Circle is not the one being worked.

## The part that is a decision, not a sweep

Ten of the sixty literal citations are the values of the two header fields
`**Active spec/plan:**` and `**Active session history:**`. One is stale today. **These must
not be starred by a text sweep**, because unlike prose citations they are machine-read:

- `skills/circle-stash/SKILL.md:115` greps the field and `sed`s the value out, then uses it as
  a path.
- The orchestrator resumes an interrupted session from `**Active session history:**`.
- Playmaker renders the field into `portfolio.md`.

A `_*_` in those values needs glob expansion at every one of those three consumers, and
`skills/migrate/SKILL.md:97` already records that all three "degrade without announcing it"
when the value does not resolve. So the field case is a decision about resolution, not a
citation-form correction. (A session-history path carries no marker at all, so only the
spec/plan field is affected in practice.)

The other fifty are prose — `## Grounding snapshot`, `## Dependencies`, `## Turn log`,
`## Closure note`, and playmaker's appended sections. Nothing parses those, so the wildcard
form is free there in exactly the way it is free in the portfolio.

## What a fix would look like

Not done here, on instruction — the dispatch that produced this measurement was scoped to the
portfolio and asked for a report rather than a widening.

1. **The template speaks.** `rules/circle-records.md` `## Circle record template` gains the
   same one-paragraph rule the portfolio template just gained, minus the regeneration
   argument (which does not apply) and plus the field exception. The pointer-versus-naming
   distinction transfers unchanged.
2. **The two fields are decided separately**, as a decision record: either the consumers learn
   to glob, or the fields stay literal and are accepted as a maintained value like a symlink.
3. **The 21 standing stale citations** are a sweep, worth doing only after (1), or they come
   back. The 13 in the superseded record are arguably history and may be left as written —
   that is part of the same decision.
4. **A gate is possible but is not the portfolio's gate.** The portfolio one
   (`hooks/lib/__tests__/portfolio-citation-form-lint.test.ts`) reads a *prompt*; the citations
   here live in *workbench records*, which no lint reads and which are a consuming project's
   data, not the plugin's. What could be gated in the plugin is the template's silence — that
   the record template names the citation form at all.

## Why in the shared store

No Circle is active, and the finding is about the record format itself rather than about the
subject of any Circle.

Also seen: 260817-1613 by reconciler — two live instances in `circles/260816-1741-guard-becomes-observation-only/_*_circle.md`, both due before that Circle's `_t_` → terminal transition makes them permanent: at `:7` the `**Active spec/plan:**` field names that Circle's own plan with a `_p_` marker while the plan is `_c_`, which is the silently-degrading pointer field this record names; at `:167` a citation names one of the Circle's decision records with an `_o_` marker while that record is `_i_`. Open the two lines for the exact citations. Both were written in the literal-marker form; the same file's other five citations use the ratified `_*_` wildcard and all resolve.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/circle-records.md` `## Circle record template` still carries no citation-form rule; the wildcard convention exists only for the portfolio template. A reconciler addendum on the record dated 260817-1613 found two further live stale citations. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — the record template names the wildcard citation form for every prose section once, beside the head-field rule that already existed; the 21 standing stale citations are not swept here; rules/circle-records.md:165
