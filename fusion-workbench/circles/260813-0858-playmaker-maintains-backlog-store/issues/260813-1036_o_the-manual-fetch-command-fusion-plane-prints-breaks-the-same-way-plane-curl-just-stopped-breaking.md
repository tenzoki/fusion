# The manual fetch command `fusion-plane` prints breaks the same way `plane_curl` just stopped breaking

---

**Severity:** Low
**Domain:** code
**Filed by:** bugfixer, while fixing the two live-rebuild test failures (session 260813-1027)
**Affects:** `bin/fusion-plane:2263` (`seed_defer_manual`)
**Cross-references:** `bin/fusion-plane:332-370` (`plane_curl`, fixed in this session);
issue `260813-0828` (the record the fix answers)

---

## The defect

`seed_defer_manual` is the C4 never-silent fallback: when seeding cannot reach Plane it
prints the exact command for the user to run in their own interactive zsh.

```bash
fetch_cmd="zsh -ic 'curl -s -H \"X-API-Key: \$PLANE_API_KEY\" \"$BASE/issues/?per_page=100\"' | jq '.results[] | select(.sequence_id==$seq)'"
```

That command pipes an interactive shell's whole stdout into `jq`. It is the identical shape
that made every `plane_curl` response unparseable on a stock macOS Terminal, where
`/etc/zshrc_Apple_Terminal` prints `Restored session: <date>` on interactive-shell startup.
A user who copies this line gets `jq: error … invalid text` and no story text, at the exact
moment the tool was trying hardest not to leave them stranded.

Not fixed inline: this string is *printed*, never executed, so it is outside the failing
tests' root cause and outside a minimal fix's scope.

## Suggested remedy

Send the body to a file in the printed command as well, e.g.
`zsh -ic 'curl -s -o /tmp/plane-issue.json …' && jq '…' /tmp/plane-issue.json`, so the
operator's own rc chatter cannot corrupt what `jq` reads.
