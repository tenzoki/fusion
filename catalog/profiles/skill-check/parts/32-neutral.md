[ -x "$C" ] && { "$C" resolve "<hex>"; echo "exit=$?"; }
```

- **`$C` exit 3** — unregistered. Ask and `register` as that helper's header prescribes.
- **`$C` exit 0** — registered. Bare `register`. On both, act on any `collision=`.
- **`$C` exit 2, 4 or 5**, from either call — write nothing; report `checkout-registry=unread` and the reason `$C` gave. No `$C`: `helper-missing`.
