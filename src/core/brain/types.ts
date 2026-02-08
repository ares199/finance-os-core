export type CEOReport = {
  ts: string;
  summary: string;
  exposures: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  watchlist: Array<{ asset: string; reason: string }>;
  metrics: {
    totalValueUSDT: number | null;
    concentrationTop3Pct?: number | null;
    concentrationTop5Pct?: number | null;
    unpricedAssetsCount: number;
  };
};
