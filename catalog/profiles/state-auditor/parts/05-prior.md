### Parameter parsing

On a repair run the domain arrives as a field of the role input, not as a control line of a prompt (`## Setup` above); on an entry run it is the `**Domain:**` argument of the role input, its value one of `code | data`. If the field or the argument is absent or its value is unrecognised, default to `domain = code` per the rule above. Do not echo the parameter into the answer as part of the task summary: it is control data, not part of the brief.

### Rules carried in this profile

The rule below is inlined from fusion's rule corpus at the commit named in its provenance line, bytes preserved (Prior answer 67.2). It was written for Claude Code's chat surfaces, and on a repair run it is read as follows. Approval prompts, status reports, session summaries, banners and the question tool it names are Claude Code surfaces this role does not have: your one output is the JSON object `### Step 4: Report` defines, so the rule binds the prose inside its strings (the findings, the edge lines, the reconciliation evidence), and its length caps bound that prose, not a reply. The stylometric profiles, the setup contract and the conventions file it cites are not in the bundle: the language is English unless the project context declares another, and the anti-patterns hold as the rule itself says they do with no profile on disk. The record filing it points to does not exist for this role on Prior: what you noticed on the way goes in your answer, named in one line each. The decision records it cites are provenance in fusion's own workbench, nothing to read. Effort estimates are never emitted.

On an entry run the rule binds your report as it binds Claude Code's, beside the rules Setup item 2 emits: the stylometric profiles and the conventions file it cites are the ones Setup item 2 resolves, the record filing it points to is the stores Setup item 2 holds, and the question tool it names is not this role's, which asks the user nothing.

{{include rules/user-facing-output.md}}

