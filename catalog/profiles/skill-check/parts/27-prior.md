If the copy fails, report it and continue; the host sets `$FUSION_PLUGIN_ROOT` on every call, so an unset one is a broken bundle, reported as such. An absent `fusion.json` costs the project one thing and only one: fusion's citation helpers read the Markdown corpus alone, because that file is the only place a project declares anything else.

## permissions — the project's permission file

**Not applicable on this host.** On Claude Code this selector offers to write a Claude Code permission file into the project, so that a session need not approve every tool call. Prior has no counterpart: the host enforces the profile's `tools_ceiling` and grants each run its tools, and no project file widens or narrows that grant.

So on Prior this selector reads no file, asks nothing and writes nothing. Report one line in the Done report, `permissions: not applicable on this host`, and **do not stamp it**: a stamp is a claim that the check was taken, and this one was not.
