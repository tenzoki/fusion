`forum` and `claude-md` are two selector names over one step, and `--skip claude-md` silently drops both

---

`skills/cleanup/SKILL.md` `## Arguments` lists `claude-md` and `forum` as two entries in "the selector's whole vocabulary". `skills/cleanup/SKILL.md` `### The message half` then says "**`--skip claude-md` drops the message with the step**, the half being Step 6's". A user who skips the gate loses the message and the table never says so. The reverse pairing, `--only claude-md`, is not defined for the message half anywhere.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Enumerating the combinations the body actually decides:

| Invocation | Message half | Where it is written |
|---|---|---|
| full run | composed, asked as the second question of the one `AskUserQuestion` | `skills/cleanup/SKILL.md` `### The message half`, first bullet; `skills/post/SKILL.md` `## Step 4: the two invocation shapes` |
| `--only forum` | composed, its own one-question confirmation | `skills/cleanup/SKILL.md` `### The message half`, fourth bullet; `skills/post/SKILL.md` `## Step 4: the two invocation shapes` |
| `--skip claude-md` | dropped | `skills/cleanup/SKILL.md` `### The message half`, second bullet |
| `--skip forum` | undefined | — |
| `--only claude-md` | undefined | — |

Two of five fall through. `rules/critical-stance.md` §4: the split is incomplete.

The mechanism reason for the third row is real — with the gate skipped there is no `AskUserQuestion` call for the second question to ride — but it is a reason to state the coupling in the selector table, not a reason to leave it in one bullet in the middle of the step. As the table stands, `forum` reads as an independently selectable step and is not one.

**Acceptance test:** every combination of `--only` / `--skip` over `claude-md` and `forum` has a stated behaviour, and the selector table says which names are coupled.

---
Reconciled 260908-1814 (reconciler, HEAD `ee99a578`): still open, and **the evidence column has moved**.
Circle `260908-1410-cut-skills-surface-add-post-body` replaced `skills/cleanup/SKILL.md`'s message half with
a read-and-perform stanza, so the `:206` and `:210` citations in the table above name other text; the three
defined rows are now written in `skills/post/SKILL.md` `## Step 4: the two invocation shapes` and in the
stanza's four bullets. The defect itself is untouched by that move. The selector table still lists
`claude-md` and `forum` as two independent entries and still does not state the coupling, and `--skip forum`
and `--only claude-md` are still undefined — the stanza carries `--skip claude-md` dropping the message as
one bullet in the middle of the step, which is exactly the placement this record objects to. Marker stays.

---
Citations re-pointed 260908 (coder, Kai Stalmann <ks@qantr.com>): the head and the table above now cite by
heading anchor. The split runs across two files and the table says so per row — the selector vocabulary and
the coupling stayed in `skills/cleanup/SKILL.md`, the two invocation shapes are written in both bodies, and
the `--skip claude-md` bullet exists only in the cleanup stanza. **No line number is written back**, per
`rules/fusion-workbench-conventions.md` `## Filename Patterns`: living text cites by heading anchor, because
an edit above the line moves it silently and no gate resolves `path:N` — which is how the `:206` and `:210`
citations came to name other text while `:54-55` stayed in the file it named and still slipped. **The defect
is untouched and the marker stays `_o_`**: two of five combinations are still undefined and the selector
table still does not state the coupling.
