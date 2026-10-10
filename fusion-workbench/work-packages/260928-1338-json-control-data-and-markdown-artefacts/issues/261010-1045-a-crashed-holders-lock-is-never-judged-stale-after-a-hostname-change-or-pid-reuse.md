A crashed holder's lock is never judged stale after a hostname change or PID reuse
---
**Severity:** Low. Every mutation then answers `conflict/lock-timeout` after 65 s until someone deletes the lock by hand, and the README names no such cause.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `codec/src/store.ts` `judge`:

```ts
if (host !== undefined && host !== hostname()) return { state: "live", bytes };
```

`.json-state/` never travels (class L), so a "foreign host" lock is in practice this machine under another `os.hostname()`; macOS can change it with the network. A reused PID of a dead holder likewise keeps the lock `live` for as long as the unrelated process runs. `codec/README.md` documents hand removal for a foreign-host lock but not these causes.

**Evidence.** Read at 468d8e87; the hostname case is inference, not reproduced.

**Acceptance test.** Either the lock records a stronger holder identity (boot id or process start time) checked in `judge`, or `codec/README.md`'s lock section and the `lock-timeout` detail name the hostname-change and PID-reuse cases and the safe manual recovery.
