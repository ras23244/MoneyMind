import React from 'react';
import Accounts from '../../components/Accounts';
import { connectedBanks } from '@/data/financeData';

export default function AccountsPage() {
    return <Accounts connectedBanks={connectedBanks} />;
}
