import React from "react";
import { DollarSign } from "lucide-react";
import { useUser } from '../context/UserContext';

export default function Sidebar({ navigation, activeTab, setActiveTab, creditScore }) {
    const { user } = useUser();
    

    return (
        <aside className="w-64 bg-card-dark border-r border-white/10 p-6 flex flex-col h-screen sticky top-0">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-white text-xl font-bold">FinanceTracker</h1>
                    <p className="text-white/60 text-sm">Personal Finance</p>
                </div>
            </div>

            <nav className="space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-auto">
                <div className="flex items-center gap-3 mb-3">
                  
                    <img
                        src={user?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQdztTDcpZ2pFqwWDYwSXbvZq5nzJYg5cn8w&s"} // fallback if user.image is missing
                        alt={`${user?.name?.firstname} ${user?.name?.lastname}`}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />

                    <div>
                        <p className="text-white text-sm font-medium">
                            {user?.fullname?.firstname} {user?.fullname?.lastname}
                        </p>
                        <p className="text-green-400 text-xs">Excellent</p>
                    </div>
                </div>
            </div>

        </aside>
    );
}
