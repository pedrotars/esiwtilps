import { Expense, User, Settlement, Payment } from '../types';

export const calculateSettlements = (expenses: Expense[], users: User[], payments: Payment[] = []): Settlement[] => {
  const balances: Record<string, number> = {};
  
  users.forEach(user => {
    balances[user.id] = 0;
  });

  expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitBetween.length;
    
    balances[expense.paidBy] += expense.amount;
    
    expense.splitBetween.forEach(userId => {
      balances[userId] -= splitAmount;
    });
  });

  payments.forEach(payment => {
    balances[payment.from] += payment.amount;
    balances[payment.to] -= payment.amount;
  });

  const settlements: Settlement[] = [];
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ id: userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ id: userId, amount: Math.abs(balance) });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const settlementAmount = Math.min(creditor.amount, debtor.amount);
    
    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: settlementAmount
      });
    }
    
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;
    
    if (creditor.amount <= 0.01) {
      creditorIndex++;
    }
    if (debtor.amount <= 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
};

export const getUserBalance = (userId: string, expenses: Expense[], payments: Payment[] = []): number => {
  let balance = 0;
  
  expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitBetween.length;
    
    if (expense.paidBy === userId) {
      balance += expense.amount;
    }
    
    if (expense.splitBetween.includes(userId)) {
      balance -= splitAmount;
    }
  });
  
  payments.forEach(payment => {
    if (payment.from === userId) {
      balance += payment.amount;
    }
    if (payment.to === userId) {
      balance -= payment.amount;
    }
  });
  
  return balance;
};

export const getTotalOwed = (userId: string, expenses: Expense[]): number => {
  let totalOwed = 0;
  
  expenses.forEach(expense => {
    if (expense.splitBetween.includes(userId) && expense.paidBy !== userId) {
      const splitAmount = expense.amount / expense.splitBetween.length;
      totalOwed += splitAmount;
    }
  });
  
  return totalOwed;
};

export const getTotalLent = (userId: string, expenses: Expense[]): number => {
  let totalLent = 0;
  
  expenses.forEach(expense => {
    if (expense.paidBy === userId && expense.splitBetween.length > 1) {
      const splitAmount = expense.amount / expense.splitBetween.length;
      const othersCount = expense.splitBetween.length - 1;
      totalLent += splitAmount * othersCount;
    }
  });
  
  return totalLent;
};