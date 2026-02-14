import React from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export default function DashboardPage() {
    return (
        <DashboardProvider>
            <DashboardLayout />
        </DashboardProvider>
    );
}
