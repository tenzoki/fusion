[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
```

Read-only classification:

```bash
for rel in stilwerk/default-voice-en.yaml stilwerk/default-voice-de.yaml stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml; do
  d="./fusion-workbench/$rel"; g="$SRC/$rel"
  [ -f "$d" ] || { echo "$rel case5-missing-local"; continue; }
  [ -f "$g" ] || { echo "$rel case6-missing-shipped"; continue; }
  P="$(shasum -a 256 "$d" | cut -c1-64)"; S="$(shasum -a 256 "$g" | cut -c1-64)"
  R="$(grep "  $rel$" "$PROV" 2>/dev/null | tail -1 | cut -c1-64)"
  if   [ "$P" = "$S" ]; then echo "$rel case1-equal"
  elif [ -z "$R" ];     then echo "$rel case0-unclassifiable"
  elif [ "$P" = "$R" ]; then echo "$rel case2-stale"
  elif [ "$S" = "$R" ]; then echo "$rel case3-adapted"
  else                       echo "$rel case4-conflict"; fi
done
```

**Eight tokens; the precedence is the branch order above.** `source-root-unresolved` ends the block before any file is classified and is reported, not enumerated. The other seven:

1. **`case1-equal`** — the project's copy *is* the shipped copy. Report nothing. Stamp it.
2. **`case0-unclassifiable`** — the copies differ and no checksum was recorded (every pre-existing workbench). Name the file, say that fusion **cannot tell an adaptation from a stale copy** for it, and carry that warning into the offer. Do not guess.
3. **`case2-stale`** — the project's copy is what it was given and the shipped file moved. Offer the replace.
4. **`case3-adapted`** — the project edited its copy and the shipped file did not move. Say nothing; touch nothing.
5. **`case4-conflict`** — both moved. Name it, offer no replace, neither change nor stamp it (so it is named on every run until resolved by hand), and say the two ways out: copy the shipped file over the project's (case 1 next run), or keep the project's and delete its line from `$PROV` (case 0 next run). A declined offer lands here the next time the module moves.
