import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  DriftClient,
  PositionDirection,
  OrderType,
  initialize,
  BN,
  OrderTriggerCondition,
} from "@drift-labs/sdk";

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  );
};

/**
 * Build an {@link AnchorProvider} from the current environment variables.
 *
 * Required env vars:
 *  - `ANCHOR_WALLET`  – path to the keypair json or a base58 secret key string
 *  - `ANCHOR_PROVIDER_URL` – RPC endpoint
 */
export function initProvider(): AnchorProvider {
  if (!process.env.ANCHOR_WALLET) {
    throw new Error("ANCHOR_WALLET env var must be set.");
  }
  if (!process.env.ANCHOR_PROVIDER_URL) {
    throw new Error("ANCHOR_PROVIDER_URL env var must be set.");
  }

  return anchor.AnchorProvider.local(process.env.ANCHOR_PROVIDER_URL, {
    preflightCommitment: "confirmed",
    skipPreflight: false,
    commitment: "confirmed",
  });
}

/* Quick‐start helper — returns a ready-to-use {@link DriftClient} with *sane* defaults.
 *
 * @param provider An {@link AnchorProvider} (see {@link initProvider}).
 * @param authority The authority key to use for the drift client.
 * @param env      Cluster to connect to – defaults to `'mainnet-beta'`.
 *
 * Internally it uses:
 *  • `authority = provider.wallet.publicKey`
 *  • one sub-account (`[0]`, active index `0`)*/

export async function createDriftClient(
  provider: AnchorProvider,
  authority: PublicKey,
  env: "mainnet-beta" | "devnet"
): Promise<DriftClient> {
  const driftClient = new DriftClient({
    connection: provider.connection,
    wallet: provider.wallet,
    env,
    authority: authority,
    accountSubscription: { type: "websocket" },
    subAccountIds: [0],
    activeSubAccountId: 0,
  });

  await driftClient.subscribe();
  return driftClient;
}

const BASIS_POINTS = 10_000;

function deriveAuctionBand({
  oraclePrice,
  offsetBps,
}: {
  oraclePrice: BN;
  offsetBps: number;
}): { start: BN; end: BN } {
  return {
    start: oraclePrice.muln(BASIS_POINTS - offsetBps).divn(BASIS_POINTS),
    end: oraclePrice.muln(BASIS_POINTS + offsetBps).divn(BASIS_POINTS),
  };
}

export async function buySolWithUsdc(
  driftClient: DriftClient,
  {
    amountSol = 0.1,
    marketIndex = 1,
    offsetBps = 10,
    auctionDuration = 30,
  }: {
    amountSol?: number;
    marketIndex?: number;
    offsetBps?: number;
    auctionDuration?: number;
  } = {}
): Promise<string> {
  const oraclePrice = driftClient.getOracleDataForSpotMarket(marketIndex).price;
  const { start, end } = deriveAuctionBand({ oraclePrice, offsetBps });

  const params = {
    orderType: OrderType.MARKET,
    baseAssetAmount: driftClient.convertToPerpPrecision(amountSol),
    direction: PositionDirection.LONG,
    marketIndex,
    auctionStartPrice: start,
    auctionEndPrice: end,
    auctionDuration,
  } as const;

  return driftClient.placeSpotOrder(params);
}

export async function sellSolForUsdc(
  driftClient: DriftClient,
  {
    amountSol = 0.1,
    marketIndex = 1,
    offsetBps = 10,
    auctionDuration = 30,
  }: {
    amountSol?: number;
    marketIndex?: number;
    offsetBps?: number;
    auctionDuration?: number;
  } = {}
): Promise<string> {
  const oraclePrice = driftClient.getOracleDataForSpotMarket(marketIndex).price;
  const { start: end, end: start } = deriveAuctionBand({
    oraclePrice,
    offsetBps,
  });

  const params = {
    orderType: OrderType.MARKET,
    baseAssetAmount: driftClient.convertToPerpPrecision(amountSol),
    direction: PositionDirection.SHORT,
    marketIndex,
    auctionStartPrice: start,
    auctionEndPrice: end,
    auctionDuration,
  } as const;

  return driftClient.placeSpotOrder(params);
}

export async function executeLimitOrder(
  driftClient: DriftClient,
  {
    amountSol = 0.1,
    marketIndex = 1,
    executionPrice = 0,
  }: {
    amountSol?: number;
    marketIndex?: number;
    executionPrice?: number;
  } = {}
) {
  const params = {
    orderType: OrderType.TRIGGER_MARKET,
    baseAssetAmount: driftClient.convertToPerpPrecision(amountSol),
    direction: PositionDirection.SHORT,
    marketIndex,
    triggerPrice: driftClient.convertToPricePrecision(executionPrice),
    triggerCondition: OrderTriggerCondition.BELOW,
  } as const;

  return driftClient.placeSpotOrder(params);
}

