import axios from "axios";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { fetchJupiterTokenPrice } from "./jupiter-get-price";
import { getCurrentBalanceInUSD } from "./get-balance-in-usd";
import { getTokenAccountData } from "./get-token-account-data";
import { swap } from "./swap";

export const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BTC = "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh";
export const SOL = "So11111111111111111111111111111111111111112";
export const wETH = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs";
export const META = "METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr";
export const JITOSOL = "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn";

let ASSET1 = JITOSOL;
const ASSET2 = USDC;
const PAIR = `${ASSET1}-${ASSET2}`;

const PUBLIC_KEY = "8JJCtexL5QTc4jnLztHNT4dKLSNhswuYwmR4gVvJZwAh";

// Connection à la blockchain Solana (mainnet)
const connection = new Connection("https://api.mainnet-beta.solana.com");

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

export const getAmountInUSD = async (
  tokenMint: string,
  amountToken: number
) => {
  const price = await fetchJupiterTokenPrice(tokenMint);
  return Number(price) * amountToken;
};

export const rebalance = async ({
  percentageAsset1,
  percentageAsset2,
}: {
  percentageAsset1: number;
  percentageAsset2: number;
}) => {
  const adminWallet = Keypair.fromSecretKey(
    bs58.decode(process.env.WALLET_PRIVATE_KEY as string)
  );
  const amountAsset1InUSd = await getCurrentBalanceInUSD(ASSET1, PUBLIC_KEY);
  const amountInUSD2 = await getCurrentBalanceInUSD(ASSET2, PUBLIC_KEY);

  const totalAmountInUSD = amountAsset1InUSd + amountInUSD2;
  console.log("totalAmountInUSD", totalAmountInUSD);

  const currentPercentageAsset1 = (amountAsset1InUSd / totalAmountInUSD) * 100;
  const currentPercentageAsset2 = (amountInUSD2 / totalAmountInUSD) * 100;

  console.log("current percentageAsset1", currentPercentageAsset1);
  console.log("current percentageAsset2", currentPercentageAsset2);

  if (currentPercentageAsset1 === percentageAsset1) {
    console.log("No need to rebalance");
    return;
  }

  // expected amount asset1

  const swapDirection =
    currentPercentageAsset1 > percentageAsset1
      ? "asset1ToAsset2"
      : "asset2ToAsset1";

  console.log("swapDirection", swapDirection);

  console.log("percentageAsset1", percentageAsset1);
  console.log("percentageAsset2", percentageAsset2);

  const expectedAmountAsset1 = (percentageAsset1 / 100) * totalAmountInUSD;
  const expectedAmountAsset2 = (percentageAsset2 / 100) * totalAmountInUSD;

  console.log("expectedAmountAsset1", expectedAmountAsset1);
  console.log("expectedAmountAsset2", expectedAmountAsset2);

  if (swapDirection === "asset1ToAsset2") {
    const priceAsset1 = await fetchJupiterTokenPrice(ASSET1);

    if (ASSET1 === SOL) {
      const balance = await connection.getBalance(new PublicKey(PUBLIC_KEY));
      const amountExpectedAsset1 = Number(
        ((expectedAmountAsset1 / Number(priceAsset1)) * 1_000_000_000).toFixed(
          0
        )
      );

      console.log("current balance", balance);
      console.log("amountExpectedAsset1", amountExpectedAsset1);

      const amountToSwap = balance - amountExpectedAsset1;

      console.log("amount to swap", amountToSwap);

      // => swap function
      const signature = await swap(ASSET1, ASSET2, amountToSwap);
      console.log("signature", signature);
    } else {
      const priceAsset1 = await fetchJupiterTokenPrice(ASSET1);
      const tokenAccountData = await getTokenAccountData(ASSET1, PUBLIC_KEY);
      const amountExpectedAsset1 = Number(
        (
          (expectedAmountAsset1 / Number(priceAsset1)) *
          10 ** Number(tokenAccountData.result.value.decimals)
        ).toFixed(0)
      );

      console.log(
        "current amount asset2",
        tokenAccountData.result.value.amount
      );
      console.log("amount expected asset1", amountExpectedAsset1);

      const amountToSwap =
        Number(tokenAccountData.result.value.amount) - amountExpectedAsset1;

      console.log("amount to swap", amountToSwap);

      // => swap function
      const signature = await swap(ASSET1, ASSET2, amountToSwap);
      console.log("signature", signature);
    }
  } else {
    const priceAsset2 = await fetchJupiterTokenPrice(ASSET2);
    const tokenAccountData = await getTokenAccountData(ASSET2, PUBLIC_KEY);
    const amountExpectedAsset2 = Number(
      (
        (expectedAmountAsset2 / Number(priceAsset2)) *
        10 ** Number(tokenAccountData.result.value.decimals)
      ).toFixed(0)
    );

    console.log("current amount asset2", tokenAccountData.result.value.amount);
    console.log("amount expected asset2", amountExpectedAsset2);

    const amountToSwap =
      Number(tokenAccountData.result.value.amount) - amountExpectedAsset2;

    console.log("amount to swap", amountToSwap);

    // => swap function
    const signature = await swap(ASSET2, ASSET1, amountToSwap);
    console.log("signature", signature);
  }
};
