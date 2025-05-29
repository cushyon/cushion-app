import { createDriftClient, initProvider } from "@src/service/drift.service";
import { PublicKey } from "@solana/web3.js";
import { initialize } from "@drift-labs/sdk";

export const initDrift = async () => {
  const env = "mainnet-beta";
  const sdkConfig = initialize({ env });

  const provider = initProvider();

  const authorityaddy = new PublicKey(
    "FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9"
  );

  const driftClient = await createDriftClient(
    provider,
    authorityaddy,
    "mainnet-beta"
  );

  const user = driftClient.getUser();

  return { driftClient, user };
};
