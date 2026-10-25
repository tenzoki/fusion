  ```

This selector does nothing about a leftover `fusion-guard.json`, nor about a retired key inside `fusion.json`. Naming either is the configuration loader's job, which does it once per guarded tool call until the file or the key is deleted. Do not read the old file here, and do not offer to move anything out of it.

