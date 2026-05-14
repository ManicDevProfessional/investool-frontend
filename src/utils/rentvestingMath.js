// Australian income tax brackets (2025-26 Financial Year)
export const calculateTax = (income) => {
  if (income <= 18200) return 0;
  let tax = 0;
  if (income > 190000) tax = 51600 + (income - 190000) * 0.45;
  else if (income > 135000) tax = 31250 + (income - 135000) * 0.37;
  else if (income > 45000) tax = 4288 + (income - 45000) * 0.30;
  else if (income > 18200) tax = (income - 18200) * 0.16;
  return tax + (income * 0.02); // Medicare levy
};

// State-by-State Stamp Duty Approximations (Investment Property, No FHB Concessions)
export const estimateStampDuty = (price, state = 'NSW') => {
  if (price <= 0) return 0;
  
  switch (state) {
    case 'NSW':
      if (price <= 16000) return price * 0.0125;
      if (price <= 35000) return 200 + (price - 16000) * 0.015;
      if (price <= 93000) return 485 + (price - 35000) * 0.0175;
      if (price <= 351000) return 1500 + (price - 93000) * 0.035;
      if (price <= 1168000) return 10530 + (price - 351000) * 0.045;
      return 47295 + (price - 1168000) * 0.055; // Premium property bracket

    case 'VIC':
      if (price <= 25000) return price * 0.014;
      if (price <= 130000) return 350 + (price - 25000) * 0.024;
      if (price <= 960000) return 2870 + (price - 130000) * 0.06;
      return price * 0.055; // Flat 5.5% over 960k

    case 'QLD':
      if (price <= 5000) return 0;
      if (price <= 75000) return (price - 5000) * 0.015;
      if (price <= 540000) return 1050 + (price - 75000) * 0.035;
      if (price <= 1000000) return 17325 + (price - 540000) * 0.045;
      return 38025 + (price - 1000000) * 0.0575;

    case 'WA':
      if (price <= 120000) return price * 0.019;
      if (price <= 150000) return 2280 + (price - 120000) * 0.0285;
      if (price <= 360000) return 3135 + (price - 150000) * 0.038;
      if (price <= 725000) return 11115 + (price - 360000) * 0.0475;
      return 28453 + (price - 725000) * 0.0515;

    case 'SA':
      if (price <= 12000) return price * 0.01;
      if (price <= 30000) return 120 + (price - 12000) * 0.02;
      if (price <= 50000) return 480 + (price - 30000) * 0.03;
      if (price <= 100000) return 1080 + (price - 50000) * 0.04;
      if (price <= 200000) return 3080 + (price - 100000) * 0.0425;
      if (price <= 250000) return 7330 + (price - 200000) * 0.0475;
      if (price <= 300000) return 9705 + (price - 250000) * 0.05;
      if (price <= 500000) return 12205 + (price - 300000) * 0.0525;
      return 22705 + (price - 500000) * 0.055;

    case 'ACT':
      // Simplified ACT formula
      if (price <= 260000) return price * 0.012;
      if (price <= 300000) return 3120 + (price - 260000) * 0.022;
      if (price <= 500000) return 4000 + (price - 300000) * 0.034;
      if (price <= 750000) return 10800 + (price - 500000) * 0.0432;
      if (price <= 1000000) return 21600 + (price - 750000) * 0.059;
      return 36350 + (price - 1000000) * 0.064;

    case 'TAS':
      if (price <= 3000) return 50;
      if (price <= 25000) return 50 + (price - 3000) * 0.0175;
      if (price <= 75000) return 435 + (price - 25000) * 0.0225;
      if (price <= 200000) return 1560 + (price - 75000) * 0.035;
      if (price <= 375000) return 5935 + (price - 200000) * 0.04;
      if (price <= 725000) return 12935 + (price - 375000) * 0.0425;
      return 27810 + (price - 725000) * 0.045;

    case 'NT':
      if (price <= 525000) return Math.pow((0.06571441 * price), 2) + 15 * price;
      if (price <= 3000000) return price * 0.0495;
      return price * 0.0545;

    default:
      return price * 0.04; // Fallback
  }
};

export const estimateLMI = (price, deposit) => {
  const lvr = 1 - (deposit / price);
  if (lvr <= 0.8) return 0;
  if (lvr <= 0.85) return price * 0.012;
  if (lvr <= 0.9) return price * 0.023;
  return price * 0.032;
};