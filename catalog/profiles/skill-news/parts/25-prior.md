## Step 6: say that a pull is owed, once

Fetching changed no file, and this run pulls nothing: the workspace is the host's checkout at the run's base revision, and a pull inside it would change what the host integrates. So there is no pull offer here and no `git pull`.

When Step 4 showed new entries, say in one sentence that a pull would bring them into the working tree, and that the pull is the user's, in their own checkout and outside this run. When nothing was shown, say nothing about a pull. Do not merge, rebase or force anything on the user's behalf.
