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
  // const { driftClient, user } = await initDrift();
  const newWallet = createThrowawayIWallet(depositorWallet);

  const driftVaultsProgram = getDriftVaultProgram(
    driftClient.connection,
    newWallet
  );

  // console.log("driftVaultsProgram", driftVaultsProgram);

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

  // console.log("vaultDepositorPubkey", vaultDepositorPubkey);

  const vaultAccount = new VaultAccount(
    driftVaultsProgram,
    new PublicKey("FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"),
    bulkAccountLoader
  );

  await vaultAccount.subscribe();

  const vaultAccountData = vaultAccount.getData();

  // console.log("vaultAccountData", vaultAccountData);
  console.log(
    "vaultAccountData.totalShares",
    vaultAccountData.totalShares.toString()
  );
  const vaultShares = vaultAccountData.totalShares;

  const vaultDepositorAccount = new VaultDepositorAccount(
    driftVaultsProgram,
    vaultDepositorPubkey,
    bulkAccountLoader
  );

  await vaultDepositorAccount.subscribe();

  console.log("vaultDepositorAccount", vaultDepositorAccount);

  const vaultProgramId = VAULT_PROGRAM_ID;
  // console.log("vaultProgramId", vaultProgramId);

  const vaultDepositorAccountData = vaultDepositorAccount.getData();

  // console.log("vaultDepositorAccountData", vaultDepositorAccountData);

  console.log(
    "vault depositor net deposit",
    vaultDepositorAccountData.netDeposits.toString()
  );

  console.log(
    "vaultDepositorAccountData shares",
    vaultDepositorAccountData.vaultShares.toString()
  );
  const depositorShares = vaultDepositorAccountData.vaultShares;

  // const percentageOfShares = (depositorShares / vaultShares) * 100;

  // console.log("percentageOfShares", percentageOfShares.toString());

  console.log("PERCENTAGE_PRECISION", PERCENTAGE_PRECISION.toString());
  console.log("PERCENTAGE_PRECISION_EXP", PERCENTAGE_PRECISION_EXP.toString());

  const userVaultSharesPct = depositorShares
    .mul(PERCENTAGE_PRECISION)
    .div(vaultShares);

  console.log("userVaultSharesPct", userVaultSharesPct.toString());

  const res = BigNum.from(userVaultSharesPct, PERCENTAGE_PRECISION_EXP).mul(
    HUNDRED
  );

  console.log("res", res.toNum());

  return vaultDepositorAccount;
};
