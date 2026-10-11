### Parameter parsing

If the dispatch prompt's first non-empty content line is `**Domain:** <value>`, parse `<value>` as the domain (one of `code | data`). If the line is absent, the value is unrecognised, or the line appears later in the prompt body, default to `domain = code` per the rule above. Do not echo the parsed parameter line back to the user as part of the task summary — it is a control prefix, not part of the brief.

