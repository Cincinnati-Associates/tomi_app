"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Person, MortgageDetails, ProFormaScenario, ProformaPerson, TaxConsideration, CalcMode } from './types';
import OwnershipCalculator from './OwnershipCalculator';
import PaymentTracker from './PaymentTracker';
import ReturnsProforma from './ReturnsProforma';
import CalculatorNav from './CalculatorNav';
import ShareModal from './ShareModal';
import { GatedSection } from './GatedSection';
import { HomiChat } from '@/components/shared/HomiChat';
import { HomiChatTrigger } from '@/components/shared/HomiChatTrigger';
import { PageIntro } from '@/components/shared/PageIntro';
import { calculateMonthlyPayment, calculateRemainingBalance } from '@/services/calculatorService';
import { getStateFromUrl, generateShareUrl, updateUrlWithState } from '@/lib/calculatorState';

const CalculatorPage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [mortgageDetails, setMortgageDetails] = useState<MortgageDetails>({
    homeValue: 500000,
    downPayment: 100000,
    loanAmount: 400000,
    interestRate: 6.5,
    loanTerm: 30,
    bedrooms: 3,
  });

  // Default scenarios: 5 years and 10 years
  const [scenarios, setScenarios] = useState<ProFormaScenario[]>([
    { id: '1', months: 60, estimatedHomeValue: 600000, annualAppreciation: 3.71 },
    { id: '2', months: 120, estimatedHomeValue: 750000, annualAppreciation: 4.14 }
  ]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('1');
  const [mode, setMode] = useState<CalcMode>('bottoms-up');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load state from URL on mount, or pre-populate first co-owner
  useEffect(() => {
    const stateFromUrl = getStateFromUrl();
    if (stateFromUrl) {
      setPeople(stateFromUrl.people);
      setMortgageDetails(stateFromUrl.mortgageDetails);
      setScenarios(stateFromUrl.scenarios);
    } else {
      setPeople([{
        id: '1',
        name: 'Co-Owner 1',
        downPaymentContribution: 0,
        estimatedMonthlyContribution: 0,
      }]);
    }
  }, []);

  // Update URL when state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlWithState({ people, mortgageDetails, scenarios });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [people, mortgageDetails, scenarios]);

  // IntersectionObserver for sticky bar
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleShare = () => {
    const url = generateShareUrl({ people, mortgageDetails, scenarios });
    setShareUrl(url);
    setIsShareModalOpen(true);
  };

  const monthlyMortgagePayment = useMemo(() => {
    return calculateMonthlyPayment(
      mortgageDetails.loanAmount,
      mortgageDetails.interestRate,
      mortgageDetails.loanTerm
    );
  }, [mortgageDetails]);

  // Calculate "General/Contractual" Ownership based on Full Loan Term
  const fullTermOwnership = useMemo(() => {
    // 1. Calculate Total Loan Principal to be paid over the life of the loan
    // Note: For a standard amortized loan, Principal Paid = Loan Amount.
    const totalPrincipal = mortgageDetails.loanAmount;

    // 2. Determine the share of monthly contribution for each person
    // (How much of the monthly bill is Person A paying?)
    const totalMonthlyContribution = people.reduce((acc, p) => acc + p.estimatedMonthlyContribution, 0);

    // 3. Allocate the Principal Paid to each person based on their share of the monthly bill
    // AND Add their Down Payment.
    // Logic: Equity = Down Payment + Share of Principal Paid

    const peopleWithEquity = people.map(p => {
      // Avoid division by zero
      const monthlyShare = totalMonthlyContribution > 0
        ? p.estimatedMonthlyContribution / totalMonthlyContribution
        : 0;

      const principalShare = totalPrincipal * monthlyShare;
      const totalCapitalContributed = p.downPaymentContribution + principalShare;

      return { ...p, totalCapitalContributed };
    });

    const totalProjectedCapital = peopleWithEquity.reduce((acc, p) => acc + p.totalCapitalContributed, 0);

    if (totalProjectedCapital === 0) return people.map(p => ({ id: p.id, name: p.name, percentage: 0 }));

    return peopleWithEquity.map(p => ({
      id: p.id,
      name: p.name,
      percentage: (p.totalCapitalContributed / totalProjectedCapital) * 100
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loanTerm is used in display text but doesn't affect the calculation
  }, [people, mortgageDetails.loanAmount]);

  // Prepare data for the selected scenario (for the tax breakdown)
  const activeScenarioData = useMemo(() => {
    const scenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
    if (!scenario) return null;

    const remainingBalance = calculateRemainingBalance(
      mortgageDetails.loanAmount,
      mortgageDetails.interestRate,
      mortgageDetails.loanTerm,
      scenario.months
    );

    // Calculate Actual Principal Paid at this snapshot
    const principalPaidTotal = mortgageDetails.loanAmount - remainingBalance;

    const totalMonthlyContribution = people.reduce((acc, p) => acc + p.estimatedMonthlyContribution, 0);

    // Calculate ownership based on Capital Invested (Down Pmt + Share of Principal Paid)
    const snapshotPeople = people.map(p => {
      const monthlyShare = totalMonthlyContribution > 0
        ? p.estimatedMonthlyContribution / totalMonthlyContribution
        : 0;

      const principalShare = principalPaidTotal * monthlyShare;
      const capitalContributed = p.downPaymentContribution + principalShare;

      return { ...p, capitalContributed };
    });

    const totalCapitalContributed = snapshotPeople.reduce((acc, p) => acc + p.capitalContributed, 0);
    const totalEquity = scenario.estimatedHomeValue - remainingBalance;


    const proformaPeople: ProformaPerson[] = snapshotPeople.map(p => {
      const percentageAtScenario = totalCapitalContributed > 0
        ? (p.capitalContributed / totalCapitalContributed) * 100
        : 0;

      return {
        ...p,
        taxConsideration: TaxConsideration.None, // Default
        percentageAtScenario,
        // IMPORTANT: For Tax ROI purposes, we usually track Total Cash invested (Down + All Monthly Payments)
        // OR we track Capital Invested. The prompt requested "Ownership & Payment", usually ROI is based on cash out of pocket.
        // However, to keep consistent with the requested "Equity tracks Capital" logic for ownership %,
        // we will display the Capital Contributed as the basis for the equity split, but ROI might typically consider total cash flow.
        // For this specific implementation requested:
        totalContributedAtScenario: p.capitalContributed,
        equityAtScenario: totalEquity * (percentageAtScenario / 100)
      };
    });

    return {
      scenario,
      remainingBalance,
      proformaPeople
    };

  }, [people, mortgageDetails, scenarios, selectedScenarioId]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <PageIntro
        pageId="calculator"
        title="Co-Buying Power Calculator"
        description="See exactly how much more home you could afford by co-buying with friends or family."
        bullets={[
          "Enter your financials",
          "Add co-buyers to compare",
          "See the real numbers",
        ]}
        ctaText="Run the Numbers"
      />

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Sticky Output Bar */}
      <div
        className={`sticky top-[56px] z-30 transition-shadow duration-200 ${
          isSticky
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-8 sm:gap-16">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {mode === 'bottoms-up' ? 'Max Home Price' : 'Home Price'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums transition-all duration-300">
                ${mortgageDetails.homeValue.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {mode === 'bottoms-up' ? 'Max Mortgage' : 'Est. Monthly Payment'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary tabular-nums transition-all duration-300">
                {mode === 'bottoms-up'
                  ? `$${mortgageDetails.loanAmount.toLocaleString()}`
                  : `$${monthlyMortgagePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Nav (sticky action buttons on right side) */}
      <CalculatorNav onShare={handleShare} />

      <main className="pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:p-0">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Top Section: Inputs */}
              <OwnershipCalculator
                people={people}
                setPeople={setPeople}
                mortgageDetails={mortgageDetails}
                setMortgageDetails={setMortgageDetails}
                monthlyMortgagePayment={monthlyMortgagePayment}
                fullTermOwnership={fullTermOwnership}
                onInvite={handleShare}
                mode={mode}
                onModeChange={setMode}
              />

              {/* Middle Section: Scenario Table - Gated */}
              <GatedSection
                title="Sales Scenarios"
                description="Model different exit timelines and appreciation rates"
              >
                <PaymentTracker
                  people={people}
                  scenarios={scenarios}
                  setScenarios={setScenarios}
                  mortgageDetails={mortgageDetails}
                  onSelectScenario={setSelectedScenarioId}
                  selectedScenarioId={selectedScenarioId}
                />
              </GatedSection>

              {/* Bottom Section: Detailed Tax Breakdown - Gated */}
              <GatedSection
                title="Exit & Payout Analysis"
                description="See detailed equity splits and tax considerations"
              >
                {activeScenarioData && (
                  <ReturnsProforma
                    scenario={activeScenarioData.scenario}
                    people={activeScenarioData.proformaPeople}
                    remainingBalance={activeScenarioData.remainingBalance}
                    homeValue={mortgageDetails.homeValue}
                  />
                )}
              </GatedSection>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        people={people}
        showInviteSection={people.length > 1}
      />

      {/* AI Chat */}
      <HomiChatTrigger
        onClick={() => setIsChatOpen(true)}
        className="bottom-24 lg:bottom-8"
      />
      <HomiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default CalculatorPage;
