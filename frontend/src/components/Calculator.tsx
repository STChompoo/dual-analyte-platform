import { useState } from 'react'
import { saveMeasurement } from '../services/measurement'

// ===================================
// Calibration Equations
// ===================================
// Linear calibration: peak current (µA) -> concentration
// concentration = (peak - intercept) / slope

const B12_SLOPE = 0.0037
const B12_INTERCEPT = -0.0102

const FOLATE_SLOPE = 0.0634
const FOLATE_INTERCEPT = 0.0492

function calcB12(peak: number): number {
  return (peak - B12_INTERCEPT) / B12_SLOPE
}

function calcFolate(peak: number): number {
  return (peak - FOLATE_INTERCEPT) / FOLATE_SLOPE
}

// ===================================
// Types
// ===================================

type Status = 'invalid' | 'deficient' | 'borderline' | 'normal'
type RiskLevel = 'safe' | 'warning' | 'danger'

interface Risk {
  level: RiskLevel
  title: string
  description: string
}

interface CalculationResult {
  b12: number
  folate: number
  b12Status: Status
  folateStatus: Status
  risk: Risk
}

// ===================================
// Classification
// ===================================
// Negative or zero concentrations are not physiologically possible.
// They indicate a peak current at or below the calibration intercept
// (bad input, assay error, or a sample outside the calibrated range),
// not a clinical finding, so they're flagged separately rather than
// being folded into "deficient".

function classifyB12(value: number): Status {
  if (value <= 0) return 'invalid'
  if (value < 200) return 'deficient'
  if (value < 300) return 'borderline'
  return 'normal'
}

function classifyFolate(value: number): Status {
  if (value <= 0) return 'invalid'
  if (value < 2) return 'deficient'
  if (value < 4) return 'borderline'
  return 'normal'
}

// ===================================
// Risk Assessment
// ===================================

function getRisk(b12: Status, folate: Status): Risk {
  if (b12 === 'invalid' || folate === 'invalid') {
    return {
      level: 'danger',
      title: 'Invalid Calculation',
      description:
        'One or both peak current values fall outside the calibrated range, producing a non-physical (zero or negative) concentration. Recheck the input values and assay conditions before interpreting any result.'
    }
  }

  if (b12 === 'deficient' && folate === 'deficient') {
    return {
      level: 'danger',
      title: 'Combined Vitamin Deficiency Risk',
      description:
        'Both vitamin B12 and folate are below the normal reference range. Further clinical evaluation is recommended.'
    }
  }

  if (b12 === 'deficient') {
      return {
        level: 'warning',
        title: 'Vitamin Deficiency Detected',
        description:
          'Vitamin B12 concentration is below the normal range. Nutritional assessment and follow-up testing may be beneficial.'
      }
    }
  if (folate === 'deficient') {
      return {
        level: 'warning',
        title: 'Vitamin Deficiency Detected',
        description:
          'Folate concentration is below the normal range. Nutritional assessment and follow-up testing may be beneficial.'
      }
    }
  if (b12 === 'borderline' || folate === 'borderline') {
    return {
      level: 'warning',
      title: 'Borderline Vitamin Status',
      description:
        'Vitamin concentration is close to the lower reference limit and monitoring is recommended.'
    }
  }

  return {
    level: 'safe',
    title: 'Normal Vitamin Status',
    description: 'Both vitamin B12 and folate are within the normal reference range.'
  }
}

// ===================================
// ECG Line
// ===================================

