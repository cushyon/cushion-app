import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export async function getTokenAccount(
  mintAddress: PublicKey,
  userPublicKey: PublicKey
) {
  const ata = await getAssociatedTokenAddress(
    mintAddress,
    userPublicKey,
    false
  );

  console.log("Associated Token Account:", ata.toBase58());
  return ata;
}
