import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AICategorization } from '../services/aiCategorization';

const FormContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: normal;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 12px;

  &:hover {
    background: #0056b3;
  }
`;

const CancelButton = styled(Button)`
  background: #6c757d;

  &:hover {
    background: #545b62;
  }
`;

const AIIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #007bff;
  margin-top: 4px;
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ExpenseFormProps {
  onClose: () => void;
  expense?: Expense;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, expense }) => {
  const { state, dispatch } = useApp();
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId || '');
  const [paidBy, setPaidBy] = useState(expense?.paidBy || state.currentUser?.id || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(expense?.splitBetween || []);
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const categorizeWithAI = async () => {
      if (description.trim().length < 3 || expense) return;
      
      setIsCategorizingAI(true);
      setAiSuggestion(null);
      
      try {
        const result = await AICategorization.categorizeExpense(
          description.trim(),
          state.categories,
          state.expenses
        );
        
        if (result.categoryId && result.confidence > 0.5) {
          setCategoryId(result.categoryId);
          setAiSuggestion(result.categoryId);
        }
      } catch (error) {
        console.error('AI categorization error:', error);
      } finally {
        setIsCategorizingAI(false);
      }
    };

    const timeoutId = setTimeout(categorizeWithAI, 1000);
    return () => clearTimeout(timeoutId);
  }, [description, state.categories, state.expenses, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !categoryId || !paidBy) {
      alert('Please fill in all required fields');
      return;
    }

    if (splitBetween.length === 0) {
      alert('Please select at least one person to split with');
      return;
    }

    const expenseData: Expense = {
      id: expense?.id || uuidv4(),
      description,
      amount: parseFloat(amount),
      date: expense?.date || new Date(),
      paidBy,
      splitBetween,
      categoryId,
    };

    if (expense) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expenseData });
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expenseData });
    }

    onClose();
  };

  const handleSplitChange = (userId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, userId]);
    } else {
      setSplitBetween(splitBetween.filter(id => id !== userId));
    }
  };

  // Auto-include the person who paid in the split
  const handlePaidByChange = (newPaidBy: string) => {
    setPaidBy(newPaidBy);
    if (newPaidBy && !splitBetween.includes(newPaidBy)) {
      setSplitBetween([...splitBetween, newPaidBy]);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Description *</Label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
          />
        </FormGroup>

        <FormGroup>
          <Label>Amount *</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </FormGroup>

        <FormGroup>
          <Label>Paid by *</Label>
          <Select
            value={paidBy}
            onChange={(e) => handlePaidByChange(e.target.value)}
          >
            <option value="">Select who paid</option>
            {state.users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Category *</Label>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setAiSuggestion(null);
            }}
          >
            <option value="">Select a category</option>
            {state.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>
          {isCategorizingAI && (
            <AIIndicator>
              <LoadingSpinner />
              AI is analyzing your expense...
            </AIIndicator>
          )}
          {aiSuggestion && !isCategorizingAI && (
            <AIIndicator>
              🤖 AI suggested category based on your description
            </AIIndicator>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Split between:</Label>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Select who should share this expense. Each person will owe their portion to the person who paid.
            {amount && splitBetween.length > 0 && (
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                {' '}(${(parseFloat(amount) / splitBetween.length).toFixed(2)} per person)
              </span>
            )}
          </div>
          <CheckboxGroup>
            {state.users.map(user => (
              <CheckboxLabel key={user.id}>
                <input
                  type="checkbox"
                  checked={splitBetween.includes(user.id)}
                  onChange={(e) => handleSplitChange(user.id, e.target.checked)}
                />
                {user.name}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FormGroup>

        <div>
          <Button type="submit">
            {expense ? 'Update Expense' : 'Add Expense'}
          </Button>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
        </div>
      </form>
    </FormContainer>
  );
};