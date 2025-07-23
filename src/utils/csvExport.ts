import { Expense, Category, User } from '../types';
import { format } from 'date-fns';

export const exportExpensesToCSV = (
  expenses: Expense[],
  categories: Category[],
  users: User[]
): void => {
  const getCategoryName = (id: string) => 
    categories.find(cat => cat.id === id)?.name || 'Unknown';
  
  const getUserName = (id: string) => 
    users.find(user => user.id === id)?.name || 'Unknown';

  const csvHeaders = [
    'Date',
    'Description',
    'Amount',
    'Category',
    'Paid By',
    'Split Between',
    'Amount Per Person'
  ];

  const csvRows = expenses.map(expense => {
    const splitBetweenNames = expense.splitBetween
      .map(userId => getUserName(userId))
      .join('; ');
    
    const amountPerPerson = expense.amount / expense.splitBetween.length;

    return [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      `"${expense.description}"`,
      expense.amount.toFixed(2),
      getCategoryName(expense.categoryId),
      getUserName(expense.paidBy),
      `"${splitBetweenNames}"`,
      amountPerPerson.toFixed(2)
    ];
  });

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `esiwtilps-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};