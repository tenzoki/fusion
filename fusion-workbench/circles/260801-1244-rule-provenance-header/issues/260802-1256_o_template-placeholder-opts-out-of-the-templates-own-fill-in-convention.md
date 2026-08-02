The template's provenance placeholder opts out of the template's own fill-in convention

---

**Severity: Low.** The added sentence documents a hazard instead of removing it, and the
fix costs one line.

**Evidence.** `templates/investigator-capture-layout.md:1-11` after this Circle:

```markdown
# Investigator Capture Layout — TEMPLATE

**Provenance:** replace this line with the record, Circle, or commit that motivated your project's capture layout.

> **Copy this file** to `./rules/investigator-capture-layout.md` in your project, then fill in every `<bracketed placeholder>` and remove the parts that don't apply. ...
>
> The `Provenance:` line above is yours to replace as well. It carries no angle brackets, so it is easy to read past.
```

The file's own instruction is "fill in every `<bracketed placeholder>`". The new
provenance line is the one placeholder in the file that is not a bracketed placeholder, so
the instruction does not reach it, and the second added sentence exists only to patch that
gap. Its wording states the defect as a property: "it is easy to read past" describes what
a copier will do with it.

Consequence in a consuming project: an unreplaced placeholder becomes a hollow header on a
real rule file, in `./rules/`, where no gate reaches (`rules/fusion-workbench-conventions.md:586`).
The spec accepts hollow headers as a limitation caught by review; shipping a template that
predisposes toward one is a different thing from accepting the residual.

**Fix.** Bring the line into the convention the file already states, and delete the patch:

```markdown
**Provenance:** <the record, Circle, or commit that motivated your project's capture layout>
```

Then remove the second added sentence and its `>` separator line at `:7-8`. The lede's
existing "fill in every `<bracketed placeholder>`" covers it, and a copier sweeping for
angle brackets finds it.

**Cross-reference, not a defect.** `templates/` is outside the gate's file set
(`gatedFiles()` reads `rules/` only), which is correct: a template is not a rule file, and
its header is an instruction rather than a citation. Nothing here argues for widening the
gate.
