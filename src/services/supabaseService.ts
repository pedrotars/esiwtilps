import { supabase, DatabaseUser, DatabaseCategory, DatabaseExpense, DatabasePayment } from '../lib/supabase';
import { User, Category, Expense, Payment } from '../types';

// Utility functions to convert between database and app types
const dbUserToUser = (dbUser: DatabaseUser): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email
});

const dbCategoryToCategory = (dbCategory: DatabaseCategory): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  color: dbCategory.color,
  icon: dbCategory.icon || ''
});

const dbExpenseToExpense = (dbExpense: DatabaseExpense): Expense => ({
  id: dbExpense.id,
  description: dbExpense.description,
  amount: dbExpense.amount,
  date: new Date(dbExpense.date),
  paidBy: dbExpense.paid_by,
  categoryId: dbExpense.category_id,
  splitBetween: dbExpense.split_between
});

const dbPaymentToPayment = (dbPayment: DatabasePayment): Payment => ({
  id: dbPayment.id,
  from: dbPayment.from_user,
  to: dbPayment.to_user,
  amount: dbPayment.amount,
  date: new Date(dbPayment.date),
  description: dbPayment.description || undefined
});

// Users Service
export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(dbUserToUser);
  },

  async create(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email
      })
      .select()
      .single();
    if (error) throw error;
    return dbUserToUser(data);
  },

  async update(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return dbUserToUser(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }
};

// Categories Service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data.map(dbCategoryToCategory);
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        color: category.color,
        icon: category.icon
      })
      .select()
      .single();
    if (error) throw error;
    return dbCategoryToCategory(data);
  },

  async update(category: Category): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        color: category.color,
        icon: category.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', category.id)
      .select()
      .single();
    if (error) throw error;
    return dbCategoryToCategory(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
};

// Expenses Service
export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase.from('expenses').select('*');
    if (error) throw error;
    return data.map(dbExpenseToExpense);
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString(),
        paid_by: expense.paidBy,
        category_id: expense.categoryId,
        split_between: expense.splitBetween
      })
      .select()
      .single();
    if (error) throw error;
    return dbExpenseToExpense(data);
  },

  async update(expense: Expense): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString(),
        paid_by: expense.paidBy,
        category_id: expense.categoryId,
        split_between: expense.splitBetween,
        updated_at: new Date().toISOString()
      })
      .eq('id', expense.id)
      .select()
      .single();
    if (error) throw error;
    return dbExpenseToExpense(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }
};

// Payments Service
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) throw error;
    return data.map(dbPaymentToPayment);
  },

  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        from_user: payment.from,
        to_user: payment.to,
        amount: payment.amount,
        date: payment.date.toISOString(),
        description: payment.description
      })
      .select()
      .single();
    if (error) throw error;
    return dbPaymentToPayment(data);
  }
};