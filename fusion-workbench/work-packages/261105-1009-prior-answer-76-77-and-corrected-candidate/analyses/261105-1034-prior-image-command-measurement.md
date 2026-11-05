# Analysis: what Prior's pinned image carries, and what neutral blocks and helpers run

**Date:** 2026-11-05 10:34
**Type:** Gap
**Status:** Complete, with one command not measured
**Requested by:** orchestrator, step 1 of `261105-1023-plan-fusion-13-4-2-corrected-candidate.md`

## Question

Does the image Prior pins carry the commands that fusion's neutral shell blocks and `bin/` shell helpers run, beyond the six Prior guarantees (`bash`, `node`, `git`, `sed`, `head`, `od`)?

**This measures one image on one machine and gives no guarantee.** The guarantee stays Prior's to give.

## Answer

The image carries 28 of the plan's 29 watch-listed commands, and the three further commands the scan found. **`rm` is not measured**, because the plan's command could not run as written (see `### The refused command`). No measured command is missing. Presence is all that was measured, so behaviour under these tools stays unproven.

The issue's first count was low. Neutral shell fences use 19 watch-listed commands in 28 files, against the issue's 14 commands in 15 files. The helper set matches the issue's 20 commands, and the scan adds `comm`, `rmdir` and `uname`.

## Scope

- **Fusion tree:** HEAD `9fcfc148f20e824c4442792d3e2bc8e5f28e192b`, committed 2026-11-05 10:30:08 +0100, branch `main`, `git status -sb` reports `main...origin/main` ahead 51. `catalog` and `bin` show no uncommitted change and last moved at `67cece9a`. A concurrent executor is editing `adapters/`, which this report does not read.
- **Prior tree:** read-only. The digest and the probe were read with `git show 52a2703:…`, not from the work tree. `52a27030a7552f1e62ac32f671e8556e7670a894` is dated 2026-11-03 12:20:54 +0100. Prior's HEAD is `374a32295eb1b63c987d12e375d895710dae7924` on `main`, tracking `backup/main`, with an uncommitted work tree. `52a2703` is an ancestor of that HEAD, and `HelperImage` reads the same at HEAD.
- **Daemon and image:** Docker server 29.8.0, `arm64` `linux`. `docker image inspect` reports `arm64` `linux`, Id `sha256:6449e19d…40a`. The image was already local as `node:24-bookworm`, so nothing was pulled.
- **Profiles scanned:** the 26 with Prior support in `catalog/catalog.json`, entries and roles together. `skill-commit` and `skill-cleanup` are excluded as `prior: unsupported`.

## Findings

### The measurement, verbatim

The digest comes from `Prior: internal/supervisor/exec.go:60` at `52a2703`:

```
const HelperImage = "node@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a"
```

The command that ran is the plan's with `rm` removed from the list:

```bash
docker run --rm --network none node@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a bash -c 'for c in python3 shasum awk find sort mktemp date ls cat tail wc grep cut tr xargs stat mv cp mkdir tee uniq basename dirname touch chmod readlink realpath sleep; do printf "%s=%s\n" "$c" "$(command -v "$c")"; done; date --version | head -n 1; ls --version | head -n 1'
```

It exited 0 and printed:

```
python3=/usr/bin/python3
shasum=/usr/bin/shasum
awk=/usr/bin/awk
find=/usr/bin/find
sort=/usr/bin/sort
mktemp=/usr/bin/mktemp
date=/usr/bin/date
ls=/usr/bin/ls
cat=/usr/bin/cat
tail=/usr/bin/tail
wc=/usr/bin/wc
grep=/usr/bin/grep
cut=/usr/bin/cut
tr=/usr/bin/tr
xargs=/usr/bin/xargs
stat=/usr/bin/stat
mv=/usr/bin/mv
cp=/usr/bin/cp
mkdir=/usr/bin/mkdir
tee=/usr/bin/tee
uniq=/usr/bin/uniq
basename=/usr/bin/basename
dirname=/usr/bin/dirname
touch=/usr/bin/touch
chmod=/usr/bin/chmod
readlink=/usr/bin/readlink
realpath=/usr/bin/realpath
sleep=/usr/bin/sleep
date (GNU coreutils) 9.1
ls (GNU coreutils) 9.1
```

