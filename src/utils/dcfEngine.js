export const runModel = (inputs, activeWacc, activeTg) => {
  const wacc = activeWacc / 100;
  const tg = activeTg / 100;

  let revenue = inputs.revenue;
  let fcfMargin = (inputs.freeCashFlow / inputs.revenue) * 100;
  let fcf = inputs.freeCashFlow;

  const getGrowth = (year) => {
    if (year <= 5) return inputs.revenueGrowthPhase1;
    if (year <= 10) return inputs.revenueGrowthPhase2;
    if (year <= 15) return inputs.revenueGrowthPhase3;
    return inputs.revenueGrowthPhase4;
  };

  const getMarginExpansion = (year) => {
    if (year <= 5) return inputs.fcfMarginExpansion1;
    if (year <= 10) return inputs.fcfMarginExpansion2;
    if (year <= 15) return inputs.fcfMarginExpansion3;
    return inputs.fcfMarginExpansion4;
  };

  const cashFlows = [];
  let pvOfFcf = 0;

  for (let year = 1; year <= 20; year++) {
    const growth = getGrowth(year) / 100;
    revenue *= 1 + growth;

    fcfMargin += getMarginExpansion(year);
    // Hard cap margins so the model doesn't generate physically impossible numbers
    fcfMargin = Math.max(1, Math.min(50, fcfMargin));

    fcf = revenue * (fcfMargin / 100);

    const pv = fcf / Math.pow(1 + wacc, year);
    pvOfFcf += pv;

    cashFlows.push({ year, revenue, fcf, fcfMargin, pv });
  }

  const terminalFcf = cashFlows[19].fcf;
  const terminalValue = (terminalFcf * (1 + tg)) / (wacc - tg);
  const pvOfTv = terminalValue / Math.pow(1 + wacc, 20);

  const enterpriseValue = pvOfFcf + pvOfTv;
  const equityValue = enterpriseValue - inputs.netDebt;
  const intrinsicValue = equityValue / inputs.sharesOutstanding;
  const upside = ((intrinsicValue - inputs.currentPrice) / inputs.currentPrice) * 100;

  return {
    cashFlows,
    pvOfFcf,
    pvOfTv,
    enterpriseValue,
    equityValue,
    intrinsicValue,
    upside,
    undervalued: intrinsicValue > inputs.currentPrice,
  };
};