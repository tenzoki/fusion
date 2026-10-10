Containment is lexical, so a symlinked store sends codec writes outside the workbench and list never sees them
---
**Severity:** Medium. A record can be written outside the root and then be invisible to `list` and id resolution while `show` by path still reads it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `resolveInside` (`codec/src/store.ts`) resolves and compares lexically and never takes a realpath, although the module header says it "refuses one that leaves the root". `controlFiles` (`store.ts`) walks only `Dirent.isDirectory()`/`isFile()`, so it does not follow a link. Only the archive boundary (`archived`, `store.ts`) uses realpaths. Reads by path follow links and the walk does not, so the two disagree.

**Evidence.** Run against `codec/dist/fusion-record.js` at 468d8e87 on a scratch workbench with `shared/issues` a symlink to a directory outside the root: `create` answered `ok:true` and wrote `261010-1200-q.record.json` outside the workbench; `list` did not show it, `show` by path read it.

**Acceptance test.** For every read and write, the realpath of the deepest existing ancestor must lie under the root's realpath, or the request is refused with a typed `path-outside-workbench`. The walk and path-addressed reads treat links the same way (both refuse or both follow). A fixture pins the symlinked-store case.
