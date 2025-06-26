import {
  DriftClient,
  getUserStatsAccountPublicKey,
  OraclePriceData,
  PRICE_PRECISION_EXP,
  PublicKey,
  QUOTE_PRECISION_EXP,
  SpotMarketConfig,
  UserAccount,
  UserStatsAccount,
  ZERO,
} from "@drift-labs/sdk";
import { initDrift } from "@src/utils/init-drift";
import { createVaultClient, initProvider } from "./drift.service";
import { BigNum } from "@drift-labs/sdk";
import { Vault, VAULT_SHARES_PRECISION_EXP } from "@drift-labs/vaults-sdk";
import { BN } from "@coral-xyz/anchor";

const fetchUserStats = async (
  driftClient: DriftClient,
  vaultPubkey: PublicKey
) => {
  const userStatsPubkey = getUserStatsAccountPublicKey(
    driftClient.program.programId,
    vaultPubkey
  );
  const userStats =
    await driftClient.program.account.userStats.fetch(userStatsPubkey);

  return userStats as UserStatsAccount;
};

const fetchDriftUserAccount = async (
  driftClient: DriftClient,
  vaultDriftUserPubkey: PublicKey
) => {
  const driftUserAccount =
    await driftClient.program.account.user.fetch(vaultDriftUserPubkey);

  return driftUserAccount as UserAccount;
};

export const getVaultStats = async (vaultAddress: string) => {
  const vaultPubkey = new PublicKey(vaultAddress);
  const { driftClient } = await initDrift();
  const vaultClient = await createVaultClient(initProvider(), driftClient);

  const oraclePriceData = await driftClient.getOracleDataForPerpMarket(0);

  const [vaultAccountData, vaultQuoteTvlBN, userStats, vaultDriftUserAccount] =
    await Promise.all([
      vaultClient.getVault(vaultPubkey),
      vaultClient.calculateVaultEquity({
        address: vaultPubkey,
      }),
      fetchUserStats(driftClient, vaultPubkey),
      fetchDriftUserAccount(
        driftClient,
        new PublicKey("2zSLRaFjF54daFxo1kciWYgtXcrNuKESPVhAaDuM5Qw4")
      ),
    ]);

  const vaultStats = constructVaultStats(
    vaultPubkey.toString(),
    {
      vaultAccountData,
      userStatsData: userStats,
      vaultQuoteTvl: vaultQuoteTvlBN,
      vaultDriftUser: vaultDriftUserAccount,
    },
    undefined,
    oraclePriceData
  );

  await driftClient.unsubscribe();

  console.log("--------------------------------");
  console.log(vaultStats);
  console.log("tvlQuote", vaultStats.tvlQuote.toNum());
  console.log("tvlBase", vaultStats.tvlBase.toNum());
  console.log("totalBasePnl", vaultStats.totalBasePnl.toNum());
  console.log("totalQuotePnl", vaultStats.totalQuotePnl.toNum());
  console.log("capacityPct", vaultStats.capacityPct);
  console.log("volume30Days", vaultStats.volume30Days.toNum());
  console.log("totalShares", vaultStats.totalShares.toNum());
  console.log(
    "vaultRedeemPeriodSecs",
    vaultStats.vaultRedeemPeriodSecs.toNumber()
  );
  console.log(
    "notionalGrowthQuotePnl",
    vaultStats.notionalGrowthQuotePnl.toNum()
  );
  console.log("--------------------------------");

  return vaultStats;
};

export type PeriodApys = {
  "7d": number;
  "30d": number;
  "90d": number;
};

export interface OffChainVaultStats {
  apys: PeriodApys;
  maxDrawdownPct: number;
  numOfVaultSnapshots: number;
  hasLoadedOffChainStats: boolean;
}

export const DEFAULT_OFF_CHAIN_STATS: OffChainVaultStats = {
  apys: {
    "7d": 0,
    "30d": 0,
    "90d": 0,
  },
  maxDrawdownPct: 0,
  numOfVaultSnapshots: 0,
  hasLoadedOffChainStats: false,
};

