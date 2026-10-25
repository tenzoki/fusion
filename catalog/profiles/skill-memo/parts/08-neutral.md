CO=$(printf '%s\n' "$ID" | sed -n 's/^CHECKOUT=//p')
P=$(printf '%s\n' "$ID" | sed -n 's/^PERSON=.*<\(.*\)>$/\1/p' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
[ -n "$P" ] || { echo "memo: no e-mail on a PERSON= line; nothing written" >&2; exit 1; }
echo "P=$P CO=$CO"
```

`$P` is the git e-mail of the `PERSON=` line, slugged: `Kai Stalmann <ks@qantr.com>` gives `ks-qantr-com`. **No e-mail, no write.** Helper exit 1, 4 or 5, or a missing helper, leaves `$P` empty and the block exits 1: halt and name the reason the helper printed, because an unkeyed name is the one every person would share. `$CO` is this checkout's `CHECKOUT=` line and serves adoption alone; it may be empty.

## Where each kind goes

