import React, { useState } from 'react';
import { Cpu, Camera, CreditCard, RefreshCw, Key, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { UserRole } from '@dharmaraksha/shared-contracts';

interface DeviceManagementViewProps {
  userRole: UserRole;
  isFixture: boolean;
}

export const DeviceManagementView: React.FC<DeviceManagementViewProps> = ({ userRole, isFixture }) => {
  const [issuedCardInput, setIssuedCardInput] = useState('');
  const [assignedVisitor, setAssignedVisitor] = useState('');
  const [activeCards, setActiveCards] = useState([
    { uid: 'E280689420000000', visitor: 'Visitor #104 (Active Case)', status: 'active_session', issuedAt: '10:15 AM' },
    { uid: 'A140722130000000', visitor: 'Inventory / Ready', status: 'unassigned_inventory', issuedAt: '-' }
  ]);

  // Role Gate check: Only Operator or Admin can access
  if (userRole !== 'operator' && userRole !== 'admin') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdfbf7',
        color: '#0f172a',
        padding: '24px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #fecdd3',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <Lock style={{ width: 44, height: 44, color: '#e11d48', margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: '#881337' }}>
            Operator & Admin Area Only
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Device management, card enrollment, and UNO Q hardware pairing are restricted to authorized operators. Your current active role is <strong>[{userRole.toUpperCase()}]</strong>.
          </p>
        </div>
      </div>
    );
  }

  const handleIssueCard = () => {
    if (!issuedCardInput) return;
    setActiveCards([
      ...activeCards,
      { uid: issuedCardInput, visitor: assignedVisitor || 'Unassigned Session', status: 'active_session', issuedAt: 'Just now' }
    ]);
    setIssuedCardInput('');
    setAssignedVisitor('');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fdfbf7',
      color: '#0f172a',
      padding: '28px',
      boxSizing: 'border-box'
    }}>
      <div style={{ borderBottom: '2px solid #e7e0d3', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              UNO Q Hardware Gateway & Device Administration
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Hardware Telemetry, Camera Feed Preview, and RFID Card Provisioning
            </div>
          </div>
          <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
            ROLE: {userRole.toUpperCase()} (AUTHORIZED)
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* UNO Q Board Status Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu style={{ width: 20, height: 20, color: '#0284c7' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Arduino UNO Q Gateway</h2>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ONLINE (Port 5000)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Gateway IP Address:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>192.168.1.145:5000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Device Key Auth:</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Header Key Verified</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Local Spool Buffer:</span>
              <span style={{ fontWeight: 600 }}>0/20 Pages (Spool Clear)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Hardware Peripherals:</span>
              <span style={{ fontWeight: 600 }}>UVC Camera + SPI Reader</span>
            </div>
          </div>
        </div>

        {/* UVC Document Camera Status */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera style={{ width: 20, height: 20, color: '#ca8a04' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Overhead Document Camera</h2>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              STANDBY READY
            </span>
          </div>

          <div style={{
            height: '110px',
            background: '#090d16',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '12px',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <Camera style={{ width: 24, height: 24, color: '#38bdf8' }} />
            <span>Overhead Bed Alignment: OK (1920 × 1080 @ 30fps)</span>
          </div>
        </div>
      </div>

      {/* RFID Card Issuance Console */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e7e0d3',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CreditCard style={{ width: 20, height: 20, color: '#4f46e5' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Visitor RFID Session Provisioning</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Scan or Enter Card UID (e.g. E280689420000000)"
            value={issuedCardInput}
            onChange={(e) => setIssuedCardInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px'
            }}
          />
          <input
            type="text"
            placeholder="Visitor Name or Case Reference"
            value={assignedVisitor}
            onChange={(e) => setAssignedVisitor(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px'
            }}
          />
          <button
            onClick={handleIssueCard}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Enroll Card
          </button>
        </div>

        {/* Active Cards Table */}
        <div style={{ border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '10px 16px', background: '#f8fafc', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            <span>CARD UID</span>
            <span>ASSIGNED SESSION</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>
          {activeCards.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '12px 16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.uid}</span>
              <span>{c.visitor}</span>
              <span style={{ color: c.status === 'active_session' ? '#059669' : '#64748b', fontWeight: 600 }}>
                {c.status === 'active_session' ? 'Active' : 'Inventory'}
              </span>
              <button
                onClick={() => {
                  setActiveCards(activeCards.filter((_, idx) => idx !== i));
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                Clear / Revoke
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

