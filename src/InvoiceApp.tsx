import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceView from './pages/invoices/InvoiceView';
import ClientManagement from './pages/clients/ClientManagement';
import ProductManagement from './pages/products/ProductManagement';
import DashboardLayout from './components/layouts/DashboardLayout';

function InvoiceApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/invoices" element={<DashboardLayout />}>
                    <Route index element={<InvoiceList />} />
                    <Route path="new" element={<InvoiceForm />} />
                    <Route path=":id" element={<InvoiceView />} />
                    <Route path=":id/edit" element={<InvoiceForm />} />
                </Route>
                <Route path="/clients" element={<DashboardLayout />}>
                    <Route index element={<ClientManagement />} />
                </Route>
                <Route path="/products" element={<DashboardLayout />}>
                    <Route index element={<ProductManagement />} />
                </Route>
                <Route path="/" element={<Navigate to="/invoices" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default InvoiceApp;
