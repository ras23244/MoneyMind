import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen overflow-x-hidden flex flex-col font-display bg-[#050505]">

            <div className="relative min-h-screen overflow-x-hidden flex flex-col font-display bg-[#050505]">
        
                {/* Navbar */}
                <nav className="relative z-50 w-full px-6 py-8 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(43,238,108,0.2)] group-hover:scale-110 transition-transform">
                            <span className="font-bold text-background-dark text-xl italic">M</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">MoneyMind</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                        onClick={() => navigate('/login')}
                         className="px-6 py-2.5 text-sm font-bold text-primary hover:text-green-400 rounded-xl hover:bg-primary hover:text-background-dark transition-all duration-300">
                            Login
                        </button>
                        <button onClick={() => navigate('/signup')} className="px-6 py-2.5 text-sm font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-background-dark transition-all duration-300">
                           Sign Up
                        </button>
                    </div>
                </nav>

                {/* Main Hero Section */}
                <main className="flex-grow flex items-center relative z-10 px-6 py-12 md:py-24 max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

                        {/* Left Column: Hero Content */}
                        <div className="space-y-10 text-left order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-2xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2bee6c]"></span>
                                Intelligent Capital Management
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] text-glow">
                                    Master Your Capital.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-400 to-gray-700">
                                        Secure Your Future.
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed font-light">
                                    Experience institutional-grade financial oversight with the simplicity of modern AI.
                                    Our platform provides the precision required by global professionals to navigate complex markets with absolute confidence.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <button 
                                onClick={() => navigate('/login')}
                                className="px-10 py-5 bg-primary text-background-dark font-black text-lg rounded-xl hover:bg-[#1a6332] transition-all transform hover:translate-y-[-4px] active:scale-95 shadow-[0_20px_40px_-10px_rgba(43,238,108,0.3)] flex items-center gap-3 group">
                                    Get Started
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>

                                <button className="px-8 py-5 glass-panel text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all border border-white/10 flex items-center gap-2 active:scale-95 transform hover:translate-y-[-2px]">
                                    Need Help?
                                </button>

                                <button className="px-8 py-5 glass-panel text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all border border-white/10 flex items-center gap-2 active:scale-95 transform hover:translate-y-[-2px]">
                                    Contact Us
                                </button>
                            </div>

                            
                        </div>

                        {/* Right Column: Professional Financial Image */}
                        <div className="relative group perspective-1000 order-1 lg:order-2">
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] transform lg:rotate-2 transition-all duration-1000 group-hover:rotate-0 group-hover:scale-[1.02]">
                                <img
                                    src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200"
                                    alt="Sophisticated Financial Center"
                                    className="w-full aspect-[4/5] lg:aspect-auto object-cover opacity-90 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                                />
                                {/* Refined Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent"></div>

                                {/* Float-in Data Card */}
                                <div className="absolute bottom-8 left-8 right-8 p-6 glass-panel rounded-2xl backdrop-blur-xl border-white/10 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Portfolio Analytics</p>
                                            <p className="text-2xl font-black text-white">Institutional Grade</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-primary">+24.8%</p>
                                            <p className="text-[10px] text-gray-500 font-medium">YTD Performance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            </div>

                    </div>
                </main>


                {/* Footer */}
                <footer className="relative z-50 w-full py-12 border-t border-white/[0.03] bg-black/50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-wrap justify-center gap-8 text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">
                            <a href="#" className="hover:text-primary transition-colors hover:text-green-400 ">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors hover:text-green-400 ">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors hover:text-green-400 ">Compliance</a>
                            <a href="#" className="hover:text-primary transition-colors hover:text-green-400 ">Support</a>
                        </div>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest text-center">
                            © 2026 MoneyMind Institutional Systems. All Rights Reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

            export default LandingPage;
