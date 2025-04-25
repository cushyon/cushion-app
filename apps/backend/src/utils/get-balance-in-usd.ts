import { PublicKey } from "@solana/web3.js";
import { getAmountInUSD } from "./rebalance";
import { getBalance } from "./rebalance";

import { SOL } from "./rebalance";
import { getTokenAccountBalance } from "./get-token-account-balance";
import { getTokenAccount } from "./get-token-account";

export const getCurrentBalanceInUSD = async (
  tokenMint: string,
  publicKey: string
) => {
  if (tokenMint === SOL) {
    const balance1 = await getBalance(publicKey);

    const amountAsset1InUSd = await getAmountInUSD(tokenMint, balance1);
    return amountAsset1InUSd;
  } else {
    const tokenAccount = await getTokenAccount(
      new PublicKey(tokenMint),
      new PublicKey(publicKey)
    );

    const tokenAccountBalance = await getTokenAccountBalance(
      tokenAccount.toString()
    );

    const amountAsset2 = Number(tokenAccountBalance.result.value.amount);
    const asset2Decimals = Number(tokenAccountBalance.result.value.decimals);

    const amountAsset2Formatted = amountAsset2 / 10 ** asset2Decimals;

    const amountInUSD2 = await getAmountInUSD(tokenMint, amountAsset2Formatted);

    return amountInUSD2;
  }
};