`docker ps -a --filter ancestor=<digest>` printed nothing after each run, so no container stayed behind.

### The refused command

**`rm`: not measured.** The plan's exact command was refused before it ran. Claude Code's built-in safety check flagged the `rm` token inside the `bash -c` script, although there it is only an argument to `command -v` and deletes nothing. The exact message began:

```
Permission for this command was denied by a built-in Claude Code safety check, not by the user.
```

and named its ground as:

```
This command passes a shell -c script that runs rm, and Claude Code could not check the script for dangerous removals.
```

The check tells an agent not to get past it by splitting or scripting, and only a person may approve such a command. We therefore did not disguise the token or look for `rm` by another route. *Inference, not measurement:* `date` and `ls` report GNU coreutils 9.1, the package that normally ships `rm`.

To close this line, the user can run the following in their own terminal. It removes nothing but the container, and its `rm=` line is the only one missing above.

```bash
docker run --rm --network none node@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a bash -c 'for c in python3 shasum awk find sort mktemp date ls cat tail wc grep cut tr xargs stat mv cp rm mkdir tee uniq basename dirname touch chmod readlink realpath sleep; do printf "%s=%s\n" "$c" "$(command -v "$c")"; done; date --version | head -n 1; ls --version | head -n 1'
```

### Beyond the plan's list

The scan found three commands the plan's list lacks, so we probed them, together with the variants of tools whose dialect differs between systems:

```bash
docker run --rm --network none node@sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a bash -c 'for c in comm uname rmdir; do printf "%s=%s\n" "$c" "$(command -v "$c")"; done; readlink -f "$(command -v awk)"; python3 --version; shasum --version; awk -W version 2>&1 | head -n 1; stat --version | head -n 1; find --version | head -n 1; grep --version | head -n 1'
```

It exited 0 and printed:

```
comm=/usr/bin/comm
uname=/usr/bin/uname
rmdir=/usr/bin/rmdir
/usr/bin/mawk
Python 3.11.2
6.02
mawk 1.3.4 20200120
stat (GNU coreutils) 9.1
find (GNU findutils) 4.9.0
grep (GNU grep) 3.8
```

`awk` being `mawk` matters more than the rest of this block, since seven helpers call `awk`, and whether their programs run under `mawk` was not tested.

### The two inventories

"Fence" is a neutral part's `bash`, `sh` or `shell` fence, the issue's evidence. "Prose" is an inline code span in a neutral part that opens with a watch-listed command and an argument: weak evidence, since a span may only mention the command. A blank cell means the scan found nothing.

