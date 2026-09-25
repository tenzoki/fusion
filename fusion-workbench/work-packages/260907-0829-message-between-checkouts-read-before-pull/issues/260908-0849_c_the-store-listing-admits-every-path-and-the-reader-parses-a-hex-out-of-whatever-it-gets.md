Every path under the store is rendered as a message, and the reader parses a checkout hex out of whatever filename it gets

---

`bin/fusion-forum new` lists the store with `git ls-tree -r` and filters only entries whose name carries **this** checkout's identifier (`bin/fusion-forum:332`). A file that matches no part of the mandated `YYMMDD-HHMM-<checkout>-<slug>.md` shape is admitted. `skills/news/SKILL.md:94` then runs `basename "$ENTRY" | cut -d- -f3` on it and hands the result to `bin/fusion-checkout-name resolve`, which exits **2** with its whole usage block on stderr rather than the exit 3 the skill body anticipates (`skills/news/SKILL.md:100`).

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Measured. Tracked scratch fixture whose store was seeded with three files — two conforming, one of them the reader's own, and a `README.md` — and read with the reader's identifier set to `abcdef01`:

```
seeded:  260907-1000-99999999-hello.md
         260907-1001-abcdef01-mine.md
         README.md
```

The names above are fixture strings, not records in this workbench. What the helper printed, with the forum store's segment written `<forum>` on the first entry because a spelled store segment is reported wherever it stands, a fence included:

```
new=2
entry=fusion-workbench/shared/<forum>/260907-1000-99999999-hello.md
entry=fusion-workbench/shared/forum/README.md
```

The reader's own entry is dropped correctly. `README.md` is not, and downstream:

```
$ echo README.md | cut -d- -f3          # empty
$ bin/fusion-checkout-name resolve ""
fusion-checkout-name: resolve takes one 8-hex-character identifier
usage: fusion-checkout-name resolve <8hex>
…
exit=2
```

`git ls-tree -r` also recurses, so any file in a subdirectory of the store is listed with a basename that says nothing about a checkout.

The cut is wrong rather than incomplete. The split the helper performs is *"does this filename carry my hex"*, and its complement is "show it". The split the feature wants is *"is this a message, and whose"*, whose complement is "it is not a message". The helper already holds the pattern that decides the second question — the regex at `bin/fusion-forum:332` — and uses it only to exclude.

The filename shape is mandated, not conventional: `rules/fusion-workbench-conventions.md` `## Filename Patterns`, the forum row.

Two consequences to fix together, since one without the other leaves the other reachable:

- `new` admits a path only when its basename matches the forum pattern; anything else in the store is reported as skipped, or listed under a key that is not `entry=`.
- `skills/news/SKILL.md` Step 4 stops deriving a hex by field position and reads the value the helper already knows, or validates before calling `resolve`.

**Acceptance test:** the fixture above lists one `entry=`, not two, and `hooks/lib/__tests__/fusion-forum.test.ts` gains the case. No run of `/fusion:news` puts another helper's usage block in front of the user.

---
Resolved: the commit that carries this line makes `bin/fusion-forum new` keep only a top-level path whose basename matches `^[0-9]{6}-[0-9]{4}-[0-9a-f]{8}-[a-z0-9-]+\.md$`, print `writer=<hex>` directly under each `entry=` (the hex read out of a basename that passed the shape test), and report every other new path in the store as `skipped=<path>`, uncounted in `new=`; the header's KEY list gains both. `skills/news/SKILL.md` Step 4 reads `writer=` and derives nothing by field position, so no run hands `bin/fusion-checkout-name resolve` an empty value. The record's fixture (two conforming entries, one of them the reader's own, and a `README.md`) is the new case in `hooks/lib/__tests__/fusion-forum.test.ts`: `new=1`, one `entry=`, `writer=99999999`, one `skipped=` naming the README. Of the two shapes the record allows for the non-message, a key that is not `entry=` was taken, so the reader still learns the path exists.
