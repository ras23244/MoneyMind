import React from 'react';
import BillsPanel from '../components/dashboard/BillsPanel';
import { useUser } from '../context/UserContext';

export default function Bills() {
    const { user } = useUser();
    return (
        <div className="min-h-screen bg-background text-white">
            <h1 className="text-2xl font-bold mb-8">Bills</h1>
            <BillsPanel userId={user?._id} onNavigate={() => { }} />
        </div>
    );
}