export type VaultsOnChainDataLookup = Record<
  string,
  {
    vaultAccountData: Vault;
    userStatsData: UserStatsAccount;
    vaultQuoteTvl: BN;
    vaultDriftUser: UserAccount;
  }
>;

export type ApyReturnsLookup = Record<
  string,
  {
    apys: PeriodApys;
    maxDrawdownPct: number;
    numOfVaultSnapshots: number;
  }
>;

export function constructVaultStats(
  vaultPubKey: string,
  vaultOnChainData: VaultsOnChainDataLookup[string],
  apyReturnStat: ApyReturnsLookup[string] | undefined,
  oraclePriceGetter: OraclePriceData
) {
  // const uiVaultConfig = getUiVaultConfig(vaultPubKey);

  // if (!uiVaultConfig) {
  //   throw new Error("Vault config not found");
  // }

  // const uiMarket = UIMarket.createSpotMarket(0);
  // const marketConfig = uiMarket.market as SpotMarketConfig;
  const oraclePriceBigNum = BigNum.from(
    oraclePriceGetter.price,
    PRICE_PRECISION_EXP
  );

  const offChainStats = apyReturnStat
    ? { ...apyReturnStat, hasLoadedOffChainStats: true }
    : DEFAULT_OFF_CHAIN_STATS;

  if (oraclePriceBigNum.eqZero()) {
    return {
      hasLoadedOnChainStats: false,
      totalBasePnl: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      totalQuotePnl: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      tvlBase: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      tvlQuote: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      capacityPct: 0,
      volume30Days: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      isUncappedCapacity: false,
      totalShares: BigNum.from(ZERO, VAULT_SHARES_PRECISION_EXP),
      vaultRedeemPeriodSecs: ZERO,
      notionalGrowthQuotePnl: BigNum.from(ZERO, QUOTE_PRECISION_EXP),
      profitShare: 0,
      ...offChainStats,
    };
  }

  const vaultAccountData = vaultOnChainData.vaultAccountData;
  const userStats = vaultOnChainData.userStatsData;

  const vaultQuoteTvl = BigNum.from(
    vaultOnChainData.vaultQuoteTvl,
    QUOTE_PRECISION_EXP
  );
  const vaultBaseTvl = vaultQuoteTvl
    .shift(QUOTE_PRECISION_EXP)
    .div(oraclePriceBigNum);
  const totalBasePnl = vaultBaseTvl.sub(
    BigNum.from(vaultAccountData.netDeposits, QUOTE_PRECISION_EXP)
  );
  const totalQuotePnl = totalBasePnl
    .mul(oraclePriceBigNum)
    .shiftTo(QUOTE_PRECISION_EXP);
  const capacityPct = vaultAccountData.maxTokens.eqn(0) // uncapped capacity
    ? "0"
    : vaultBaseTvl.toPercentage(
        BigNum.from(vaultAccountData.maxTokens, QUOTE_PRECISION_EXP),
        QUOTE_PRECISION_EXP.toNumber()
      );

  const volume30Days = BigNum.from(
    userStats.makerVolume30D.add(userStats.takerVolume30D),
    QUOTE_PRECISION_EXP
  );

  const vaultDriftUserQuoteNetDeposits = BigNum.from(
    vaultOnChainData.vaultDriftUser.totalDeposits.sub(
      vaultOnChainData.vaultDriftUser.totalWithdraws
    ),
    QUOTE_PRECISION_EXP
  );
  const notionalGrowthQuotePnl = vaultQuoteTvl.sub(
    vaultDriftUserQuoteNetDeposits
  );

  return {
    hasLoadedOnChainStats: true,
    totalBasePnl,
    totalQuotePnl,
    tvlBase: vaultBaseTvl,
    tvlQuote: vaultQuoteTvl,
    capacityPct: Math.min(+capacityPct, 100),
    isUncappedCapacity: vaultAccountData.maxTokens.eqn(0),
    volume30Days,
    totalShares: BigNum.from(
      vaultAccountData.totalShares,
      VAULT_SHARES_PRECISION_EXP
    ),
    vaultRedeemPeriodSecs: vaultAccountData.redeemPeriod,
    notionalGrowthQuotePnl,
    profitShare: vaultAccountData.profitShare,
    ...offChainStats,
  };
}
