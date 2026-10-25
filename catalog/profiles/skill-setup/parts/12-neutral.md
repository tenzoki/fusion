```

- **`LEGACY-STORES`**, `OLD=1` — say the line to the user once, in the chat language, and **stop Setup here, creating nothing**.
- **`OLD=0`** — nothing out of format here. Continue with the `mkdir` below. Say nothing about it.

Only when `OLD=0`, create the workbench directory alone and let the codec decide what it is. This is the only `initialize` sent anywhere, and it comes before any other write:

```bash
