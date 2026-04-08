export interface Garnishment {
  id: string;
  accountId: string;
  accountNumber: string;
  debtorName: string;
  garnishmentType: string;
  amount: number;
  status: string;
  issuedDate: string;
  servedDate: string | null;
  courtName: string;
}
