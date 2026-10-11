
**Compute the three edges.** One line each, with cited evidence.

- **Artefact↔Evidence base edge** — already implicit in the `code`/`data` protocol output (claims-vs-disk + reviewer-issues count). Restate as one line: `<N> claims verified / <M> drift items / <K> open reviewer issues`. When flagged, the line names the vertex at fault, because the edge alone does not: `(artefact at fault)` when the work disagrees with a true evidence base, `(evidence base at fault)` when the evidence base states something disk contradicts.
- **Artefact↔Brief edge** — take the brief from your dispatch prompt (Setup step 6) and read the active plan's `## Directive` (or active spec's equivalent). Walk the commits from `git log <session-start-HEAD>..HEAD` and produce one prose line: `commits move toward / partially toward / orthogonal to / away from the stated brief`. Cite the commit hashes that motivated the judgement.
- **Evidence base↔Brief edge** — for each