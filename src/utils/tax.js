// ----------------------------------------------------------------------
// ATO Stage 3 Tax Brackets (Effective July 1, 2024)
// ----------------------------------------------------------------------
export const ATO_STAGE_3_BRACKETS = [
  { min: 0, max: 18200, rate: 0.00 },
  { min: 18200, max: 45000, rate: 0.16 },
  { min: 45000, max: 135000, rate: 0.30 },
  { min: 135000, max: 190000, rate: 0.37 },
  { min: 190000, max: Infinity, rate: 0.45 }
];

export const MEDICARE_LEVY_RATE = 0.02;

// ----------------------------------------------------------------------
// Core Tax Calculator
// ----------------------------------------------------------------------
export const calculateTax = (income) => {
  if (income <= 0) return 0;

  let tax = 0;
  let remainingIncome = income;

  for (const bracket of ATO_STAGE_3_BRACKETS) {
    // Calculate how much of the income falls into the current bracket
    const bracketSize = bracket.max - bracket.min;
    const taxableInThisBracket = Math.min(remainingIncome, bracketSize);

    if (taxableInThisBracket > 0) {
      tax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }

    if (remainingIncome <= 0) break;
  }

  // Add 2% Medicare Levy (Simplified: assumes standard investor, no low-income offset)
  const medicareLevy = income > 26000 ? income * MEDICARE_LEVY_RATE : 0;

  return Math.round(tax + medicareLevy);
};

// ----------------------------------------------------------------------
// InvesTool Negative Gearing Engine
// ----------------------------------------------------------------------
export const calculateNegativeGearing = ({
  salary,
  annualRent,
  annualExpenses,
  annualInterest,
  annualDepreciation
}) => {
  // 1. Calculate the property's paper loss (or profit)
  const totalDeductions = annualExpenses + annualInterest + annualDepreciation;
  const netPropertyIncome = annualRent - totalDeductions; 

  // 2. Calculate tax without the property
  const baseTax = calculateTax(salary);

  // 3. Calculate tax WITH the property
  // If netPropertyIncome is negative, it reduces their taxable salary
  const newTaxableIncome = Math.max(0, salary + netPropertyIncome);
  const newTax = calculateTax(newTaxableIncome);

  // 4. Determine the exact tax refund triggered by the property
  const taxRefund = baseTax - newTax;

  // 5. Calculate TRUE out-of-pocket cashflow
  // We exclude depreciation here because it is a "paper" deduction, not actual cash spent
  const cashflowBeforeTax = annualRent - (annualExpenses + annualInterest);
  const trueCashflowAfterTax = cashflowBeforeTax + taxRefund;

  return {
    isNegativelyGeared: netPropertyIncome < 0,
    paperLoss: netPropertyIncome, // The number the ATO sees
    taxRefund: taxRefund, // The cash back at tax time
    cashflowBeforeTax: cashflowBeforeTax, 
    trueCashflowAfterTax: trueCashflowAfterTax, // The actual money gained/lost
    weeklyHoldingCost: trueCashflowAfterTax / 52 // The ultimate metric for the user
  };
};