function EcgLine() {
  return (
    <svg className="ecg-svg" viewBox="0 0 400 36" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="ecg-path"
        d="M0 18 L50 18 L60 5 L72 30 L82 18 L150 18 L160 5 L172 30 L182 18 L250 18 L260 5 L272 30 L282 18 L400 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

// ===================================
// Readout Card
// ===================================

interface ReadoutCardProps {
  label: string
  value: number
  unit: string
  status: Status
}

function ReadoutCard({ label, value, unit, status }: ReadoutCardProps) {
  const statusText =
    status === 'invalid'
      ? 'INVALID'
      : status === 'deficient'
      ? 'DEFICIENT'
      : status === 'borderline'
      ? 'BORDERLINE'
      : 'NORMAL'

  const statusClass =
    status === 'invalid'
      ? 'status-invalid'
      : status === 'deficient'
      ? 'status-deficient'
      : status === 'borderline'
      ? 'status-borderline'
      : 'status-normal'

  return (
    <div className={`readout-card ${statusClass}`}>
      <div className="readout-top">
        <span className="readout-label">{label}</span>
        <div className={`readout-badge ${statusClass}`}>
          <span className="badge-dot" />
          {statusText}
        </div>
      </div>

      <div className="readout-value-row">
        <span className="readout-value-num">
          {status === 'invalid' ? '—' : value.toFixed(2)}
        </span>
        <span className="readout-value-unit">{unit}</span>
      </div>
    </div>
  )
}

// ===================================
// Main Component
// ===================================

export default function VitaminCalculator() {
  const [b12Peak, setB12Peak] = useState('')
  const [folatePeak, setFolatePeak] = useState('')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  async function handleCalculate() {
    setError(null)

    const b12Value = parseFloat(b12Peak)
    const folateValue = parseFloat(folatePeak)

    if (isNaN(b12Value) || isNaN(folateValue)) {
      setError('Please enter valid peak current values.')
      return
    }

    setAnalyzing(true)
    setResult(null)

    window.setTimeout(async () => {
      const b12Result = calcB12(b12Value)
      const folateResult = calcFolate(folateValue)

      const b12Status = classifyB12(b12Result)
      const folateStatus = classifyFolate(folateResult)
      try {
        await saveMeasurement({
            vitaminB12: b12Result,
            folate: folateResult,
            b12Status,
            folateStatus,
        })
        
        console.log("Measurement saved")
    } catch (error) {
        
        console.error(
            "Failed to save measurement",
            error
        )
    }
      setResult({
        b12: b12Result,
        folate: folateResult,
        b12Status,
        folateStatus,
        risk: getRisk(b12Status, folateStatus)
      })

      setAnalyzing(false)
    }, 600)
  }

  function handleReset() {
    setB12Peak('')
    setFolatePeak('')
    setResult(null)
    setError(null)
    setAnalyzing(false)
  }

  return (
    <div className="med-container">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="med-header">

  <div className="med-cross-icon">
    +
  </div>

  <h1 className="med-title">
    VITAMIN B12 & FOLATE ANALYSER
  </h1>

  <p className="med-subtitle">
    Differential Pulse Voltammetry Calibration Analysis
  </p>

  <div className="sys-status">
    <div className="sys-dot"></div>
    ONLINE
  </div>

  <EcgLine />

</header>

      {/* Input panel */}
      <div className="panel">
        <h2 className="panel-title">INPUT</h2>

        <label className="field">
          <span className="field-label">B12 peak current (µA)</span>
          <input
            className="field-input"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 0.42"
            value={b12Peak}
            onChange={(e) => setB12Peak(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Folate peak current (µA)</span>
          <input
            className="field-input"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 0.31"
            value={folatePeak}
            onChange={(e) => setFolatePeak(e.target.value)}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <div className="button-row">
          <button className="btn btn-primary" onClick={handleCalculate} disabled={analyzing}>
            {analyzing ? 'Analyzing…' : 'Run analysis'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset} disabled={analyzing}>
            Reset
          </button>
        </div>
      </div>

      {/* Result panel */}
      {result && (
        <div className="panel">
          <h2 className="panel-title">RESULT</h2>

          <ReadoutCard label="Vitamin B12" value={result.b12} unit="pg/mL" status={result.b12Status} />
          <ReadoutCard label="Folate" value={result.folate} unit="ng/mL" status={result.folateStatus} />

          <div className={`risk-banner risk-${result.risk.level}`}>
            <h3 className="risk-title">{result.risk.title}</h3>
            <p className="risk-description">{result.risk.description}</p>
          </div>

          <p className="disclaimer">
            This tool supports calibration and lab workflow only. It is not a diagnostic device;
            reference ranges shown are illustrative and must be validated against your assay's
            own method-specific cutoffs before any clinical use.
          </p>
        </div>
      )}
    </div>
  )
}

// ===================================
// Styles
// ===================================

const STYLES = `
  .med-container {
    max-width: 520px;
    margin: auto;
  
    padding: 24px;
  
    background:
      radial-gradient(
        circle at top left,
        rgba(158,220,255,0.18),
        transparent 35%
      ),
      radial-gradient(
        circle at top right,
        rgba(244,154,223,0.18),
        transparent 35%
      ),
      #faf9ff;
  
    min-height: 100vh;
  
    font-family: Inter, sans-serif;
  }

  .med-header {
  width: 100%;
  
  background: linear-gradient(
    135deg,
    rgba(105,184,255,.18),
          rgba(53,109,255,.12)
  );

  border-radius: 30px;

  padding: 32px 24px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  color: white;

  box-shadow:
    0 15px 35px rgba(37, 99, 235, 0.25);

  margin-bottom: 28px;
}

  .header-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
  }

  .med-cross-icon {
    width: 54px;
    height: 54px;
  
    border-radius: 18px;
  
    background:
      linear-gradient(
        135deg,
        #9edcff,
        #f49adf
      );
  
    color: white;
  
    font-size: 26px;
    font-weight: 700;
  
    box-shadow:
      0 8px 24px rgba(124,92,255,0.2);
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .med-title {
    font-family: 'Inter', sans-serif;
    font-size: 25px;
    font-weight: 700;
    letter-spacing: -0.03em;
    background:
      linear-gradient(
        90deg,
        #356DFF,
        #69B8FF
      );
  
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
  }

  .med-subtitle {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.01em;
    margin-top: 6px;
  }

  .sys-status {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 14px;

  border-radius: 999px;

  background: rgba(34, 197, 94, 0.15);

  border: 1px solid rgba(34, 197, 94, 0.35);

  color: #15803d;

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;

  flex-shrink: 0;
}

  .sys-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 0 4px rgba(34, 197, 94, 0.18),
    0 0 12px #22c55e;
}

  .ecg-svg {
      width: 100%;
      height: 28px;
      color: #a46fff;
      opacity: 0.85;
  }
  .ecg-path {
    stroke-dasharray: 800;
    stroke-dashoffset: 800;
  
    animation:
      drawECG 4s linear infinite;
  }
      @keyframes drawECG {
    from {
      stroke-dashoffset: 800;
    }
  
    to {
      stroke-dashoffset: 0;
    }
  }
  .panel {
    background: rgba(255,255,255,0.85);
  
    backdrop-filter: blur(14px);
  
    border-radius: 24px;
  
    border: 1px solid rgba(124,92,255,0.08);
  
    box-shadow:
      0 10px 35px rgba(124,92,255,0.08);
  
    padding: 22px;
  }

  .panel-title {
    font-size: 14px;
    letter-spacing: 0.1em;
    color: #5a7068;
    margin: 0 0 12px;
  }

  .field {
    display: block;
    margin-bottom: 12px;
  }

  .field-label {
    display: block;
    font-size: 13px;
    color: #5a7068;
    margin-bottom: 4px;
  }

  .field-input {
    background: white;
  
    border: 2px solid #ece8ff;
  
    border-radius: 16px;
  
    padding: 14px 16px;
  
    font-size: 16px;
  
    transition: 0.25s;
  }
  
    .field-input:focus {
    border-color: #7c5cff;
  
    box-shadow:
      0 0 0 5px rgba(124,92,255,0.12);
  
    outline: none;
  }

  .error-text {
    color: #b3261e;
    font-size: 14px;
    margin: 4px 0 12px;
  }

  .button-row {
    display: flex;
    gap: 8px;
  }

  .btn {
      flex: 1;
      padding: 10px;
      font-family: Inter,"SF Pro Display",sans-serif;
      font-size: 14px;
      letter-spacing: 0.05em;
      border-radius: 3px;
      border: 1px solid transparent;
      cursor: pointer;
      box-shadow:
      0 0 0 4px rgba(34,197,94,0.12);
    }
    .btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-primary {
    background:
      linear-gradient(
        135deg,
        #356DFF,
        #5A8CFF
      );
  
    color: white;
  
    border: none;
  
    border-radius: 16px;
  
    font-weight: 600;
  
    box-shadow:
      0 8px 20px rgba(124,92,255,0.25);
  }
    .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
  
    box-shadow:
      0 12px 28px rgba(53,109,255,0.28);
  }
    .btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn-secondary {
    background: #ffffff;
  
    color: #475569;
  
    border: 1px solid #e2e8f0;
  
    border-radius: 16px;
  
    padding: 12px 18px;
  
    font-weight: 600;
  
    transition: all 0.2s ease;
  }

  .readout-card {
    background: white;
  
    border-radius: 20px;
  
    border: 1px solid #f0edff;
  
    padding: 18px;
  
    box-shadow:
      0 6px 20px rgba(124,92,255,0.06);
  }

  .readout-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .readout-label {
    font-size: 14px;
    color: #5a7068;
  }

  .readout-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 10px;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .readout-value-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .readout-value-num {
    font-size: 26px;
    font-weight: bold;
  }
  background:
      linear-gradient(
        90deg,
        #356DFF,
        #69B8FF
      );
  
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .readout-value-unit {
    font-size: 14px;
    color: #5a7068;
  }

  .status-normal { color: #1b6e4c; }
  .status-normal.readout-badge { background: #e3f5ea; }

  .status-borderline { color: #946800; }
  .status-borderline.readout-badge { background: #fbf0d9; }

  .status-deficient { color: #b3261e; }
  .status-deficient.readout-badge { background: #fbe2e0; }

  .status-invalid { color: #5a7068; }
  .status-invalid.readout-badge { background: #e6eae8; }

  .risk-banner {
    border-radius: 3px;
    padding: 12px;
    margin-top: 12px;
  }

  .risk-title {
    font-size: 15px;
    margin: 0 0 4px;
  }

  .risk-description {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }

  .risk-safe {
    background: #e3f5ea;
    color: #1b6e4c;
  }

  .risk-warning {
    background: #fbf0d9;
    color: #946800;
  }

  .risk-danger {
    background: #fbe2e0;
    color: #b3261e;
  }

  .disclaimer {
    font-size: 12px;
    color: #8a9a94;
    margin-top: 12px;
    line-height: 1.5;
  }
`
