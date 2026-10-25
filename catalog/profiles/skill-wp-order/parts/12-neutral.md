- **exit 1 with an argument given**: the user's argument is not one the helper takes. Quote its stderr usage line.
- **exit 1 with no argument**: a usage fault in this body. Report it as a fusion defect, never as the user's fault.

On exit 0 the format decides the reply:

- **`--format tsv` or `--format json`**: one sentence saying what it is, then stdout verbatim in a single ` ```tsv ` or ` ```json ` block, untranslated and unannotated. The bytes are the contract (`hooks/order.ts` `## The TSV format`, `## The JSON format`); a `note` in them is not repeated. Stop.
- **`--format markdown`**: stdout verbatim as the reply (`hooks/order.ts` `## The Markdown format`). Stop.
- **No argument or `--format text`**: Step 3.

## Step 3: render the text format

**`verdict=empty` is a real answer and never an error.** Say there are no live work packages; if the helper printed `unreadable=` rows, name each as item 6 below says, then stop.

Otherwise, in this order:

1. **The summary figures**, each in words: items, edges, unmet entries, unresolved entries, cycles, ready, roots, items with an empty `depends_on`, unreadable records, and the verdict (`acyclic` or `cyclic`).
2. **One line per item, in exactly the order the helper printed**: position, depth, blocking count, readiness word (`ready`, `blocked` or `paused`, as printed) and the item's name. Every item the helper printed appears, and no other.
3. **Each `cycle=` row**: name its members and say they wait on one another, so none of them can come first by this computation.
4. **Each `unmet=` row**: name the item, the target and the condition, and say the item is blocked because the codec found that condition unmet.
5. **Each `unresolved=` row**: name the item, the record id and the codec's reason, and say the codec could not resolve it to a package, so it blocks nothing in this computation and is no proof the condition holds, which is what the `note=` line warns of.
6. **Each `unreadable=` row**: name the item and the codec's reason, so it stands outside the order rather than being dropped in silence.

**A `note=` line is repeated in a sentence of its own**, after the figures and never folded into the table or dropped: it says `ready=` is optimistic by the counts it names, and the user's ruling behind it is in the helper header.

## Guardrails

- In every format: never reorder, filter, group or omit an item; never add a figure the helper did not print.
- Never say which item to take next, never add a recommendation or a priority, and never call the order binding.
- Write no file, commit nothing, ask the user nothing, dispatch no agent.
