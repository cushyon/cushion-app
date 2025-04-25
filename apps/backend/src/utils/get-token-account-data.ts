import { PublicKey } from "@solana/web3.js";
import { getTokenAccountBalance } from "./get-token-account-balance";
import { getTokenAccount } from "./get-token-account";

export const getTokenAccountData = async (
  tokenMint: string,
  publicKey: string
) => {
  const tokenAccount = await getTokenAccount(
    new PublicKey(tokenMint),
    new PublicKey(publicKey)
  );

  const tokenAccountBalance = await getTokenAccountBalance(
    tokenAccount.toString()
  );

  return tokenAccountBalance;
};
