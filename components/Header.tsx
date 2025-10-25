import React from 'react';
import { PawPrint } from 'lucide-react';

type Page = 'home' | 'directory' | 'forClinics';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="bg-slate-900/70 backdrop-blur-sm shadow-lg sticky top-0 z-20 border-b border-slate-700">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <button onClick={() => onNavigate('home')} className="flex items-center gap-3" aria-label="Go to homepage">
                    <PawPrint className="text-blue-400 h-8 w-8 md:h-10 md:w-10" />
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-white">Madison Vet Finder</h1>
                        <p className="text-sm md:text-base text-slate-400 hidden md:block">Find trusted local vets - Fast</p>
                    </div>
                </button>
                <nav className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => onNavigate('directory')} className="text-base font-medium text-slate-300 hover:text-blue-400 transition-colors">Find a Vet</button>
                    <button onClick={() => onNavigate('forClinics')} className="text-base font-medium text-slate-300 hover:text-blue-400 transition-colors">For Clinics</button>
                    <button 
                        onClick={() => onNavigate('forClinics')} 
                        className="hidden sm:inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        List Your Clinic
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;