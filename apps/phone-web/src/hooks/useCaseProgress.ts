import { useState, useEffect, useCallback } from 'react';

export interface PhoneMilestone {
  milestoneId: string;
  name: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface CaseProgressData {
  caseId: string;
  documentSetId: string;
  origin: 'laptop_upload' | 'kiosk_capture';
  status: string;
  milestones: PhoneMilestone[];
  specialistStates: Array<{
    specialistId: string;
    benchId: string;
    taskStatus: string;
  }>;
  errors: Array<{ message: string; timestamp: string }>;
  isLoading: boolean;
}

const API_BASE = '/api/v1';

export function useCaseProgress(caseId: string | null, pollIntervalMs: number = 5000): CaseProgressData {
  const [data, setData] = useState<CaseProgressData>({
    caseId: '',
    documentSetId: '',
    origin: 'laptop_upload',
    status: 'created',
    milestones: [],
    specialistStates: [],
    errors: [],
    isLoading: false
  });

  const fetchProgress = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/presentation`);
      if (!res.ok) return;
      const json = await res.json();
      setData({
        caseId: json.caseId || caseId,
        documentSetId: json.documentSetId || '',
        origin: json.origin || 'laptop_upload',
        status: json.status || 'created',
        milestones: json.milestones || [],
        specialistStates: (json.specialistStates || []).map((s: any) => ({
          specialistId: s.specialistId,
          benchId: s.benchId,
          taskStatus: s.taskStatus
        })),
        errors: json.errors || [],
        isLoading: false
      });
    } catch {
      // Silently fail on phone
    }
  }, [caseId]);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchProgress, pollIntervalMs]);

  return data;
}
