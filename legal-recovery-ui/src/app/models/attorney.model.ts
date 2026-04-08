export interface Attorney {
  id: string;
  firstName: string;
  lastName: string;
  barNumber: string;
  firmName: string;
  email: string;
  phone: string;
  isActive: boolean;
  maxCaseLoad: number;
  currentCaseCount: number;
}

export interface EligibleAttorney {
  attorneyId: string;
  name: string;
  barNumber: string;
  firmName: string;
  currentCaseCount: number;
  maxCaseLoad: number;
  isLocalCounsel: boolean;
}
