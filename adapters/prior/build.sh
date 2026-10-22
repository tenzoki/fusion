#!/bin/sh
# build.sh: the reproducible build of fusion's Prior module bundle, its
# verification against Prior's own inspector, and its delivery (plan step 8;
# Prior answers 67.4, 67.8, 67.9).
#
#   build.sh build [<out>]   render the catalog, build the three targets in a
#                            staged Prior clone, assemble the payload, write
#                            the tarball, its sha256 sidecar and handover.json
#                            into <out> (default: a fresh directory under
#                            TMPDIR); print the bundle digest
#   build.sh verify <out>    run Prior's InspectBundle and ExtractBundleArchive
#                            from the staged clone over <out>'s payload and
#                            tarball and compare with handover.json
#   build.sh deliver         build, verify, then copy the tarball, the sidecar
#                            and handover.json to
#                            ~/.local/share/prior/incoming/fusion/<version>/<digest-hex>/
#                            and print that absolute path
#
# <out> must be outside both repositories and empty or absent. The build
# refuses a dirty fusion tree: any modified, deleted or untracked path outside
# fusion-workbench/, whose event log and record files a live session keeps
# modified, and any git-ignored path under adapters/prior/fusionmodule/ or
# adapters/prior/launcher/ (a .DS_Store, an editor swap file), because
# build-identity.json inventories every file there and an ignored one would
# move the digest of a build that reports a clean revision.
# FUSION_BUILD_ALLOW_DIRTY=1 overrides the refusal and marks the fusion
# revision `<sha>+dirty` in build-identity.json and handover.json, so such a
# build never passes as one from a revision.
#
# Every Go command runs through stage.sh in a disposable clone of Prior at
# PRIOR_PIN: the assembler cmd/fusion-bundle is built natively there and runs
# the three target builds in Prior's exact form (see its header). Nothing is
# written into either repository.
#
# Environment: PRIOR_REPO (required; the Prior repository to clone, with no
# default: unset, the script prints its usage and exits 2) and TMPDIR as
# stage.sh reads them; FUSION_BUILD_KEEP=1 keeps the render work directory and
# prints its path.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
fusion_root=$(cd "$here/../.." && pwd)
catalog_dir="$fusion_root/catalog"
pin=$(tr -d '[:space:]' < "$here/PRIOR_PIN")
prior_repo=${PRIOR_REPO:-}

usage() {
  echo "usage: PRIOR_REPO=<prior-repository> build.sh build [<out>] | build.sh verify <out> | build.sh deliver" >&2
  exit 2
}

if [ -z "$prior_repo" ]; then
  echo "build.sh: PRIOR_REPO is not set; it names the Prior repository to clone" >&2
  usage
fi

die() {
  echo "build.sh: $*" >&2
  exit 1
}

