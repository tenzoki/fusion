`forum` and `claude-md` are two selector names over one step, and `--skip claude-md` silently drops both

---

`skills/cleanup/SKILL.md:54-55` lists `claude-md` and `forum` as two entries in "the selector's whole vocabulary". `skills/cleanup/SKILL.md:210` then says "`--skip claude-md` drops the whole step, message too". A user who skips the gate loses the message and the table never says so. The reverse pairing, `--only claude-md`, is not defined for the message half anywhere.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Enumerating the combinations the body actually decides:

| Invocation | Message half | Where it is written |
|---|---|---|
| full run | composed, asked as the second question of the one `AskUserQuestion` | `skills/cleanup/SKILL.md:206` |
| `--only forum` | composed, its own one-question confirmation | `skills/cleanup/SKILL.md:210` |
| `--skip claude-md` | dropped | `skills/cleanup/SKILL.md:210` |
| `--skip forum` | undefined | — |
| `--only claude-md` | undefined | — |

Two of five fall through. `rules/critical-stance.md` §4: the split is incomplete.

The mechanism reason for the third row is real — with the gate skipped there is no `AskUserQuestion` call for the second question to ride — but it is a reason to state the coupling in the selector table, not a reason to leave it in one sentence in the middle of the step. As the table stands, `forum` reads as an independently selectable step and is not one.

**Acceptance test:** every combination of `--only` / `--skip` over `claude-md` and `forum` has a stated behaviour, and the selector table says which names are coupled.
