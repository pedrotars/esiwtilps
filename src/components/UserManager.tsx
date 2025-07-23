import React, { useState } from 'react';
import styled from 'styled-components';
import { useSupabaseApp } from '../context/SupabaseAppContext';
import { User } from '../types';
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

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const UserCard = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #666;
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #0056b3;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #dc3545;

  &:hover {
    background: #c82333;
  }
`;

const AddUserForm = styled.div`
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

const EditForm = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const UserManager: React.FC = () => {
  const { state, addUser, updateUser, deleteUser } = useSupabaseApp();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const userData: User = {
      id: editingUser?.id || uuidv4(),
      name: formData.name.trim(),
      email: formData.email.trim()
    };

    if (editingUser) {
      await updateUser(userData);
    } else {
      await addUser(userData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '' });
    setShowForm(false);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (state.users.length <= 1) {
      alert('Cannot delete the last user. At least one user is required.');
      return;
    }

    const hasExpenses = state.expenses.some(expense => 
      expense.paidBy === userId || expense.splitBetween.includes(userId)
    );
    
    if (hasExpenses) {
      alert('Cannot delete user who has expenses. Please reassign or delete those expenses first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  };

  return (
    <Container>
      <Title>Manage People</Title>
      
      {editingUser && (
        <EditForm>
          <h4>Editing: {editingUser.name}</h4>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormRow>
            <div>
              <Button type="submit">Update User</Button>
              <CancelButton type="button" onClick={resetForm}>
                Cancel
              </CancelButton>
            </div>
          </form>
        </EditForm>
      )}
      
      <UserGrid>
        {state.users.map(user => (
          <UserCard key={user.id}>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
            <UserActions>
              <ActionButton onClick={() => handleEdit(user)}>
                Edit
              </ActionButton>
              <DeleteButton onClick={() => handleDelete(user.id)}>
                Delete
              </DeleteButton>
            </UserActions>
          </UserCard>
        ))}
      </UserGrid>

      {showForm && !editingUser ? (
        <AddUserForm>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormRow>
            <div>
              <Button type="submit">Add Person</Button>
              <CancelButton type="button" onClick={resetForm}>
                Cancel
              </CancelButton>
            </div>
          </form>
        </AddUserForm>
      ) : !editingUser ? (
        <AddUserForm>
          <p>Add a new person to split expenses with</p>
          <Button onClick={() => setShowForm(true)}>
            + Add Person
          </Button>
        </AddUserForm>
      ) : null}
    </Container>
  );
};