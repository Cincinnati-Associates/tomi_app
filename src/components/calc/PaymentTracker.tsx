"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Person, ProFormaScenario, MortgageDetails } from './types';
import { calculateRemainingBalance } from '@/services/calculatorService';

interface PaymentTrackerProps {
  people: Person[];
  scenarios: ProFormaScenario[];
  setScenarios: React.Dispatch<React.SetStateAction<ProFormaScenario[]>>;
  mortgageDetails: MortgageDetails;
  onSelectScenario: (id: string) => void;
  selectedScenarioId: string;
}

// Formatted numeric input component
const FormattedNumericInput: React.FC<{
  value: number | string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, name, className, placeholder }) => {
  const [localValue, setLocalValue] = useState('');

  const format = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  useEffect(() => {
    const strVal = value === undefined || value === null ? '' : value.toString();
    const rawLocal = localValue.replace(/,/g, '');

    if (strVal === '') {
      if (localValue !== '') setLocalValue('');
    } else if (rawLocal === '' || parseFloat(strVal) !== parseFloat(rawLocal)) {
      setLocalValue(format(strVal));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- localValue intentionally omitted to avoid infinite loops
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const raw = val.replace(/,/g, '');

    if (raw === '' || /^-?\d*\.?\d*$/.test(raw)) {
      setLocalValue(format(raw));
      onChange(raw);
    }
  };

  return (
    <input
      type="text"
      name={name}
      value={localValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
};

const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  people,
  scenarios,
  setScenarios,
  mortgageDetails,
  onSelectScenario,
  selectedScenarioId
}) => {
  const [newMonths, setNewMonths] = useState<number | ''>('');
  const [newEstValue, setNewEstValue] = useState<number | ''>('');
  const [newAppreciation, setNewAppreciation] = useState<number | ''>('');

  const calculateFutureValue = (pv: number, rate: number, months: number) => {
    const years = months / 12;
    return Math.round(pv * Math.pow(1 + rate / 100, years));
  };

  const calculateRate = (pv: number, fv: number, months: number) => {
    const years = months / 12;
    if (years <= 0 || pv <= 0) return 0;
    const rate = (Math.pow(fv / pv, 1 / years) - 1) * 100;
    return parseFloat(rate.toFixed(2));
  };

  const handleMonthsChange = (val: number | '') => {
    setNewMonths(val);
    if (typeof val === 'number' && val > 0 && mortgageDetails.homeValue > 0) {
      // If appreciation is set, calculate future value
      if (typeof newAppreciation === 'number' && newAppreciation !== 0) {
        const fv = calculateFutureValue(mortgageDetails.homeValue, newAppreciation, val);
        setNewEstValue(fv);
      }
      // If future value is set but appreciation is not, calculate appreciation
      else if (typeof newEstValue === 'number' && newEstValue > 0) {
        const r = calculateRate(mortgageDetails.homeValue, newEstValue, val);
        setNewAppreciation(r);
      }
    }
  };

  const handleAppreciationChange = (val: number | '') => {
    setNewAppreciation(val);
    if (typeof val === 'number' && typeof newMonths === 'number' && newMonths > 0 && mortgageDetails.homeValue > 0) {
      const fv = calculateFutureValue(mortgageDetails.homeValue, val, newMonths);
      setNewEstValue(fv);
    }
  };

  const handleValueChange = (val: number | '') => {
    setNewEstValue(val);
    if (typeof val === 'number' && val > 0 && typeof newMonths === 'number' && newMonths > 0 && mortgageDetails.homeValue > 0) {
      const r = calculateRate(mortgageDetails.homeValue, val, newMonths);
      setNewAppreciation(r);
    }
  };

  const handleAddScenario = () => {
    if (!newMonths || !newEstValue) return;

    const newScenario: ProFormaScenario = {
      id: Date.now().toString(),
      months: Number(newMonths),
      estimatedHomeValue: Number(newEstValue),
      annualAppreciation: typeof newAppreciation === 'number' ? newAppreciation : 0
    };

    const updatedScenarios = [...scenarios, newScenario].sort((a, b) => a.months - b.months);
    setScenarios(updatedScenarios);
    onSelectScenario(newScenario.id);
    setNewMonths('');
    setNewEstValue('');
    setNewAppreciation('');
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = scenarios.filter(s => s.id !== id);
    setScenarios(updated);
    if (selectedScenarioId === id && updated.length > 0) {
      onSelectScenario(updated[0].id);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-lg rounded-xl p-6 border border-border">
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Sales Scenarios</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Define different future scenarios to visualize equity growth and ownership shifts based on your contribution inputs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 items-end bg-card p-4 rounded-lg border border-border">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Period (Months)
            {typeof newMonths === 'number' && newMonths > 0 && (
              <span className="text-primary ml-1">
                ({(newMonths / 12).toLocaleString('en-US', { maximumFractionDigits: 2 })} Years)
              </span>
            )}
          </label>
          <FormattedNumericInput
            value={newMonths}
            onChange={(val) => handleMonthsChange(parseFloat(val) || '')}
            placeholder="e.g. 60"
            className="w-full rounded-md bg-muted border-transparent text-foreground focus:border-primary focus:ring-primary text-sm pl-4 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Ann. Appreciation (%)</label>
          <FormattedNumericInput
            value={newAppreciation}
            onChange={(val) => handleAppreciationChange(parseFloat(val) || '')}
            placeholder="e.g. 3.5"
            className="w-full rounded-md bg-muted border-transparent text-foreground focus:border-primary focus:ring-primary text-sm pl-4 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Est. Future Value</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <FormattedNumericInput
              value={newEstValue}
              onChange={(val) => handleValueChange(parseFloat(val) || '')}
              placeholder="e.g. 650000"
              className="w-full pl-10 rounded-md bg-muted border-transparent text-foreground focus:border-primary focus:ring-primary text-sm py-2"
            />
          </div>
        </div>
        <button
          onClick={handleAddScenario}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors"
        >
          Add Scenario
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '600px' }} className="divide-y divide-border">
          <thead className="bg-card">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Timeline</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Apprec.</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Future Value</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Rem. Mortgage</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">Total Equity</th>
              {people.map(p => (
                <th key={p.id} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground tracking-wider border-l border-border">
                  {p.name}
                  <div className="text-[10px] text-muted-foreground/70 font-normal">Own % / Equity $</div>
                </th>
              ))}
              <th style={{ width: '48px' }} className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {scenarios.length === 0 ? (
              <tr>
                <td colSpan={6 + people.length} className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No scenarios added. Add a time period and value above.
                </td>
              </tr>
            ) : (
              scenarios.map((scenario) => {
                const remainingBalance = calculateRemainingBalance(
                  mortgageDetails.loanAmount,
                  mortgageDetails.interestRate,
                  mortgageDetails.loanTerm,
                  scenario.months
                );
                const totalEquity = scenario.estimatedHomeValue - remainingBalance;
                const years = (scenario.months / 12).toFixed(1);

                const snapshotContributions = people.map(p => ({
                  id: p.id,
                  amount: p.downPaymentContribution + (p.estimatedMonthlyContribution * scenario.months)
                }));
                const totalContributed = snapshotContributions.reduce((acc, c) => acc + c.amount, 0);

                const isSelected = selectedScenarioId === scenario.id;

                return (
                  <motion.tr
                    key={scenario.id}
                    className={cn(
                      "hover:bg-card transition-colors cursor-pointer",
                      isSelected && 'bg-card ring-1 ring-primary/30'
                    )}
                    onClick={() => onSelectScenario(scenario.id)}
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="font-medium">{scenario.months} Months</div>
                      <div className="text-xs text-muted-foreground">Year {years}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-muted-foreground">
                      {scenario.annualAppreciation.toFixed(2)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-foreground">
                      ${scenario.estimatedHomeValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-muted-foreground">
                      ${remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-primary">
                      ${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>

                    {people.map(p => {
                      const contrib = snapshotContributions.find(c => c.id === p.id)?.amount || 0;
                      const pct = totalContributed > 0 ? (contrib / totalContributed) * 100 : 0;
                      const equity = totalEquity * (pct / 100);

                      return (
                        <td key={p.id} className="px-4 py-4 whitespace-nowrap text-center border-l border-border">
                          <div className="text-sm text-foreground font-medium">{pct.toFixed(1)}%</div>
                          <div className="text-xs text-primary/80">${equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </td>
                      );
                    })}

                    <td style={{ width: '48px', padding: '8px' }}>
                      <button
                        onClick={(e) => handleDeleteScenario(scenario.id, e)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs text-muted-foreground">* Click a row to view detailed tax breakdown below</span>
      </div>
    </div>
  );
};

export default PaymentTracker;
