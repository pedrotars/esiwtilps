import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { ExpenseList } from '../components/ExpenseList';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CategoryIcon = styled.span`
  font-size: 32px;
`;

const CategoryDetails = styled.div``;

const CategoryName = styled.h1`
  margin: 0;
  color: #333;
`;

const CategoryStats = styled.div`
  color: #666;
  margin-top: 4px;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #545b62;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const NoExpensesMessage = styled.div`
  background: white;
  padding: 48px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #666;
`;

export const CategoryExpenses: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { state } = useApp();

  const category = state.categories.find(cat => cat.id === categoryId);
  const categoryExpenses = state.expenses.filter(expense => expense.categoryId === categoryId);

  if (!category) {
    return (
      <Container>
        <div>Category not found</div>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Dashboard
        </BackButton>
      </Container>
    );
  }

  const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = categoryExpenses.length > 0 ? totalAmount / categoryExpenses.length : 0;
  
  const uniqueParticipants = new Set();
  categoryExpenses.forEach(expense => {
    uniqueParticipants.add(expense.paidBy);
    expense.splitBetween.forEach(userId => uniqueParticipants.add(userId));
  });

  return (
    <Container>
      <Header>
        <CategoryInfo>
          <CategoryIcon>{category.icon}</CategoryIcon>
          <CategoryDetails>
            <CategoryName>{category.name}</CategoryName>
            <CategoryStats>
              {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''} • 
              ${totalAmount.toFixed(2)} total
            </CategoryStats>
          </CategoryDetails>
        </CategoryInfo>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Dashboard
        </BackButton>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryValue>${totalAmount.toFixed(2)}</SummaryValue>
          <SummaryLabel>Total Spent</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{categoryExpenses.length}</SummaryValue>
          <SummaryLabel>Total Expenses</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>${averageAmount.toFixed(2)}</SummaryValue>
          <SummaryLabel>Average Amount</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{uniqueParticipants.size}</SummaryValue>
          <SummaryLabel>People Involved</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      {categoryExpenses.length > 0 ? (
        <ExpenseList 
          expenses={categoryExpenses} 
          title={`${category.icon} ${category.name} Expenses`}
        />
      ) : (
        <NoExpensesMessage>
          <h3>No expenses in this category yet</h3>
          <p>Start adding expenses to see them here!</p>
        </NoExpensesMessage>
      )}
    </Container>
  );
};