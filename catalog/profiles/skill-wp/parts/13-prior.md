"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-mode --record "$D/package.json" --value autonomous --source "{\"kind\":\"user-word\",\"ref\":{\"kind\":\"other\",\"path\":\"$N\",\"sha256\":\"sha256:$H\"}}" --actor user; echo "exit=$?"
```

Any other exit leaves the package filed in the ordinary mode: say so, with the `fusion-write:` line.
