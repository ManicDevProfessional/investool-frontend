import { useMemo, useState } from 'react';

// Enhanced Stamp Duty Estimator with basic First Home Buyer (FHB) rules
const calculateStampDuty = (price, state, isFHB) => {
  if (price <= 0) return 0;
  
  let duty = 0;
  
  // Base duty calculation (Simplified Investment/Next Home)
  switch (state) {
    case 'NSW':
      if (price <= 16000) duty = price * 0.0125;
      else if (price <= 35000) duty = 200 + (price - 16000) * 0.015;
      else if (price <= 93000) duty = 485 + (price - 35000) * 0.0175;
      else if (price <= 351000) duty = 1500 + (price - 93000) * 0.035;
      else if (price <= 1168000) duty = 10530 + (price - 351000) * 0.045;
      else duty = 47295 + (price - 1168000) * 0.055;
      break;
    case 'VIC':
      if (price <= 25000) duty = price * 0.014;
      else if (price <= 130000) duty = 350 + (price - 25000) * 0.024;
      else if (price <= 960000) duty = 2870 + (price - 130000) * 0.06;
      else duty = price * 0.055;
      break;
    case 'QLD':
      if (price <= 5000) duty = 0;
      else if (price <= 75000) duty = (price - 5000) * 0.015;
      else if (price <= 540000) duty = 1050 + (price - 75000) * 0.035;
      else if (price <= 1000000) duty = 17325 + (price - 540000) * 0.045;
      else duty = 38025 + (price - 1000000) * 0.0575;
      break;
    default:
      // Fallback rough estimate for other states for simplicity in this example
      duty = price * 0.045; 
  }

  // FHB Concessions (General 2025-26 rules)
  if (isFHB) {
    if (state === 'NSW') {
      if (price <= 800000) return 0;
      if (price <= 1000000) return duty * ((price - 800000) / 200000); // Tapered
    }
    if (state === 'VIC') {
      if (price <= 600000) return 0;
      if (price <= 750000) return duty * ((price - 600000) / 150000);
    }
    if (state === 'QLD') {
      if (price <= 700000) return 0;
      if (price <= 800000) return duty * ((price - 700000) / 100000);
    }
  }

  return duty;
};

// LMI Calculation
const calculateLMI = (price, deposit) => {
  const lvr = price > 0 ? 1 - (deposit / price) : 0;
  if (lvr <= 0.8) return 0;
  if (lvr <= 0.85) return price * 0.012;
  if (lvr <= 0.9) return price * 0.023;
  if (lvr <= 0.95) return price * 0.035;
  return price * 0.045; // 95%+ LVR
};

export function usePurchasingCosts() {
  const [inputs, setInputs] = useState({
    propertyPrice: 750000,
    deposit: 100000,
    state: 'NSW',
    buyerType: 'First Home Buyer', // 'First Home Buyer', 'Next Home', 'Investor'
    
    // Configurable closing costs
    conveyancing: 1800,
    buildingPest: 600,
    mortgageRegFee: 155,
    transferFee: 350,
    loanAppFee: 395,
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = (type === 'number') ? (parseFloat(value) || 0) : value;
    setInputs(prev => ({ ...prev, [name]: parsedValue }));
  };

  const metrics = useMemo(() => {
    const isFHB = inputs.buyerType === 'First Home Buyer';
    const stampDuty = calculateStampDuty(inputs.propertyPrice, inputs.state, isFHB);
    const lmi = calculateLMI(inputs.propertyPrice, inputs.deposit);
    
    const governmentFees = inputs.mortgageRegFee + inputs.transferFee;
    const professionalFees = inputs.conveyancing + inputs.buildingPest + inputs.loanAppFee;
    
    const totalPurchaseCosts = stampDuty + lmi + governmentFees + professionalFees;
    const totalCashRequired = inputs.deposit + totalPurchaseCosts;
    
    const loanAmount = Math.max(0, inputs.propertyPrice - inputs.deposit);
    const lvr = inputs.propertyPrice > 0 ? (loanAmount / inputs.propertyPrice) * 100 : 0;

    return {
      stampDuty,
      lmi,
      governmentFees,
      professionalFees,
      totalPurchaseCosts,
      totalCashRequired,
      loanAmount,
      lvr: lvr.toFixed(1),
    };
  }, [inputs]);

  return { inputs, handleInputChange, metrics };
}