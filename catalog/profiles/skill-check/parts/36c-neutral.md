
```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]; then echo "upstream=no-work-tree"; else
  B="$(git symbolic-ref -q --short HEAD 2>/dev/null)"
  U=""; [ -n "$B" ] && U="$(git for-each-ref --format='%(upstream:short)' "refs/heads/$B")"
  if [ -z "$U" ]; then echo "upstream=none"; else
    echo "upstream=$U"
    if C="$(git rev-list --left-right --count "$U...HEAD" 2>/dev/null)"; then
      echo "behind=$(printf '%s' "$C" | cut -f1) ahead=$(printf '%s' "$C" | cut -f2)"
    else echo "counts=unread"; fi
    F="$(git rev-parse --git-path FETCH_HEAD)"
    if [ -f "$F" ]; then echo "fetched_hours_ago=$(( ($(date +%s) - $(date -r "$F" +%s)) / 3600 ))"; else echo "fetched=never"; fi
  fi
fi
```

One line in the project's chat language, and no line carrying a count omits the age:

- **`behind=` non-zero:** how many commits, the `upstream=` name, the age, and that a pull is owed.
- **`behind=0` with `ahead=` non-zero:** nothing to pull as of that view; the branch is that many commits ahead and unpushed. The age is still said.
- **`behind=0 ahead=0`:** level as of that view, with the age.
- **`fetched=never`:** the count was taken against a remote this checkout has never contacted, so it is not evidence of anything. Say to fetch. This is the case the record was filed on, and it reads as a warning whatever the count says.
- **`fetched_hours_ago=` above 24:** lead with the age and put the count after it, not the other way round.
- **`upstream=none`:** no upstream is configured for the current branch. A detached HEAD reads the same way.
- **`upstream=no-work-tree`:** not a git work tree, so nothing is owed here and nothing is a fault.
- **`counts=unread`:** an upstream is configured and its remote-tracking ref could not be read. Name it unread beside the upstream name; never print a zero in its place.

Advisory throughout: no branch of this selector blocks anything, and none of them asks the user anything.

## leftovers — files written by mechanisms fusion no longer ships

Probe for the halt flag and for the three inert files `rules/workbench-tracking.md` `## The four classes` names as written by nothing at this version; this is read-only:

```bash
[ -f ./fusion-workbench/.guard-state/escalation.json ] && grep -q '"haltActive"[[:space:]]*:[[:space:]]*true' ./fusion-workbench/.guard-state/escalation.json && echo "legacy halt flag present" || echo "no legacy halt flag"
for f in escalation.json churn.json state-drift.json; do [ -f "./fusion-workbench/.guard-state/$f" ] && echo "leftover: $f"; done
```

**`no legacy halt flag` and no `leftover:` line — say nothing at all.** An absent file, an unreadable one and `haltActive: false` are the ordinary case, and none of them gets a line in the report.

