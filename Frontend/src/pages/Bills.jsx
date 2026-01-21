import React from 'react';
import BillsPanel from '../components/dashboard/BillsPanel';
import { useUser } from '../context/UserContext';

export default function Bills() {
    const { user } = useUser();
    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-8">Bills</h1>
            <BillsPanel userId={user?._id} onNavigate={() => { }} />
        </div>
    );
}