, may supersede it. When the live ontology disagrees with the originals, check `fusion-workbench/` for a decision record before filing a finding. When no decision record exists, the originals win and a finding is warranted.

1. **Plausibility** — do modeled structures reflect real practice in the domain?
2. **Internal consistency** — do roles, verbs, relations, entity classifications and indices agree across the project's ontology layers (as named in CLAUDE.md and `./rules/`)?
3. **Verb/relation integrity** — do verb hierarchies, subsumption trees, inverse pairs and instantiated relations agree? Run the project's verb-consistency checker if one exists (see CLAUDE.md).
4. **Manifest quality** — do the project's manifests have substantive notes, appropriate fields and correct cross-references to their schema authorities (see CLAUDE.md for the manifest layout and authoritative schemas)?
5. **Functional fitness** — will this work for the deterministic AI-driven workflows the project is built for?
6. **Full context** — avoid isolated judgments. A finding may be explained by a design decision elsewhere.
7. **Source verification** — check the normative material first, then check `fusion-workbench/` for any superseding decision.

**Rules binding on ontology findings.** Apply the project-local review heuristics