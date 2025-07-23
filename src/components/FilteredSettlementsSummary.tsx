import React from 'react';
import styled from 'styled-components';
import { useSupabaseApp } from '../context/SupabaseAppContext';
import { calculateSettlements, getUserBalance } from '../utils/settlements';
import { Payment, Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';

const Container = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
`;

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const BalanceCard = styled.div<{ isPositive: boolean }>`
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.isPositive ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.isPositive ? '#c3e6cb' : '#f5c6cb'};
`;

const UserName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const BalanceAmount = styled.div<{ isPositive: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.isPositive ? '#155724' : '#721c24'};
`;

const BalanceDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const SettlementsSection = styled.div`
  margin-top: 24px;
`;

const SettlementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettlementItem = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettlementText = styled.div`
  color: #333;
`;

const SettlementAmount = styled.div`
  font-weight: bold;
  color: #007bff;
  font-size: 18px;
`;

const SettleButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 12px;

  &:hover {
    background: #218838;
  }
`;

const NoSettlements = styled.div`
  text-align: center;
  color: #666;
  padding: 32px;
  background: #f8f9fa;
  border-radius: 8px;
`;

interface FilteredSettlementsSummaryProps {
  expenses: Expense[];
  title?: string;
}

export const FilteredSettlementsSummary: React.FC<FilteredSettlementsSummaryProps> = ({ 
  expenses, 
  title = "Settlements & Balances" 
}) => {
  const { state, addPayment } = useSupabaseApp();
  
  const settlements = calculateSettlements(expenses, state.users, state.payments);
  const userBalances = state.users.map(user => ({
    user,
    balance: getUserBalance(user.id, expenses, state.payments)
  }));

  const getUserName = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const handleSettlePayment = (from: string, to: string, amount: number) => {
    const payment: Payment = {
      id: uuidv4(),
      from,
      to,
      amount,
      date: new Date(),
      description: `Settlement payment from ${getUserName(from)} to ${getUserName(to)}`
    };

    addPayment(payment);
  };

  return (
    <Container>
      <Title>{title}</Title>
      
      <BalanceGrid>
        {userBalances.map(({ user, balance }) => (
          <BalanceCard key={user.id} isPositive={balance >= 0}>
            <UserName>{user.name}</UserName>
            <BalanceAmount isPositive={balance >= 0}>
              ${Math.abs(balance).toFixed(2)}
            </BalanceAmount>
            <BalanceDescription>
              {balance > 0 ? 'Gets back' : balance < 0 ? 'Owes' : 'All settled up'}
            </BalanceDescription>
          </BalanceCard>
        ))}
      </BalanceGrid>

      <SettlementsSection>
        <h3>Suggested Settlements</h3>
        {settlements.length === 0 ? (
          <NoSettlements>
            🎉 Everyone is settled up! No payments needed.
          </NoSettlements>
        ) : (
          <SettlementsList>
            {settlements.map((settlement, index) => (
              <SettlementItem key={index}>
                <SettlementText>
                  <strong>{getUserName(settlement.from)}</strong> owes{' '}
                  <strong>{getUserName(settlement.to)}</strong>
                </SettlementText>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SettlementAmount>
                    ${settlement.amount.toFixed(2)}
                  </SettlementAmount>
                  <SettleButton
                    onClick={() => handleSettlePayment(settlement.from, settlement.to, settlement.amount)}
                  >
                    Mark as Paid
                  </SettleButton>
                </div>
              </SettlementItem>
            ))}
          </SettlementsList>
        )}
      </SettlementsSection>
    </Container>
  );
};