# outside_repos <dir>: refuse a directory inside the fusion checkout or the
# Prior repository, after resolving symlinks on both sides.
outside_repos() {
  target=$(cd "$1" && pwd -P)
  for repo in "$fusion_root" "$prior_repo"; do
    resolved=$(cd "$repo" && pwd -P)
    case "$target/" in
      "$resolved"/*) die "$1 lies inside $repo; build outside both repositories" ;;
    esac
  done
}

# fusion_revision: HEAD, suffixed +dirty under the override, refused otherwise.
# Dirt is a tracked-tree change outside fusion-workbench/ or an ignored path
# (`!!`) under the two directories build-identity.json inventories; the
# identity itself is unchanged, only the guard sees the ignored files too.
fusion_revision() {
  head=$(git -C "$fusion_root" rev-parse HEAD)
  changed=$(git -C "$fusion_root" status --porcelain --untracked-files=all -- . ':(exclude)fusion-workbench')
  ignored=$(git -C "$fusion_root" status --porcelain --ignored --untracked-files=all -- adapters/prior/fusionmodule adapters/prior/launcher | grep '^!! ' || true)
  dirty=$(printf '%s\n%s\n' "$changed" "$ignored" | sed '/^$/d')
  if [ -n "$dirty" ]; then
    if [ "${FUSION_BUILD_ALLOW_DIRTY:-0}" = "1" ]; then
      echo "build.sh: fusion tree is dirty outside fusion-workbench/; building $head+dirty under FUSION_BUILD_ALLOW_DIRTY=1" >&2
      echo "$dirty" | sed 's/^/build.sh:   /' >&2
      head="$head+dirty"
    else
      echo "build.sh: fusion tree is dirty outside fusion-workbench/:" >&2
      echo "$dirty" | sed 's/^/  /' >&2
      die "commit or discard first (FUSION_BUILD_ALLOW_DIRTY=1 builds a +dirty identity)"
    fi
  fi
  echo "$head"
}

# field <out> <key>: one top-level string field of handover.json.
field() {
  sed -n "s/^  \"$2\": \"\\([^\"]*\\)\",*\$/\\1/p" "$1/handover.json" | head -n 1
}

build() {
  out=$1
  if [ -e "$out" ]; then
    [ -d "$out" ] || die "$out exists and is not a directory"
    [ -z "$(ls -A "$out")" ] || die "$out is not empty"
  else
    mkdir -p "$out"
  fi
  out=$(cd "$out" && pwd -P)
  outside_repos "$out"
  [ -d "$catalog_dir/node_modules" ] || die "$catalog_dir/node_modules is missing; run: cd catalog && npm ci"
  revision=$(fusion_revision)

  work=$(mktemp -d "${TMPDIR:-/tmp}/fusion-bundle-work.XXXXXX")
  cleanup() {
    if [ "${FUSION_BUILD_KEEP:-0}" = "1" ]; then
      echo "build.sh: work directory kept at $work"
    else
      rm -rf "$work"
    fi
  }
  trap cleanup EXIT

  render_cmd="cd catalog && npm run --silent render -- prior <work>/rendered"
  echo "build.sh: $render_cmd"
  (cd "$catalog_dir" && npm run --silent render -- prior "$work/rendered")

  stage_cmd="adapters/prior/stage.sh run -- adapters/prior/build.sh _staged <out> <work>/rendered <fusion-revision>"
  echo "build.sh: $stage_cmd"
  # Captured, then shown: a pipe into tee would hide the stage's exit code.
  "$here/stage.sh" run -- "$here/build.sh" _staged "$out" "$work/rendered" "$revision" "$render_cmd" "$stage_cmd" > "$work/assemble.out"
  cat "$work/assemble.out"
  digest=$(awk '$1 == "bundle_digest" { print $2 }' "$work/assemble.out")
  [ -n "$digest" ] || die "the assembler printed no bundle digest"
  echo "build.sh: bundle digest $digest"
  echo "build.sh: output at $out"
}

# _staged runs inside stage.sh's clone, from its root: the assembler is built
# natively, then run with the paths the outer command resolved.
staged() {
  [ -n "${FUSION_STAGE_CLONE:-}" ] || die "_staged runs only under stage.sh run"
  out=$1; rendered=$2; revision=$3; render_cmd=$4; stage_cmd=$5
  tools=$(mktemp -d "${TMPDIR:-/tmp}/fusion-bundle-tools.XXXXXX")
  trap 'rm -rf "$tools"' EXIT
  go build -o "$tools/fusion-bundle" ./integrationbuild/fusionmodule/cmd/fusion-bundle
  "$tools/fusion-bundle" -out "$out" -clone "$FUSION_STAGE_CLONE" -fusion-root "$fusion_root" -rendered "$rendered" -launcher "$here/launcher/fusion-module.sh" -adapter "$here" -fusion-revision "$revision" -prior-revision "$pin" -command "$render_cmd" -command "$stage_cmd"
}

verify() {
  out=$(cd "$1" && pwd -P)
  [ -f "$out/handover.json" ] || die "$out has no handover.json"
  "$here/stage.sh" run -- "$here/build.sh" _verify "$out"
}

# _verify runs inside the clone: a throwaway probe package written into the
# clone's integrationbuild/ (never into adapters/prior/, whose sources may not
# import Prior's internal packages) inspects the payload with Prior's own
# InspectBundle, extracts the tarball with Prior's ExtractBundleArchive and
# inspects that too, and compares both identities with handover.json.
staged_verify() {
  [ -n "${FUSION_STAGE_CLONE:-}" ] || die "_verify runs only under stage.sh run"
  out=$1
  probe="$FUSION_STAGE_CLONE/integrationbuild/inspectprobe"
  mkdir -p "$probe"
  cat > "$probe/main.go" <<'EOF'
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/kai/prior/internal/module"
	api "github.com/kai/prior/moduleapi/v1"
)

func main() {
	out := os.Args[1]
	body, err := os.ReadFile(filepath.Join(out, "handover.json"))
	fail(err)
	var h struct {
		ModuleID     string `json:"module_id"`
		Version      string `json:"version"`
		BundleDigest string `json:"bundle_digest"`
		Tarball      string `json:"tarball"`
	}
	fail(json.Unmarshal(body, &h))
	expected := api.Identity{ModuleID: h.ModuleID, Version: h.Version, BundleDigest: h.BundleDigest}
	ctx := context.Background()
	fromDir, err := module.InspectBundle(ctx, filepath.Join(out, "payload"), "module.json")
	fail(err)
	report("payload", fromDir, expected)
	extracted, err := os.MkdirTemp("", "fusion-bundle-verify-")
	fail(err)
	defer os.RemoveAll(extracted)
	fail(module.ExtractBundleArchive(ctx, filepath.Join(out, h.Tarball), extracted, module.ArchiveLimits{MaxBytes: 512 << 20, MaxEntries: 16384}))
	fromTar, err := module.InspectBundle(ctx, extracted, "module.json")
	fail(err)
	report("tarball", fromTar, expected)
	fmt.Printf("verify: ok, %d files, executable %s, %d data files\n", len(fromTar.Index.Files), fromTar.Manifest.Executable, len(fromTar.Manifest.Data))
}

func report(source string, b module.Bundle, expected api.Identity) {
	id, _ := json.Marshal(b.Identity)
	fmt.Printf("verify: %s identity %s\n", source, id)
	if b.Identity != expected {
		fmt.Fprintf(os.Stderr, "verify: %s identity differs from handover.json %+v\n", source, expected)
		os.Exit(1)
	}
}

func fail(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "verify:", err)
		os.Exit(1)
	}
}
EOF
  go run ./integrationbuild/inspectprobe "$out"
}

deliver() {
  out=$(mktemp -d "${TMPDIR:-/tmp}/fusion-bundle.XXXXXX")
  build "$out"
  verify "$out"
  version=$(field "$out" version)
  digest=$(field "$out" bundle_digest)
  tarball=$(field "$out" tarball)
  [ -n "$version" ] && [ -n "$digest" ] && [ -n "$tarball" ] || die "handover.json lacks version, bundle_digest or tarball"
  dest="$HOME/.local/share/prior/incoming/fusion/$version/${digest#sha256:}"
  mkdir -p "$dest"
  for name in "$tarball" "$tarball.sha256" handover.json; do
    if [ -e "$dest/$name" ]; then
      cmp -s "$out/$name" "$dest/$name" || die "$dest/$name exists with different bytes"
    else
      cp "$out/$name" "$dest/$name"
      chmod 0444 "$dest/$name"
    fi
  done
  echo "$dest"
}

[ $# -ge 1 ] || usage
command=$1
shift
case "$command" in
  build)
    [ $# -le 1 ] || usage
    build "${1:-$(mktemp -d "${TMPDIR:-/tmp}/fusion-bundle.XXXXXX")}"
    ;;
  verify)
    [ $# -eq 1 ] || usage
    verify "$1"
    ;;
  deliver)
    [ $# -eq 0 ] || usage
    deliver
    ;;
  _staged)
    [ $# -eq 5 ] || usage
    staged "$@"
    ;;
  _verify)
    [ $# -eq 1 ] || usage
    staged_verify "$1"
    ;;
  *) usage ;;
esac
