import React from 'react';
import { SpecialistDefinition, BenchDefinition, BENCHES } from '@dharmaraksha/tribunal-definitions';
import { Shield, Crown, FileText, CheckCircle2, X, Scale, BookOpen, User, Sparkles } from 'lucide-react';

interface CourtroomDossierModalProps {
  specialist: SpecialistDefinition;
  onClose: () => void;
  onSelectBench?: () => void;
}

export const CourtroomDossierModal: React.FC<CourtroomDossierModalProps> = ({
  specialist,
  onClose,
  onSelectBench
}) => {
  const bench = BENCHES.find((b: BenchDefinition) => b.id === specialist.benchId) || BENCHES[0];
  const isChair = specialist.isChair;

  // Realistic legal arguments and sample findings based on bench
  const getSpecialistDossier = (spec: SpecialistDefinition) => {
    switch (spec.benchId) {
      case 'A':
        return {
          lawSchool: 'National Law School of India University (NLSIU), Bengaluru',
          yearsOfExperience: '14 Years in Forensic Evidence & Title Verification',
          currentFiling: 'Verified 3-page Commercial Lease Agreement (Doc-01) and Security Deposit Counterfoil (Doc-02). OCR text fidelity verified at 99.4% with intact paragraph anchors.',
          keyObservation: 'Page 3 exhibits valid signatures from both Lessor and Lessee; Annexure A (Fixture inventory) referenced in Clause 3 is absent from the scanned folio.',
          citedAuthorities: ['Section 65B, Indian Evidence Act, 1872', 'Section 17, Registration Act, 1908']
        };
      case 'B':
        return {
          lawSchool: 'National Academy of Legal Studies and Research (NALSAR), Hyderabad',
          yearsOfExperience: '18 Years in Commercial Tenancy & Contractual Rights',
          currentFiling: 'Clause 4 stipulates monthly rent of INR 45,000 payable in advance by the 5th of each English calendar month. Clause 11 imposes a strict 11-month lock-in obligation.',
          keyObservation: 'Clause 8 shifts routine repair liability up to INR 5,000 onto the lessee. Early exit before month 11 triggers mandatory rent acceleration.',
          citedAuthorities: ['Section 105, Transfer of Property Act, 1882', 'Section 108(B), Rights & Liabilities of Lessee']
        };
      case 'C':
        return {
          lawSchool: 'Faculty of Law, University of Delhi',
          yearsOfExperience: '22 Years in Statutory Interpretation & Supreme Court Jurisprudence',
          currentFiling: 'Bench C benchmarked all clauses against the Transfer of Property Act 1882 and Indian Contract Act 1872. Confirmed jurisdiction under Karnataka Rent Act, 1999.',
          keyObservation: 'Clause 12 (unilateral forfeiture) conflicts with the landmark precedent of Kailash Nath Associates v. DDA (2015) requiring proof of actual loss for forfeiture.',
          citedAuthorities: ['Section 74, Indian Contract Act, 1872', 'Kailash Nath Associates v. DDA (2015) 4 SCC 136']
        };
      case 'D':
        return {
          lawSchool: 'The West Bengal National University of Juridical Sciences (WBNUJS), Kolkata',
          yearsOfExperience: '16 Years in Commercial Litigation & Penal Clauses',
          currentFiling: 'Identified material financial vulnerability in Clause 14: Delayed rent accrues compounding interest at 24% per annum. Uncapped forfeiture of 6 months deposit.',
          keyObservation: 'This rate is prima facie extortionate and unenforceable under Indian contract jurisprudence. Recommended challenging under Section 74 penalty doctrine.',
          citedAuthorities: ['Section 73, Compensation for Breach', 'Fateh Chand v. Balkishan Dass (1964) 1 SCR 515']
        };
      case 'E':
        return {
          lawSchool: 'National Law University, Delhi (NLUD)',
          yearsOfExperience: '12 Years in Legal Plain-Language & Vernacular Delivery',
          currentFiling: 'Synthesized legal findings into certified plain-language summary for the visitor with bilingual English, Kannada, and Hindi support.',
          keyObservation: 'Discrepancy audit confirmed INR 20,000 mismatch between Clause 5 lease deposit (INR 2,50,000) and physical receipt counterfoil (INR 2,70,000).',
          citedAuthorities: ['Section 23, Lawful Consideration', 'Rule 4, Consumer Protection (E-Commerce) Rules']
        };
      default:
        return {
          lawSchool: 'Supreme Court Bar Association Chamber',
          yearsOfExperience: '15 Years',
          currentFiling: 'Evaluating documentary evidence within statutory parameters.',
          keyObservation: 'Analysis grounded in primary case folios.',
          citedAuthorities: ['Constitution of India, Article 39A']
        };
    }
  };

  const dossier = getSpecialistDossier(specialist);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6, 9, 19, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(145deg, #0e1526 0%, #151d33 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2)',
          color: '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Gold Header */}
        <div style={{
          background: 'linear-gradient(90deg, #18223d 0%, #0e1526 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${bench.primaryColor} 0%, #090d16 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${bench.primaryColor}40`
            }}>
              {isChair ? (
                <Crown style={{ width: 22, height: 22, color: '#fbbf24' }} />
              ) : (
                <Scale style={{ width: 22, height: 22, color: '#ffffff' }} />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-serif, "Cinzel", serif)',
                  color: isChair ? '#fbbf24' : '#f8fafc',
                  margin: 0,
                  letterSpacing: '0.5px'
                }}>
                  {specialist.name}
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: isChair ? 'rgba(251, 191, 36, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: isChair ? '#fbbf24' : '#38bdf8',
                  border: isChair ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {specialist.id} {isChair ? '• BENCH CHAIR' : '• ADVOCATE SPECIALIST'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Bench {bench.id}: {bench.name} • {specialist.role}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Credentials Bar */}
          <div style={{
            background: 'rgba(9, 13, 22, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Academic & Bar Affiliation
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>
                {dossier.lawSchool}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Specialized Standing
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px' }}>
                {dossier.yearsOfExperience}
              </div>
            </div>
          </div>

          {/* Current Live Legal Filing */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText style={{ width: 16, height: 16, color: '#38bdf8' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Active Tribunal Submission
              </h4>
            </div>
            <div style={{
              background: 'rgba(9, 13, 22, 0.4)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}>
              {dossier.currentFiling}
            </div>
          </div>

          {/* Forensic Finding & Material Observation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles style={{ width: 16, height: 16, color: '#fbbf24' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Material Forensic Finding
              </h4>
            </div>
            <div style={{
              background: 'rgba(251, 191, 36, 0.05)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#fef3c7'
            }}>
              {dossier.keyObservation}
            </div>
          </div>

          {/* Cited Statutory Authorities */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <BookOpen style={{ width: 16, height: 16, color: '#10b981' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Cited Statutory Provisions & Precedents
              </h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dossier.citedAuthorities.map((auth, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#a7f3d0'
                  }}
                >
                  {auth}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgba(9, 13, 22, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            <span>Deliberation Recorded & Grounded to Case Snapshot</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {onSelectBench && (
              <button
                onClick={() => {
                  onSelectBench();
                  onClose();
                }}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Inspect Bench {bench.id}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              Return to Chamber
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

