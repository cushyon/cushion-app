import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
	calculateReservePrice,
	DriftClient,
	User,
	initialize,
	PositionDirection,
	convertToNumber,
	calculateTradeSlippage,
	PRICE_PRECISION,
	QUOTE_PRECISION,
	Wallet,
	PerpMarkets,
	BASE_PRECISION,
	getMarketOrderParams,
	BulkAccountLoader,
	BN,
	calculateBidAskPrice,
	getMarketsAndOraclesForSubscription,
	calculateEstimatedPerpEntryPrice,
} from '@drift-labs/sdk';

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
	//const env = 'devnet';
	const env = 'mainnet-beta';

	// Initialize Drift SDK
	const sdkConfig = initialize({ env });

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

	// Misc. other things to set up
	const usdcTokenAddress = await getTokenAddress(
		sdkConfig.USDC_MINT_ADDRESS,
		provider.wallet.publicKey.toString()
	);

	// Set up the Drift Client
	const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID);
	const bulkAccountLoader = new BulkAccountLoader(
		provider.connection,
		'confirmed',
		1000
	);
	const driftClient = new DriftClient({
		connection: provider.connection,
		wallet: provider.wallet,
		programID: driftPublicKey,
		// accountSubscription: {
		// 	type: 'polling',
		// 	accountLoader: bulkAccountLoader,
		// },
	});
    
	await driftClient.subscribe();

	console.log('subscribed to driftClient');

    const userAccountPublicKey = await driftClient.getUserAccountPublicKey()
    console.log("userAccount", userAccountPublicKey)
    //console.log("bulkAccountLoader", bulkAccountLoader)

    // const [txSig, userPublickKey] = await driftClient.initializeUserAccount(
    //     0,
    //     "toly"
    //   );

	// Set up user client
	const user = new User({
		driftClient: driftClient,
		userAccountPublicKey: await driftClient.getUserAccountPublicKey(),
		accountSubscription: {
			type: 'polling',
			accountLoader: bulkAccountLoader,
		},
	});
    console.log('User', user);
	//// Check if user account exists for the current wallet
	const userAccountExists = await user.exists();

	if (!userAccountExists) {
		console.log(
			'initializing to',
			env,
			' drift account for',
			provider.wallet.publicKey.toString()
		);

		//// Create a Drift V2 account by Depositing some USDC ($10,000 in this case)
		const depositAmount = new BN(10000).mul(QUOTE_PRECISION);
		await driftClient.initializeUserAccountAndDepositCollateral(
			depositAmount,
			await getTokenAddress(
				usdcTokenAddress.toString(),
				provider.wallet.publicKey.toString()
			)
		);
	}

	await user.subscribe();

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
};

main();