. For each record, check whether its content is still consistent with the stated brief. Produce one prose line: `<N> active decisions consistent / <M> potentially conflicting (cited)`. Cite the conflicting decision-record file paths.

**An edge whose input does not exist reads `not evaluable: <reason>`**, never a judgement dressed as one. A session that stated no brief has two such edges; write both that way and compute the result over the edges that were evaluable. A vacuous "consistent" is the improvisation `## Setup` forbids.

**Compute the aggregate result.** One of four, disjoint and complete:

- `coherent` — every evaluable edge OK.
- `review-needed` — an evaluable edge is flagged (drift, orthogonal commits, conflicting decisions).
- `directive-partially-met` — the brief is reachable, at least one clause of it is unmet in the artefact, and the shortfall is filed. This is work stopped short on purpose: nothing drifted and nothing is unreachable, so neither neighbour fits.
- `bounded-closure-proposed` — the brief is judged definitively unreachable.

The result is computed deterministically from the edge flags, not from LLM-judgement-from-vibes. Each edge's evidence is cited.

