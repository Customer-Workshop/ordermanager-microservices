export interface State {
  id: string;
  code: string;
  name: string;
  countyCount: number;
  courthouseCount: number;
  isActive: boolean;
}

export interface StateHierarchy {
  stateId: string;
  stateCode: string;
  stateName: string;
  statuteOfLimitationsMonths: number;
  defaultMinimumBalance: number;
  counties: CountyHierarchy[];
}

export interface CountyHierarchy {
  countyId: string;
  fipsCode: string;
  name: string;
  statuteOfLimitationsMonthsOverride: number | null;
  minimumBalanceOverride: number | null;
  courthouses: CourthouseDetail[];
}

export interface CourthouseDetail {
  courthouseId: string;
  courthouseCode: string;
  name: string;
  eFilingStatus: string;
  filingFeeOverride: number | null;
  effectiveStatuteOfLimitationsMonths: number;
  effectiveMinimumBalance: number;
}
