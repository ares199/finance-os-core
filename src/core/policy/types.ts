export type AutonomyMode = "readonly" | "suggest" | "confirm" | "auto";

export interface PolicyState {
  autonomyMode: AutonomyMode;
  maxDailyLossPct: number;
  maxPositionSizePct: number;
  maxCryptoAllocationPct: number;
  allowLeverage: boolean;
  killSwitch: boolean;
}
