export interface DocumentTemplate {
  id: string;
  templateCode: string;
  name: string;
  documentType: string;
  productType: string;
  format: string;
  versionNumber: number;
  status: string;
  stateName: string | null;
  countyName: string | null;
  courthouseName: string | null;
  effectiveDate: string;
  expirationDate: string | null;
  usageCount: number;
}

export interface RationalizationReport {
  totalTemplates: number;
  activeTemplates: number;
  retiredTemplates: number;
  candidatesForRetirement: number;
  nearDuplicateClusters: number;
  consolidationOpportunities: number;
}
