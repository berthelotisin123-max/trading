import { useState } from 'react';
import type { FormEvent } from 'react';
import { useToast } from '../context/ToastContext';

interface RiskResult {
  riskBudget: number;
  units: number;
  stopDistance: number;
  targetAmount: number;
  rewardRisk: number;
}

const EMPTY: RiskResult | null = null;

export default function Risk() {
  const { toast } = useToast();
  const [result, setResult] = useState<RiskResult | null>(EMPTY);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const balance = Number(data.get('balance'));
    const riskPct = Number(data.get('riskPct'));
    const entry = Number(data.get('entry'));
    const stop = Number(data.get('stop'));
    const target = Number(data.get('target'));
    const unitValue = Number(data.get('unitValue'));

    const stopDistance = Math.abs(entry - stop);
    const validTarget = (stop < entry && target > entry) || (stop > entry && target < entry);
    const allFinite = [balance, riskPct, entry, stop, target, unitValue].every(Number.isFinite);

    if (!allFinite || balance <= 0 || riskPct <= 0 || riskPct > 100 || stopDistance <= 0 || unitValue <= 0 || !validTarget) {
      toast('Check values: stop and target must be on opposite sides of entry.');
      return;
    }

    const riskBudget = (balance * riskPct) / 100;
    const units = riskBudget / (stopDistance * unitValue);
    const targetDistance = Math.abs(target - entry);
    const targetAmount = targetDistance * units * unitValue;

    setResult({ riskBudget, units, stopDistance, targetAmount, rewardRisk: targetDistance / stopDistance });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Risk management</div>
          <h1>Position risk calculator</h1>
          <p>Estimate risk from your account size and planned stop distance.</p>
        </div>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Trade parameters</h2>
              <p>Enter consistent price and account-currency units</p>
            </div>
            <span className="tag warn">Estimate</span>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>Account balance<input name="balance" type="number" min="0.01" step="any" defaultValue="10000" required /></label>
            <label>Risk per trade (%)<input name="riskPct" type="number" min="0.01" max="100" step="any" defaultValue="1" required /></label>
            <label>Entry price<input name="entry" type="number" step="any" defaultValue="100" required /></label>
            <label>Stop-loss price<input name="stop" type="number" step="any" defaultValue="98" required /></label>
            <label>Take-profit price<input name="target" type="number" step="any" defaultValue="104" required /></label>
            <label>
              Account-currency value per 1 price unit per position unit
              <input name="unitValue" type="number" min="0.000001" step="any" defaultValue="1" required />
            </label>
            <div className="full"><button className="btn primary" type="submit">Calculate estimate</button></div>
          </form>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Result</h2>
              <p>Calculated from the values you provided</p>
            </div>
          </div>
          <div className="watchlist" aria-live="polite">
            {result ? (
              <>
                <div className="market-row"><span>Risk budget</span><b>{result.riskBudget.toFixed(2)}</b></div>
                <div className="market-row"><span>Estimated position units</span><b>{result.units.toFixed(4)}</b></div>
                <div className="market-row"><span>Stop distance</span><b>{result.stopDistance.toFixed(5)}</b></div>
                <div className="market-row"><span>Potential target amount</span><b>{result.targetAmount.toFixed(2)}</b></div>
                <div className="market-row"><span>Planned reward / risk</span><b>{result.rewardRisk.toFixed(2)} : 1</b></div>
              </>
            ) : (
              <div className="market-row"><span>Enter parameters to calculate</span><span className="muted">—</span></div>
            )}
          </div>
          <p className="chart-footnote">
            Position units are estimated as risk budget ÷ (entry-to-stop distance × value per price unit).
            This does not infer pip value, lot size, margin, contract multiplier, fees, or currency conversion.
            Confirm instrument specifications with your broker.
          </p>
        </div>
      </div>
    </>
  );
}
