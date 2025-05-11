import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

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
	OrderType
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
	const env = 'devnet';
	// const env = 'mainnet-beta';

	// Initialize Drift SDK
	const sdkConfig = initialize({ env });

	const keypairBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY || "");
	const keypair = Keypair.fromSecretKey(keypairBytes);
	console.log("pubkey", keypair.publicKey.toBase58());
	const userpubkey = keypair.publicKey
	console.log("b")

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

	const driftClient = new DriftClient({
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
	
	await driftClient.subscribe();

	/*const orderParams = {
		orderType: OrderType.MARKET,
		marketIndex: 0,
		direction: PositionDirection.LONG,
		baseAssetAmount: driftClient.convertToPerpPrecision(100),
		auctionStartPrice: driftClient.convertToPricePrecision(21.20),
		auctionEndPrice: driftClient.convertToPricePrecision(21.30),
		price: driftClient.convertToPricePrecision(21.35),
		auctionDuration: 60,
		maxTs: now + 100,
	}
	await driftClient.placePerpOrder(orderParams);*/
	
	// Get current price
	const solMarketInfo = PerpMarkets[env].find(
		(market) => market.baseAssetSymbol === 'SOL'
	);

	if(solMarketInfo){
		const marketIndex = solMarketInfo.marketIndex;
		const solMarketAccount = driftClient.getPerpMarketAccount(
			marketIndex
		);
		if(solMarketAccount){
			console.log(env, `Placing a 1 SOL-PERP LONG order`);
			const txSig = await driftClient.placePerpOrder(
				getMarketOrderParams({
					baseAssetAmount: new BN(1).mul(BASE_PRECISION),
					direction: PositionDirection.LONG,
					marketIndex: solMarketAccount.marketIndex,
				})
			);
			console.log("txSig", txSig);
		}
	}
};

main();