import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CharacterActivity
} from '../components/character/types.js';
import {
  ChamberAnimationState,
  buildChamberState
} from '../components/character/activity-state-engine.js';

export interface CaseMilestone {
  milestoneId: string;
  name: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface UseCaseEventsResult {
  chamberState: ChamberAnimationState;
  milestones: CaseMilestone[];
  origin: 'laptop_upload' | 'kiosk_capture';
  caseStatus: string;
  documentSetId: string;
  isConnected: boolean;
  lastEventCursor: number;
  errors: Array<{ message: string; timestamp: string }>;
}

const API_BASE = '/api/v1';

const DEFAULT_CHAMBER_STATE: ChamberAnimationState = {
  specialistActivities: new Map(),
  messengerActivity: 'idle_breathing',
  presidingActivity: 'idle_breathing'
};

/**
 * SSE client hook for binding backend state to 3D chamber animations.
 * 
 * On mount/reconnect: fetches current snapshot state via REST (no replay of old walks).
 * SSE stream: applies incremental updates from real events.
 * Handles: duplicates (idempotent by event ID), late events, cancellations.
 */
export function useCaseEvents(caseId: string | null | undefined): UseCaseEventsResult {
  const [chamberState, setChamberState] = useState<ChamberAnimationState>(DEFAULT_CHAMBER_STATE);
  const [milestones, setMilestones] = useState<CaseMilestone[]>([]);
  const [origin, setOrigin] = useState<'laptop_upload' | 'kiosk_capture'>('laptop_upload');
  const [caseStatus, setCaseStatus] = useState('created');
  const [documentSetId, setDocumentSetId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [errors, setErrors] = useState<Array<{ message: string; timestamp: string }>>([]);
  const lastCursorRef = useRef(0);
  const seenEventIds = useRef(new Set<string>());
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch current state snapshot via REST (no animation replay)
  const fetchCurrentState = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/presentation`);
      if (!res.ok) return;
      const data = await res.json();

      setOrigin(data.origin || 'laptop_upload');
      setCaseStatus(data.status || 'created');
      setDocumentSetId(data.documentSetId || '');
      setMilestones(data.milestones || []);
      setErrors(data.errors || []);

      // Build chamber state from current snapshot
      const state = buildChamberState(
        data.specialistStates || [],
        data.messengerState || { activity: 'idle_breathing', inTransit: false },
        data.presidingState || { activity: 'idle_breathing', synthesisStatus: 'awaiting' }
      );
      setChamberState(state);
    } catch {
      // Silently fail — will retry on SSE reconnect
    }
  }, [caseId]);

  // Handle incoming SSE event (incremental update)
  const handleSSEEvent = useCallback((eventData: any) => {
    if (!eventData || !eventData.eventId) return;

    // Deduplication by event ID
    if (seenEventIds.current.has(eventData.eventId)) return;
    seenEventIds.current.add(eventData.eventId);

    // Track cursor for reconnection
    if (eventData.cursor > lastCursorRef.current) {
      lastCursorRef.current = eventData.cursor;
    }

    const payload = eventData.payload || {};
    const eventType: string = eventData.eventType || '';

    // Update specialist activity based on event type
    if (eventType.startsWith('specialist:') && payload.specialistId) {
      setChamberState(prev => {
        const newActivities = new Map(prev.specialistActivities);
        let activity: CharacterActivity = 'idle_breathing';

        switch (eventType) {
          case 'specialist:task_assigned':
            activity = 'attentive_listening';
            break;
          case 'specialist:task_started':
            activity = 'attentive_listening';
            break;
          case 'specialist:reading_evidence':
            activity = 'seated_reading';
            break;
          case 'specialist:checking_source':
            activity = 'checking_source';
            break;
          case 'specialist:writing_finding':
            activity = 'note_taking';
            break;
          case 'specialist:discussing':
            activity = 'discussion_gesture';
            break;
          case 'specialist:task_completed':
            activity = 'idle_breathing';
            break;
          case 'specialist:task_failed':
            activity = 'idle_breathing';
            break;
        }

        newActivities.set(payload.specialistId, activity);
        return { ...prev, specialistActivities: newActivities };
      });
    }

    // Update messenger
    if (eventType === 'messenger:in_transit' || eventType === 'messenger:transit_started') {
      setChamberState(prev => ({ ...prev, messengerActivity: 'messenger_locomotion' }));
    }
    if (eventType === 'messenger:packet_delivered' || eventType === 'messenger:transit_handoff') {
      setChamberState(prev => ({ ...prev, messengerActivity: 'idle_breathing' }));
    }

    // Update presiding
    if (eventType === 'presiding:synthesis_started') {
      setChamberState(prev => ({ ...prev, presidingActivity: 'seated_reading' }));
    }
    if (eventType === 'presiding:synthesis_completed' || eventType === 'presiding:synthesis_ready') {
      setChamberState(prev => ({ ...prev, presidingActivity: 'idle_breathing' }));
    }

    // Handle cancellation — reset ALL to idle
    if (eventType === 'case:cancelled' || eventType === 'case:run_canceled') {
      setChamberState({
        specialistActivities: new Map(),
        messengerActivity: 'idle_breathing',
        presidingActivity: 'idle_breathing'
      });
      setCaseStatus('cancelled');
    }

    // Add milestone for significant events
    const milestoneEvents = new Set([
      'case:created',
      'document:intake_finished',
      'case:snapshot_frozen',
      'case:analysis_started',
      'bench:packet_sealed',
      'bench:packet_ready',
      'messenger:packet_delivered',
      'presiding:synthesis_started',
      'presiding:synthesis_completed',
      'report:ready_for_review'
    ]);
    if (milestoneEvents.has(eventType)) {
      setMilestones(prev => {
        if (prev.some(m => m.milestoneId === eventData.eventId)) return prev; // Dedup
        return [
          ...prev,
          {
            milestoneId: eventData.eventId,
            name: eventType.replace(/[.:_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: payload.description || eventType,
            timestamp: eventData.timestamp || new Date().toISOString(),
            status: 'completed'
          }
        ];
      });
    }
  }, []);

  // SSE connection lifecycle
  useEffect(() => {
    if (!caseId) {
      setChamberState(DEFAULT_CHAMBER_STATE);
      setMilestones([]);
      return;
    }

    // On mount/case change: fetch current state (no replay)
    fetchCurrentState();

    // Connect SSE for real-time incremental updates
    const sseUrl = `${API_BASE}/cases/${caseId}/events${lastCursorRef.current > 0 ? `?afterCursor=${lastCursorRef.current}` : ''}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEEvent(data);
      } catch {
        /* ignore parse errors */
      }
    };

