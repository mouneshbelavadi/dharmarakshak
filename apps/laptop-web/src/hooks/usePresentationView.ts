import { useState, useEffect, useCallback } from 'react';

export interface PresentationViewData {
  caseId: string;
  documentSetId: string;
  origin: 'laptop_upload' | 'kiosk_capture';
  status: string;
  milestones: Array<{
    milestoneId: string;
    name: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  specialistStates: Array<{
    specialistId: string;
    benchId: string;
    activity: string;
    taskStatus: string;
  }>;
  findings?: {
    executiveSummary?: string;
    keyObligations?: string[];
    materialRisks?: string[];
    criticalDeadlines?: string[];
    inconsistenciesIdentified?: string[];
    questionsForVisitorClarification?: string[];
    missingDocumentsOrExhibits?: string[];
    statutoryCoverageLimitations?: string[];
  };
  errors: Array<{ message: string; timestamp: string }>;
  isLoading: boolean;
  fetchError: string | null;
}

const API_BASE = '/api/v1';

export function usePresentationView(caseId: string | null | undefined): PresentationViewData {
  const [data, setData] = useState<PresentationViewData>({
    caseId: '',
    documentSetId: '',
    origin: 'laptop_upload',
    status: 'created',
    milestones: [],
    specialistStates: [],
    errors: [],
    isLoading: false,
    fetchError: null
  });

  const fetchPresentation = useCallback(async () => {
    if (!caseId) return;
    setData(prev => ({ ...prev, isLoading: true, fetchError: null }));
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/presentation`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData({
        caseId: json.caseId || caseId,
        documentSetId: json.documentSetId || '',
        origin: json.origin || 'laptop_upload',
        status: json.status || 'created',
        milestones: json.milestones || [],
        specialistStates: json.specialistStates || [],
        findings: json.findings,
        errors: json.errors || [],
        isLoading: false,
        fetchError: null
      });
    } catch (err: any) {
      setData(prev => ({ ...prev, isLoading: false, fetchError: err.message }));
    }
  }, [caseId]);

  useEffect(() => {
    fetchPresentation();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchPresentation, 10000);
    return () => clearInterval(interval);
  }, [fetchPresentation]);

  return data;
}
