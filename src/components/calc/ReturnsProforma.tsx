"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProformaPerson, TaxConsideration, ProFormaScenario } from './types';

interface ReturnsProformaProps {
  scenario: ProFormaScenario;
  people: ProformaPerson[];
  remainingBalance: number;
  homeValue: number; // Initial home value
}

// Reusable component for formatted number inputs
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

const ReturnsProforma: React.FC<ReturnsProformaProps> = ({ scenario, people, remainingBalance }) => {
  const [sellingCostsPercent, setSellingCostsPercent] = useState(3);
  // We manage local state for tax considerations to allow user toggling without affecting the main scenario data structure deeply
  const [taxSelections, setTaxSelections] = useState<{ [key: string]: TaxConsideration }>({});

  useEffect(() => {
    // Reset or Init tax selections when people change
    const initial: { [key: string]: TaxConsideration } = {};
    people.forEach(p => {
      initial[p.id] = TaxConsideration.None;
    });
    setTaxSelections(prev => ({ ...initial, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- people intentionally replaced with people.length to only react to count changes
  }, [people.length]);

  const handleTaxChange = (id: string, val: TaxConsideration) => {
    setTaxSelections(prev => ({ ...prev, [id]: val }));
  };

  const totalEquity = scenario.estimatedHomeValue - remainingBalance;
  const sellingCosts = scenario.estimatedHomeValue * (sellingCostsPercent / 100);
  const netProceeds = scenario.estimatedHomeValue - remainingBalance - sellingCosts;

  return (
    <div className="bg-card/50 backdrop-blur-lg rounded-xl p-6 border border-border">
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">
        Exit & Payout Analysis: {scenario.months} Month Scenario
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Future Sale Price</label>
          <div className="text-2xl font-bold text-foreground">${scenario.estimatedHomeValue.toLocaleString()}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Loan Balance</label>
          <div className="text-2xl font-bold text-muted-foreground">${remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Selling Costs (%)</label>
          <FormattedNumericInput
            value={sellingCostsPercent}
            onChange={(val) => setSellingCostsPercent(parseFloat(val) || 0)}
            className="mt-1 block w-24 rounded-md bg-card border border-border text-foreground focus:border-primary focus:ring-primary text-sm pl-4 py-2"
          />
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center mb-6 border border-border">
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <div className="text-sm text-muted-foreground">Total Gross Equity</div>
          <div className="text-lg font-medium text-foreground">${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <div className="text-sm text-muted-foreground">Est. Selling Costs</div>
          <div className="text-lg font-medium text-red-500">-${sellingCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-sm text-muted-foreground">Net Distributable Proceeds</div>
          <div className="text-2xl font-bold text-primary">${netProceeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {people.map(person => {
          const shareOfProceeds = netProceeds * (person.percentageAtScenario / 100);
          // Capital Gains = Proceeds - Cost Basis (Total Contributed)
          // Note: This is simplified. True cost basis includes purchase costs, improvements, etc.
          const capitalGains = shareOfProceeds - person.totalContributedAtScenario;

          let taxableGains = capitalGains;
          const taxSelection = taxSelections[person.id] || TaxConsideration.None;

          if (taxSelection === TaxConsideration.Section121) {
            taxableGains = Math.max(0, capitalGains - 250000); // Single filer simplified
          } else if (taxSelection === TaxConsideration.TenThirtyOneExchange) {
            taxableGains = 0; // Deferred
          }

          const netReturn = shareOfProceeds - person.totalContributedAtScenario;
          const returnOnInvestment = person.totalContributedAtScenario > 0
            ? (netReturn / person.totalContributedAtScenario) * 100
            : 0;

          // Calculate Annualized Return (CAGR)
          const years = scenario.months / 12;
          let annualizedROI = 0;

          if (person.totalContributedAtScenario > 0 && years > 0) {
            if (shareOfProceeds > 0) {
              // Standard CAGR Formula: (End / Start)^(1/t) - 1
              annualizedROI = (Math.pow(shareOfProceeds / person.totalContributedAtScenario, 1 / years) - 1) * 100;
            } else {
              // Total Loss scenario
              annualizedROI = -100;
            }
          }

          return (
            <motion.div
              key={person.id}
              className="bg-card border border-border rounded-lg p-4 flex flex-col w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] max-w-[320px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-3">
                <h4 className="font-bold text-lg text-foreground">{person.name}</h4>
                <div className="text-xs text-primary font-medium">{person.percentageAtScenario.toFixed(2)}% Ownership</div>
              </div>

              <div className="space-y-2 text-sm flex-grow">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Contrib.</span><span className="text-muted-foreground">${person.totalContributedAtScenario.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Net Proceeds</span><span className="font-semibold text-primary">${shareOfProceeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="border-t border-border my-2"></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Profit/Loss</span><span className={cn("font-bold", netReturn >= 0 ? 'text-foreground' : 'text-red-500')}>{netReturn < 0 ? '-' : ''}${Math.abs(netReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total ROI</span><span className={cn(netReturn >= 0 ? 'text-primary' : 'text-red-500')}>{returnOnInvestment.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Annualized</span><span className={cn(annualizedROI >= 0 ? 'text-primary' : 'text-red-500')}>{annualizedROI.toFixed(1)}%</span></div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tax Strategy</label>
                <select
                  value={taxSelection}
                  onChange={(e) => handleTaxChange(person.id, e.target.value as TaxConsideration)}
                  className="block w-full py-1.5 pl-4 pr-8 text-xs bg-background border border-border text-muted-foreground rounded focus:outline-none focus:border-green-500"
                >
                  {Object.values(TaxConsideration).map(val => <option key={val} value={val}>{val}</option>)}
                </select>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Est. Taxable Gain</span>
                  <span className="text-xs font-mono text-muted-foreground">${taxableGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ReturnsProforma;
