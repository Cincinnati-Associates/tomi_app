"use client";
import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Person, MortgageDetails, CalcMode } from './types';
import { calculateMaxLoanAmount } from '@/services/calculatorService';

interface OwnershipCalculatorProps {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  mortgageDetails: MortgageDetails;
  setMortgageDetails: React.Dispatch<React.SetStateAction<MortgageDetails>>;
  monthlyMortgagePayment: number;
  fullTermOwnership: { id: string; name: string; percentage: number }[];
  onInvite: () => void;
}

// Tomi brand colors for pie chart - alternating green/gold for better contrast
const COLORS = ['#2D5A4A', '#E8DC7E', '#4A7C6B', '#C4A35A'];

// Formatted numeric input component
const FormattedNumericInput: React.FC<{
  value: number | string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, name, className, placeholder, disabled }) => {
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
      className={cn(className, disabled && 'opacity-50 cursor-not-allowed')}
      placeholder={placeholder}
      autoComplete="off"
      disabled={disabled}
    />
  );
};

// Input field component
const InputField: React.FC<{
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  prefix?: string;
  name?: string;
  disabled?: boolean;
  highlight?: boolean;
  labelAction?: React.ReactNode;
}> = ({ label, value, onChange, type = "number", prefix, name, disabled, highlight, labelAction }) => {

  const handleFormattedChange = (val: string) => {
    const syntheticEvent = {
      target: { name, value: val }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <label className={cn(
          "block text-sm font-medium",
          highlight ? 'text-primary' : 'text-muted-foreground'
        )}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="mt-1 relative rounded-md">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-muted-foreground sm:text-sm">{prefix}</span>
          </div>
        )}
        {type === 'number' ? (
          <FormattedNumericInput
            name={name}
            value={value}
            onChange={handleFormattedChange}
            disabled={disabled}
            className={cn(
              "block w-full rounded-md bg-card border border-border",
              "text-foreground focus:border-primary focus:ring-primary sm:text-sm",
              prefix ? 'pl-10' : 'pl-4',
              "py-2"
            )}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              "block w-full rounded-md bg-card border border-border",
              "text-foreground focus:border-primary focus:ring-primary sm:text-sm",
              prefix ? 'pl-10' : 'pl-4',
              "py-2",
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )}
      </div>
    </div>
  );
};