    // Listen for specific named event types
    const eventTypes = [
      'specialist:task_assigned',
      'specialist:task_started',
      'specialist:reading_evidence',
      'specialist:checking_source',
      'specialist:writing_finding',
      'specialist:discussing',
      'specialist:task_completed',
      'specialist:task_failed',
      'specialist:task_progress',
      'bench:packet_sealed',
      'bench:packet_ready',
      'messenger:in_transit',
      'messenger:transit_started',
      'messenger:packet_delivered',
      'messenger:transit_handoff',
      'presiding:synthesis_started',
      'presiding:synthesis_completed',
      'presiding:synthesis_ready',
      'case:created',
      'case:snapshot_frozen',
      'case:analysis_started',
      'case:cancelled',
      'case:run_canceled',
      'document:intake_finished',
      'report:ready_for_review'
    ];

    for (const et of eventTypes) {
      es.addEventListener(et, (event: any) => {
        try {
          const data = JSON.parse(event.data);
          handleSSEEvent(data);
        } catch {
          /* ignore */
        }
      });
    }

    es.onerror = () => {
      setIsConnected(false);
      // On reconnect, fetch current state (don't replay old animations)
      setTimeout(() => fetchCurrentState(), 2000);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [caseId, fetchCurrentState, handleSSEEvent]);

  return {
    chamberState,
    milestones,
    origin,
    caseStatus,
    documentSetId,
    isConnected,
    lastEventCursor: lastCursorRef.current,
    errors
  };
}
