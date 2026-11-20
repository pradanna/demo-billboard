import { TimeFilter, TrafficLevel } from '../../types';

export type ReportFormat = 'PDF' | 'EXCEL' | 'BOTH';

export type ReportScopeType = 'all' | 'city' | 'single';

export interface ReportConfig {
  title: string;
  clientName: string;
  scopeType: ReportScopeType;
  city?: string;
  billboardId?: string;
  timeRange: 'harian' | 'mingguan' | 'bulanan';
  format: ReportFormat;
  includeDemographics: boolean;
  includeVehicleBreakdown: boolean;
  includePoi: boolean;
  notes?: string;
}

export interface GeneratedReportItem {
  id: string;
  title: string;
  clientName: string;
  format: ReportFormat;
  scopeLabel: string;
  timeRangeLabel: string;
  generatedAt: string; // ISO String
  fileSize: string;
  billboardCount: number;
  config: ReportConfig;
}
