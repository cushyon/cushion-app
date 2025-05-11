import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import bs58 from "bs58";
import { AnchorProvider, Program, Provider } from '@coral-xyz/anchor';
import { IDL, VAULT_PROGRAM_ID, VaultClient } from "@drift-labs/vaults-sdk";
import {
  Keypair,
  PublicKey,
  type TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  DriftClient,
  PositionDirection,
  OrderType,
  User,
  getUserAccountPublicKeySync,
  initialize,
  BulkAccountLoader,
  DRIFT_PROGRAM_ID,
  getOrderParams,
  getLimitOrderParams,
  MarketType,
  FastSingleTxSender,
  PostOnlyParams,
  PRICE_PRECISION,
  BASE_PRECISION,
  PerpMarkets,
  calculateBidAskPrice,
  convertToNumber,
  getMarketOrderParams,
  BN,
} from "@drift-labs/sdk";
import { Public } from "@prisma/client/runtime/library";

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  );
};

const main = async () => {
  const env = "devnet";
  const sdkConfig = initialize({ env });

  const keypairBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY || "");
  const keypair = Keypair.fromSecretKey(keypairBytes);

  // Set up the Wallet and Provider
  if (!process.env.ANCHOR_WALLET) {
    throw new Error("ANCHOR_WALLET env var must be set.");
  }

  if (!process.env.ANCHOR_PROVIDER_URL) {
    throw new Error("ANCHOR_PROVIDER_URL env var must be set.");
  }

  const provider = anchor.AnchorProvider.local(
    process.env.ANCHOR_PROVIDER_URL,
    {
      preflightCommitment: "confirmed",
      skipPreflight: false,
      commitment: "confirmed",
    }
  );

  // Check SOL Balance
  const lamportsBalance = await provider.connection.getBalance(
    provider.wallet.publicKey
  );
  console.log(
    provider.wallet.publicKey.toString(),
    env,
    "SOL balance:",
    lamportsBalance / 10 ** 9
  );

  const authorityaddy = new PublicKey(
    "6hpk9equdGMJf1pKs9xcuwUrMigCYC5Gec15tCbMqcs8"
  );

  /*const driftClient = new DriftClient({
    connection: provider.connection,
    wallet: provider.wallet,
    env: "devnet",
    accountSubscription: {
      type: "websocket",
    },
    authority: authorityaddy,
    subAccountIds: [0],
    activeSubAccountId: 0,
  });*/

  const driftClient = new DriftClient({
    connection: provider.connection,
    wallet: provider.wallet,
    env: "devnet",
    authority: authorityaddy,
    activeSubAccountId: 0,
    subAccountIds: [0],
    txSender: new FastSingleTxSender({
      connection: provider.connection,
      wallet: provider.wallet,
      timeout: 30000,
      blockhashRefreshInterval: 1000,
      opts: {
        commitment: "confirmed",
        skipPreflight: false,
        preflightCommitment: "confirmed",
      },
    }),
  });

  // @ts-ignore
const program = new Program(IDL, provider, VAULT_PROGRAM_ID);
const vaultClient = new VaultClient({
	driftClient,
	// @ts-ignore
	program,
	cliMode: false,
});

await driftClient.subscribe();


const orderParams = {
	orderType: OrderType.LIMIT,
	marketIndex: 1,
	direction: PositionDirection.SHORT,
	baseAssetAmount: driftClient.convertToSpotPrecision(1, 100),
	price: driftClient.convertToPricePrecision(100),
  }
  
  await vaultClient.driftClient.placeSpotOrder(orderParams);

  // Get current price
  /*const solMarketInfo = PerpMarkets[env].find(
    (market) => market.baseAssetSymbol === "SOL"
  );

  if (!solMarketInfo) {
    throw new Error("SOL market not found");
  }

  const marketIndex = solMarketInfo.marketIndex;

  if (!marketIndex) throw new Error("SOL market index not found");

  const amm = driftClient.getPerpMarketAccount(marketIndex)?.amm;
  if (!amm) throw new Error("SOL market account not found");

  // Get vAMM bid and ask price
  const [bid, ask] = calculateBidAskPrice(
    amm,
    driftClient.getOracleDataForPerpMarket(marketIndex)
  );

  const formattedBidPrice = convertToNumber(bid, PRICE_PRECISION);
  const formattedAskPrice = convertToNumber(ask, PRICE_PRECISION);

  console.log(
    env,
    `vAMM bid: $${formattedBidPrice} and ask: $${formattedAskPrice}`
  );

  const solMarketAccount = driftClient.getPerpMarketAccount(
    solMarketInfo.marketIndex
  );

  if (!solMarketAccount) throw new Error("SOL market not found");

  console.log(env, `Placing a 1 SOL-PERP LONG order`);

  const txSig = await driftClient.placePerpOrder(
    getMarketOrderParams({
      baseAssetAmount: new BN(1).mul(BASE_PRECISION),
      direction: PositionDirection.LONG,
      marketIndex: solMarketAccount.marketIndex,
    })
  );
  console.log(
    env,
    `Placed a 1 SOL-PERP LONG order. Tranaction signature: ${txSig}`
  );*/
};

main();
