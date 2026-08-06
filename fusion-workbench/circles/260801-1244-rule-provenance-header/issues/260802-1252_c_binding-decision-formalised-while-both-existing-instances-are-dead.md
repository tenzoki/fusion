`Binding decision:` is now formally defined, and both pre-existing instances cite dead paths

---

**Severity: Medium.** The defect is pre-existing. This Circle made it load-bearing by
promoting `Binding decision:` from an undocumented habit to a defined mechanism.

**Evidence.**

The new section defines the mechanism, `rules/fusion-workbench-conventions.md:588`:

> **`Provenance:` is file-scoped; `Binding decision:` is section-scoped.** ... A `Binding
> decision:` line inside a section states which record binds *that section*.

Three instances now exist in the file (`grep -n 'Binding decision'`), in two mutually
inconsistent path shapes:

| Line | Citation | Resolves? |
|---|---|---|
| 328 | `decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` | **No.** The record exists, at `circles/260716-1847-workbench-umbau/decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`. The bare `decisions/` prefix is a pre-v4 root type-folder path and names nothing post-v4. |
| 592 | `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md` | **Yes.** Verified present. New in this Circle. |
| 688 | `decisions/260519-1100_a_circle-stash-pop-design.md` | **No.** `find fusion-workbench -name '*260519-1100*'` returns nothing. No file by that name exists anywhere in the workbench. |

Line 688 also uses a bullet form (`- Binding decision:`) where 328 and 592 use a bare
line.

**Why it matters now rather than before.** Before this Circle, `Binding decision:` was an
undocumented habit and a stale instance was ordinary rot. The new section makes it a named
mechanism, contrasted against `Provenance:`, in the plugin's own normative ground truth.
The file now teaches a citation form whose only two pre-existing examples a reader cannot
follow. Spec criterion 8 asked for the new note to be written "in the existing
section-scoped `Binding decision:` form"; it was written in a *corrected* form, which is
right, and which leaves the two originals visibly wrong by comparison.

The spec's accepted limitation "dead citations go uncaught" covers the `Provenance:`
header and the gate. It does not argue for leaving two known-dead section notes in place
in the file that defines the form.

**Fix.**

- `:328` — repoint to
  `circles/260716-1847-workbench-umbau/decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.
- `:688` — the record is gone. Either locate its successor and repoint, or replace the
  line with the honest admission the new section already licenses for headers. Do not
  invent a record; `:583` forbids exactly that.
- `:688` — normalise the bullet to the bare-line form used at `:328` and `:592`.

If `circles/260801-1244-curator` is close, this is squarely its remit (reconciling
normative surfaces against what actually happened) and is better done there than patched
here. Cross-referenced rather than refiled if the curator spec already covers it.

---
Resolved: 2026-08-06 (reconciler, workbench-wide pass) — both `Binding decision:` instances now cite resolvable paths in wildcard form: `rules/circle-records.md:36` → `circles/260716-1847-workbench-umbau/decisions/260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md` and `rules/rule-file-provenance.md:48` → `shared/decisions/260801-1020_*_provenance-header-on-rule-files.md`. Both targets exist (as `_i_`). Fixed by the Textschicht citation batches (`fae818b`) after the conventions partition (`0fead5e`); the citation form is D1 `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_i_zitierform-fuer-workbench-records.md`. This finding had been left open at this Circle's closure by explicit user decision; the fix arrived from the later Circle.
