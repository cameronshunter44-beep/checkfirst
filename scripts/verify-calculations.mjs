import assert from 'node:assert/strict';
import { calculate, payment } from '../lib/calculations.js';

const close = (actual, expected, tolerance = 0.02) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);
};

close(payment(20000, 11.5, 60), 439.85);
close(payment(340000, 6.4, 360), 2126.72);
close(payment(39800, 4.99, 300), 232.44);
close(payment(12000, 0, 24), 500);
assert.equal(payment(0, 8, 60), 0);
assert.equal(payment(10000, 8, 0), 0);

const quickLoan = calculate('loan', { amount: 20000, apr: 11.5, term: 60, fees: 99999 }, 'quick');
close(quickLoan.summary.monthly, 439.85);
assert.equal(quickLoan.summary.fees, 0, 'Quick loan must not include hidden Full Check fees');

const fullLoan = calculate('loan', { amount: 20000, apr: 11.5, term: 60, fees: 800 }, 'full');
assert.equal(fullLoan.summary.fees, 800);

const quickRent = calculate('rent', { base: 1600, months: 12, utilities: 900, parking: 900, movein: 9000 }, 'quick');
assert.equal(quickRent.summary.effectiveMonthly, 1600, 'Quick rent must use only visible Quick Check inputs');

const fullRent = calculate('rent', { base: 1600, months: 12, utilities: 180, parking: 100, internet: 65, other: 45, insurance: 18, commute: 120, movein: 650, deposit: 1600 }, 'full');
close(fullRent.summary.effectiveMonthly, 2182.17);

const quickJob = calculate('job', { asalary: 80000, abonus: 5000, abenefits: 999999, acommute: 999999, bsalary: 92000, bbonus: 3000, bbenefits: 1, bcommute: 1 }, 'quick');
assert.equal(quickJob.summary.aValue, 85000);
assert.equal(quickJob.summary.bValue, 95000);

const quickHome = calculate('home', { price: 425000, down: 85000, apr: 6.4, years: 30, tax: 99999, insurance: 99999, hoa: 99999 }, 'quick');
close(quickHome.summary.mortgage, 2126.72);
close(quickHome.summary.monthly, quickHome.summary.mortgage);

console.log('CheckFirst calculation verification passed.');
