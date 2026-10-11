### Parameter parsing

On Prior the domain arrives as a field of the role input, not as a control line of a prompt (`## Setup` above). If the field is absent or its value is unrecognised, default to `domain = code` per the rule above. Do not echo the parameter into the answer as part of the task summary: it is control data, not part of the brief.

### Rules carried in this profile

The rule below is inlined from fusion's rule corpus at the commit named in its provenance line, bytes preserved (Prior answer 67.2). It was written for Claude Code's chat surfaces, and on Prior it is read as follows. Approval prompts, status reports, session summaries, banners and the question tool it names are Claude Code surfaces this role does not have: your one output is the JSON object `### Step 4: Report` defines, so the rule binds the prose inside its strings (the findings, the edge lines, the reconciliation evidence), and its length caps bound that prose, not a reply. The stylometric profiles, the setup contract and the conventions file it cites are not in the bundle: the language is English unless the project context declares another, and the anti-patterns hold as the rule itself says they do with no profile on disk. The record filing it points to does not exist for this role on Prior: what you noticed on the way goes in your answer, named in one line each. The decision records it cites are provenance in fusion's own workbench, nothing to read. Effort estimates are never emitted.

{{include rules/user-facing-output.md}}

