1. **Literal capture** — e.g. an argument `this: <pasted text>`, `task: <todo>`, or `<topic>\n<content>`. Capture the content verbatim; do not rewrite.
2. **Conversational reference** — does not exist on Prior: an entry run has no conversation, so an argument such as `the open tasks` names no content of its own. Treat it as mode 1 when the argument carries the content, else as mode 3.
3. **Empty** — the entry with no argument. Ask with one `host.question.v1` call: note or task, what topic, and what should be captured? Do not guess.
