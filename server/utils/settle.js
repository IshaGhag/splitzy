function settleBalances(balances) {
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0) creditors.push([person, amount]);
    if (amount < 0) debtors.push([person, -amount]);
  }

  const transactions = [];

  while (creditors.length && debtors.length) {
    const [creditor, creditAmt] = creditors[0];
    const [debtor, debtAmt] = debtors[0];
    const settled = Math.min(creditAmt, debtAmt);

    transactions.push({ from: debtor, to: creditor, amount: settled });

    creditors[0][1] -= settled;
    debtors[0][1] -= settled;

    if (creditors[0][1] === 0) creditors.shift();
    if (debtors[0][1] === 0) debtors.shift();
  }

  return transactions;
}

module.exports = settleBalances;