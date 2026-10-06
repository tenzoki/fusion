---
description: Report the order fusion computes over the live work packages — position, depth, blocking count and readiness per item, with cycles, unmet and unresolved entries and the caveat — read from bin/fusion-work-order and never ranked. Use when the user asks in what order the packages stand or what blocks what.
argument-hint: "[--format text|tsv|markdown|json]"
allowed-tools: [Bash]
---

# Work order (report what the store computes)

The user invoked `/fusion:wp-order`. This workflow runs the helper `bin/fusion-work-order` and renders what it printed. The command's name differs from the helper's; this is the only helper it wraps.

**The mechanism is not in this body.** The node set, the ordering, depth, blocking count, readiness, the optimism counts and the exit codes are documented in the headers of `bin/fusion-work-order` and of `hooks/order.ts`, which renders the computation and points to where it is done; those headers are the authoritative text. What this body carries is the flow and the sentences the user reads.

**The order is the helper's computation, not a ranking.** No agent asserts one, and the user overrides any figure at will (`rules/fusion-workbench-conventions.md` `## Work packages`, the `depends_on` paragraph).

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 0: the workbench

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
```

If it exits non-zero, halt with *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.* Do not create one from here.

## Step 1: the helper has to be there

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-work-order" ] && echo present || echo missing
```

On `missing`, say this and stop:

> *`/fusion:wp-order` needs `bin/fusion-work-order`, and the installed copy of fusion does not carry it yet. Run `fusion --update`, then restart the session.*

**Never improvise the mechanism on that branch.** No hand-rolled parse of the work-package store, no order of your own.

## Step 2: run it

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-work-order" <the user's arguments>; echo "exit=$?"
```

Pass the words the user gave after the command unchanged, each as its own argument, or none. Do not check or correct them: the helper is the only validator of what an argument means. Exit 0 is the only case that continues, whatever `verdict=` says. For every other, say one plain sentence and stop:

- **exit 2**: no fusion workbench above here. Run `/fusion:setup`.
- **exit 3**: the plugin itself could not run (compiled hooks or codec bundle missing, or an internal error), so nothing could be asked. Run `fusion --update`, then restart the session. Never report this as "no work packages".
- **exit 4**: the workbench was not read; quote the stderr line. A `legacy` workbench is migrated by `/fusion:migrate`. Never report this as "no work packages".
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
