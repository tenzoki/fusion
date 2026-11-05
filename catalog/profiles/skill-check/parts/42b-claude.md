## tmp — the intermediate-file directory

```bash
T="$FUSION_PLUGIN_ROOT/bin/fusion-tmp"; if [ -x "$T" ]; then "$T" check; echo "exit=$?"; else echo "tmp=unread"; fi
```

`present=no`, `grants=missing`, `deny=missing` or `ignored=no`: run `"$FUSION_PLUGIN_ROOT/bin/fusion-tmp" path`, then its `grant`, which only add, and report their lines. Reported, not repaired: `ignored=tracked`, untrack the `settings=` file; `link=occupied`, `<root>/tmp` is something else, moved by hand to get the view link; `long=yes`, Python sockets break under it, so such a tool gets a shorter `TMPDIR`; `deny=skipped-home-under-temp`, `~/.fusion-tmp` is under a system temp prefix the deny would cover; `deny=present-under-sandbox`, the four `Edit(//…)` deny entries make the sandbox's `TMPDIR` unwritable and are removed by hand; `grants=unparseable`, the settings file is fixed by hand. Name `size_kb=` and each `other=` line and offer nothing: nothing in fusion deletes them. `tmp=unread` or a non-zero `exit=`: not taken.

