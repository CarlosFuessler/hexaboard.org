#!/bin/sh
# HexaTUI installer: downloads the prebuilt binary for this platform.
#
#   curl -fsSL https://hexaboard.org/install.sh | sh
set -e

BASE="${HEXABOARD_BASE:-https://hexaboard.org}"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS" in
  darwin | linux) ;;
  *) echo "hexatui: unsupported OS '$OS' (supported: darwin, linux)" >&2; exit 1 ;;
esac

ARCH=$(uname -m)
case "$ARCH" in
  x86_64 | amd64) ARCH=amd64 ;;
  arm64 | aarch64) ARCH=arm64 ;;
  *) echo "hexatui: unsupported architecture '$ARCH'" >&2; exit 1 ;;
esac

URL="$BASE/bin/hexatui-$OS-$ARCH.gz"
echo "downloading $URL ..."
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fSsL "$URL" -o "$TMP/hexatui.gz"
gunzip -f "$TMP/hexatui.gz"
chmod +x "$TMP/hexatui"

DEST="$HOME/.local/bin"
mkdir -p "$DEST"
mv "$TMP/hexatui" "$DEST/hexatui"

echo "installed: $DEST/hexatui"
case ":$PATH:" in
  *":$DEST:"*) ;;
  *) echo "note: add $DEST to your PATH (e.g. add it to ~/.zshrc):"
     echo "      export PATH=\"\$HOME/.local/bin:\$PATH\"" ;;
esac
echo "run it: hexatui   (fetches live content from hexaboard.org)"
