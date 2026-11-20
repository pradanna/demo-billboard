export * from './billboard';
export * from './traffic';
export * from './demografi';

export interface SummaryKPI {
  totalBillboard: number;
  totalTrafficHarian: number;
  rataRataTrafficPerBillboard: number;
  totalMotor: number;
  totalMobil: number;
  totalPejalanKaki: number;
  totalTruk: number;
}
