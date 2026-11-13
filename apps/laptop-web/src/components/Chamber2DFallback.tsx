import React from 'react';
import { BENCHES, BenchId, BenchDefinition, SpecialistDefinition } from '@dharmaraksha/tribunal-definitions';
import { Crown, Shield, Layers, Compass } from 'lucide-react';

interface Chamber2DFallbackProps {
  selectedBenchId: BenchId;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme: 'split' | 'light' | 'dark';
}

/**
 * Chamber2DFallback: Complete 2D architectural SVG schematic of the 50-specialist chamber.
 * Provides 100% accessible parity when WebGL is unavailable, context is lost, or user prefers 2D.
 */
export const Chamber2DFallback: React.FC<Chamber2DFallbackProps> = ({
  selectedBenchId,
  selectedSpecialistId,
  onSelectBench,
  onSelectSpecialist,
  theme
}) => {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#f9f6ef' : '#080c14';
  const floorStroke = isLight ? '#e2d9c8' : '#1e293b';
  const textPrimary = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#64748b' : '#94a3b8';

  // 2D Coordinates for the 5 Benches (SVG space 0,0 to 800,700)
  const bench2DCoords: Record<BenchId, { x: number; y: number; labelOffset: number }> = {
    A: { x: 180, y: 440, labelOffset: 50 },  // Left front
    B: { x: 210, y: 220, labelOffset: 50 },  // Left rear
    C: { x: 400, y: 130, labelOffset: 50 },  // Center rear
    D: { x: 590, y: 220, labelOffset: 50 },  // Right rear
    E: { x: 620, y: 440, labelOffset: 50 }   // Right front
  };

  const wellCoords = { x: 400, y: 360 };
  const daisCoords = { x: 400, y: 610 };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 2D Fallback Header Banner */}
      <div style={{
        padding: '8px 16px',
        background: isLight ? '#efe8d8' : '#0f172a',
        borderBottom: `1px solid ${floorStroke}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: textMuted
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass style={{ width: 14, height: 14, color: '#ca8a04' }} />
          <span style={{ fontWeight: 600, color: textPrimary }}>
            2D Architectural Floor Plan Fallback
          </span>
          <span style={{ background: '#ca8a0422', color: '#ca8a04', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
            ACCESSIBLE VIEW
          </span>
        </div>
        <div>
          Click any table or seat circle to inspect specialists
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 800 700"
          style={{ width: '100%', height: '100%', maxHeight: '680px' }}
          role="img"
          aria-label="50-Specialist Chamber Floor Plan"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="wellGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="daisGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Chamber Outer Circumference Rings */}
          <circle cx="400" cy="360" r="340" fill="none" stroke={floorStroke} strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="400" cy="360" r="280" fill="none" stroke={floorStroke} strokeWidth="1.5" />
          <circle cx="400" cy="360" r="140" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Courier Routes connecting Benches to Central Well */}
          {BENCHES.map((bench) => {
            const coords = bench2DCoords[bench.id];
            return (
              <line
                key={`route-${bench.id}`}
                x1={coords.x}
                y1={coords.y}
                x2={wellCoords.x}
                y2={wellCoords.y}
                stroke={bench.primaryColor}
                strokeWidth={selectedBenchId === bench.id ? 2.5 : 1.2}
                strokeDasharray="6 4"
                opacity={selectedBenchId === bench.id ? 0.9 : 0.4}
              />
            );
          })}

          {/* Courier Route from Central Well to Presiding Dais */}
          <line
            x1={wellCoords.x}
            y1={wellCoords.y}
            x2={daisCoords.x}
            y2={daisCoords.y - 25}
            stroke="#ca8a04"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* Central Evidence Well */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectBench('A')}
            role="button"
            tabIndex={0}
            aria-label="Central Evidence Well"
          >
            <circle cx={wellCoords.x} cy={wellCoords.y} r="54" fill="url(#wellGlow)" />
            <circle
              cx={wellCoords.x}
              cy={wellCoords.y}
              r="44"
              fill={isLight ? '#f1f5f9' : '#1e293b'}
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <circle cx={wellCoords.x} cy={wellCoords.y} r="32" fill={isLight ? '#e2e8f0' : '#0f172a'} />
            <text
              x={wellCoords.x}
              y={wellCoords.y - 6}
              textAnchor="middle"
              fill={textPrimary}
              fontSize="10"
              fontWeight="700"
              letterSpacing="1"
            >
              EVIDENCE WELL
            </text>
            <text
              x={wellCoords.x}
              y={wellCoords.y + 10}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="8"
              fontWeight="600"
            >
              SNAPSHOT V1
            </text>
          </g>

          {/* Messenger Courier Node in Transit */}
          <g transform={`translate(${wellCoords.x - 70}, ${wellCoords.y + 60})`}>
            <circle cx="0" cy="0" r="14" fill="#0284c7" opacity="0.3" />
            <polygon points="0,-10 9,0 0,10 -9,0" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="20" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="600">
              Messenger
            </text>
          </g>

          {/* AI Presiding Reviewer Dais */}
          <g
            transform={`translate(${daisCoords.x}, ${daisCoords.y})`}
            role="button"
            tabIndex={0}
            aria-label="AI Presiding Reviewer Dais"
          >
            <rect
              x="-120"
              y="-28"
              width="240"
              height="56"
              rx="12"
              fill="url(#daisGlow)"
            />
            <rect
              x="-110"
              y="-24"
              width="220"
              height="48"
              rx="8"
              fill={isLight ? '#ffffff' : '#0f172a'}
              stroke="#ca8a04"
              strokeWidth="2"
            />
            <text
              x="0"
              y="-2"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="12"
              fontWeight="800"
              letterSpacing="0.5"
            >
              AI PRESIDING REVIEWER
            </text>
            <text
              x="0"
              y="14"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9"
            >
              Chamber Synthesis & Final Adjudication Dais
            </text>
          </g>

          {/* Five Benches and 50 Specialist Seats */}
          {BENCHES.map((bench: BenchDefinition) => {
            const center = bench2DCoords[bench.id];
            const isBenchSelected = selectedBenchId === bench.id;
            const tableRadius = 38;
            const seatRingRadius = 66;

            return (
              <g key={bench.id} id={`bench-group-${bench.id}`}>
                {/* Bench Floor Dais highlight */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={seatRingRadius + 16}
                  fill={isBenchSelected ? bench.primaryColor : 'transparent'}
                  fillOpacity={isBenchSelected ? 0.08 : 0}
                  stroke={isBenchSelected ? bench.primaryColor : 'transparent'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Round Table Mesh */}
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectBench(bench.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Bench ${bench.id}: ${bench.name}`}
                >
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={tableRadius}
                    fill={isLight ? '#ffffff' : '#1e293b'}
                    stroke={isBenchSelected ? bench.primaryColor : floorStroke}
                    strokeWidth={isBenchSelected ? 3 : 1.5}
                  />
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={tableRadius - 10}
                    fill={bench.primaryColor}
                    fillOpacity={isBenchSelected ? 0.35 : 0.15}
                  />
                  <text
                    x={center.x}
                    y={center.y - 2}
                    textAnchor="middle"
                    fill={textPrimary}
                    fontSize="11"
                    fontWeight="800"
                  >
                    Bench {bench.id}
                  </text>
                  <text
                    x={center.x}
                    y={center.y + 12}
                    textAnchor="middle"
                    fill={textMuted}
                    fontSize="7"
                    fontWeight="600"
                  >
                    10 Seats
                  </text>
                </g>

                {/* 10 Individual Specialist Seats around Table */}
                {bench.specialists.map((spec: SpecialistDefinition, idx: number) => {
                  const angle = (idx / 10) * Math.PI * 2;
                  const seatX = center.x + Math.cos(angle) * seatRingRadius;
                  const seatY = center.y + Math.sin(angle) * seatRingRadius;
                  const isSpecialistSelected = selectedSpecialistId === spec.id;
                  const seatRadius = spec.isChair ? 14 : 12;

                  return (
                    <g
                      key={spec.id}
                      id={`seat-node-${spec.id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBench(bench.id);
                        onSelectSpecialist(spec.id);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${spec.id} ${spec.name} (${spec.role})${spec.isChair ? ' - Chair' : ''}`}
                    >
                      {/* Selection Halo */}
                      {isSpecialistSelected && (
                        <circle
                          cx={seatX}
                          cy={seatY}
                          r={seatRadius + 6}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Specialist Seat Circle */}
                      <circle
                        cx={seatX}
                        cy={seatY}
                        r={seatRadius}
                        fill={
                          isSpecialistSelected
                            ? '#38bdf8'
                            : spec.isChair
                              ? '#d97706'
                              : isLight
                                ? '#ffffff'
                                : '#334155'
                        }
                        stroke={
                          spec.isChair
                            ? '#fbbf24'
                            : isSpecialistSelected
                              ? '#ffffff'
                              : floorStroke
                        }
                        strokeWidth={spec.isChair ? 2 : 1}
                      />

                      {/* Seat ID or Crown */}
                      <text
                        x={seatX}
                        y={seatY + (spec.isChair ? 3 : 3.5)}
                        textAnchor="middle"
                        fill={
                          isSpecialistSelected
                            ? '#0f172a'
                            : spec.isChair
                              ? '#ffffff'
                              : isLight
                                ? '#0f172a'
                                : '#e2e8f0'
                        }
                        fontSize={spec.isChair ? '7' : '7.5'}
                        fontWeight="800"
                      >
                        {spec.isChair ? '★10' : spec.id.substring(1)}
                      </text>

                      {/* Chair Crown Icon Indicator */}
                      {spec.isChair && (
                        <polygon
                          points={`${seatX - 5},${seatY - 14} ${seatX - 3},${seatY - 10} ${seatX},${seatY - 15} ${seatX + 3},${seatY - 10} ${seatX + 5},${seatY - 14} ${seatX + 4},${seatY - 8} ${seatX - 4},${seatY - 8}`}
                          fill="#fbbf24"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2D Fallback Footer Legend */}
      <div style={{
        padding: '10px 16px',
        borderTop: `1px solid ${floorStroke}`,
        background: isLight ? '#ffffff' : '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: textMuted
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#334155', display: 'inline-block' }} />
            <span>Regular Seat (01–09)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706', border: '1px solid #fbbf24', display: 'inline-block' }} />
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Chair Seat (★10)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Active Selection</span>
          </div>
        </div>
        <div>
          Total 50 Seats: 5 Benches × 10 Specialists
        </div>
      </div>
    </div>
  );
};
