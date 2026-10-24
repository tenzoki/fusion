
     # No measurement was taken. Decide nothing from a number that does not exist.
     if counted_by == "none":                                      domain = "code"   # counts unavailable

     # The project tree, read first. Source in the tree means this workbench
     # governs a build; the only question left is whether data outweighs it.
     elif code_files > 0 and data_files > code_files * 2:          domain = "data"
     elif code_files > 0:                                          domain = "code"

     # code_files == 0 from here down. The tree holds no source, so the only
     # question left is whether it holds structured data at all.
     elif data_files > 0:                                          domain = "data"
     else:                                                         domain = "code"   # fallback
     ```

     **The branch order is the substance here, not the layout.** The bare `data_files > 0` branch at the bottom is a claim that this workbench governs **no build**, and the direct evidence for that claim is `code_files == 0`. It carries no `code_files` conjunct of its own because the two `code_files` branches above it *are* that conjunct: they define the region it sits in. **Do not lift it above them.** A single CI `.yml` in a source tree would then claim the whole project for `data`, which is why the sourceless case gets its own line at the bottom rather than reusing the ratio at the top. `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` fails if it moves.

