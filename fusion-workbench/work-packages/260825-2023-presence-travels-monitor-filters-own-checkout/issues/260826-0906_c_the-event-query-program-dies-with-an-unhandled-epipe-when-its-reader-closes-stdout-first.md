# The event-query program dies with an unhandled EPIPE when its reader closes stdout first

---
`hooks/dist/events-query.js` writes its figures with a bare `process.stdout.write` and registers no
`error` handler on the stream. A reader that has already closed the pipe turns that write into an
unhandled `'error'` event: a node stack trace on stderr and a non-zero exit, from a helper whose
contract is that a reason goes to stderr and the exit code says which figure was missing.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low, and the reachability is stated rather than implied. Each subcommand makes exactly
one `process.stdout.write` (`hooks/events-query.ts:260`, `:352`, `:367`) and the output fits a pipe
buffer, so `| head -N` does not reach it: `head` has not exited by the time the single write lands.
What reaches it is a reader that fails or exits before the write, which is how it was measured.

**Cross-references:** `hooks/events-query.ts:260`, `:352`, `:367`; `bin/fusion-events`, the exit
table in its header.

## Measured

At `72a9561`, in a throwaway workbench outside the repository, with a reader that exits immediately:

```
$ FUSION_EVENTS_PERSON='Kai' FUSION_EVENTS_CHECKOUT='bbbbbbbb' FUSION_EVENTS_IDENTITY_EXIT=0 \
    node hooks/dist/events-query.js presence | cat -A
cat: illegal option -- A
node:events:485
      throw er; // Unhandled 'error' event
      ^
Error: write EPIPE
    at afterWriteDispatched (node:internal/stream_base_commons:159:15)
    ...
    at presence (file:///…/hooks/dist/events-query.js:202:20)
```

The same shape holds for `turns`. `grep -l "stdout.on\|EPIPE" hooks/*.ts hooks/lib/*.ts` returns
nothing, so no program under `hooks/` handles it — this is a family property and not a defect
introduced by this Circle. It is filed against this program because this is the one whose header
promises that every failure is a reason on stderr and a number in the exit code, and a node stack
trace is neither.

## Fix direction

One line, and it belongs wherever the family agrees to put it rather than in this program alone:

```ts
process.stdout.on("error", (e: NodeJS.ErrnoException) => {
  if (e.code === "EPIPE") process.exit(0);
  throw e;
});
```

Whether the family adopts it is worth deciding once, for `bin/fusion-review-coverage`,
`bin/fusion-staging-drift`, `bin/fusion-turn-budget` and this one together. Fixing only the program
that was measured leaves the other three, which is the shape
`260809-2046_*_the-git-branch-deny-is-a-fourth-fail-open-site-and-is-not-in-the-open-records-scope.md` was filed about in
`hooks/lib/fail-open.ts`'s own header: four sites are not four defects, they are one shape.

---
Resolved: one shape across the four reporting CLIs — `exitZeroOnStdoutEpipe()` in `hooks/lib/fail-open.ts`, registered before the first write in events-query, review-coverage, staging-drift and turn-budget. A reader that closed the pipe gets exit 0 and silence; every other stream error still throws. Re-measured with the record's own repro (`| cat -A`): node exit 0, empty stderr.
