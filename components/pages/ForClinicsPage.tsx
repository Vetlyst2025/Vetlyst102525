import React from 'react';
import { Mail, BarChart, Zap, Check } from 'lucide-react';

type Page = 'home' | 'directory' | 'forClinics';

interface ForClinicsPageProps {
    onNavigate: (page: Page) => void;
}

const ForClinicsPage: React.FC<ForClinicsPageProps> = ({ onNavigate }) => {
    return (
        <main className="animate-fade-in">
            {/* Hero Section */}
            <section className="bg-slate-900 py-20 md:py-28">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">Get More Clients.</h1>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-400">Without Changing How You Work.</h1>
                    <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">Madison Vet Finder sends new appointment requests from local pet owners directly to your inbox. No new software. No logins. No hassle.</p>
                    <div className="mt-8">
                        <button 
                            onClick={() => { /* Placeholder for claim listing flow */ }} 
                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            Claim Your Free Listing
                        </button>
                    </div>
                </div>
            </section>
            
            {/* 3-Step Process */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">How It Works</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
                        <div className="p-6">
                             <div className="flex justify-center items-center h-16 w-16 bg-slate-700 text-slate-300 rounded-full mx-auto mb-4 border border-slate-600">
                                <Zap className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">1. List Your Clinic</h3>
                            <p className="text-slate-400">Claim your free, auto-generated listing or create a new one. We'll verify your details to ensure accuracy.</p>
                        </div>
                         <div className="p-6">
                             <div className="flex justify-center items-center h-16 w-16 bg-slate-700 text-slate-300 rounded-full mx-auto mb-4 border border-slate-600">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">2. Receive Leads by Email</h3>
                            <p className="text-slate-400">When a pet owner requests an appointment, we send you their contact info and needs instantly via email.</p>
                        </div>
                        <div className="p-6">
                           <div className="flex justify-center items-center h-16 w-16 bg-slate-700 text-slate-300 rounded-full mx-auto mb-4 border border-slate-600">
                                <BarChart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">3. Book and Track ROI</h3>
                            <p className="text-slate-400">You contact the client directly to book the appointment. It's that simple. We provide basic reporting on leads sent.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Pricing Tiers */}
            <section className="py-16 bg-slate-900/50">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h2>
                        <p className="mt-2 text-slate-400">Start for free. Upgrade when you're ready.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-slate-800 p-8 rounded-lg shadow-lg border-2 border-blue-500 flex flex-col">
                            <h3 className="text-2xl font-bold text-white">Free Listing</h3>
                            <p className="text-slate-400 mt-2">Everything you need to get discovered.</p>
                            <p className="text-4xl font-extrabold text-white mt-6">Free</p>
                            <p className="text-slate-400">Forever</p>
                            <ul className="space-y-4 mt-8 text-slate-300 flex-grow">
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-green-400 flex-shrink-0" /> Business name, address, phone</li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-green-400 flex-shrink-0" /> Appear in search results</li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-green-400 flex-shrink-0" /> Receive appointment requests</li>
                            </ul>
                            <button className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Get Started for Free</button>
                        </div>
                        <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700 flex flex-col">
                            <h3 className="text-2xl font-bold text-white">Premium</h3>
                             <p className="text-slate-400 mt-2">Get featured and stand out from the crowd.</p>
                            <p className="text-4xl font-extrabold text-white mt-6">Coming Soon</p>
                            <p className="text-slate-400">&nbsp;</p>
                             <ul className="space-y-4 mt-8 text-slate-300 flex-grow">
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-green-400 flex-shrink-0" /> <span className="font-semibold text-slate-200">Everything in Free, plus:</span></li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0" /> Featured placement at the top of search</li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0" /> Enhanced profile with photo gallery</li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0" /> Direct website link</li>
                                <li className="flex items-start"><Check className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0" /> Monthly performance report</li>
                            </ul>
                            <button className="w-full mt-8 bg-slate-700 text-slate-400 font-bold py-3 px-6 rounded-lg cursor-not-allowed">Join Waitlist</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ForClinicsPage;