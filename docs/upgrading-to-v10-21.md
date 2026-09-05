# Upgrading to v10.21 (from v10.20)

One note for 10.21.0, the checkout-registry release. Nothing in your project is rewritten and no migration step is required. What arrives is one new store, one new helper, one question your next `/fusion:setup` asks once, and a correction to a figure `bin/fusion-events presence` was already printing.

## What you will notice

- **One file appears, and it is the whole of the change on disk.** On your next `/fusion:setup`, the checkout you run it in registers itself: one file at `fusion-workbench/shared/checkouts/<8hex>.md`, named after the identifier `bin/fusion-identity` already minted for that checkout. It carries an alias, the person who claims the checkout, the git identity as read, and two timestamps. Nothing else on disk changes. **No existing record is rewritten, no marker moves, no line of `orchestrator-events.jsonl` is touched**, and no configuration key arrives or leaves.

- **Setup asks one question, once per checkout.** Where the checkout has no entry, Step 0i asks in plain chat text (not a dialog, because the alias and the person are free text) for the person and the alias, offering a deterministic suggested name and whatever persons the store already holds. Declining everything still writes the entry, with the suggested alias and your git identity as the person, and that is deliberate: the entry is what records that the question was asked, it publishes nothing that is not already in every commit you have made, and its content reproduces today's behaviour exactly. Where an entry exists, Setup refreshes the git identity silently and asks nothing.

- **No field carries a hostname, an account name or a folder path.** That was a decision and not an oversight (`260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, option 1). Nothing about the machine is published.

- **The alias is an attribute; the hex stays the key.** It stays the key in the filename, in every event line, in every `**Claim:**` field and in every comparison. Four places now render the alias beside or instead of the hex: the monitor header, `/fusion:next`'s refusal when another checkout holds the Circle, the `party=` lines of `bin/fusion-events presence` (a sixth TAB field, appended, so a consumer reading five is unaffected), and `FUSION_ALIAS`, which SessionStart exports where an entry exists. Where nothing resolves, every one of them renders the hex, exactly as it did before this release.

- **`other_people` can go down, and that is the correction landing.** `presence` joins the git identities the registry maps to one person and counts that person once. If you work from two machines with two git configurations, register both and the count stops reporting you as two people. With no registry the map is empty, `canon` is the identity function, and the figures are the ones v10.20 printed, from the same code path rather than from a fallback branch. **`/fusion:next`'s claim comparison is untouched**: it still compares the identity as written, because a comparison routed through a pulled file would answer differently before and after a fetch. A second machine is still refused that person's own Circle, and the override the refusal already offers is still the way through.

- **The `git clean` mint is no longer silent.** Where `bin/fusion-identity` has to mint `fusion-workbench/.checkout-id`, it now says on stderr that it did, names the identifier, and says how many other checkout identifiers the workbench already carries. It cannot tell a first identity apart from a re-mint after the file was swept, and it says which two causes it cannot separate rather than picking one (`260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md`). Exit codes, stdout and the halt condition are unchanged.

- **The one-release-behind cost applies as usual.** Until you run `fusion --update` and restart, the installed copy has no `bin/fusion-checkout-name`, so every call site takes its `[ -x ]` miss branch and renders the hex. That is the standing cost of a new `bin/` helper and not a fault in your project (`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`).

## If you do not want the store

Delete `fusion-workbench/shared/checkouts/` and every reader falls back to what it did in v10.20: the hex renders everywhere, `presence` counts raw git identities, and `FUSION_ALIAS` is not exported. Nothing degrades and nothing warns. The next `/fusion:setup` will ask the question again, since an absent entry is exactly the unregistered state.

If your project tracks its workbench, the store is class R1 in `rules/workbench-tracking.md`: it travels in git like every other record store, and it needs no merge driver and no lock, because each checkout writes only the file named after its own identifier. A collision on an alias is reported by `register` and never enforced, for the reason the claim field already carries: a checkout that has not pulled cannot see an entry that has not been pushed.

## Verify after updating

`fusion --update`, restart, then `/fusion:setup` at your project root. The Done report names which Step 0i branch ran. After that, `"$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" roster` prints `entries=` and one `entry=` line per registered checkout, and `"$FUSION_PLUGIN_ROOT/bin/fusion-events" presence` prints `party=` lines whose sixth field is the alias or `-`.

The helper's own header is the authoritative documentation for the subcommands, the exit codes and the entry grammar.
