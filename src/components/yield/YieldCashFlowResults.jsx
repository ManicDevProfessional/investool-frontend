import { useMemo } from 'react';
import { calculateTax } from '../../utils/rentvestingMath'; 
import YieldDashboardTab from './tabs/YieldDashboardTab';
import YieldSensitivityTab from './tabs/YieldSensitivityTab';
import YieldProjectionsTab from './tabs/YieldProjectionsTab';

export default function YieldCashflowResults({ inputs, metrics, sensitivity, handleSensitivityChange, activeTab }) {
  
  // --- DATA PROCESSING FOR CHARTS ---

  const propertyMgmtDollar = metrics.annualRent * (inputs.propertyMgmtRate / 100);
  
  const expenseData = [
    { name: 'Strata', value: inputs.annualStrata, color: '#f59e0b' },
    { name: 'Rates', value: inputs.annualRates, color: '#10b981' },
    { name: 'Maintenance', value: inputs.annualMaintenance, color: '#ef4444' },
    { name: 'Insurance', value: inputs.annualInsurance, color: '#3b82f6' },
    { name: 'Property Mgmt', value: propertyMgmtDollar, color: '#8b5cf6' },
  ].filter(e => e.value > 0);

  const cashflowChartData = [
    { name: 'Gross Rent', amount: metrics.annualRent, fill: '#0ea5e9' },
    { name: 'Tax Refund', amount: metrics.taxRefund, fill: '#10b981' },
    { name: 'Expenses', amount: -metrics.totalOpex, fill: '#f59e0b' },
    { name: 'Interest', amount: -metrics.annualInterest, fill: '#ef4444' },
    { name: 'Principal', amount: -metrics.annualPrincipal, fill: '#b91c1c' },
    { name: 'Net Cashflow', amount: metrics.postTaxCashflow, fill: metrics.postTaxCashflow >= 0 ? '#10b981' : '#ef4444' },
  ];

  const projectionData = metrics.futureValues.map(v => ({
    year: `Y${v.year}`,
    cashflow: v.cashflow,
    cumulative: v.cumulative,
  }));
  const tickInterval = inputs.loanTermYears >= 40 ? 4 : inputs.loanTermYears >= 30 ? 3 : inputs.loanTermYears >= 20 ? 2 : 1;

  // Rate Shock Curve Engine
  const rateCurveData = useMemo(() => {
    const data = [];
    const baseRate = inputs.interestRate;
    for (let shift = -1; shift <= 4; shift += 0.5) {
      const testRate = Math.max(0, baseRate + shift);
      const testAnnualInterest = metrics.loanAmount * (testRate / 100);
      
      const testTaxDeductions = metrics.totalOpex + testAnnualInterest + inputs.annualDepreciation;
      const testTaxableIncome = metrics.annualRent - testTaxDeductions;
      
      const baseTax = calculateTax(inputs.salary);
      const testTax = calculateTax(inputs.salary + testTaxableIncome);
      const testTaxRefund = Math.max(0, baseTax - testTax);
      const testTaxPayable = Math.max(0, testTax - baseTax);
      
      const testPreTaxCashflow = metrics.netOperatingIncome - testAnnualInterest - metrics.annualPrincipal;
      const testPostTaxCashflow = testPreTaxCashflow + testTaxRefund - testTaxPayable;
      
      data.push({
        rateLabel: `${testRate.toFixed(1)}%`,
        rate: testRate,
        cashflow: Math.round(testPostTaxCashflow / 52)
      });
    }
    return data;
  }, [inputs, metrics]);

  return (
    <div className="xl:col-span-8 space-y-6">
      {activeTab === 'dashboard' && (
        <YieldDashboardTab 
          metrics={metrics} 
          cashflowChartData={cashflowChartData} 
          expenseData={expenseData} 
        />
      )}
      {activeTab === 'sensitivity' && (
        <YieldSensitivityTab 
          inputs={inputs} 
          metrics={metrics} 
          sensitivity={sensitivity} 
          handleSensitivityChange={handleSensitivityChange} 
          rateCurveData={rateCurveData} 
        />
      )}
      {activeTab === 'projections' && (
        <YieldProjectionsTab 
          inputs={inputs} 
          projectionData={projectionData} 
          tickInterval={tickInterval} 
        />
      )}
    </div>
  );
}