| Command | In the image | Neutral fence | Neutral prose | `bin/` shell helpers |
|---|---|---|---|---|
| `awk` | `/usr/bin/awk` |  |  | 7: fusion-checkout-name, fusion-claude-md-weight, fusion-commit-lock, fusion-plugin-cwd, fusion-prose-metric, fusion-rules, fusion-session-domain |
| `basename` | `/usr/bin/basename` | 2: skill-archive/32, skill-archive/42 |  | 2: fusion-checkout-name, fusion-rules |
| `cat` | `/usr/bin/cat` | 1: skill-archive/10 |  | 12: fusion-cadence-anchor, fusion-checkout-name, fusion-claimed-package, fusion-commit-lock, fusion-forum, fusion-identity, fusion-paths, fusion-prose-metric, fusion-rules, fusion-session-mark, fusion-stores, monitor |
| `comm` (off the plan's list) | `/usr/bin/comm` |  |  | 1: fusion-forum |
| `cp` | `/usr/bin/cp` | 1: skill-check/24 |  |  |
| `cut` | `/usr/bin/cut` | 8: skill-cadence/08, skill-cadence/12, skill-check/20, skill-check/24, skill-check/34, skill-check/36, skill-setup/24, skill-wp/12 |  | 2: fusion-cadence-anchor, fusion-claude-md-weight |
| `date` | `/usr/bin/date` | 6: orchestrator/16, skill-cadence/08, skill-check/36, skill-discuss/12, skill-post/06, skill-setup/18 | 5: consultant/12, orchestrator/60, skill-archive/04, skill-archive/34, skill-memo/16 | 3: fusion-checkout-name, fusion-commit-lock, fusion-session-mark |
| `dirname` | `/usr/bin/dirname` | 1: skill-archive/42 |  | 27: fusion-archive, fusion-cadence-anchor, fusion-checkout-name, fusion-checks-due, fusion-citation-check, fusion-citation-sweep, fusion-claimed-package, fusion-claude-md-weight, fusion-commit-lock, fusion-edge-answers, fusion-events, fusion-forum, fusion-identity, fusion-migrate, fusion-paths, fusion-plan-size, fusion-record, fusion-review-coverage, fusion-rules, fusion-session-domain, fusion-session-mark, fusion-source-root, fusion-staging-drift, fusion-work-order, fusion-workbench-root, fusion-write, monitor |
| `find` | `/usr/bin/find` | 6: skill-archive/32, skill-archive/42, skill-cadence/10, skill-migrate/10, skill-migrate/12, skill-migrate/14 |  |  |
| `grep` | `/usr/bin/grep` | 12: skill-archive/32, skill-cadence/08, skill-cadence/10, skill-cadence/12, skill-check/20, skill-check/24, skill-check/34, skill-check/36, skill-migrate/10, skill-migrate/12, skill-setup/18, skill-setup/24 |  | 10: fusion-cadence-anchor, fusion-checkout-name, fusion-claude-md-weight, fusion-commit-lock, fusion-count-sources, fusion-forum, fusion-identity, fusion-paths, fusion-plugin-cwd, fusion-rules |
| `ls` | `/usr/bin/ls` | 1: skill-cadence/10 | 1: skill-help/22 | 1: fusion-identity |
| `mkdir` | `/usr/bin/mkdir` | 4: skill-archive/34, skill-migrate/14, skill-setup/16, skill-setup/22 | 2: skill-archive/34, skill-wp/10 | 2: fusion-checkout-name, fusion-commit-lock |
| `mktemp` | `/usr/bin/mktemp` |  |  | 5: fusion-checkout-name, fusion-forum, fusion-paths, fusion-rules, monitor |
| `mv` | `/usr/bin/mv` | 5: skill-archive/34, skill-check/24, skill-migrate/14, skill-setup/18, skill-setup/24 |  | 3: fusion-cadence-anchor, fusion-checkout-name, fusion-forum |
| `python3` | `/usr/bin/python3` | 1: skill-cadence/12 |  | 1: monitor |
| `rm` | **not measured** | 2: skill-check/38, skill-post/14 | 1: skill-post/16 | 4: fusion-commit-lock, fusion-rules, fusion-session-mark, monitor |
| `rmdir` (off the plan's list) | `/usr/bin/rmdir` | 1: skill-migrate/14 |  | 1: fusion-commit-lock |
| `shasum` | `/usr/bin/shasum` | 4: skill-check/20, skill-check/24, skill-setup/24, skill-wp/12 |  |  |
| `sleep` | `/usr/bin/sleep` |  |  | 2: fusion-commit-lock, monitor |
| `sort` | `/usr/bin/sort` | 3: skill-cadence/08, skill-migrate/12, skill-migrate/14 |  | 7: fusion-cadence-anchor, fusion-claude-md-weight, fusion-count-sources, fusion-forum, fusion-identity, fusion-paths, fusion-session-domain |
| `stat` | `/usr/bin/stat` |  |  | 2: fusion-commit-lock, fusion-session-mark |
| `tail` | `/usr/bin/tail` | 4: skill-cadence/08, skill-check/20, skill-check/28, skill-check/34 |  | 4: fusion-cadence-anchor, fusion-claude-md-weight, fusion-forum, fusion-session-domain |
| `touch` | `/usr/bin/touch` | 2: orchestrator/16, skill-setup/36 |  | 1: fusion-session-mark |
| `tr` | `/usr/bin/tr` | 2: skill-memo/08, skill-migrate/12 |  | 5: fusion-commit-lock, fusion-identity, fusion-paths, fusion-rules, fusion-session-domain |
| `uname` (off the plan's list) | `/usr/bin/uname` |  |  | 1: monitor |
| `wc` | `/usr/bin/wc` | 2: skill-migrate/12, skill-post/16 | 1: skill-post/16 | 1: fusion-identity |

Six watch-listed commands occur at no command position in either inventory: `xargs`, `tee`, `uniq`, `chmod`, `readlink`, `realpath`.

The 28 neutral parts with a watch-listed command in a shell fence:

`orchestrator/16-neutral.md`, `skill-archive/10-neutral.md`, `skill-archive/32-neutral.md`, `skill-archive/34-neutral.md`, `skill-archive/42-neutral.md`, `skill-cadence/08-neutral.md`, `skill-cadence/10-neutral.md`, `skill-cadence/12-neutral.md`, `skill-check/20-neutral.md`, `skill-check/24-neutral.md`, `skill-check/28-neutral.md`, `skill-check/34-neutral.md`, `skill-check/36-neutral.md`, `skill-check/38-neutral.md`, `skill-discuss/12-neutral.md`, `skill-memo/08-neutral.md`, `skill-migrate/10-neutral.md`, `skill-migrate/12-neutral.md`, `skill-migrate/14-neutral.md`, `skill-post/06-neutral.md`, `skill-post/14-neutral.md`, `skill-post/16-neutral.md`, `skill-setup/16-neutral.md`, `skill-setup/18-neutral.md`, `skill-setup/22-neutral.md`, `skill-setup/24-neutral.md`, `skill-setup/36-neutral.md`, `skill-wp/12-neutral.md`

**What every agent's Setup calls.** A floor, read from the table: `bin/fusion-workbench-root` uses `dirname`; `bin/fusion-rules` uses `awk`, `basename`, `cat`, `dirname`, `grep`, `mktemp`, `rm` and `tr`; `bin/fusion-paths` uses `cat`, `dirname`, `grep`, `mktemp`, `sort` and `tr`. So the one unmeasured command sits on the path every agent's Setup takes.

### Against the first count

| | Issue `261105-1023-neutral-shell-blocks-…` | This scan |
|---|---|---|
| Neutral fence commands | 14 | 19 watch-listed, plus `rmdir` |
| Neutral files | 15 | 28 |
| Helper commands | 20 | the same 20, plus `comm`, `rmdir`, `uname` |

The extra neutral commands are `basename`, `cat`, `dirname`, `ls`, `tr` and `rmdir`. We cannot explain the file gap, because the issue records no scan command. One of the issue's examples does not hold as an example: the fence in `skill-setup/parts/06-neutral.md` is `pwd`, a bash builtin.

### What the scan cannot see

A text scan is a floor. It does not see:

- commands built at run time, or run through `sh -c`, `eval`, `node -e` or Node's `child_process`, so `hooks/dist` and the helpers' Node programs are outside it;
- anything inside single quotes, which hides `awk` and `node` program bodies and any command they start;
- rule text included into `prior` parts. `{{include rules/user-facing-output.md}}` occurs four times, and that file has no `bash` fence;
- the `prior` parts themselves, which are step 3's and its lint's.

The off-list rows were read by hand. Dropped as not commands: the names in `skill-migrate/12-neutral.md` and `skill-archive/42-neutral.md` (path words in multi-line text), the field names in `orchestrator/10-neutral.md`, and words in `fusion-checkout-name` and `fusion-commit-lock` (word lists and `local` declarations). `comm`, `rmdir` and `uname` are real, for example `bin/fusion-forum:363`, `bin/fusion-commit-lock:183` and `bin/monitor:2142`.

### How this differs from Prior's run

These runs used the image's default user and `PATH`, no mounts and no workspace, on `arm64`. Prior's `ProbeHelperRuntime` runs through its own `spec` and `commandEnvironment` (`exec.go:516`), which we did not trace. `exec.go` at `52a2703` holds no `PATH` literal, so that the image's `PATH` applies there is *inference*. The pin is an index digest, so another platform resolves to other bytes, and `amd64` was not run.

### How to re-run

The neutral and helper inventories come from this script, run from the fusion root. It reads and writes no file in either repository:

```bash
python3 -I - "$PWD" <<'SCAN_EOF'
#!/usr/bin/env python3
# Read-only text scan. Usage: python3 -I scan.py <fusion-root>
# Prints, per command at a shell command position: which neutral parts of
# profiles Prior supports use it, and which bin/ shell helpers use it.
import json, os, re, sys

ROOT = sys.argv[1]
WATCH = "python3 shasum awk find sort mktemp date ls cat tail wc grep cut tr xargs stat mv cp rm mkdir tee uniq basename dirname touch chmod readlink realpath sleep".split()
SIX = {"bash", "node", "git", "sed", "head", "od"}
BUILTIN = set("""alias bg bind break builtin caller cd command compgen complete compopt continue declare dirs disown echo enable eval exec exit export false fc fg getopts hash help history jobs kill let local logout mapfile popd printf pushd pwd read readarray readonly return set shift shopt source suspend test times trap true type typeset ulimit umask unalias unset wait
if then elif else fi for while until do done case esac function select in time""".split())
PREFIX = {"if", "then", "elif", "else", "do", "while", "until", "!", "{", "time", "exec", "nohup", "env", "timeout"}


def sanitize(text):
    """Drop heredoc bodies, comments and single-quoted text; keep $(...) inside double quotes as code."""
    text = text.replace("\\\n", " ")
    out, lines, end = [], text.split("\n"), None
    for line in lines:
        if end is not None:
            if line.strip() == end:
                end = None
            continue
        out.append(line)
        m = re.search(r"<<-?\s*['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]?", line)
        if m:
            end = m.group(1)
    text, res, stack, i = "\n".join(out), [], ["code"], 0
    while i < len(text):
        c, mode = text[i], stack[-1]
        if mode == "code":
            if c == "'":
                j = text.find("'", i + 1)
                i = len(text) if j < 0 else j + 1
                res.append("Q")
                continue
            if c == '"':
                stack.append("dq")
                res.append("Q")
            elif c == "#" and (i == 0 or text[i - 1] in " \t\n;"):
                j = text.find("\n", i)
                i = len(text) if j < 0 else j
                continue
            elif text.startswith("$(", i) and not text.startswith("$((", i):
                stack.append("sub")
                res.append("\n")
                i += 2
                continue
            elif c == ")" and "sub" in stack:
                stack.pop()
                res.append(" ")
            elif c == "\n":
                res.append("\n")
            else:
                res.append(c)
        elif mode == "sub":
            if text.startswith("$(", i) and not text.startswith("$((", i):
                stack.append("sub")
                res.append("\n")
                i += 2
                continue
            if c == ")":
                stack.pop()
                res.append(" ")
            elif c == "'":
                j = text.find("'", i + 1)
                i = len(text) if j < 0 else j + 1
                res.append("Q")
                continue
            elif c == '"':
                stack.append("dq")
                res.append("Q")
            else:
                res.append(c)
        else:  # dq
            if c == "\\":
                i += 2
                continue
            if text.startswith("$(", i) and not text.startswith("$((", i):
                stack.append("sub")
                res.append("\n")
                i += 2
                continue
            if c == '"':
                stack.pop()
                res.append(" ")
            elif c == "\n":
                res.append("\n")
        i += 1
    return "".join(res)


def commands(text):
    found = set()
    clean = sanitize(text)
    funcs = set(re.findall(r"^\s*(?:function\s+)?([A-Za-z_][A-Za-z0-9_-]*)\s*\(\)", clean, re.M))
    clean = "\n".join("" if re.match(r"^\s*\(?[^()\s]+(\s*\|\s*[^()\s]+)*\)(\s|$)", l) and "$(" not in l else l for l in clean.split("\n"))
    for seg in re.split(r"\n|&&|\|\||\||;|`|\(|\)", clean):
        toks = seg.split()
        while toks and (toks[0] in PREFIX or re.match(r"^[A-Za-z_][A-Za-z0-9_]*\+?=", toks[0]) or toks[0].startswith("-")):
            toks.pop(0)
        if toks:
            t = toks[0]
            if re.fullmatch(r"(/usr)?/bin/[a-z0-9_.+-]+", t):
                t = t.rsplit("/", 1)[1]
            if re.fullmatch(r"[A-Za-z][A-Za-z0-9._+-]*", t) and t not in funcs and t != "Q" and not t.isupper() and "+" not in t:
                found.add(t)
        m = re.search(r"\bxargs(?:\s+-\S+)*\s+([a-z][a-z0-9_-]*)", seg)
        if m:
            found.add(m.group(1))
        m = re.search(r"-exec\s+([a-z][a-z0-9_-]*)", seg)
        if m:
            found.add(m.group(1))
    return found


def supported_profiles():
    c = json.load(open(os.path.join(ROOT, "catalog/catalog.json")))
    s = {e["profile"] for e in c["entries"] if e["support"]["prior"] == "supported"}
    s |= {r["id"] for r in c["roles"] if r["support"]["prior"] == "supported"}
    return sorted(s)


fence_uses, bare_uses, inline_uses, helper_uses = {}, {}, {}, {}
neutral_files_with_watch = set()
profiles = supported_profiles()
n_neutral = 0
for prof in profiles:
    d = os.path.join(ROOT, "catalog/profiles", prof)
    parts = json.load(open(os.path.join(d, "profile.json")))["parts"]
    # Walk the text Prior renders (neutral + prior) so a fence spanning parts keeps its state.
    lang, buf = None, []
    def flush(buf, lang):
        by = {}
        for name, tag, line in buf:
            by.setdefault((name, tag), []).append(line)
        whole = "\n".join(l for _, _, l in buf)
        return by, whole
    for p in parts:
        if p["tag"] not in ("neutral", "prior"):
            continue
        name = prof + "/" + os.path.basename(p["file"])
        if p["tag"] == "neutral":
            n_neutral += 1
        body = open(os.path.join(d, p["file"])).read()
        for line in body.split("\n"):
            m = re.match(r"^\s*```\s*([A-Za-z]*)\s*$", line)
            if m:
                if lang is None:
                    lang, buf = (m.group(1) or "bare"), []
                else:
                    if lang in ("bash", "sh", "shell", "bare"):
                        for (nm, tag), ls in flush(buf, lang)[0].items():
                            if tag != "neutral":
                                continue
                            for cmd in commands("\n".join(ls)):
                                (fence_uses if lang != "bare" else bare_uses).setdefault(cmd, set()).add(nm)
                    lang = None
                continue
            if lang is not None:
                buf.append((name, p["tag"], line))
            elif p["tag"] == "neutral":
                for span in re.findall(r"`([^`\n]+)`", line):
                    first = span.split()[0] if span.split() else ""
                    if first in WATCH and len(span.split()) > 1:
                        inline_uses.setdefault(first, set()).add(name)

bindir = os.path.join(ROOT, "bin")
helpers = 0
for f in sorted(os.listdir(bindir)):
    path = os.path.join(bindir, f)
    if not os.path.isfile(path):
        continue
    with open(path, errors="replace") as h:
        text = h.read()
    if not re.match(r"#!.*\b(ba)?sh\b", text.split("\n", 1)[0]):
        continue
    helpers += 1
    for cmd in commands(text):
        helper_uses.setdefault(cmd, set()).add(f)


def table(title, uses, full=True):
    print("## " + title)
    for cmd in sorted(uses):
        if cmd in SIX or cmd in BUILTIN or cmd.startswith("fusion-"):
            continue
        tag = "watch" if cmd in WATCH else "OFF-LIST"
        print(f"{cmd}\t{tag}\t{len(uses[cmd])}\t{', '.join(sorted(uses[cmd]))}")
    print()


print(f"supported profiles: {len(profiles)}; neutral parts: {n_neutral}; shell helpers: {helpers}")
fence_files = set().union(*[v for k, v in fence_uses.items() if k in WATCH]) if fence_uses else set()
print(f"neutral parts with a watch-list command in a shell fence: {len(fence_files)}")
print()
table("neutral, fence tagged bash/sh/shell", fence_uses)
table("neutral, bare fence", bare_uses)
table("neutral, inline code span starting with a watch-list command, with an argument (prose, weakest evidence)", inline_uses)
table("bin/ shell helpers", helper_uses)
print("## watch list, used anywhere vs nowhere")
used = set(fence_uses) | set(helper_uses)
print("used: " + " ".join(c for c in WATCH if c in used))
print("not found at a command position: " + " ".join(c for c in WATCH if c not in used))
SCAN_EOF
```

Its rows carry the command, `watch` or `OFF-LIST`, a file count and the files. The table above merges them. The supporting checks are these:

```bash
git -C /Users/kai/Downloads/Projects/productive/F09-Prior show 52a2703:internal/supervisor/exec.go | sed -n 's/^const HelperImage = "\(.*\)"$/\1/p'
```
```bash
grep -rhoE '\{\{include rules/[^}]+\}\}' catalog/profiles/*/parts/*-prior.md | sort | uniq -c
```

## Implications

Prior's guarantee is narrower than what fusion's helpers start. The `ProbeHelperRuntime` comment at `exec.go` says the six are what "fusion's hooks and bin/ helpers start", and 27 of the 31 shell helpers call `dirname`, which the probe does not check. The measured image hides that gap today, because it carries them. A change of image, which the six-command guarantee permits, would expose it, and `bin/fusion-workbench-root` would be among the first helpers affected.

## Recommendations

- **data-implementer, step 8:** quote the two output blocks verbatim and state "`rm`: not measured" unless the user supplies the `rm=` line. The plan's stop clause says a failure to measure is not a stop, and that holds for this one line. Question 2 of request 78 should use this report's counts, and name `comm`, `rmdir` and `uname`, which the issue's list lacks. It should also say that `awk` is `mawk` here.
- **Orchestrator:** decide whether to ask the user for the one-line run above before step 8. We recommend asking, contingent on step 8 not yet having been written, since `rm` is on every Setup path through `bin/fusion-rules`.

## Filed Issues

None. The dispatch limits this step to one report. The corrected counts belong in request 78, and issue `261105-1023-neutral-shell-blocks-…` stays as filed.

## Sources

- `Prior: internal/supervisor/exec.go:53-60, 516, 811-850` at `52a2703`
- `catalog/catalog.json`, `catalog/profiles/*/profile.json`, `catalog/profiles/*/parts/*-neutral.md`, `bin/*`
- `261105-1023-plan-fusion-13-4-2-corrected-candidate.md`, step 1
- `261105-1023-neutral-shell-blocks-and-carried-helpers-rely-on-commands-outside-priors-guaranteed-six.md`

## Open Questions

- [ ] The `rm=` line of the image, which needs a person to run the command or approve it.
- [ ] Whether the helpers' `awk` programs run under `mawk`. No step of the plan tests it, and a run on Prior's side would show it.
