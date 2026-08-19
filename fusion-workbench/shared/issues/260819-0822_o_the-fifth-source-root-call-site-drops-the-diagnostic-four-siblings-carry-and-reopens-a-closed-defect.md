The fifth `fusion-source-root` call site drops the diagnostic its four siblings carry, reopening the shape of a closed defect

---

`06ab15b` added a fifth prompt call site for `bin/fusion-source-root`, in
`skills/archive/SKILL.md:39`. The four existing ones share one shape, settled by
`260810-2110_c_fusion-src-resolves-to-the-empty-string-with-no-report-when-fusion-plugin-root-is-unset.md`
and decision `260810-0921` (option a1, *tolerate and report*). The new one is a different shape and
drops the report, which is the half that record was filed about.

---

**The four siblings** (`skills/next/SKILL.md:16-20`, `skills/setup/SKILL.md:15-19`,
`skills/cleanup/SKILL.md:18-22`, `skills/help/SKILL.md:20-24`), byte-identical modulo the closing
sentence:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
else
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
fi
```

**The new site** (`skills/archive/SKILL.md:39`):

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")" || FUSION_SRC="$FUSION_PLUGIN_ROOT"
```

Three departures, in increasing order of consequence.

1. **No `${FUSION_PLUGIN_ROOT:-}`.** With the variable unset the test reads
   `[ -x "/bin/fusion-source-root" ]`, which is false, so `FUSION_SRC` is assigned the **empty
   string** and the next line runs `cat "/rules/workbench-tracking.md"`. That is the exact value
   `260810-2110` was filed about: *"`$FUSION_SRC` resolves to the empty string with no report."*

2. **No stderr line.** The four siblings distinguish the two causes that reach the same branch —
   an install copy predating the helper, and an unset root — because `260810-2110` recorded that
   they *"produce different values, one usable and one not, with no way for the reader to tell
   which happened."* The new site prints nothing and conflates them again.

3. **The prose does not match the block.** The sentence under it reads *"If neither root yields the
   file, say so and continue."* The block tries exactly one path: `$FUSION_SRC` is already the
   resolved-or-fallback value, and no second `cat` against `$FUSION_PLUGIN_ROOT` follows. There is
   no "neither root" behaviour to describe.

**Why this site rather than another.** The file being read is
`rules/workbench-tracking.md`, the record-versus-live-state classification this skill's own lede
calls *"what this skill must preserve rather than discard"*, in a skill whose Step 7 note says the
archive folder is often *"the only copy of every artifact this skill moves"*. A silent empty root is
the one failure the surrounding prose is careful about everywhere else.

Verified at HEAD `83488e9` by
`grep -rn "fusion-source-root" skills/ agents/` (five call sites, four in the `if`/`else` shape and
one one-liner) and by reading
`shared/issues/260810-2110_c_fusion-src-resolves-to-the-empty-string-with-no-report-when-fusion-plugin-root-is-unset.md`
`Resolved:` note, which states the convention and its reason.

Not verified, stated as **inference:** the behaviour under `nounset` was not run. Departure 1 is read
off the shell semantics of an unset expansion, not measured.

**Fix direction.** Replace the one-liner with the four-line shape its siblings carry, adapting only
the closing sentence, and reword the following paragraph to name the one root actually tried. Note
that `260816-0133_o_the-setup-and-migrate-probes-are-byte-identical-in-three-copies-with-no-gate-against-the-next-drift.md`
is the standing record that nothing gates this kind of drift; this is a fresh instance of it and a
reason to weigh that record rather than to refile it.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.
