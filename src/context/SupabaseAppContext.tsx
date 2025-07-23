import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Expense, Category, Group, Payment } from '../types';
import { usersService, categoriesService, expensesService, paymentsService } from '../services/supabaseService';

interface AppState {
  users: User[];
  expenses: Expense[];
  categories: Category[];
  groups: Group[];
  payments: Payment[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { users: User[]; categories: Category[]; expenses: Expense[]; payments: Payment[] } }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment };

const initialState: AppState = {
  users: [],
  expenses: [],
  categories: [],
  groups: [],
  payments: [],
  currentUser: null,
  loading: true,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOAD_DATA':
      return {
        ...state,
        users: action.payload.users,
        categories: action.payload.categories,
        expenses: action.payload.expenses,
        payments: action.payload.payments,
        currentUser: action.payload.users[0] || null,
        loading: false,
        error: null
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Async actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const SupabaseAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [users, categories, expenses, payments] = await Promise.all([
          usersService.getAll(),
          categoriesService.getAll(),
          expensesService.getAll(),
          paymentsService.getAll()
        ]);

        dispatch({
          type: 'LOAD_DATA',
          payload: { users, categories, expenses, payments }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      }
    };

    loadData();
  }, []);

  // Async actions
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await expensesService.create(expense);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    } catch (error) {
      console.error('Error adding expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      const updatedExpense = await expensesService.update(expense);
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    } catch (error) {
      console.error('Error updating expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expensesService.delete(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      console.error('Error deleting expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await categoriesService.create(category);
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    } catch (error) {
      console.error('Error adding category:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add category' });
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const updatedCategory = await categoriesService.update(category);
      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
    } catch (error) {
      console.error('Error updating category:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update category' });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesService.delete(id);
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    } catch (error) {
      console.error('Error deleting category:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete category' });
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const newUser = await usersService.create(user);
      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (error) {
      console.error('Error adding user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add user' });
    }
  };

  const updateUser = async (user: User) => {
    try {
      const updatedUser = await usersService.update(user);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update user' });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.delete(id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      console.error('Error deleting user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete user' });
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const newPayment = await paymentsService.create(payment);
      dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
    } catch (error) {
      console.error('Error adding payment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment' });
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      addExpense,
      updateExpense,
      deleteExpense,
      addCategory,
      updateCategory,
      deleteCategory,
      addUser,
      updateUser,
      deleteUser,
      addPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useSupabaseApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useSupabaseApp must be used within a SupabaseAppProvider');
  }
  return context;
};