import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
const connection = new Connection("https://api.mainnet-beta.solana.com");

export async function swap(asset1: string, asset2: string, amount: number) {
  const adminWallet = Keypair.fromSecretKey(
    bs58.decode(process.env.WALLET_PRIVATE_KEY as string)
  );

  const quoteResponse = await axios.get(
    `https://lite-api.jup.ag/swap/v1/quote?inputMint=${asset1}&outputMint=${asset2}&amount=${amount}&slippageBps=50&restrictIntermediateTokens=true`
  );

  console.log("quoteResponse", quoteResponse.data);

  interface SwapResponse {
    swapTransaction: string;
    lastValidBlockHeight: number;
    priorityFeeEstimate: number;
  }

  const swapResponse = await axios.post<SwapResponse>(
    "https://lite-api.jup.ag/swap/v1/swap",
    {
      quoteResponse: quoteResponse.data,
      userPublicKey: adminWallet.publicKey,
      dynamicComputeUnitLimit: true,
      dynamicSlippage: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 1000000,
          priorityLevel: "veryHigh",
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("swapResponse", swapResponse.data);

  const transactionBase64 = swapResponse.data.swapTransaction;
  const transaction = VersionedTransaction.deserialize(
    Buffer.from(transactionBase64, "base64")
  );
  console.log("transaction", transaction);

  transaction.sign([adminWallet]);

  const transactionBinary = transaction.serialize();
  console.log("transactionBinary", transactionBinary);

  const signature = await connection.sendRawTransaction(transactionBinary, {
    maxRetries: 2,
    skipPreflight: true,
  });

  console.log("signature", signature);

  return signature;
}
