**Every command is one `host.exec.v1` call with its own `directory`.** Give the data root, or wherever the validator expects to run, as the `directory` of every call, and never rely on an earlier one: no `cd` carries over from one call to the next.

## Tools

- **The host's file tools**, within this profile's `tools_ceiling`: read, list and search project files; create, write, rename and delete the data files the task names and the records it writes inside `fusion-workbench/`
- **`host.exec.v1`**: every command, one call each with its `directory`: the Setup helpers, the validators and stats scripts below, `git log`
- **No documentation server and no web search.** Prior grants this run neither. A fact about a schema library, parser, validator or format spec that the repository does not show is named in your report as unverified, never assumed from memory
