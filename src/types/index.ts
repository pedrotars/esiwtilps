export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  paidBy: string;
  splitBetween: string[];
  categoryId: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  expenses: string[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: Date;
  description?: string;
}