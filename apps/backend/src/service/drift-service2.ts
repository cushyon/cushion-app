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

  // ORDER 0.01 USDC 
  /*
  const orderParams = {
	orderType: OrderType.LIMIT,
	marketIndex: 0,
	direction: PositionDirection.SHORT,
	baseAssetAmount: driftClient.convertToPerpPrecision(0.01),
	oraclePriceOffset: driftClient.convertToPricePrecision(.05).toNumber(),
  }
  await driftClient.placePerpOrder(orderParams);
  */
  
  /*   transactionLogs: [
    'Program ComputeBudget111111111111111111111111111111 invoke [1]',
    'Program ComputeBudget111111111111111111111111111111 success',
    'Program dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH invoke [1]',
    'Program log: Instruction: PlaceSpotOrder',
    'Program log: Error InvalidOrderMinOrderSize thrown at programs/drift/src/validation/order.rs:357',
    'Program log: Order base_asset_amount (2000000) < min_order_size (100000000)',
    'Program log: AnchorError occurred. Error Code: InvalidOrderMinOrderSize. Error Number: 6056. Error Message: InvalidOrderMinOrderSize.',
    'Program dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH consumed 16978 of 599850 compute units',
    'Program dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH failed: custom program error: 0x17a8'
  ]*/
 

	/*const orderParams = {
		orderType: OrderType.MARKET,
		marketIndex: 0,
		direction: PositionDirection.SHORT,
		baseAssetAmount: driftClient.convertToSpotPrecision(1, 0.005),
	}
	
	await driftClient.placeSpotOrder(orderParams);*/


 /*const orderParams = {
	orderType: OrderType.LIMIT,
	marketIndex: 0,
	direction: PositionDirection.SHORT,
	baseAssetAmount: driftClient.convertToPerpPrecision(0.1),
	oraclePriceOffset: driftClient.convertToPricePrecision(.05).toNumber(),
  }
  await driftClient.placePerpOrder(orderParams);*/

  // CANCEL ORDER !
/*
const marketType = MarketType.PERP;
const marketIndex = 0; 
const direction = PositionDirection.SHORT;
await driftClient.cancelOrders(marketType, marketIndex, direction);
*/
  const marketIndex = 0;

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
  );
};

main();
