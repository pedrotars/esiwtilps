import React from 'react';
import styled from 'styled-components';
import { useSupabaseApp } from '../context/SupabaseAppContext';
import { Expense } from '../types';
import { format } from 'date-fns';
import { exportExpensesToCSV } from '../utils/csvExport';

const ListContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ListHeader = styled.div`
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const DownloadButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #218838;
  }
`;

const ExpenseItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const ExpenseInfo = styled.div`
  flex: 1;
`;

const ExpenseDescription = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ExpenseDetails = styled.div`
  font-size: 14px;
  color: #666;
  display: flex;
  gap: 16px;
`;

const ExpenseAmount = styled.div`
  font-weight: 600;
  color: #007bff;
  font-size: 18px;
`;

const CategoryBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const Actions = styled.div`
  margin-left: 16px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  padding: 6px 12px;
  margin-left: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #f8f9fa;
  }
`;

const NoExpenses = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #666;
`;

interface ExpenseListProps {
  expenses?: Expense[];
  title?: string;
  onEdit?: (expense: Expense) => void;
  showDownload?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  title = "Recent Expenses",
  onEdit,
  showDownload = false
}) => {
  const { state, deleteExpense } = useSupabaseApp();
  
  const expensesToShow = expenses || state.expenses;
  
  const getCategoryById = (id: string) => 
    state.categories.find(cat => cat.id === id);
  
  const getUserById = (id: string) => 
    state.users.find(user => user.id === id);

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
    }
  };

  const handleDownloadCSV = () => {
    exportExpensesToCSV(expensesToShow, state.categories, state.users);
  };

  if (expensesToShow.length === 0) {
    return (
      <ListContainer>
        <ListHeader>
          <ListTitle>{title}</ListTitle>
          {showDownload && (
            <DownloadButton onClick={handleDownloadCSV}>
              📄 Download CSV
            </DownloadButton>
          )}
        </ListHeader>
        <NoExpenses>
          No expenses found. Add your first expense to get started!
        </NoExpenses>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <ListTitle>{title}</ListTitle>
        {showDownload && (
          <DownloadButton onClick={handleDownloadCSV}>
            📄 Download CSV
          </DownloadButton>
        )}
      </ListHeader>
      {expensesToShow.map(expense => {
        const category = getCategoryById(expense.categoryId);
        const paidByUser = getUserById(expense.paidBy);
        
        return (
          <ExpenseItem key={expense.id}>
            <ExpenseInfo>
              <ExpenseDescription>{expense.description}</ExpenseDescription>
              <ExpenseDetails>
                <span>
                  {category && (
                    <CategoryBadge color={category.color}>
                      {category.icon} {category.name}
                    </CategoryBadge>
                  )}
                </span>
                <span>Paid by {paidByUser?.name}</span>
                <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                <span>Split {expense.splitBetween.length} ways</span>
              </ExpenseDetails>
            </ExpenseInfo>
            <ExpenseAmount>${expense.amount.toFixed(2)}</ExpenseAmount>
            <Actions>
              {onEdit && (
                <ActionButton onClick={() => onEdit(expense)}>
                  Edit
                </ActionButton>
              )}
              <ActionButton onClick={() => handleDelete(expense.id)}>
                Delete
              </ActionButton>
            </Actions>
          </ExpenseItem>
        );
      })}
    </ListContainer>
  );
};