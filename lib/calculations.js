export const num = (value) => {
  const parsed = Number(String(value ?? '').replace(/[$,%\s,]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const payment = (principal, apr, months) => {
  const p = Math.max(0, num(principal));
  const rateApr = Math.max(0, num(apr));
  const n = Math.max(0, num(months));
  if (p === 0 || n === 0) return 0;
  const monthlyRate = rateApr / 1200;
  if (monthlyRate === 0) return p / n;
  return (p * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
};

const full = (mode) => mode === 'full';

export function calculate(type, values, mode = 'quick') {
  const v = values || {};

  if (type === 'car') {
    const price = Math.max(0, num(v.price));
    const apr = Math.max(0, num(v.apr));
    const term = Math.max(0, num(v.term));
    const down = Math.max(0, num(v.down));
    const trade = Math.max(0, num(v.trade));
    const owed = Math.max(0, num(v.owed));
    const taxRate = full(mode) ? Math.max(0, num(v.tax)) : 0;
    const fees = full(mode) ? Math.max(0, num(v.fees)) : 0;
    const addons = full(mode) ? Math.max(0, num(v.addons)) : 0;
    const insurance = full(mode) ? Math.max(0, num(v.insurance)) : 0;
    const fuel = full(mode) ? Math.max(0, num(v.fuel)) : 0;
    const maint = full(mode) ? Math.max(0, num(v.maint)) : 0;
    const tax = price * taxRate / 100;
    const negativeEquity = Math.max(0, owed - trade);
    const positiveEquity = Math.max(0, trade - owed);
    const estimatedPurchaseTotal = price + tax + fees + addons;
    const financed = Math.max(0, estimatedPurchaseTotal - down - positiveEquity + negativeEquity);
    const monthly = payment(financed, apr, term);
    const totalLoanPayments = monthly * term;
    const interest = Math.max(0, totalLoanPayments - financed);
    const ownershipMonthly = monthly + insurance + fuel + maint;
    const warnings = [];
    if (term >= 72) warnings.push('A long loan term can lower the payment while increasing total interest and the time you remain in debt.');
    if (negativeEquity > 0) warnings.push(`${money(negativeEquity)} of negative trade equity is being rolled into the next loan.`);
    if (full(mode) && addons > 0) warnings.push(`${money(addons)} of add-ons are included. Confirm each add-on is optional and wanted.`);
    if (full(mode) && taxRate > 0) warnings.push('Sales-tax treatment can vary by state and by how a trade-in is handled. Verify the dealer worksheet.');
    if (down > estimatedPurchaseTotal + negativeEquity) warnings.push('The entered down payment is larger than the estimated amount due. Recheck the inputs.');
    return {
      primary: `${money(monthly)}/mo`,
      subtitle: full(mode) ? 'Estimated loan payment using all entered deal costs.' : 'Quick estimate using only the fields shown above.',
      stats: [
        [full(mode) ? 'Est. purchase total' : 'Vehicle price', money(estimatedPurchaseTotal)],
        ['Amount financed', money(financed)],
        ['Loan payments', money(totalLoanPayments)],
        ['Interest', money(interest)],
        [full(mode) ? 'Ownership / month' : 'Loan payment / month', `${money(ownershipMonthly)}/mo`],
        ['Trade position', negativeEquity ? `${money(negativeEquity)} negative` : `${money(positiveEquity)} positive`],
      ],
      summary: { monthly, financed, totalLoanPayments, interest, ownershipMonthly },
      warnings,
    };
  }

  if (type === 'home') {
    const price = Math.max(0, num(v.price));
    const down = Math.max(0, num(v.down));
    const apr = Math.max(0, num(v.apr));
    const years = Math.max(0, num(v.years));
    const principal = Math.max(0, price - down);
    const mortgage = payment(principal, apr, years * 12);
    const interest = Math.max(0, mortgage * years * 12 - principal);
    const annualTax = full(mode) ? Math.max(0, num(v.tax)) : 0;
    const annualInsurance = full(mode) ? Math.max(0, num(v.insurance)) : 0;
    const hoa = full(mode) ? Math.max(0, num(v.hoa)) : 0;
    const maint = full(mode) ? Math.max(0, num(v.maint)) : 0;
    const utilities = full(mode) ? Math.max(0, num(v.utilities)) : 0;
    const closing = full(mode) ? Math.max(0, num(v.closing)) : 0;
    const taxInsuranceMonthly = (annualTax + annualInsurance) / 12;
    const otherMonthly = hoa + maint + utilities;
    const monthly = mortgage + taxInsuranceMonthly + otherMonthly;
    const cashUpFront = down + closing;
    const warnings = [];
    if (down > price && price > 0) warnings.push('The entered down payment is larger than the home price. Recheck the inputs.');
    if (price > 0 && down / price < 0.2) warnings.push('A down payment below 20% can involve mortgage insurance or other loan-specific costs that are not automatically estimated here.');
    if (!full(mode)) warnings.push('Quick Check excludes property tax, homeowners insurance, HOA, maintenance, utilities and closing costs. Use Full Check for a broader housing estimate.');
    return {
      primary: `${money(monthly)}/mo`,
      subtitle: full(mode) ? 'Estimated monthly carrying cost from the values you entered.' : 'Mortgage principal-and-interest estimate only.',
      stats: [
        ['Mortgage P&I', `${money(mortgage)}/mo`],
        ['Loan amount', money(principal)],
        ['Mortgage interest', money(interest)],
        ['Cash up front', money(cashUpFront)],
        ['Tax + insurance', `${money(taxInsuranceMonthly)}/mo`],
        ['Other monthly', `${money(otherMonthly)}/mo`],
      ],
      summary: { monthly, mortgage, principal, interest, cashUpFront },
      warnings,
    };
  }

  if (type === 'solar') {
    const cash = Math.max(0, num(v.cash));
    const financed = Math.max(0, num(v.financed));
    const apr = Math.max(0, num(v.apr));
    const years = Math.max(0, num(v.years));
    const monthly = payment(financed, apr, years * 12);
    const total = monthly * years * 12;
    const interest = Math.max(0, total - financed);
    const gap = financed - cash;
    const warnings = [];
    if (cash > 0 && gap > cash * 0.15) warnings.push('The financed price is more than 15% above the entered cash price. Ask what creates the difference.');
    if (years >= 20) warnings.push('This is a very long financing term. Compare total repayment, not only the monthly payment.');
    if (full(mode) && num(v.roof) >= 12) warnings.push('Roof age may matter if panels need removal for future roof work.');
    warnings.push('Utility savings, tax incentives, production guarantees and net-metering rules are not automatically verified by this calculator.');
    return {
      primary: `${money(monthly)}/mo`,
      subtitle: `${money(total)} estimated total loan payments`,
      stats: [
        ['Cash price', money(cash)],
        ['Financed price', money(financed)],
        ['Interest', money(interest)],
        ['Cash vs financed gap', money(gap)],
      ],
      summary: { monthly, total, interest, gap },
      warnings,
    };
  }

  if (type === 'loan') {
    const amount = Math.max(0, num(v.amount));
    const apr = Math.max(0, num(v.apr));
    const term = Math.max(0, num(v.term));
    const fees = full(mode) ? Math.max(0, num(v.fees)) : 0;
    const monthly = payment(amount, apr, term);
    const scheduledPayments = monthly * term;
    const interest = Math.max(0, scheduledPayments - amount);
    const totalRepayment = scheduledPayments + fees;
    const warnings = [];
    if (apr > 15) warnings.push('The entered APR is above 15%. Compare other offers if they are available to you.');
    if (term >= 60) warnings.push('A longer term may reduce the monthly payment while increasing total interest.');
    if (!full(mode)) warnings.push('Quick Check excludes fees. Use Full Check if the lender charges origination or other upfront fees.');
    return {
      primary: `${money(monthly)}/mo`,
      subtitle: 'Standard fixed-payment amortization estimate.',
      stats: [
        ['Total repayment', money(totalRepayment)],
        ['Interest', money(interest)],
        ['Fees entered', money(fees)],
        ['Cost above principal', money(totalRepayment - amount)],
      ],
      summary: { monthly, totalRepayment, interest, fees },
      warnings,
    };
  }

  if (type === 'purchase') {
    const cash = Math.max(0, num(v.cash));
    const financed = Math.max(0, num(v.financed));
    const apr = Math.max(0, num(v.apr));
    const term = Math.max(0, num(v.term));
    const extras = full(mode) ? Math.max(0, num(v.delivery)) + Math.max(0, num(v.protection)) : 0;
    const monthly = payment(financed, apr, term);
    const scheduledPayments = monthly * term;
    const interest = Math.max(0, scheduledPayments - financed);
    const total = scheduledPayments + extras;
    const aboveCash = total - cash;
    const warnings = [];
    if (cash > 0 && aboveCash > cash * 0.25) warnings.push('The estimated total cost is more than 25% above the cash price.');
    if (apr > 20) warnings.push('The entered APR is high. Compare the total repayment against paying cash or another financing option.');
    if (!full(mode)) warnings.push('Quick Check excludes delivery, setup and protection-plan costs.');
    return {
      primary: `${money(monthly)}/mo`,
      subtitle: `${money(total)} estimated total paid`,
      stats: [
        ['Cash price', money(cash)],
        ['Total paid', money(total)],
        ['Interest', money(interest)],
        ['Extras entered', money(extras)],
        ['Above cash price', money(aboveCash)],
      ],
      summary: { monthly, total, interest, aboveCash },
      warnings,
    };
  }

  if (type === 'rent') {
    const base = Math.max(0, num(v.base));
    const months = Math.max(1, num(v.months));
    const recurringExtras = full(mode)
      ? Math.max(0, num(v.utilities)) + Math.max(0, num(v.parking)) + Math.max(0, num(v.internet)) + Math.max(0, num(v.other)) + Math.max(0, num(v.insurance)) + Math.max(0, num(v.commute))
      : 0;
    const moveInFees = full(mode) ? Math.max(0, num(v.movein)) : 0;
    const deposit = full(mode) ? Math.max(0, num(v.deposit)) : 0;
    const effectiveMonthly = base + recurringExtras + moveInFees / months;
    const leaseCost = (base + recurringExtras) * months + moveInFees;
    const moveInCash = base + moveInFees + deposit;
    const warnings = [];
    if (!full(mode)) warnings.push('Quick Check shows base rent only. Full Check adds utilities, parking, internet, fees, insurance, commute and move-in costs.');
    warnings.push('Security deposits are shown as move-in cash but are not counted as a lease expense because refundability depends on the lease and property condition.');
    return {
      primary: `${money(effectiveMonthly)}/mo`,
      subtitle: full(mode) ? 'Effective monthly cost with entered recurring and move-in expenses.' : 'Base rent only.',
      stats: [
        ['Base rent', `${money(base)}/mo`],
        ['Recurring extras', `${money(recurringExtras)}/mo`],
        ['Lease-period cost', money(leaseCost)],
        ['Move-in cash', money(moveInCash)],
        ['Deposit', money(deposit)],
      ],
      summary: { effectiveMonthly, leaseCost, moveInCash, deposit },
      warnings,
    };
  }

  if (type === 'job') {
    const aSalary = Math.max(0, num(v.asalary));
    const bSalary = Math.max(0, num(v.bsalary));
    const aBonus = Math.max(0, num(v.abonus));
    const bBonus = Math.max(0, num(v.bbonus));
    const aBenefits = full(mode) ? Math.max(0, num(v.abenefits)) : 0;
    const bBenefits = full(mode) ? Math.max(0, num(v.bbenefits)) : 0;
    const aCommute = full(mode) ? Math.max(0, num(v.acommute)) : 0;
    const bCommute = full(mode) ? Math.max(0, num(v.bcommute)) : 0;
    const aValue = aSalary + aBonus + aBenefits - aCommute;
    const bValue = bSalary + bBonus + bBenefits - bCommute;
    const difference = bValue - aValue;
    const aCommuteHours = full(mode) ? Math.max(0, num(v.ahours)) * 48 : 0;
    const bCommuteHours = full(mode) ? Math.max(0, num(v.bhours)) * 48 : 0;
    const aPtoValue = full(mode) ? Math.max(0, num(v.apto)) * (aSalary / 260) : 0;
    const bPtoValue = full(mode) ? Math.max(0, num(v.bpto)) * (bSalary / 260) : 0;
    const warnings = ['This comparison does not estimate taxes or put a dollar value on job security, culture, schedule flexibility, career growth or health-plan details.'];
    if (!full(mode)) warnings.push('Quick Check compares salary and entered bonus only. Full Check adds benefits, commute, PTO and commute time.');
    return {
      primary: money(Math.abs(difference)),
      subtitle: `${difference >= 0 ? 'Offer B' : 'Offer A'} has the higher entered annual value by this amount.`,
      stats: [
        ['Offer A value', money(aValue)],
        ['Offer B value', money(bValue)],
        ['A commute hours / year', `${Math.round(aCommuteHours)} hrs`],
        ['B commute hours / year', `${Math.round(bCommuteHours)} hrs`],
        ['A PTO estimate', money(aPtoValue)],
        ['B PTO estimate', money(bPtoValue)],
      ],
      summary: { difference, aValue, bValue },
      warnings,
    };
  }

  return { primary: '$0', subtitle: '', stats: [], summary: {}, warnings: ['Unknown check type.'] };
}
