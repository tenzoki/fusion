| `commit` | **Machine-written** (`fusion-commit-lock with`, on a landed HEAD) | Short hash, message summary |
| `campaign_read` | **Machine-written** (`bin/fusion-campaign sync`, once per campaign read at the fetch after each commit) | Campaign id, its state and the `sha256:` revision of the file read, as `campaign`, `state`, `revision`; `detail` = `<id> <state> <first 12 hex>` |
