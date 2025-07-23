import React, { useState } from 'react';
import styled from 'styled-components';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { CategoryManager } from '../components/CategoryManager';
import { SettlementsSummary } from '../components/SettlementsSummary';
import { UserManager } from '../components/UserManager';
import { DateFilter, DateFilterValue, filterExpensesByDate } from '../components/DateFilter';
import { FilteredExpenseChart } from '../components/FilteredExpenseChart';
import { FilteredSettlementsSummary } from '../components/FilteredSettlementsSummary';
import { Expense } from '../types';
import { useSupabaseApp } from '../context/SupabaseAppContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;

  &:hover {
    background: #545b62;
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 24px;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: ${props => props.active ? '#007bff' : '#666'};
  border-bottom-color: ${props => props.active ? '#007bff' : 'transparent'};

  &:hover {
    color: #007bff;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

type TabType = 'overview' | 'expenses' | 'categories' | 'people' | 'settlements';

export const Dashboard: React.FC = () => {
  const { state } = useSupabaseApp();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: 'all' });

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const filteredExpenses = filterExpensesByDate(state.expenses, dateFilter);

  if (state.loading) {
    return <LoadingSpinner message="Loading Esiwtilps..." subMessage="Fetching your data from the cloud..." />;
  }

  if (state.error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <h2>Error loading data</h2>
          <p>{state.error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <FilteredExpenseChart expenses={filteredExpenses} />
            <FilteredSettlementsSummary expenses={filteredExpenses} />
          </>
        );
      case 'expenses':
        return (
          <>
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <ExpenseList 
              expenses={filteredExpenses} 
              onEdit={handleEditExpense} 
              showDownload={true}
            />
          </>
        );
      case 'categories':
        return <CategoryManager />;
      case 'people':
        return <UserManager />;
      case 'settlements':
        return <SettlementsSummary />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Esiwtilps</Title>
        <ButtonGroup>
          <Button onClick={() => setShowExpenseForm(true)}>
            + Add Expense
          </Button>
          <SecondaryButton onClick={() => setShowCategoryManager(true)}>
            Manage Categories
          </SecondaryButton>
        </ButtonGroup>
      </Header>

      <TabsContainer>
        <TabsList>
          <Tab
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Tab>
          <Tab
            active={activeTab === 'expenses'}
            onClick={() => setActiveTab('expenses')}
          >
            All Expenses
          </Tab>
          <Tab
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </Tab>
          <Tab
            active={activeTab === 'people'}
            onClick={() => setActiveTab('people')}
          >
            People
          </Tab>
          <Tab
            active={activeTab === 'settlements'}
            onClick={() => setActiveTab('settlements')}
          >
            Settlements
          </Tab>
        </TabsList>

        {renderTabContent()}
      </TabsContainer>

      {showExpenseForm && (
        <Modal onClick={handleCloseExpenseForm}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ExpenseForm
              onClose={handleCloseExpenseForm}
              expense={editingExpense || undefined}
            />
          </ModalContent>
        </Modal>
      )}

      {showCategoryManager && (
        <Modal onClick={() => setShowCategoryManager(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CategoryManager />
            <div style={{ padding: '0 24px 24px' }}>
              <Button onClick={() => setShowCategoryManager(false)}>
                Close
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};