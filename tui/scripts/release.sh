#!/bin/sh
# Builds compressed hexatui binaries for every supported platform into
# public/bin/, ready to be served by the website.
set -e
cd "$(dirname "$0")/.."

OUT="../public/bin"
mkdir -p "$OUT"

for target in darwin/arm64 darwin/amd64 linux/amd64 linux/arm64; do
  os=${target%/*}
  arch=${target#*/}
  echo "building hexatui-$os-$arch..."
  CGO_ENABLED=0 GOOS=$os GOARCH=$arch go build -trimpath -ldflags="-s -w" \
    -o "$OUT/hexatui-$os-$arch" .
  gzip -9f "$OUT/hexatui-$os-$arch"
done

ls -la "$OUT"
