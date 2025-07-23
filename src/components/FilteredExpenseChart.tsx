import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import { useSupabaseApp } from '../context/SupabaseAppContext';
import { useNavigate } from 'react-router-dom';
import { Expense } from '../types';

const ChartContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const ChartTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
`;

const ChartWrapper = styled.div`
  height: 400px;
  width: 100%;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 60px 20px;
  font-size: 18px;
`;

interface ChartData {
  name: string;
  value: number;
  color: string;
  categoryId: string;
  icon?: string;
}

interface FilteredExpenseChartProps {
  expenses: Expense[];
  title?: string;
}

export const FilteredExpenseChart: React.FC<FilteredExpenseChartProps> = ({ 
  expenses, 
  title = "Expense Breakdown" 
}) => {
  const { state } = useSupabaseApp();
  const navigate = useNavigate();

  const chartData: ChartData[] = state.categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color,
      categoryId: category.id,
      icon: category.icon
    };
  }).filter(item => item.value > 0);

  const handlePieClick = (data: ChartData) => {
    navigate(`/category/${data.categoryId}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {data.icon} {data.name}
          </p>
          <p style={{ margin: '4px 0 0 0', color: data.color }}>
            ${data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '50%'
              }}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {entry.payload.icon} {entry.value} (${entry.payload.value.toFixed(2)})
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>{title}</ChartTitle>
        <NoDataMessage>
          No expenses to display for the selected time period.
        </NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
};