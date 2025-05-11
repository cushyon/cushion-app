import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';

import { Keypair, PublicKey } from '@solana/web3.js';
import {
	DriftClient,
	PositionDirection,
	OrderType,
	User,
	getUserAccountPublicKeySync,
	initialize,
	BulkAccountLoader
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

	/*const driftClient = new DriftClient({
		connection: provider.connection,
		wallet: provider.wallet,
		env: 'devnet',
	  });
	  
	  await driftClient.subscribe();*/

	const bulkAccountLoader = new BulkAccountLoader(
		provider.connection,
		'confirmed',
		1000
	);
	// Set up user client
	const user = new User({
		driftClient: driftClientVault,
		userAccountPublicKey: getUserAccountPublicKeySync(
			new PublicKey(authorityaddy),
			new PublicKey("76X1E2EAdB2ZFB8gt4cXf8Qe9CJJH6dmxwYfnX5vv23m"),
		),
		accountSubscription: {
			type: 'polling',
			accountLoader: bulkAccountLoader,
		},
	});

	const userAccountExists = await user.exists();
    console.log('userAccountExists', userAccountExists);
	if (!userAccountExists) {
		console.log(
			'initializing to',
			env,
			' drift account for',
			provider.wallet.publicKey.toString()
		);

		//// Create a Drift V2 account
		const [txSig, userPublickKey] = await driftClientVault.initializeUserAccount(
			0,
			"nadar cushion 2"
		  );
		console.log("drift account created", txSig);
	}

	await user.subscribe();

	const orderParams = {
		orderType: OrderType.LIMIT,
		marketIndex: 1,
		direction: PositionDirection.SHORT,
		baseAssetAmount: driftClientVault.convertToSpotPrecision(1, 100),
		price: driftClientVault.convertToPricePrecision(100),
	  }
	  
	  await driftClientVault.placeSpotOrder(orderParams);
};

main();