It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reports. The "never prepend `cd`" rule at the top of this workflow is what keeps it there.

First check whether the project already has one. This is read-only and always allowed:
