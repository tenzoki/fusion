The conditional marker write has no plugin-root guard, so an empty version wipes the record it exists to protect

---

**Severity:** High. It destroys the only record of which fusion version produced a workbench, silently, and the same skill names that loss as the reason an earlier check stops Setup.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:92-94`
**Cross-references:** plan step 4 and its `## Data Structures` section in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`; `rules/workbench-tracking.md` `## The setup marker is written on change, not on every run`

---

## What is wrong

Commit `905a8a4` replaced the unconditional marker write with this block:

```bash
M=./fusion-workbench/.fusion-setup
V="$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
[ -f "$M" ] && grep -qF "\"plugin_version\":\"$V\"" "$M" || printf '{"setup_at":"%s","plugin_version":"%s"}\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$V" > "$M"
```

`$V` is now load-bearing: it decides whether anything is written at all. When `$FUSION_PLUGIN_ROOT` is unset or the manifest is unreadable, `V` is the empty string, the `grep -qF` for `"plugin_version":""` finds nothing, and the marker is rewritten as `{"setup_at":"…","plugin_version":""}`.

Every neighbouring block in the same skill guards that variable. Steps 0b, 0d, 0e and 0f each carry a form of "If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup." This block carries none.

The loss is the one the pre-v4 refusal above it is written to prevent. `skills/setup/SKILL.md:54` states that the refusal stops Setup before this point because the marker write "overwrites `plugin_version`, destroying the only record of which version produced the workbench." The new block reaches that outcome by a different route and with no refusal in front of it.

The second run is quiet, which makes it worse rather than better: once the file holds `"plugin_version":""`, the `grep -qF` matches and nothing is reported. The original version is gone and no surface says so.

## Verified

Measured at HEAD `2f1e3a6` in a scratch tree, running the block as written:

```
case 1: legacy marker with setup_pwd, same version
V=[10.6.0]
{"setup_at":"2026-08-01T00:00:00+0200","setup_pwd":"/old/path","plugin_version":"10.6.0"}   (untouched)

case 2: FUSION_PLUGIN_ROOT unset
V=[]
{"setup_at":"2026-08-23T11:05:03+0200","plugin_version":""}                                 (rewritten)
```

Case 1 is the behaviour the plan's `## Data Structures` prescribes and it holds. Case 2 is the defect.

## A second, smaller property of the same test

`grep -qF "\"plugin_version\":\"$V\""` requires the exact spelling this block's own `printf` produces, with no space after the colon. A marker written in any other JSON formatting never matches, and Setup then rewrites it on every run, which is the behaviour the change removes. Today fusion is the only writer, so this is a latent coupling rather than a live fault, but the marker's shape is now a contract between two lines of one block.

## Direction, not a prescription

Guard the resolution and skip the write when it fails, rather than writing an empty version. Something of the shape: resolve `V`, and if it is empty, write nothing, report that the marker could not be evaluated, and carry that into the Done report the way the sibling steps carry their own failures. Not blocking Setup is right; writing a wrong marker is not.
