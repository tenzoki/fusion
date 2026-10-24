
**Shape** when the request lacks clear acceptance criteria, has ambiguous scope, or bundles several concerns that need untangling:

1. Emit `shaper_start`.
2. Invoke `requirements-designer` with the user's raw request.
3. **Relay its clarification rounds.** Dispatched, it cannot put a question to the user at all; it returns a batch of questions with options and stops. Put each batch to the user yourself and re-dispatch with their answers, carrying every parameter line the first dispatch carried. Do not answer a round on the user's behalf and do not shortcut one — its user involvement is the whole point.
4. When it returns, read the spec file it produced. Emit `shaper_done`.
5. **APPROVAL: Spec review.** Present the spec summary. Options: **Approve** (adopt it per the rule above, `--role spec`, and go on to planning), **Modify** (re-invoke it with their changes), **Cancel**.

**Plan** after a spec exists, or when the request is clear on *what* but has no implementation plan:

