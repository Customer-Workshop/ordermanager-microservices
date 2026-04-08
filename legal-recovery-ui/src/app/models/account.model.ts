export interface Account {
  id: string;
  accountNumber: string;
  debtorName: string;
  originalBalance: number;
  currentBalance: number;
  productType: string;
  status: string;
  currentStage: string;
  selectionScore: number | null;
  caseNumber: string | null;
  stateName: string;
  countyName: string;
  courthouseName: string;
  attorneyName: string | null;
}

export interface CreateAccountRequest {
  accountNumber: string;
  debtorName: string;
  originalBalance: number;
  currentBalance: number;
  productType: string;
  stateId: string;
  countyId: string;
  courthouseId: string;
}
