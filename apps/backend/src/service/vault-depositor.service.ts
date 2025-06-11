import {
  DriftVaults,
  getDriftVaultProgram,
  IDL,
  VaultAccount,
  VaultClient,
  VaultDepositorAccount,
} from "@drift-labs/vaults-sdk";
import { initDrift } from "@src/utils/init-drift";
import { VAULT_PROGRAM_ID } from "@drift-labs/vaults-sdk";
import {
  AnchorProvider,
  Program,
  Wallet as AnchorWallet,
} from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {
  BN,
  BigNum,
  DriftClient,
  BulkAccountLoader,
  PERCENTAGE_PRECISION,
  PERCENTAGE_PRECISION_EXP,
} from "@drift-labs/sdk";
import { createThrowawayIWallet } from "@src/utils/create-iwallet";

const HUNDRED = new BN(100);

export function getVaultDepositorAddressSync(
  programId: PublicKey,
  vault: PublicKey,
  authority: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("vault_depositor")),
      vault.toBuffer(),
      authority.toBuffer(),
    ],
    programId
  )[0];
}

export const initVaultDepositor = async ({
  driftClient,
  vaultDepositorAddress,
}: {
  driftClient: DriftClient;
  vaultDepositorAddress: PublicKey;
}) => {
  console.log("Entering initVaultDepositor");
  const depositorWallet = new PublicKey(
    "4aXMMBox8pxMFABgVBg2MCxbFEcgm8cguFA5KRCFA6qf"
  );
  const newWallet = createThrowawayIWallet(depositorWallet);

  const driftVaultsProgram = getDriftVaultProgram(
    driftClient.connection,
    newWallet
  );

  const bulkAccountLoader = new BulkAccountLoader(
    driftClient.connection,
    "confirmed",
    1000
  );

  const vaultDepositorPubkey = VaultDepositorAccount.getAddressSync(
    VAULT_PROGRAM_ID,
    new PublicKey("FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"),
    new PublicKey("4aXMMBox8pxMFABgVBg2MCxbFEcgm8cguFA5KRCFA6qf")
  );

  const vaultAccount = new VaultAccount(
    driftVaultsProgram,
    new PublicKey("FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"),
    bulkAccountLoader
  );

  await vaultAccount.subscribe();

  const vaultAccountData = vaultAccount.getData();

  const vaultShares = vaultAccountData.totalShares;

  const vaultDepositorAccount = new VaultDepositorAccount(
    driftVaultsProgram,
    vaultDepositorPubkey,
    bulkAccountLoader
  );

  await vaultDepositorAccount.subscribe();

  const vaultDepositorAccountData = vaultDepositorAccount.getData();

  const depositorShares = vaultDepositorAccountData.vaultShares;

  const userVaultSharesPct = depositorShares
    .mul(PERCENTAGE_PRECISION)
    .div(vaultShares);

  const res = BigNum.from(userVaultSharesPct, PERCENTAGE_PRECISION_EXP).mul(
    HUNDRED
  );

  console.log("res", res.toNum());

  return { vaultDepositorAccount, depositorShares: res.toNum() };
};
