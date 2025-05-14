#!/usr/bin/env bash
set -euo pipefail

# 1) Reconstruit le fichier wallet
echo "$WALLET_JSON" > /tmp/wallet.json
export ANCHOR_WALLET=/tmp/wallet.json

# 2) Lance votre service (envMode loose pour garder les variables)
exec pnpm turbo run backend:start --env-mode=loose
