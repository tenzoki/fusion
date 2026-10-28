Tests that execute shipped setup and migrate blocks still pass the real HOME
---
`hooks/lib/__tests__/store-name-migration.test.ts:21` (`ENV = { ...process.env, … }`) and `:125` (`FRESH_ENV`, `HOME: process.env.HOME`) run lifted skill blocks under the machine's own HOME. That is how one step-7 run wrote the real `~/.fusion-tmp` (a `98fc420e` directory whose `.origin` names a `store-name-` temp root still stands there). Step 0t is safe today only because it sits under its own heading, which `extractBashBlock` for "Write the setup marker" does not reach; nothing pins that.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: both env objects set `HOME` to a scratch directory, and a check in that file asserts that no lifted block names `bin/fusion-tmp` (or that the scratch HOME, not the real one, gained `.fusion-tmp`).
