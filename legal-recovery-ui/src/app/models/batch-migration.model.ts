export interface BatchDashboard {
  totalBatchJobs: number;
  activeJobs: number;
  migratedJobs: number;
  inParallelJobs: number;
  decommissionedJobs: number;
  retiredJobs: number;
  remainingJobs: number;
  migrationProgressPercent: number;
  jobsByStage: { [stage: string]: number };
}

export interface MigrationDashboard {
  totalJobs: number;
  statusBreakdown: { [status: string]: number };
  stageBreakdown: { [stage: string]: number };
  recentMigrations: MigrationEvent[];
}

export interface MigrationEvent {
  jobName: string;
  fromStatus: string;
  toStatus: string;
  date: string;
}
