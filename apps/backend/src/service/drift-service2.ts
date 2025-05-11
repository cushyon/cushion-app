import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';

import { Keypair, PublicKey, type TransactionInstruction, ComputeBudgetProgram} from '@solana/web3.js';
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
	numberToSafeBN,
	MarketType,
	PostOnlyParams,
	PRICE_PRECISION,
	BASE_PRECISION
} from '@drift-labs/sdk';
import { Public } from '@prisma/client/runtime/library';

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
	const env = 'devnet';
	const sdkConfig = initialize({ env });

	const keypairBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY || "");
	const keypair = Keypair.fromSecretKey(keypairBytes);

	// Set up the Wallet and Provider
	if (!process.env.ANCHOR_WALLET) {
		throw new Error('ANCHOR_WALLET env var must be set.');
	}

	if (!process.env.ANCHOR_PROVIDER_URL) {
		throw new Error('ANCHOR_PROVIDER_URL env var must be set.');
	}
		
	const provider = anchor.AnchorProvider.local(
		process.env.ANCHOR_PROVIDER_URL,
		{
			preflightCommitment: 'confirmed',
			skipPreflight: false,
			commitment: 'confirmed',
		}
	);
	
	// Check SOL Balance
	const lamportsBalance = await provider.connection.getBalance(
		provider.wallet.publicKey
	);
	console.log(
		provider.wallet.publicKey.toString(),
		env,
		'SOL balance:',
		lamportsBalance / 10 ** 9
	);

	const authorityaddy = new PublicKey("6hpk9equdGMJf1pKs9xcuwUrMigCYC5Gec15tCbMqcs8");

	const driftClientVault = new DriftClient({
			connection: provider.connection,
			wallet: provider.wallet,
			env: "devnet", 
			accountSubscription: {
				type: 'websocket',
			},
			authority: authorityaddy,
			subAccountIds: [0],
			activeSubAccountId: 0
		});
	
	await driftClientVault.subscribe();

		// Get current price
		const solMarketInfo = PerpMarkets[env].find(
			(market) => market.baseAssetSymbol === 'SOL'
		);
	
		//const marketIndex = solMarketInfo.marketIndex;
	
		// Get vAMM bid and ask price
		// const [bid, ask] = calculateBidAskPrice(
		// 	driftClient.getPerpMarketAccount(marketIndex).amm,
		// 	driftClient.getOracleDataForPerpMarket(marketIndex)
		// );
	
		// const formattedBidPrice = convertToNumber(bid, PRICE_PRECISION);
		// const formattedAskPrice = convertToNumber(ask, PRICE_PRECISION);
	
		// console.log(
		// 	env,
		// 	`vAMM bid: $${formattedBidPrice} and ask: $${formattedAskPrice}`
		// );
	
		// const solMarketAccount = driftClient.getPerpMarketAccount(
		// 	solMarketInfo.marketIndex
		// );
		// console.log(env, `Placing a 1 SOL-PERP LONG order`);
	
		// const txSig = await driftClient.placePerpOrder(
		// 	getMarketOrderParams({
		// 		baseAssetAmount: new BN(1).mul(BASE_PRECISION),
		// 		direction: PositionDirection.LONG,
		// 		marketIndex: solMarketAccount.marketIndex,
		// 	})
		// );
		// console.log(
		// 	env,
		// 	`Placed a 1 SOL-PERP LONG order. Tranaction signature: ${txSig}`
		// );

	/*const orderParams = {
		orderType: OrderType.LIMIT,
		marketIndex: 1,
		direction: PositionDirection.SHORT,
		baseAssetAmount: driftClientVault.convertToSpotPrecision(1, 100),
		price: driftClientVault.convertToPricePrecision(100),
	  }
	  
	  await driftClientVault.placeSpotOrder(orderParams);*/

	  /*const usdcSpotMarket = driftClientVault.getSpotMarketAccount(0);
    if (!usdcSpotMarket) {
      throw new Error("USDC-SPOT market not found");
    }

    const perpMarketAccount = driftClientVault.getPerpMarketAccount(
      1,
    );

    if (!perpMarketAccount) {
      throw new Error(
        "Invalid symbol: Drift doesn't have a market for this token",
      );
    }

	  const instructions: TransactionInstruction[] = [];
	  instructions.push(
		ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
	  );
      const instruction = await driftClientVault.getPlaceOrdersIx([
        getOrderParams(
          getLimitOrderParams({
            price: numberToSafeBN(160, PRICE_PRECISION),
            marketType: MarketType.PERP,
            baseAssetAmount: numberToSafeBN(160, BASE_PRECISION),
            direction: PositionDirection.SHORT,
            marketIndex: perpMarketAccount.marketIndex,
            postOnly: PostOnlyParams.SLIDE,
          }),
        ),
      ]);

      instructions.push(instruction);

	  const driftLookupTableAccount = await driftClientVault.fetchMarketLookupTableAccount()

	  const latestBlockhash = await driftClientVault.connection.getLatestBlockhash();
		const tx = await driftClientVault.txSender.sendVersionedTransaction(
		await driftClientVault.txSender.getVersionedTransaction(
			instructions,
			[driftLookupTableAccount],
			[],
			driftClientVault.opts,
			latestBlockhash,
		),
		);*/
};

main();