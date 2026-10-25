"$FUSION_PLUGIN_ROOT/bin/fusion-checks-due"
```

`marker=unchanged` means nothing was written and the file's modification time did not move, which is the property the tracking rule asks for. `marker=written` means the marker was missing, carried another version, or still carried the `checks` object it drops. `checks_due=` comes from `bin/fusion-checks-due`; it reads `.check-stamps`, which never travels. A fresh workspace does not carry that file, so on Prior every check reads as due until the host keeps it between runs (request 76, question 3).

**`marker-version-unresolved` says the version could not be read, which is not the same as the version matching.** The version decides both halves, so an unreadable one leaves no comparison to make and no due list to compute: the block writes nothing and prints that token. Setup is not blocked. A marker is never written with an empty version, because the next run cannot tell an empty one apart from a real one. Report the token together with whichever outcome followed: an existing marker was left exactly as it stands, or the workbench has no marker at all and is therefore not set up here until Setup runs again in a later entry run.