const OwnershipCalculator: React.FC<OwnershipCalculatorProps> = ({
  people,
  setPeople,
  mortgageDetails,
  setMortgageDetails,
  monthlyMortgagePayment,
  fullTermOwnership,
  onInvite,
}) => {
  const [mode, setMode] = useState<CalcMode>('bottoms-up');
  const [newPersonName, setNewPersonName] = useState('');
  const [fetchingRate, setFetchingRate] = useState(false);

  // Bottoms-Up Logic: Recalculate Affordability
  useEffect(() => {
    if (mode === 'bottoms-up' && people.length > 0) {
      const totalMonthlyBudget = people.reduce((acc, p) => acc + p.estimatedMonthlyContribution, 0);
      const totalDownPayment = people.reduce((acc, p) => acc + p.downPaymentContribution, 0);

      const maxLoan = calculateMaxLoanAmount(totalMonthlyBudget, mortgageDetails.interestRate, mortgageDetails.loanTerm);
      const maxHomeValue = maxLoan + totalDownPayment;

      setMortgageDetails(prev => ({
        ...prev,
        homeValue: maxHomeValue,
        downPayment: totalDownPayment,
        loanAmount: maxLoan
      }));
    }
  }, [people, mortgageDetails.interestRate, mortgageDetails.loanTerm, mode, setMortgageDetails]);

  const handleAddPerson = () => {
    if (newPersonName.trim() && people.length < 4) {
      const newPerson: Person = {
        id: new Date().toISOString(),
        name: newPersonName.trim(),
        downPaymentContribution: 0,
        estimatedMonthlyContribution: 0,
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const handleMortgageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newDetails = { ...mortgageDetails, [name]: parseFloat(value) || 0 };

    if (mode === 'top-down') {
      if (name === 'homeValue' || name === 'downPayment') {
        newDetails.loanAmount = newDetails.homeValue - newDetails.downPayment;
      } else if (name === 'loanAmount') {
        newDetails.downPayment = newDetails.homeValue - newDetails.loanAmount;
      }
    }

    setMortgageDetails(newDetails);
  };

  const handleContributionChange = (id: string, field: 'downPaymentContribution' | 'estimatedMonthlyContribution', value: number) => {
    const roundedValue = Math.round(value * 100) / 100;
    setPeople(people.map(p => p.id === id ? { ...p, [field]: roundedValue } : p));
  };

  const handleFetchCurrentRate = async () => {
    setFetchingRate(true);
    try {
      const res = await fetch('/api/mortgage-rates');
      const data = await res.json();

      if (data.error) {
        console.error('Failed to fetch rate:', data.error);
        alert('Unable to fetch current rates. Please try again later.');
      } else {
        handleMortgageChange({
          target: { name: 'interestRate', value: data.rate.toString() }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    } catch (error) {
      console.error('Failed to fetch rate:', error);
      alert('Unable to fetch current rates. Please try again later.');
    } finally {
      setFetchingRate(false);
    }
  };

  const totalDownPaymentContributed = people.reduce((acc, p) => acc + p.downPaymentContribution, 0);
  const totalMonthlyContributed = people.reduce((acc, p) => acc + p.estimatedMonthlyContribution, 0);
  const remainingDownPayment = mortgageDetails.downPayment - totalDownPaymentContributed;
  const remainingMonthly = monthlyMortgagePayment - totalMonthlyContributed;

  // Ownership estimate section
  const ownershipEstimateSection = (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-lg font-heading font-semibold text-muted-foreground mb-2">Full Term Ownership Estimate</h3>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Based on down payment plus share of loan principal paid over {mortgageDetails.loanTerm} years.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start min-w-0">
        <div className="min-w-0" style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={fullTermOwnership}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
              >
                {fullTermOwnership.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value) => `${Number(value).toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 min-w-0 overflow-hidden">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Est. Available Nights</h4>
          {people.length > 0 ? fullTermOwnership.map((person, index) => {
            const totalCapacity = mortgageDetails.bedrooms * 365;
            const nights = people.length <= mortgageDetails.bedrooms
              ? 365
              : Math.round((person.percentage / 100) * totalCapacity);

            return (
              <div key={person.id} className="flex justify-between items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-3 h-3 min-w-[12px] min-h-[12px] max-w-[12px] max-h-[12px] rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-muted-foreground truncate">{person.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-foreground whitespace-nowrap">{person.percentage.toFixed(1)}%</div>
                  <div className="text-xs text-primary whitespace-nowrap">{nights} nights</div>
                </div>
              </div>
            );
          }) : <p className="text-sm text-muted-foreground italic">Add owners to see calculations</p>}
        </div>
      </div>
    </div>
  );

  // Mortgage section
  const mortgageSection = (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-heading font-semibold text-muted-foreground mb-3">
        {mode === 'top-down' ? 'Mortgage Assumptions' : 'Calculated Affordability'}
      </h3>
      <div className="space-y-4 flex-grow">
        {mode === 'top-down' && (
          <>
            <InputField label="Purchase Price" name="homeValue" prefix="$" value={mortgageDetails.homeValue} onChange={handleMortgageChange} />
            <InputField label="Down Payment" name="downPayment" prefix="$" value={mortgageDetails.downPayment} onChange={handleMortgageChange} />
            <InputField label="Loan Amount" name="loanAmount" prefix="$" value={mortgageDetails.loanAmount} onChange={handleMortgageChange} />
          </>
        )}

        <InputField
          label="Interest Rate (%)"
          name="interestRate"
          value={mortgageDetails.interestRate}
          onChange={handleMortgageChange}
          labelAction={
            <button
              onClick={handleFetchCurrentRate}
              disabled={fetchingRate}
              className={cn(
                "text-xs px-2.5 py-1 rounded font-medium whitespace-nowrap transition-all",
                fetchingRate
                  ? "bg-muted text-muted-foreground cursor-wait border border-border"
                  : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary cursor-pointer"
              )}
            >
              {fetchingRate ? 'Fetching...' : 'Get Current Rate'}
            </button>
          }
        />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Loan Term (Years)</label>
          <select
            name="loanTerm"
            value={mortgageDetails.loanTerm}
            onChange={handleMortgageChange}
            className="block w-full rounded-md bg-card border border-border text-foreground focus:border-primary focus:ring-primary sm:text-sm pl-4 pr-10 py-2"
          >
            {[5, 7, 10, 15, 20, 30, 50].map(year => (
              <option key={year} value={year}>{year} Years</option>
            ))}
          </select>
        </div>

        {mode === 'bottoms-up' && (
          <>
            <div className="pt-4 border-t border-border mt-4"></div>
            <InputField label="Max Home Price" name="homeValue" prefix="$" value={mortgageDetails.homeValue} onChange={() => { }} disabled highlight />
            <InputField label="Max Loan Amount" name="loanAmount" prefix="$" value={mortgageDetails.loanAmount} onChange={() => { }} disabled highlight />
            <div className="mt-2 text-xs text-muted-foreground">
              Based on total monthly budget of <span className="text-primary">${totalMonthlyContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> and down payment of <span className="text-primary">${totalDownPaymentContributed.toLocaleString()}</span>.
            </div>
          </>
        )}

        <InputField label="Number of Bedrooms" name="bedrooms" value={mortgageDetails.bedrooms} onChange={handleMortgageChange} />

        {mode === 'top-down' && (
          <div className="mt-4 bg-card p-4 rounded-lg text-center border border-border">
            <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
            <p className="text-2xl font-bold text-primary">${monthlyMortgagePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        )}
      </div>

      {ownershipEstimateSection}
    </div>
  );

  // Owner section
  const ownerSection = (
    <div>
      <h3 className="text-lg font-heading font-semibold text-muted-foreground mb-3">
        {mode === 'top-down' ? 'Owners & Contributions' : 'Contributor Budgets'}
      </h3>

      {mode === 'top-down' ? (
        <div className="bg-card p-4 rounded-lg mb-4 space-y-4 border border-border">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Down Payment Contributions</span>
              <span className="font-medium text-foreground">
                ${totalDownPaymentContributed.toLocaleString()} / ${mortgageDetails.downPayment.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalDownPaymentContributed / (mortgageDetails.downPayment || 1)) * 100)}%` }}>
              </div>
            </div>
            <div className="text-right text-xs mt-1">
              <span className={cn(
                "font-semibold",
                remainingDownPayment === 0 ? 'text-primary' :
                  remainingDownPayment < 0 ? 'text-blue-500' :
                    'text-muted-foreground'
              )}>
                {remainingDownPayment < 0
                  ? `Over by $${Math.abs(remainingDownPayment).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : `$${remainingDownPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })} remaining`}
              </span>
            </div>
          </div>

          <div className="border-t border-border"></div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Est. Monthly Contributions</span>
              <span className="font-medium text-foreground">
                ${totalMonthlyContributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${monthlyMortgagePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalMonthlyContributed / (monthlyMortgagePayment || 1)) * 100)}%` }}>
              </div>
            </div>
            <div className="text-right text-xs mt-1">
              <span className={cn(
                "font-semibold",
                Math.abs(remainingMonthly) < 0.01 ? 'text-primary' :
                  remainingMonthly < 0 ? 'text-blue-500' :
                    'text-muted-foreground'
              )}>
                {remainingMonthly < -0.01
                  ? `Over by $${Math.abs(remainingMonthly).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${remainingMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-4 rounded-lg mb-4 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Input how much cash and monthly budget each owner has to determine purchasing power.</p>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground uppercase">Total Monthly Budget</div>
            <div className="text-xl font-bold text-primary">${totalMonthlyContributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-muted-foreground uppercase">Total Cash Down</div>
            <div className="text-xl font-bold text-primary">${totalDownPaymentContributed.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {people.map((person, index) => (
          <motion.div
            key={person.id}
            className="bg-card p-3 rounded-lg border border-border"
            style={{ position: 'relative' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleRemovePerson(person.id)}
              className="text-red-500 hover:text-red-400 transition-colors"
              style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', zIndex: 10 }}
              aria-label={`Remove ${person.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="mb-3" style={{ paddingRight: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="font-medium text-foreground">{person.name}</span>
              {/* Invite button - only show for non-first owners (index > 0) */}
              {index > 0 && (
                <button
                  onClick={onInvite}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 rounded-full text-xs font-medium cursor-pointer transition-all hover:bg-green-500/20 hover:border-green-500 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Invite to complete
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs text-muted-foreground">Down Pmt ($)</label>
                  {mode === 'top-down' && index === people.length - 1 && remainingDownPayment > 1 && (
                    <button
                      onClick={() => handleContributionChange(person.id, 'downPaymentContribution', person.downPaymentContribution + remainingDownPayment)}
                      className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      + ${remainingDownPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </button>
                  )}
                </div>
                <FormattedNumericInput
                  value={person.downPaymentContribution || ''}
                  onChange={(val) => handleContributionChange(person.id, 'downPaymentContribution', parseFloat(val) || 0)}
                  className="w-full text-right rounded-md bg-muted border-transparent text-foreground focus:border-primary focus:ring-primary sm:text-sm px-4 py-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs text-muted-foreground">Est. Monthly ($)</label>
                  {mode === 'top-down' && index === people.length - 1 && remainingMonthly > 0.01 && (
                    <button
                      onClick={() => handleContributionChange(person.id, 'estimatedMonthlyContribution', person.estimatedMonthlyContribution + remainingMonthly)}
                      className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      + ${remainingMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </button>
                  )}
                </div>
                <FormattedNumericInput
                  value={person.estimatedMonthlyContribution || ''}
                  onChange={(val) => handleContributionChange(person.id, 'estimatedMonthlyContribution', parseFloat(val) || 0)}
                  className="w-full text-right rounded-md bg-muted border-transparent text-foreground focus:border-primary focus:ring-primary sm:text-sm px-4 py-2"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {people.length < 4 && (
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="New owner name"
            className="flex-grow rounded-md bg-card border border-border text-foreground focus:border-primary focus:ring-primary sm:text-sm pl-4 py-2"
          />
          <button
            onClick={handleAddPerson}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );

  // Toggle switch
  const toggleSwitch = (
    <div className="mb-8 overflow-x-auto">
      <div className="flex justify-center min-w-0">
        <div className="inline-flex gap-1 p-1 bg-muted rounded-xl border border-border">
          <button
            onClick={() => setMode('bottoms-up')}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap border-none cursor-pointer transition-all",
              mode === 'bottoms-up'
                ? "bg-card text-primary shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Bottoms-Up
            </div>
            <span className="text-xs font-normal text-muted-foreground mt-0.5">(budget first)</span>
          </button>
          <button
            onClick={() => setMode('top-down')}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap border-none cursor-pointer transition-all",
              mode === 'top-down'
                ? "bg-card text-primary shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Top-Down
            </div>
            <span className="text-xs font-normal text-muted-foreground mt-0.5">(mortgage first)</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-border overflow-hidden">
      {/* Page title and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold leading-tight text-foreground">
          Home Co-Ownership Calculator
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Model ownership splits, equity tracking, and future returns for co-owned properties
        </p>
      </div>

      {toggleSwitch}

      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ order: mode === 'top-down' ? 1 : 2 }}
          >
            {mortgageSection}
          </motion.div>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ order: mode === 'top-down' ? 2 : 1 }}
          >
            {ownerSection}
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default OwnershipCalculator;
