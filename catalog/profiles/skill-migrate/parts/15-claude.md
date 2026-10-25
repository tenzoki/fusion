Then what to do next, in this order: commit the migration as one commit of renames and push it; tell the other checkouts to pull rather than migrate again, so the project has one revert point (a checkout holding an untracked container under `circles/` runs `/fusion:migrate` once more after the pull); run `/fusion:setup`. For `MODE=plain`, say that nothing here is in a diff, and go on to Step 6.

**In `MODE=git`, a run that moved anything ends here**: commit the renames as one commit, then run `/fusion:migrate` again; the re-run offers the citation repairs and Step 7.
