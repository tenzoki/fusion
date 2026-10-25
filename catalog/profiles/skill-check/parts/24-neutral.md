
> These workbench files differ from the ones this fusion version ships: *&lt;list&gt;*. Replace them with the shipped copies? Any edits you made to those files are lost. For *&lt;the case-0 files&gt;* fusion has no record of what it originally copied, so it cannot tell whether you adapted the file or the module moved on.

Two options: **"Replace them"** and **"Keep mine"**.

**Both answers end with a stamp, which is what stops the question repeating.** On "replace", copy the shipped file over the project's and stamp **the destination**, so a failed copy is left unstamped and offered again next run. On "keep mine", change no file and stamp anyway. One block, after the prelude: `MODE=replace` over the files to replace, then `MODE=stamp` over the case-1 files plus every kept file the question covered:

```bash
[ -f "$PROV" ] || : > "$PROV"
for rel in <rel...>; do
  if [ "$MODE" = replace ]; then
    cp "$SRC/$rel" "./fusion-workbench/$rel" || { echo "$rel replace-failed"; continue; }
    h="$(shasum -a 256 "./fusion-workbench/$rel" | cut -c1-64)"
  else
    h="$(shasum -a 256 "$SRC/$rel" | cut -c1-64)"
    grep -q "^$h  $rel$" "$PROV" && continue
  fi
  grep -v "  $rel$" "$PROV" > "$PROV.t"; printf '%s  %s\n' "$h" "$rel" >> "$PROV.t"; mv -f "$PROV.t" "$PROV"
done
```

Report in the Done report: which files were replaced, printed `replace-failed`, were kept, were conflicts or were missing on either side, and, on `source-root-unresolved`, that the assets were not compared. When every file came back `case1-equal`, say nothing about this step.

## config — the project's own configuration file

fusion reads `./fusion.json` at the project root and merges it over its own built-in defaults, so this file is where a project declares which of its non-Markdown files carry record citations (`hooks/lib/config.ts`; the seeded template declares nothing and therefore inherits everything). It belongs in version control: every change to which files fusion's citation helpers read has to show up in a diff.

It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reports. The "never prepend `cd`" rule at the top of this workflow is what keeps it there.

First check whether the project already has one. This is read-only and always allowed:

```bash
[ -f ./fusion.json ] && echo "fusion.json present" || echo "fusion.json absent"
```

- **`present`** — nothing to do. Do not run the copy anyway: the template declares nothing, so copying it over a project's filled-in file would replace a real setting with an empty inheritance.
- **`absent`** — seed the template. The copy is idempotent and never overwrites:

  ```bash