export async function modifyLimitOrder(
  driftClient: DriftClient,
  orderId: number,
  amountSol: number,
  executionPrice: number
) {
  const updateParams = {
    orderId,
    newBaseAmount: driftClient.convertToPerpPrecision(amountSol),
    newTriggerPrice: driftClient.convertToPricePrecision(executionPrice),
  };

  return driftClient.modifyOrder(updateParams);
}

export async function cancelOrder(driftClient: DriftClient, orderId: number) {
  return driftClient.cancelOrder(orderId);
}

const main = async () => {
  const env = "mainnet-beta";
  const sdkConfig = initialize({ env });

  const provider = initProvider();

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
    "FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"
  );

  const driftClient = await createDriftClient(
    provider,
    authorityaddy,
    "mainnet-beta"
  );

  const user = driftClient.getUser();
  // console.log("user", user);
  const tokenAmount = user.getTokenAmount(0);
  console.log("tokenAmount", tokenAmount.toString());

  // const txSig = await buySolWithUsdc(driftClient);
  // console.log("Transaction signature:", txSig);

  // Documentation driftClient: https://github.com/drift-labs/protocol-v2/blob/cc75694a819de89635973e8ac62259f94529f260/sdk/src/driftClient.ts#L4606
  // BUY  USDC WITH SOL

  /*const oraclePrice = driftClient.getOracleDataForSpotMarket(1).price;
  console.log("oraclePrice", oraclePrice.toString());
  // assuming oraclePrice is a BN with PRICE_PRECISION = 1e6
  const BASIS_POINTS = 10000;
  const offsetBps = 10; // 0.1% = 10bps

  // Calculate ±0.1% (10 bps)
  const auctionStartPrice = oraclePrice
    .muln(BASIS_POINTS + offsetBps)
    .divn(BASIS_POINTS);
  const auctionEndPrice = oraclePrice
    .muln(BASIS_POINTS - offsetBps)
    .divn(BASIS_POINTS);
  const auctionDuration = 30; // 30 slots

  console.log("auctionStartPrice", auctionStartPrice.toString());
  console.log("auctionEndPrice", auctionEndPrice.toString());

  const orderParams2 = {
    orderType: OrderType.MARKET,
    baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.01 SOL -> USDC
    direction: PositionDirection.LONG, // SOL -> USDC
    marketIndex: 1,
    auctionStartPrice: auctionStartPrice,
    auctionEndPrice: auctionEndPrice,
    auctionDuration: auctionDuration,
  };
  await driftClient.placeSpotOrder(orderParams2);*/

  // PERP SHORT 55 SOL WORKING
  /*const orderParams = {
	orderType: OrderType.LIMIT,
	marketIndex: 0,
	direction: PositionDirection.SHORT,
	baseAssetAmount: driftClient.convertToPerpPrecision(55),
	oraclePriceOffset: driftClient.convertToPricePrecision(.05).toNumber(),
  }
  await driftClient.placePerpOrder(orderParams);
  */

  // CANCEL ORDER !
  /*
const marketType = MarketType.PERP;
const marketIndex = 0; 
const direction = PositionDirection.SHORT;
await driftClient.cancelOrders(marketType, marketIndex, direction);
*/

  /*const marketIndex = 0;

  if (marketIndex == undefined) throw new Error("SOL market index not found");

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
    marketIndex
  );
  console.log("solMarketAccount", solMarketAccount);

  if (!solMarketAccount) throw new Error("SOL market not found");

  console.log(env, `Placing a 1 SOL-PERP LONG order`);

  const txSig = await driftClient.placePerpOrder(
    getMarketOrderParams({
      baseAssetAmount: new BN(0.1).mul(BASE_PRECISION),
      direction: PositionDirection.LONG,
      marketIndex: solMarketAccount.marketIndex,
    })
  );
  console.log(
    env,
    `Placed a 1 SOL-PERP LONG order. Tranaction signature: ${txSig}`
  );*/

  /*const orderParams = {
	orderType: OrderType.MARKET,
	marketIndex: 1, // SOL MARKET
	direction: PositionDirection.LONG, // BUY SOL WITH USDC USE SHORT IF YOU WANT TO SELL SOL TO USDC
	baseAssetAmount: driftClient.convertToSpotPrecision(1, 0.1), 
	//price: driftClient.convertToPricePrecision(175),
  }
 
  await driftClient.placeSpotOrder(orderParams);*/
};

main();
