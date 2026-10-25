
If the container you derived already exists, neither overwrite nor append: pick a `<topic>` that tells the two apart, and say in your report that you did.

The record, and the minimum is almost nothing on purpose. `rules/fusion-workbench-conventions.md` `## Work packages` defines the kind, its statuses and this floor:

```markdown
# <one-line title>

## Directive

<one paragraph: what the work is, and why it might matter>
```

No head block: filer, domain and mode are the control file's. Do not add an Options, Constraints or Recommendation section: those make a decision record, and the rule above records what filing at that cost produced.

## Process

1. Resolve per Step 0, then the invocation mode.
2. Derive the stamp and the `<topic>` slug; check only that the container is free.
3. `mkdir -p` the container, **create** the record inside it, then file it as below.
4. Report: a new item at `open`, and its path.

## On a JSON-controlled workbench

`$D` is the container, `$N` the record in it, both relative to `$WORKBENCH`. With the record written:

```bash
