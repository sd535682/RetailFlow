import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './contexts/InventoryContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { Transactions } from './pages/Transactions';

function App() {
  return (
    <ErrorBoundary>
      <InventoryProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/transactions" element={<Transactions />} />
            </Routes>
          </Layout>
        </Router>
      </InventoryProvider>
    </ErrorBoundary>
  );
}

export default App;