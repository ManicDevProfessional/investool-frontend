import { useMemo } from 'react';
import { calculateTax, estimateStampDuty, estimateLMI } from '../utils/rentvestingMath';

export function useRentvestingModel(inputs) {
  // Pass the selected state to the stamp duty calculator
  const stampDutyAuto = useMemo(() => estimateStampDuty(inputs.propertyPrice, inputs.state), [inputs.propertyPrice, inputs.state]);
  const lmiAuto = useMemo(() => estimateLMI(inputs.propertyPrice, inputs.savings), [inputs.propertyPrice, inputs.savings]);

  const finalStampDuty = inputs.stampDuty || stampDutyAuto;
  const finalLMI = inputs.lmi || lmiAuto;

  const totalUpfront = finalStampDuty + finalLMI;
  const effectiveDeposit = inputs.savings - totalUpfront;
  const loanAmount = Math.max(0, inputs.propertyPrice - effectiveDeposit);

  const adjustedRate = inputs.interestRate + inputs.sensitivityInterest;
  const adjustedGrowth = inputs.capitalGrowth + inputs.sensitivityGrowth;

  const baseTax = useMemo(() => calculateTax(inputs.salary), [inputs.salary]);

  const projections = useMemo(() => {
    const data = [];
    let pporLoanBalance = loanAmount;
    let pporValue = inputs.propertyPrice;

    let invLoanBalance = loanAmount;
    let invValue = inputs.propertyPrice;
    let invSurplusCash = 0;

    // Loop based on user's selected loan term (e.g., 10, 20, 30, 40)
    for (let year = 1; year <= inputs.loanTermYears; year++) {
      // --- PPOR ---
      const monthlyRate = adjustedRate / 100 / 12;
      const months = inputs.loanTermYears * 12;
      const pporMonthlyPayment = pporLoanBalance > 0
        ? (pporLoanBalance * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : 0;
      const pporAnnualPayment = pporMonthlyPayment * 12;
      const pporInterestPaid = pporLoanBalance * (adjustedRate / 100);
      const pporPrincipalRepayment = pporAnnualPayment - pporInterestPaid;
      
      pporLoanBalance = Math.max(0, pporLoanBalance - pporPrincipalRepayment);
      pporValue *= (1 + adjustedGrowth / 100);
      const pporNetWealth = pporValue - pporLoanBalance;

      // --- INVESTMENT ---
      const invInterestPaid = invLoanBalance * (adjustedRate / 100);
      const invGrossRent = inputs.propertyPrice * (inputs.rentalYield / 100);
      
      // Calculate Detailed Expenses
      const propertyMgmtCost = invGrossRent * (inputs.propertyManagementRate / 100);
      const totalCashExpenses = inputs.annualStrata + inputs.annualRates + inputs.annualMaintenance + inputs.annualInsurance + propertyMgmtCost;
      
      // Net Rental Income (Cash flow before tax)
      const invNetRentalIncome = invGrossRent - invInterestPaid - totalCashExpenses; 

      // Tax Logic: Depreciation is a paper loss, it reduces tax but doesn't cost cash
      const paperDeductions = inputs.annualDepreciation;
      const taxableIncomeAfterProperty = inputs.salary + invNetRentalIncome - paperDeductions;
      
      const newTax = calculateTax(taxableIncomeAfterProperty);
      const taxRefund = Math.max(0, baseTax - newTax);

      const rentPaidAnnual = inputs.weeklyRent * 52;

      // Cashflow Diff
      const pporAnnualCost = pporInterestPaid + pporPrincipalRepayment + inputs.annualStrata + inputs.annualRates + inputs.annualMaintenance + inputs.annualInsurance;
      const rentvestAnnualOutflow = rentPaidAnnual + invInterestPaid + totalCashExpenses - invGrossRent - taxRefund;
      const annualSaving = pporAnnualCost - rentvestAnnualOutflow;
      
      invSurplusCash += Math.max(0, annualSaving);
      invSurplusCash *= 1.04; 

      invValue *= (1 + adjustedGrowth / 100);
      const capitalGain = invValue - inputs.propertyPrice;
      const taxableGain = inputs.includeCGTDiscount ? capitalGain * 0.5 : capitalGain;
      const cgtPayable = calculateTax(inputs.salary + taxableGain) - baseTax;
      
      const invNetWealthAfterTax = (invValue - invLoanBalance) + invSurplusCash - Math.max(0, cgtPayable);

      data.push({
        year: `Year ${year}`,
        PPOR: Math.round(pporNetWealth),
        Rentvesting: Math.round(invNetWealthAfterTax),
      });
    }
    return data;
  }, [inputs, adjustedRate, adjustedGrowth, baseTax, loanAmount]);

  // Grab the final year dynamically based on loan term
  const finalYear = projections[projections.length - 1];
  const winner = finalYear.Rentvesting > finalYear.PPOR ? 'Rentvesting' : 'Buying PPOR';
  const difference = Math.abs(finalYear.Rentvesting - finalYear.PPOR);

  return { projections, finalYear, winner, difference, finalStampDuty, finalLMI };
}