The help update topic at 13.2.0 tells an install older than 13.0.0 that `fusion --update` is the whole update
---
13.2.0 dropped the 12.2.3 paragraph. The paragraph now on top, "Coming from 13.1.12 or earlier: 13.2.0 needs no migration; `fusion --update` is the whole update", also matches a 12.x install, and for that install the sentence is false.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Scope: `skills/help/SKILL.md` `### 4. Update`.

**Evidence.**

- `ec76d4fd` removed "**Coming from a 12.2.3 install:** 13.0.0 moves every record's state …", the one paragraph that told a v12 install it must migrate. It added "**Coming from 13.1.12 or earlier:** 13.2.0 needs no migration; `fusion --update` is the whole update."
- The label "13.1.12 or earlier" has no lower bound. A 12.2.3 install falls under it, and only the last line, "**Older than that:**", sends the reader to `docs/`. That line is below a paragraph that already answered "no migration".
- Dropping the oldest paragraph is the topic's rule (`README-agents.md` `## Releasing`, step 0, and `261015-1559-does-the-help-update-topic-at-13-1-3-drop-the-v13-migration-paragraph-or-fold-the-patch-into-the-13-1-2-paragraph.md`). The defect is the open lower bound on the labels, which the rule's own wording ("labelled by the install a reader is coming from") does not require. The "13.1.11 or earlier" label has the same open bound. It did no harm while the 12.2.3 paragraph stood below it.

**Fix direction.** Give each label a lower bound, for example "Coming from 13.0.0 to 13.1.12". Then "Older than that" catches every pre-13 install. Or have "Older than that" name v12 explicitly as needing `/fusion:migrate`. Either is a cut or a re-wording under the `skills/` byte ceiling.

**Acceptance test.** A reader on 12.2.3 who takes the first paragraph whose label matches their install reaches the migration requirement. `cd hooks && npm test` is green, `surface-growth-bound.test.ts` and the reference-resolution pin included.
