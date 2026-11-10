
## Step 4: `cut --checkouts <N>`

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" cut --checkouts <N> <--tolerance and its value, when the user gave one>; echo "exit=$?"
```

The cut reads this checkout's working tree, fetches nothing and writes one proposal file, nothing else. Exit 0 continues. **exit 2**: `<N>` is no whole number above zero, or the tolerance none from zero: say so. **exit 4**: the workbench in the working tree was not read; quote the stderr line. Exits 1 and 3 as in Step 2.

Render the page in the user's terms, in this order:

- **`lane=` rows**: per lane, the packages that go into it, in the order they are worked, prerequisites first. Two packages that work in the same part of the project always land in one lane.
- **`handoff=` rows**: work that passes from one lane to another: the package that has to finish first, the one that waits for it, and the two lanes.
- **`imbalance=` rows**: a lane holding more than the cut allows, because packages whose declared areas overlap are never split: name the lane, its size and the packages. The user accepts it, takes a file several packages share out of a package's declared areas, or changes the number of checkouts.
- **`no-areas=` rows and `no-areas-count=`**: the packages that declare no area of the project, so the cut cannot keep them apart from anybody: name them. An area is declared per package with `"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-resources --record <its control path> --path <path> --actor user`, `--path` repeatable, each a path relative to the project root without a trailing slash and covering everything under it, on the user's confirmation and never from the brief. Say once, here: a package with declared areas is read only by this version of fusion, as a campaign record is, so areas are declared and a campaign is opened only once every checkout of the project runs it; in a workbench a Prior host also reads, only after Prior has re-pinned the codec. An older reader refuses such a package by name, not silently.
- **`delta-plus=` and `delta-minus=` rows**: what one checkout more or fewer would change: which packages change lane, and which hand-offs appear or disappear. At one checkout there is no `delta-minus=`.

End with the `proposal=` path: the proposal stands in that file, a second run with the same parameters replaces it, and **nothing is written to the workbench until the user confirms the proposal in Step 5.**
