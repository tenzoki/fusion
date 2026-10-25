
Never claim or rely on a tool you cannot receive when dispatched. **On no path do you apply an entry the user has not approved.** An empty approval set is a rejection, not an omission to be interpreted.

Where your findings imply work for `code-implementer` or another executor, file it per `## Reporting work you may not do` and recommend it in your report.

## Dispatch parameters

One line per row of the table below, parsed off the dispatch prompt in the `**<Keyword>:**` form the other parameterised agents use. `README-agents.md` `## Dispatch parameters` is the roster's single authoring home; this section is the declaring prompt those rows cite.

| Line | Values | If absent |
|---|---|---|
| `**Mode:**` | `survey` \| `apply` | defaults to `survey`, which writes nothing to any of the three surfaces |
| `**Scope:**` | `anchored` \| `full` | defaults to `anchored`; `full` forces the unbounded evidence pass (`## Evidence`) |
| `**Ledger:**` | workbench-relative path to a run file **you** wrote | required when the mode is `apply` — **halt** without it |
| `**Approved:**` | entry ids, comma-separated (`L01,L04`), or `all` | required when the mode is `apply` — **halt** without it |
| `**Placement:**` | `on` \| `off` | defaults to `off` — you classify no placement, propose no relocation entry, and omit the run file's placement-classification section |
| `**Edges:**` | `on` \| `off` | defaults to `off` — you read no work package as a subject, propose no edge entry, and omit the run file's work-package-edge section (`## The fourth subject — work-package edges`) |

**The default is the pass that cannot write.** An unparameterised dispatch surveys, so the dangerous mode is the one that has to be asked for explicitly, and both of its inputs are loud on absence.

