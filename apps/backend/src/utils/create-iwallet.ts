import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { IWallet } from "@drift-labs/sdk";

export const createThrowawayIWallet = (walletPubKey: PublicKey): IWallet => {
  const newKeypair = walletPubKey
    ? new Keypair({
        publicKey: walletPubKey.toBytes(),
        secretKey: new Keypair().publicKey.toBytes(),
      })
    : new Keypair();
  const newWallet = {
    publicKey: newKeypair.publicKey,
    signTransaction: (transaction: Transaction) => {
      return Promise.resolve(transaction);
    },
    signAllTransactions: (transactions: Transaction[]) => {
      return Promise.resolve(transactions);
    },
  };
  return newWallet;
};
