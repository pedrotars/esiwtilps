import React, { useState } from 'react';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
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

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const CategoryCard = styled.div<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryIcon = styled.span`
  font-size: 20px;
`;

const CategoryName = styled.span`
  font-weight: 500;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const AddCategoryForm = styled.div`
  border: 2px dashed #ddd;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ColorInput = styled.input`
  width: 60px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
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

const CancelButton = styled(Button)`
  background: #6c757d;
  margin-left: 12px;

  &:hover {
    background: #545b62;
  }
`;

export const CategoryManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff',
    icon: '📂'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const categoryData: Category = {
      id: editingCategory?.id || uuidv4(),
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon
    };

    if (editingCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: categoryData });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#007bff', icon: '📂' });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || '📂'
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (categoryId: string) => {
    const hasExpenses = state.expenses.some(expense => expense.categoryId === categoryId);
    
    if (hasExpenses) {
      alert('Cannot delete category that has expenses. Please reassign or delete those expenses first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    }
  };

  return (
    <Container>
      <Title>Manage Categories</Title>
      
      <CategoryGrid>
        {state.categories.map(category => (
          <CategoryCard key={category.id} color={category.color}>
            <CategoryInfo>
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryName>{category.name}</CategoryName>
            </CategoryInfo>
            <CategoryActions>
              <ActionButton onClick={() => handleEdit(category)}>
                Edit
              </ActionButton>
              <ActionButton onClick={() => handleDelete(category.id)}>
                Delete
              </ActionButton>
            </CategoryActions>
          </CategoryCard>
        ))}
      </CategoryGrid>

      {showForm ? (
        <AddCategoryForm>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                type="text"
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Icon (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
              />
              <ColorInput
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </FormRow>
            <div>
              <Button type="submit">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
              <CancelButton type="button" onClick={resetForm}>
                Cancel
              </CancelButton>
            </div>
          </form>
        </AddCategoryForm>
      ) : (
        <AddCategoryForm>
          <p>Add a new spending category</p>
          <Button onClick={() => setShowForm(true)}>
            + Add Category
          </Button>
        </AddCategoryForm>
      )}
    </Container>
  );
};