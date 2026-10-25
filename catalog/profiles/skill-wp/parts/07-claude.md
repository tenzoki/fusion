1. **Literal** — `/fusion:wp <title>` with an optional paragraph after the first line; a leading `idea:`, `idee:` or `backlog:` is stripped. The first line, or a short line derived from it, is the title, the rest the paragraph.
2. **Conversational reference** — `/fusion:wp this idea`, `das gehört ins Backlog`. Take the referenced content from the recent context, the user's own words in the paragraph.
3. **Empty** — ask via `AskUserQuestion` for the title and the paragraph. Do not guess.
