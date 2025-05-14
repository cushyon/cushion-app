#!/usr/bin/env bash
set -euo pipefail

# Load .env if local execution, not .env on Railway
if [[ -f .env ]]; then
  set -a                     # exporte all read variables
  source .env
  set +a
fi

# 1) Reconstruit le fichier wallet
echo "$WALLET_JSON" > /tmp/wallet.json
export ANCHOR_WALLET=/tmp/wallet.json

# 2) Lance votre service (envMode loose pour garder les variables)
exec pnpm turbo run start --filter=backend --env-mode=loose

