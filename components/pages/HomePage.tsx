import React from 'react';
import { Clinic } from '../../types';
import ClinicCard from '../ClinicCard';
import { Search, Mail, BarChart, CheckCircle, PawPrint, HeartHandshake, Zap } from 'lucide-react';

type Page = 'home' | 'directory' | 'forClinics';

interface HomePageProps {
    onNavigate: (page: Page) => void;
    onSelectClinic: (clinic: Clinic) => void;
    clinics: Clinic[];
    totalClinics: number;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectClinic, clinics, totalClinics }) => {
    return (
        <main className="animate-fade-in">
            {/* Hero Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white">Find a Trusted Vet in Dane County</h1>
                    <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">Quickly search for local veterinary clinics, read details, and request an appointment for your pet.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => onNavigate('directory')} 
                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                        >
                            Find a Vet Near You
                        </button>
                        <button 
                            onClick={() => onNavigate('forClinics')} 
                            className="bg-slate-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-600 transition-colors border border-slate-500 text-lg"
                        >
                            List Your Clinic
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works (for Pet Owners) */}
            <section className="py-16 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Find the Right Care in 3 Easy Steps</h2>
                        <p className="mt-2 text-slate-400">Connecting with a great local vet has never been simpler.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="flex justify-center items-center h-16 w-16 bg-slate-800 text-blue-400 rounded-full mx-auto mb-4 border border-slate-700">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">1. Search & Filter</h3>
                            <p className="text-slate-400">Quickly find clinics in Dane County by location, services, or specialty.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center h-16 w-16 bg-slate-800 text-blue-400 rounded-full mx-auto mb-4 border border-slate-700">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">2. Request an Appointment</h3>
                            <p className="text-slate-400">Submit a request directly from the clinic’s page. No phone tag required.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center h-16 w-16 bg-slate-800 text-blue-400 rounded-full mx-auto mb-4 border border-slate-700">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">3. Get a Confirmation</h3>
                            <p className="text-slate-400">The clinic will contact you directly to confirm your appointment details.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Why Clinics Love Us */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white">Why Clinics Love Madison Vet Finder</h2>
                        <p className="mt-2 text-slate-400">We focus on what matters: growing your practice.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-slate-700 p-8 rounded-lg shadow-lg border border-slate-600">
                           <Zap className="h-10 w-10 text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">Get Pre-Qualified Leads</h3>
                            <p className="text-slate-300">Receive appointment requests directly in your inbox from local pet owners actively seeking care.</p>
                        </div>
                        <div className="bg-slate-700 p-8 rounded-lg shadow-lg border border-slate-600">
                            <HeartHandshake className="h-10 w-10 text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">No Software to Learn</h3>
                            <p className="text-slate-300">No logins, no dashboards, no training. Our platform works with your existing email and phone workflow.</p>
                        </div>
                         <div className="bg-slate-700 p-8 rounded-lg shadow-lg border border-slate-600">
                             <BarChart className="h-10 w-10 text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">Increase Your Visibility</h3>
                            <p className="text-slate-300">Get discovered by new clients in your area and stand out with a complete, verified listing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Clinics */}
             {clinics.length > 0 && (
                 <section className="py-16 bg-slate-900/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white">Featured Vets in Dane County</h2>
                             <button onClick={() => onNavigate('directory')} className="mt-4 text-blue-400 font-semibold hover:underline">
                                View All {totalClinics} Clinics &rarr;
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clinics.map((clinic, index) => (
                                <ClinicCard 
                                    key={`${clinic.name}-${index}`} 
                                    clinic={clinic}
                                    onSelect={onSelectClinic}
                                />
                            ))}
                        </div>
                    </div>
                </section>
             )}
        </main>
    );
};

export default HomePage;