import { useMemo } from 'react';
import { calculateTax, estimateStampDuty, estimateLMI } from '../utils/rentvestingMath';

export function useYieldCashflowModel(inputs, sensitivity) {
  return useMemo(() => {
    // 1. Apply Sensitivity Shifts
    const adjustedRate = inputs.interestRate + sensitivity.interestShift;
    const adjustedRent = inputs.weeklyRent * (1 + sensitivity.rentGrowth / 100);

    // 2. Upfront Costs & Loan Sizing
    const stampDuty = estimateStampDuty(inputs.propertyPrice, inputs.state);
    const lmi = estimateLMI(inputs.propertyPrice, inputs.deposit);
    const totalUpfront = stampDuty + lmi;
    const effectiveDeposit = inputs.deposit - totalUpfront;
    const loanAmount = Math.max(0, inputs.propertyPrice - effectiveDeposit);
    const lvr = inputs.propertyPrice > 0 ? (loanAmount / inputs.propertyPrice) * 100 : 0;

    // 3. Income & Operating Expenses (NEW: Incorporating Vacancy Rate)
    const rawAnnualRent = adjustedRent * 52;
    const vacancyRateDecimal = (inputs.vacancyRate || 0) / 100;
    const vacancyLoss = rawAnnualRent * vacancyRateDecimal;
    const annualRent = rawAnnualRent - vacancyLoss; 
    
    const grossYield = inputs.propertyPrice > 0 ? (annualRent / inputs.propertyPrice) * 100 : 0;

    const propertyMgmtCost = annualRent * (inputs.propertyMgmtRate / 100);
    const totalOpex = inputs.annualStrata + inputs.annualRates + inputs.annualMaintenance + inputs.annualInsurance + propertyMgmtCost;
    const netOperatingIncome = annualRent - totalOpex;
    const netYield = inputs.propertyPrice > 0 ? (netOperatingIncome / inputs.propertyPrice) * 100 : 0;

    // 4. Debt Service
    const monthlyRate = adjustedRate / 100 / 12;
    // NEW: Use the dynamic loan term from inputs
    const totalMonths = (inputs.loanTermYears || 30) * 12; 
    let annualInterest = loanAmount * (adjustedRate / 100);
    let annualPrincipal = 0;

    if (inputs.loanType === 'PI' && loanAmount > 0 && monthlyRate > 0) {
      const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalAnnualPayment = monthlyPayment * 12;
      annualPrincipal = totalAnnualPayment - annualInterest;
    }

    const totalDebtService = annualInterest + annualPrincipal;
    const preTaxCashflow = netOperatingIncome - totalDebtService;

    // 5. Tax Calculations
    const totalTaxDeductions = totalOpex + annualInterest + inputs.annualDepreciation;
    const taxablePropertyIncome = annualRent - totalTaxDeductions;
    const baseTax = calculateTax(inputs.salary);
    const adjustedTax = calculateTax(inputs.salary + taxablePropertyIncome);
    const taxRefund = Math.max(0, baseTax - adjustedTax);
    const taxPayable = Math.max(0, adjustedTax - baseTax);

    // 6. Final Cashflow
    const postTaxCashflow = preTaxCashflow + taxRefund - taxPayable;
    const weeklyPostTax = postTaxCashflow / 52;

    const cashOnCashReturn = effectiveDeposit > 0 ? (postTaxCashflow / effectiveDeposit) * 100 : 0;
    const dscr = annualInterest > 0 ? netOperatingIncome / annualInterest : 0; 

    // 7. Future Projections (NEW: Loop up to the selected loan term)
    const projectionYears = inputs.loanTermYears || 30;
    const futureValues = [];
    let cumulativeCashflow = 0;
    let currentPropertyValue = inputs.propertyPrice;
    
    for (let i = 1; i <= projectionYears; i++) {
      currentPropertyValue *= (1 + sensitivity.capitalGrowth / 100);
      
      // Calculate future rent, factoring in vacancy
      const futureRawRent = (inputs.weeklyRent * 52) * Math.pow(1 + sensitivity.rentGrowth / 100, i);
      const futureVacancyLoss = futureRawRent * vacancyRateDecimal;
      const annualRentFuture = futureRawRent - futureVacancyLoss;

      const netIncomeFuture = annualRentFuture - totalOpex; 
      const interestFuture = loanAmount * (adjustedRate / 100); 
      const taxDeductionsFuture = totalOpex + interestFuture + inputs.annualDepreciation;
      const taxableIncomeFuture = annualRentFuture - taxDeductionsFuture;
      const taxFuture = calculateTax(inputs.salary + taxableIncomeFuture);
      const cashflowFuture = netIncomeFuture - interestFuture + (baseTax - taxFuture);
      
      cumulativeCashflow += cashflowFuture;
      futureValues.push({
        year: i,
        cashflow: Math.round(cashflowFuture),
        cumulative: Math.round(cumulativeCashflow),
        propertyValue: Math.round(currentPropertyValue),
      });
    }

    return {
      stampDuty, lmi, loanAmount, lvr, effectiveDeposit,
      annualRent, grossYield, totalOpex, netOperatingIncome, netYield,
      annualInterest, annualPrincipal, totalDebtService,
      preTaxCashflow, taxablePropertyIncome, taxRefund, taxPayable,
      postTaxCashflow, weeklyPostTax,
      cashOnCashReturn, dscr, futureValues,
      gearingStatus: taxablePropertyIncome < 0 ? 'Negatively Geared' : 'Positively Geared',
      cashflowStatus: postTaxCashflow >= 0 ? 'Positive Cashflow' : 'Negative Cashflow',
    };
  }, [inputs, sensitivity]);
}