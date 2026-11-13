import React, { useState } from 'react';
import { CaseRecord, LaptopTheme } from '@dharmaraksha/shared-contracts';
import {
  Scale,
  Shield,
  FileCheck,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  HelpCircle,
  Award,
  Globe
} from 'lucide-react';

interface JudicialDecreeViewProps {
  currentCase: CaseRecord;
  theme?: LaptopTheme;
}

export const JudicialDecreeView: React.FC<JudicialDecreeViewProps> = ({
  currentCase,
  theme = 'split'
}) => {
  const isLight = theme === 'light';
  const [vernacularLang, setVernacularLang] = useState<'en' | 'kn' | 'hi'>('en');

  const summary = currentCase.presidingSummary || {
    executiveSummary: 'This preliminary legal review covers the Commercial Lease Agreement and Security Deposit Counterfoil.',
    keyObligations: [
      'Clause 4: Monthly rent of INR 45,000 payable strictly in advance on or before the 5th of each English calendar month.',
      'Clause 8: Lessee is strictly responsible for minor interior repairs up to INR 5,000 per instance.',
      'Clause 11: Mandatory 11-month lock-in period during which lessee cannot terminate without penalty.'
    ],
    materialRisks: [
      'Clause 12: Lessor reserves unilateral right to forfeit 100% of the 6-month security deposit upon early termination.',
      'Clause 14: Delayed rent accrues compounding interest at 24% per annum (prima facie penal interest).'
    ],
    criticalDeadlines: [
      'Rent Payment: 5th of every month',
      'Renewal Notice: Written intimation required 60 days prior to lease expiry'
    ],
    inconsistenciesIdentified: [
      'Cross-Document Conflict: Deposit receipt dated 12-Oct shows payment of INR 2,70,000, whereas Clause 5 records INR 2,50,000.'
    ],
    questionsForVisitorClarification: [
      'Can you produce the stamped bank receipt for the additional INR 20,000 difference?',
      'Has the physical inspection checklist (Annexure A) been signed by the lessor?'
    ],
    statutoryCoverageLimitations: [
      'State-specific Rent Control exemptions for commercial premises exceeding specified municipal valuation require confirmation of local municipal notification.'
    ]
  };

  // Vernacular plain-language summaries
  const vernacularTranslations = {
    en: {
      headline: 'Certified Plain-Language Summary for the Citizen',
      rentText: 'You are renting this commercial property for 11 months at ₹45,000 per month. Rent is strictly due on or before the 5th of every month.',
      depositText: 'You paid a security deposit, but there is a ₹20,000 discrepancy between your receipt (₹2,70,000) and the lease clause (₹2,50,000). Keep both receipts safe.',
      riskText: 'WARNING: The landlord inserted a clause claiming they can take your entire deposit if you leave early. Under Indian Supreme Court law (Kailash Nath case), they cannot legally do this without proving real financial loss.',
      interestText: 'The 24% compound interest penalty for delayed rent is considered illegal and penal by Indian courts.'
    },
    kn: {
      headline: 'ನಾಗರಿಕರಿಗಾಗಿ ದೃಢೀಕೃತ ಸರಳ ಭಾಷಾ ಸಾರಾಂಶ (ಕನ್ನಡ)',
      rentText: 'ನೀವು ಈ ವಾಣಿಜ್ಯ ಆಸ್ತಿಯನ್ನು ತಿಂಗಳಿಗೆ ₹45,000 ದರದಲ್ಲಿ 11 ತಿಂಗಳವರೆಗೆ ಬಾಡಿಗೆಗೆ ಪಡೆಯುತ್ತಿದ್ದೀರಿ. ಪ್ರತಿ ತಿಂಗಳ 5 ನೇ ತಾರೀಖಿನೊಳಗೆ ಬಾಡಿಗೆಯನ್ನು ಪಾವತಿಸಬೇಕು.',
      depositText: 'ನೀವು ಭದ್ರತಾ ಠೇವಣಿ ಪಾವತಿಸಿದ್ದೀರಿ, ಆದರೆ ನಿಮ್ಮ ರಸೀದಿ (₹2,70,000) ಮತ್ತು ಗುತ್ತಿಗೆ ಷರತ್ತು (₹2,50,000) ನಡುವೆ ₹20,000 ವ್ಯತ್ಯಾಸವಿದೆ. ಎರಡೂ ರಸೀದಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.',
      riskText: 'ಎಚ್ಚರಿಕೆ: ನೀವು ಅವಧಿಗಿಂತ ಮುಂಚಿತವಾಗಿ ಹೊರಬಂದರೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಠೇವಣಿಯನ್ನು ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಬಹುದು ಎಂದು ಮಾಲೀಕರು ಬರೆದಿದ್ದಾರೆ. ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ತೀರ್ಪಿನ ಪ್ರಕಾರ (ಕೈಲಾಶ್ ನಾಥ್ ಕೇಸ್), ನೈಜ ನಷ್ಟವನ್ನು ಸಾಬೀತುಪಡಿಸದೆ ಅವರು ಇದನ್ನು ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
      interestText: 'ತಡವಾಗಿ ಬಾಡಿಗೆ ಪಾವತಿಗೆ ವಿಧಿಸಲಾದ 24% ಚಕ್ರಬಡ್ಡಿ ದಂಡವು ಭಾರತೀಯ ನ್ಯಾಯಾಲಯಗಳ ಪ್ರಕಾರ ಕಾನೂನುಬಾಹಿರವಾಗಿದೆ.'
    },
    hi: {
      headline: 'नागरिक के लिए प्रमाणित सरल भाषा सारांश (हिन्दी)',
      rentText: 'आप इस वाणिज्यिक संपत्ति को ₹45,000 प्रति माह पर 11 महीने के लिए किराए पर ले रहे हैं। किराया हर महीने की 5 तारीख तक देना अनिवार्य है।',
      depositText: 'आपने सुरक्षा जमा (डिपॉजिट) का भुगतान किया है, लेकिन आपकी रसीद (₹2,70,000) और अनुबंध की धारा (₹2,50,000) में ₹20,000 का अंतर है। दोनों प्रतियां सुरक्षित रखें।',
      riskText: 'चेतावनी: मकान मालिक ने लिखा है कि यदि आप 11 महीने से पहले खाली करते हैं तो पूरी जमा राशि जब्त कर ली जाएगी। सुप्रीम कोर्ट के फैसलों (कैलाश नाथ केस) के अनुसार, वे बिना वास्तविक नुकसान साबित किए ऐसा नहीं कर सकते।',
      interestText: 'देरी से किराया देने पर 24% चक्रवृद्धि ब्याज का जुर्माना भारतीय अदालतों द्वारा दंडात्मक और अमान್ಯ माना जाता है।'
    }
  };

  const activeTranslation = vernacularTranslations[vernacularLang];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#05070e',
      color: '#1a1208',
      padding: '40px 10%',
      boxSizing: 'border-box'
    }}>
      {/* High Court Folio Paper Container */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        background: '#fdfaf3',
        color: '#1a1208',
        border: '1px solid #c9a84c',
        borderTop: '5px solid #c9a84c',
        borderRadius: '4px',
        padding: '60px 72px',
        boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        boxSizing: 'border-box'
      }}>
        {/* Court Crest & Judicial Heading */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid #d4c5a9', paddingBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
            marginBottom: '14px'
          }}>
            <Scale style={{ width: 30, height: 30 }} />
          </div>

          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#8b6218',
            fontFamily: 'var(--font-serif)',
            textAlign: 'center',
            marginBottom: '6px'
          }}>
            यतो धर्मस्ततो जयः • WHERE THERE IS DHARMA, THERE IS VICTORY
          </div>

          <h1 style={{
            fontSize: '20px',
            fontWeight: 800,
            fontFamily: 'var(--font-serif)',
            textAlign: 'center',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#1a1208',
            margin: '0 0 4px 0'
          }}>
            IN THE SUPREME APPELLATE TRIBUNAL OF DHARMARAKSHA
          </h1>

          <div style={{
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#7a6a52',
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            EXTRAORDINARY LEGAL ADJUDICATION JURISDICTION • COMMERCIAL CASE NO. 001/2026
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '11.5px',
            color: '#7a6a52',
            fontFamily: 'var(--font-serif)'
          }}>
            <span>Case ID: <strong>{currentCase.caseId}</strong></span>
            <span>•</span>
            <span>Snapshot: <strong>Version {currentCase.currentSnapshotVersion}</strong></span>
            <span>•</span>
            <span>Reviewed: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
          </div>
        </div>

        {/* Bench Coram Composition */}
        <div style={{
          background: '#f7f2e8',
          border: '1px solid #d4c5a9',
          borderLeft: '4px solid #8b6218',
          borderRadius: '4px',
          padding: '16px 20px',
          fontSize: '12px',
          lineHeight: 1.6
        }}>
          <div style={{ fontWeight: 800, color: '#8b6218', fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Coram & Judicial Bench Composition:
          </div>
          <div style={{ color: '#2a1e10' }}>
            <strong>Hon'ble Presiding Reviewer (Chief Justice)</strong> presiding with <strong>Chair A10</strong> (Forensic Documents), <strong>Chair B10</strong> (Contractual Obligations), <strong>Chair C10</strong> (Indian Statutory Precedents), <strong>Chair D10</strong> (Adversarial Penal Clauses), and <strong>Chair E10</strong> (Plain-Language Synthesis). Unanimous 50-specialist chamber coram.
          </div>
        </div>

        {/* Formal Operative Decree & Adjudication Summary */}
        <div>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: '#8b6218',
            letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(139,98,24,0.3)',
            paddingBottom: '6px',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Award style={{ width: 16, height: 16, color: '#8b6218' }} />
            I. Master Judicial Findings & Operative Directions
          </h2>
          <div style={{
            fontSize: '13px',
            lineHeight: 1.7,
            color: '#2a1e10',
            fontFamily: 'Inter',
            borderLeft: '3px solid #d4c5a9',
            paddingLeft: '16px',
            textAlign: 'justify'
          }}>
            {summary.executiveSummary}
          </div>
        </div>

        {/* Critical Statutory Obligations */}
        <div>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: '#8b6218',
            letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(139,98,24,0.3)',
            paddingBottom: '6px',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileCheck style={{ width: 16, height: 16, color: '#8b6218' }} />
            II. Material Contractual & Financial Obligations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summary.keyObligations.map((ob, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: '3px solid #d4c5a9',
                  paddingLeft: '16px',
                  color: '#2a1e10',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  fontFamily: 'Inter'
                }}
              >
                {ob}
              </div>
            ))}
          </div>
        </div>

        {/* High Legal Risks & Unenforceable Penalties */}
        <div>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: '#8b6218',
            letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(139,98,24,0.3)',
            paddingBottom: '6px',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle style={{ width: 16, height: 16, color: '#8b6218' }} />
            III. Material Vulnerabilities & Unconscionable Clauses
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summary.materialRisks.map((risk, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: '3px solid #d4c5a9',
                  paddingLeft: '16px',
                  color: '#2a1e10',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  fontFamily: 'Inter'
                }}
              >
                {risk}
              </div>
            ))}
          </div>
        </div>

        {/* Critical Statutory Deadlines */}
        <div>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: '#8b6218',
            letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(139,98,24,0.3)',
            paddingBottom: '6px',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock style={{ width: 16, height: 16, color: '#8b6218' }} />
            IV. Critical Statutory Deadlines & Intimations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {summary.criticalDeadlines.map((dl, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: '3px solid #d4c5a9',
                  paddingLeft: '16px',
                  color: '#2a1e10',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  fontFamily: 'Inter'
                }}
              >
                {dl}
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Document Discrepancy Alert */}
        {summary.inconsistenciesIdentified.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: '#8b6218',
              letterSpacing: '0.5px',
              borderBottom: '1px solid rgba(139,98,24,0.3)',
              paddingBottom: '6px',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <HelpCircle style={{ width: 16, height: 16, color: '#8b6218' }} />
              V. Flagged Documentary Inconsistencies
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.inconsistenciesIdentified.map((inc, idx) => (
                <div
                  key={idx}
                  style={{
                    borderLeft: '3px solid #d4c5a9',
                    paddingLeft: '16px',
                    color: '#2a1e10',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    fontFamily: 'Inter'
                  }}
                >
                  {inc}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certified Plain-Language & Vernacular Delivery */}
        <div style={{
          background: '#f7f2e8',
          border: '1px solid #d4c5a9',
          borderTop: '3px solid #8b6218',
          borderRadius: '4px',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: 18, height: 18, color: '#8b6218' }} />
              <h3 style={{
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-serif)',
                color: '#8b6218',
                margin: 0
              }}>
                {activeTranslation.headline}
              </h3>
            </div>

            {/* Language Switcher Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setVernacularLang('en')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  background: vernacularLang === 'en' ? '#1a1208' : 'transparent',
                  color: vernacularLang === 'en' ? '#f4f6fb' : '#7a6a52',
                  border: vernacularLang === 'en' ? '1px solid #1a1208' : '1px solid #c9a84c',
                  cursor: 'pointer'
                }}
              >
                English
              </button>
              <button
                onClick={() => setVernacularLang('kn')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  background: vernacularLang === 'kn' ? '#1a1208' : 'transparent',
                  color: vernacularLang === 'kn' ? '#f4f6fb' : '#7a6a52',
                  border: vernacularLang === 'kn' ? '1px solid #1a1208' : '1px solid #c9a84c',
                  cursor: 'pointer'
                }}
              >
                ಕನ್ನಡ (Kannada)
              </button>
              <button
                onClick={() => setVernacularLang('hi')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  background: vernacularLang === 'hi' ? '#1a1208' : 'transparent',
                  color: vernacularLang === 'hi' ? '#f4f6fb' : '#7a6a52',
                  border: vernacularLang === 'hi' ? '1px solid #1a1208' : '1px solid #c9a84c',
                  cursor: 'pointer'
                }}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', lineHeight: 1.7, color: '#2a1e10', fontFamily: 'Inter' }}>
            <div style={{ borderLeft: '3px solid #d4c5a9', paddingLeft: '14px' }}>
              <strong>Rent & Tenure:</strong> {activeTranslation.rentText}
            </div>
            <div style={{ borderLeft: '3px solid #d4c5a9', paddingLeft: '14px' }}>
              <strong>Deposit Warning:</strong> {activeTranslation.depositText}
            </div>
            <div style={{ borderLeft: '3px solid #d4c5a9', paddingLeft: '14px' }}>
              <strong>Forfeiture Clause:</strong> {activeTranslation.riskText}
            </div>
            <div style={{ borderLeft: '3px solid #d4c5a9', paddingLeft: '14px' }}>
              <strong>Interest Doctrine:</strong> {activeTranslation.interestText}
            </div>
          </div>
        </div>

        {/* Decorative Rule above SHA-256 */}
        <div style={{ borderTop: '1px solid #d4c5a9', marginTop: '32px', marginBottom: '24px' }} />

        {/* SHA-256 Hash Section & Judicial Signature */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#7a6a52',
            background: '#f7f2e8',
            border: '1px solid #d4c5a9',
            borderRadius: '4px',
            padding: '12px 16px',
            textAlign: 'center'
          }}>
            SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield style={{ width: 22, height: 22, color: '#8b6218' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#8b6218', fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>
                DIGITALLY SEALED OPERATIVE DECREE
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#1a1208' }}>
                By Order of the Supreme Tribunal
              </div>
              <div style={{ fontSize: '11px', color: '#7a6a52' }}>
                Presiding Judicial Officer & Master Coram
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

