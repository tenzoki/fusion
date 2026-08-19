The v10.2 migration note still states the `Status:` position with the qualifier the rule just dropped

---

`docs/upgrading-to-v10-2.md`, third of its "Three ways forward":

> the shipped guidance is likewise to leave a record you are not transitioning exactly as it stands.

`rules/fusion-workbench-conventions.md` dropped that qualifier in this session. The position is now
unconditional and names the transition case explicitly: leave the field exactly as it stands,
including when you transition the record, because the drifted headers are the evidence the removal
was decided on. The reason for the change is that the excluded case was the only one an agent ever
meets, so the rule as qualified said nothing about the situation it was written for
(`shared/issues/260819-0041_c_the-status-position-carves-an-exception-for-a-record-you-are-transitioning-and-never-says-what-it-is.md`).

---

The note is not wrong about the past and is not urgent. It describes guidance as it stood at v10.2.0,
which is a released version, and it is a migration document rather than a rule — a reader follows it
once, on the way to a version, and does not return. Rewriting a shipped migration note to match a
rule that changed after it is arguably the wrong move on its own.

What makes it worth a record is that a reader who reaches it *from* the rule will read two shipped
sentences stating the same position with opposite scopes, and nothing marks which one is current.
Two candidate resolutions:

1. Leave the sentence and add a dated clause saying the qualifier was dropped after v10.2.0, with the
   pointer. Keeps the note true about its own version and closes the contradiction for a reader
   arriving from the rule.
2. Leave it entirely, and rely on the note being version-scoped by its filename. Cheapest, and
   defensible for a document nobody re-reads; costs nothing until someone does.

Found by the executor of task U3 in session `260818-2301`, outside its file set, and reported rather
than acted on. No Circle active, so it is filed in the shared store under the Origin Rule.

---
Resolved: option 1. `docs/upgrading-to-v10-2.md:88` keeps its sentence and gains a dated clause — the qualifier was dropped after v10.2.0, the position is now unconditional because transitioning a record is the only case an agent ever meets, and the current wording sits in `agents/orchestrator.md` for the Circle record and `rules/fusion-workbench-conventions.md` `## Decision Record Template` for the decision record. The note stays true about the version it documents, and a reader arriving from the rule no longer meets two shipped sentences with opposite scopes.
