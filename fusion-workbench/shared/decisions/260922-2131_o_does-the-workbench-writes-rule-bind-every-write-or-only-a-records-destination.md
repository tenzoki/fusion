# Does the workbench-writes rule bind every write an agent makes, or only where its records go?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260922-1859-curator-run.md` (the survey that raised this as candidate `C02`, with the measurement behind it); `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md` (the partition of what every dispatch carries, which is the class this bullet sits in)

---

## Question

`CLAUDE.md` `## Conventions` carries this bullet:

```
- **Workbench writes**: agents write only to `fusion-workbench/`. Sub-agents share no memory; everything persists through workbench files.
```

Read as an absolute, the first clause is false for four of the eleven agents. `agents/coder.md` owns `.go`, `.rs`, `.ts`, `.tsx`, `.py`, `.js`, `.java` and the build manifests; `agents/ontocoder.md` owns structured data wherever it sits; `agents/editor.md` writes customer deliverables project-side; `agents/curator.md` writes `CLAUDE.md` and the project's own `./rules/`. The last of those is not merely permitted but required elsewhere: `rules/rule-file-provenance.md` `## Provenance headers on rule files` reads "An agent that creates a rule file gives it a header in the same edit" and "This obligation falls first on the curator". An agent obeying the bullet as an absolute would never write a rule file, and a rule file tells it to.

Read narrowly, the bullet is about where an agent's **durable record of its work** goes, and on that reading nothing in it is false: the coder's code, the ontocoder's data, the editor's deliverable and the curator's normative text are the work itself, not an account of it, and every account still lands in `fusion-workbench/`. The bullet's own second sentence supports that reading, because sharing no memory and persisting through workbench files is a statement about state rather than about file writes in general.

The text does not say which was meant, and this record does not try to recover it. What forces the question now is that the first reading is the one a reader unfamiliar with the sentence's history takes, and the bullet is charged to every dispatch, so whichever reading is right is being carried eleven times per session.

This is filed as its own record rather than fixed in a text pass because the bullet is a prohibition. A curator pass may correct what a measurement falsifies; loosening a "do not do X" rule needs a ruling, and this record is where it goes.

## Options

1. **Make the narrow reading explicit.** The bullet becomes "agents write their records only to `fusion-workbench/`", with the second sentence unchanged.
   - Pros: keeps what is load-bearing, that no agent opens a record store of its own outside the workbench, and drops a clause that is false as written; the shortest form that survives the measurement.
   - Cons: it is a reconstruction of intent, not a recovery of it. If the absolute was meant, this ratifies four violations instead of reporting them.
2. **Keep the absolute and name the exceptions.** The bullet keeps its first clause and gains the four agents that write project-side, each with what it owns.
   - Pros: nothing is loosened; a reader gets the true picture in one place.
   - Cons: it duplicates four routing statements that `CLAUDE.md` already points at, in a file charged to every dispatch at zero head-room; and an exception list is a surface that goes stale the next time an agent's ownership moves.
3. **Leave the bullet as it stands.**
   - Pros: no ruling is made on a sentence whose intent nobody has recovered.
   - Cons: the contradiction with the provenance obligation stays live, and every survey reports it again.

## Constraints

- Whatever is chosen keeps the property the bullet exists for: no agent writes a record store of its own outside `fusion-workbench/`, and no stray artifact store appears beside one.
- Whatever is chosen keeps the second sentence. Sub-agents sharing no memory, and everything persisting through workbench files, is true on every reading and is the part later prompts rely on.
- `CLAUDE.md` is charged to all eleven dispatch paths at zero head-room, so an option that adds bytes there has to say what comes out.
- The edit, once ruled, goes through the curator: it is the one path to `CLAUDE.md`.

## Recommendation

Option 1, on two grounds the filing party can point at rather than infer. The bullet's second sentence is about state, which is the narrow reading's subject and not the absolute's; and the four project-side writers are not incidental but constitutive, since three of them exist for no other purpose, so an absolute that excludes them would never have been true of this system at any point in its history. Option 2 is the honest choice if the absolute is what was meant, and the user is the only party who can say.
