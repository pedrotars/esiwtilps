import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseAppProvider } from './context/SupabaseAppContext';
import { Dashboard } from './pages/Dashboard';
import { CategoryExpenses } from './pages/CategoryExpenses';
import styled, { createGlobalStyle } from 'styled-components';
import './debug';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
    color: #333;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #e9ecef;
  margin-top: 40px;
`;

function App() {
  return (
    <SupabaseAppProvider>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/category/:categoryId" element={<CategoryExpenses />} />
        </Routes>
        <Footer>
          a tars & co product
        </Footer>
      </Router>
    </SupabaseAppProvider>
  );
}

export default App;