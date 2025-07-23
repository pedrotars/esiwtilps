import React, { useState } from 'react';
import styled from 'styled-components';
import { subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const FilterContainer = styled.div`
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#007bff' : '#dee2e6'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

const CustomFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomInput = styled.input`
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const DateInput = styled.input`
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export type DateFilterType = 'all' | 'last7days' | 'last30days' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'customDays' | 'customRange';

export interface DateFilterValue {
  type: DateFilterType;
  customDays?: number;
  startDate?: Date;
  endDate?: Date;
}

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (filter: DateFilterValue) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ value, onChange }) => {
  const [customDays, setCustomDays] = useState(value.customDays || 7);
  const [startDate, setStartDate] = useState(
    value.startDate ? value.startDate.toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    value.endDate ? value.endDate.toISOString().split('T')[0] : ''
  );

  const handleFilterChange = (type: DateFilterType) => {
    let filterValue: DateFilterValue = { type };

    switch (type) {
      case 'customDays':
        filterValue.customDays = customDays;
        break;
      case 'customRange':
        if (startDate && endDate) {
          filterValue.startDate = new Date(startDate);
          filterValue.endDate = new Date(endDate);
        }
        break;
    }

    onChange(filterValue);
  };

  const handleCustomDaysChange = (days: number) => {
    setCustomDays(days);
    onChange({ type: 'customDays', customDays: days });
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      onChange({
        type: 'customRange',
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }
  };

  return (
    <FilterContainer>
      <FilterLabel>Filter by:</FilterLabel>
      
      <FilterButtonGroup>
        <FilterButton
          active={value.type === 'all'}
          onClick={() => handleFilterChange('all')}
        >
          All Time
        </FilterButton>
        
        <FilterButton
          active={value.type === 'last7days'}
          onClick={() => handleFilterChange('last7days')}
        >
          Last 7 Days
        </FilterButton>
        
        <FilterButton
          active={value.type === 'last30days'}
          onClick={() => handleFilterChange('last30days')}
        >
          Last 30 Days
        </FilterButton>
        
        <FilterButton
          active={value.type === 'thisWeek'}
          onClick={() => handleFilterChange('thisWeek')}
        >
          This Week
        </FilterButton>
        
        <FilterButton
          active={value.type === 'thisMonth'}
          onClick={() => handleFilterChange('thisMonth')}
        >
          This Month
        </FilterButton>
        
        <FilterButton
          active={value.type === 'lastMonth'}
          onClick={() => handleFilterChange('lastMonth')}
        >
          Last Month
        </FilterButton>
      </FilterButtonGroup>

      <CustomFilterGroup>
        <span>Last</span>
        <CustomInput
          type="number"
          min="1"
          max="365"
          value={customDays}
          onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
          onBlur={() => handleCustomDaysChange(customDays)}
        />
        <FilterButton
          active={value.type === 'customDays'}
          onClick={() => handleCustomDaysChange(customDays)}
        >
          Days
        </FilterButton>
      </CustomFilterGroup>

      <CustomFilterGroup>
        <DateInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          onBlur={handleDateRangeChange}
        />
        <span>to</span>
        <DateInput
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          onBlur={handleDateRangeChange}
        />
        <FilterButton
          active={value.type === 'customRange'}
          onClick={handleDateRangeChange}
        >
          Apply Range
        </FilterButton>
      </CustomFilterGroup>
    </FilterContainer>
  );
};

export const filterExpensesByDate = (expenses: any[], filter: DateFilterValue): any[] => {
  if (filter.type === 'all') {
    return expenses;
  }

  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (filter.type) {
    case 'last7days':
      startDate = subDays(now, 7);
      break;
    case 'last30days':
      startDate = subDays(now, 30);
      break;
    case 'thisWeek':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    case 'customDays':
      startDate = subDays(now, filter.customDays || 7);
      break;
    case 'customRange':
      if (filter.startDate && filter.endDate) {
        startDate = filter.startDate;
        endDate = filter.endDate;
      } else {
        return expenses;
      }
      break;
    default:
      return expenses;
  }

  return expenses.filter(expense => 
    isWithinInterval(new Date(expense.date), { start: startDate, end: endDate })
  );
};