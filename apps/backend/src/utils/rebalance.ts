import axios from "axios";
import {
  PublicKey,
  Connection,
  Keypair,
  VersionedTransaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getTokenAccountBalance } from "./get-token-account-balance";
import bs58 from "bs58";
export const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BTC = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh";
export const SOL = "So11111111111111111111111111111111111111112";
export const wETH = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs";
export const META = "METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr";

const ASSET1 = SOL;
const ASSET2 = USDC;
const PAIR = `${ASSET1}-${ASSET2}`;

const PUBLIC_KEY = "8JJCtexL5QTc4jnLztHNT4dKLSNhswuYwmR4gVvJZwAh";

// Connection à la blockchain Solana (mainnet)
const connection = new Connection("https://api.mainnet-beta.solana.com");

async function getTokenAccount(
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

export const getBalance = async (address: string) => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    // Convertir les lamports en SOL (1 SOL = 1,000,000,000 lamports)
    return balance / 1_000_000_000;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};

export const rebalance = async () => {
  const adminWallet = Keypair.fromSecretKey(
    bs58.decode(process.env.WALLET_PRIVATE_KEY as string)
  );
  const balance1 = await getBalance(PUBLIC_KEY);
  const balanceInLamports = balance1 * 1_000_000_000;

  console.log("adminWallet", adminWallet);
  console.log("balance1", balance1);
  console.log("balanceInLamports", balanceInLamports);

  const tokenAccount2 = await getTokenAccount(
    new PublicKey(ASSET2),
    new PublicKey(PUBLIC_KEY)
  );

  const tokenAccountBalance2 = await getTokenAccountBalance(
    tokenAccount2.toString()
  );

  console.log("tokenAccount2", tokenAccount2);

  console.log("tokenAccountBalance", tokenAccountBalance2);

  const amountToSwap = balanceInLamports * 0.1;

  console.log("amountToSwap", amountToSwap);

  const quoteResponse = await axios.get(
    `https://lite-api.jup.ag/swap/v1/quote?inputMint=${ASSET1}&outputMint=${ASSET2}&amount=${amountToSwap}&slippageBps=50&restrictIntermediateTokens=true`
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
      userPublicKey: PUBLIC_KEY.toString(),
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
};
