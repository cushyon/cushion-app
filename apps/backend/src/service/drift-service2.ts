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
  const env = "mainnet-beta";
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
    "FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"
  );

  const driftClient = new DriftClient({
    connection: provider.connection,
    wallet: provider.wallet,
    env: "mainnet-beta",
    accountSubscription: {
      type: "websocket",
    },
    authority: authorityaddy,
    subAccountIds: [0],
    activeSubAccountId: 0,
  });

  await driftClient.subscribe();


  /*const orderParams = {
	orderType: OrderType.MARKET,
	marketIndex: 1, // SOL MARKET
	direction: PositionDirection.LONG, // BUY SOL WITH USDC USE SHORT IF YOU WANT TO SELL SOL TO USDC
	baseAssetAmount: driftClient.convertToSpotPrecision(1, 0.1), 
	//price: driftClient.convertToPricePrecision(175),
  }
 
  await driftClient.placeSpotOrder(orderParams);*/

  // BUY 0.1 SOL WITH USDC
  /*const oraclePrice = driftClient.getOracleDataForSpotMarket(1).price;
  console.log("oraclePrice", oraclePrice.toString());
	// assuming oraclePrice is a BN with PRICE_PRECISION = 1e6
	const BASIS_POINTS = 10000;
	const offsetBps = 10; // 0.1% = 10bps

	// Calculate ±0.1% (10 bps)
	const auctionStartPrice = oraclePrice.muln(BASIS_POINTS - offsetBps).divn(BASIS_POINTS);
	const auctionEndPrice = oraclePrice.muln(BASIS_POINTS + offsetBps).divn(BASIS_POINTS);
	const auctionDuration = 30; // 30 slots

	console.log("auctionStartPrice", auctionStartPrice.toString());
	console.log("auctionEndPrice", auctionEndPrice.toString())

const orderParams2 = {
	orderType: OrderType.MARKET,
	baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // USDC -> 0.1 SOL
	direction: PositionDirection.LONG,
	marketIndex: 1,
	auctionStartPrice: auctionStartPrice,
	auctionEndPrice: auctionEndPrice,
	auctionDuration: auctionDuration,
	};
	await driftClient.placeSpotOrder(orderParams2)
	*/

	// BUY  USDC WITH SOL
	
	const oraclePrice = driftClient.getOracleDataForSpotMarket(1).price;
	console.log("oraclePrice", oraclePrice.toString());
	  // assuming oraclePrice is a BN with PRICE_PRECISION = 1e6
	  const BASIS_POINTS = 10000;
	  const offsetBps = 10; // 0.1% = 10bps
  
	  // Calculate ±0.1% (10 bps)
	  const auctionStartPrice = oraclePrice.muln(BASIS_POINTS + offsetBps).divn(BASIS_POINTS);
	  const auctionEndPrice = oraclePrice.muln(BASIS_POINTS - offsetBps).divn(BASIS_POINTS);
	  const auctionDuration = 30; // 30 slots
  
	  console.log("auctionStartPrice", auctionStartPrice.toString());
	  console.log("auctionEndPrice", auctionEndPrice.toString())
  
  const orderParams2 = {
	  orderType: OrderType.MARKET,
	  baseAssetAmount: driftClient.convertToPerpPrecision(0.1), // 0.01 SOL -> USDC
	  direction: PositionDirection.SHORT, // SOL -> USDC
	  marketIndex: 1,
	  auctionStartPrice: auctionStartPrice,
	  auctionEndPrice: auctionEndPrice,
	  auctionDuration: auctionDuration,
	  };
	  await driftClient.placeSpotOrder(orderParams2)
	

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
};

main();
