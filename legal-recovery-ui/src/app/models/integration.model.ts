export interface IntegrationPartner {
  id: string;
  partnerName: string;
  direction: string;
  protocol: string;
  dataFormat: string;
  frequency: string;
  isActive: boolean;
  supportsApi: boolean;
  apiEndpoint: string | null;
  sftpHost: string | null;
}

export interface IntegrationDashboard {
  totalPartners: number;
  activePartners: number;
  sftpOnlyPartners: number;
  apiPartners: number;
  dualModePartners: number;
  partners: IntegrationPartner[];
}
