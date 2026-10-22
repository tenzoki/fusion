#!/bin/sh
# stage.sh: run a Go command over the adapter sources inside a disposable clone
# of Prior at PRIOR_PIN (Prior answer 67.4, route a).
#
# The adapter under fusionmodule/ has no go.mod and compiles nowhere in fusion's
# tree. This script clones Prior's local repository at the pinned revision into
# a fresh scratch directory, copies fusionmodule/ to
# integrationbuild/fusionmodule/ there, runs `go mod download` once, and runs
# the requested command from the clone's root against Prior's own go.mod and
# its moduleapi/v1. Nothing is committed to Prior, nothing is written into the
# Prior checkout, and no replace, go.work, nested module or vendored copy is
# created anywhere.
#
#   stage.sh test                 go vet and go test over ./integrationbuild/fusionmodule/...
#   stage.sh run -- <command...>  run <command...> from the clone root, same environment
#
# Environment:
#   PRIOR_REPO          the Prior repository to clone; required, with no default
#                       (unset, the script prints its usage and exits 2). Never
#                       baked into a shipped artefact: the clone is a build input
#   FUSION_STAGE_KEEP   when set to 1, the clone is kept and its path printed
#   FUSION_BUNDLE_DIR   passed through to the tests (plan step 9's conformance)
#   TMPDIR              where the scratch clone is created (mktemp -d)
#
# Printed on every run: the clone's `git rev-parse HEAD`, which must equal
# PRIOR_PIN, and the Go version the command ran with.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
pin=$(tr -d '[:space:]' < "$here/PRIOR_PIN")
prior_repo=${PRIOR_REPO:-}
catalog_dir=$(cd "$here/../../catalog" && pwd)

usage() {
  echo "usage: PRIOR_REPO=<prior-repository> stage.sh test | stage.sh run -- <command...>" >&2
  exit 2
}

if [ -z "$prior_repo" ]; then
  echo "stage.sh: PRIOR_REPO is not set; it names the Prior repository to clone" >&2
  usage
fi

[ $# -ge 1 ] || usage
command=$1
shift
case "$command" in
  test) [ $# -eq 0 ] || usage ;;
  run) [ $# -ge 2 ] && [ "$1" = "--" ] || usage; shift ;;
  *) usage ;;
esac

if [ ! -d "$prior_repo/.git" ]; then
  echo "stage.sh: PRIOR_REPO is not a git repository: $prior_repo" >&2
  exit 1
fi
case "$pin" in
  *[!0-9a-f]*|"") echo "stage.sh: PRIOR_PIN is not a hex revision: '$pin'" >&2; exit 1 ;;
esac

clone=$(mktemp -d "${TMPDIR:-/tmp}/fusion-prior-stage.XXXXXX")
cleanup() {
  if [ "${FUSION_STAGE_KEEP:-0}" = "1" ]; then
    echo "stage.sh: clone kept at $clone"
  else
    rm -rf "$clone"
  fi
}
trap cleanup EXIT

git clone --quiet --no-checkout "$prior_repo" "$clone"
git -C "$clone" checkout --quiet --detach "$pin"
head=$(git -C "$clone" rev-parse HEAD)
echo "stage.sh: prior clone at $head"
case "$head" in
  "$pin"*) ;;
  *) echo "stage.sh: clone HEAD $head is not PRIOR_PIN $pin" >&2; exit 1 ;;
esac
if [ -n "$(git -C "$clone" status --porcelain)" ]; then
  echo "stage.sh: clone is not clean" >&2
  exit 1
fi

mkdir -p "$clone/integrationbuild"
cp -R "$here/fusionmodule" "$clone/integrationbuild/fusionmodule"
if find "$clone/integrationbuild" \( -name go.mod -o -name go.work \) | grep -q .; then
  echo "stage.sh: a go.mod or go.work is staged; the adapter must build against Prior's root module" >&2
  exit 1
fi

export GOWORK=off
export GOTOOLCHAIN=local
export GOFLAGS=-mod=readonly
export FUSION_CATALOG_DIR="$catalog_dir"
export FUSION_STAGE_CLONE="$clone"

cd "$clone"
echo "stage.sh: $(go version)"
go mod download

case "$command" in
  test)
    go vet ./integrationbuild/fusionmodule/...
    go test ./integrationbuild/fusionmodule/...
    ;;
  run)
    "$@"
    ;;
esac
