import React from 'react';

type Page = 'home' | 'directory' | 'forClinics';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="bg-slate-800 text-slate-300">
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-bold text-white">Madison Vet Finder</h3>
                        <p className="text-slate-400">Connecting pets with trusted local vets.</p>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">About</button>
                        <button onClick={() => onNavigate('forClinics')} className="hover:text-white transition-colors">Contact</button>
                        <button onClick={() => onNavigate('forClinics')} className="hover:text-white transition-colors">Claim Listing</button>
                        <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Privacy Policy</button>
                    </div>
                </div>
                <div className="text-center text-slate-500 text-sm mt-8 border-t border-slate-700 pt-6">
                    <p>&copy; {new Date().getFullYear()} Madison Vet Finder. All rights reserved. Data curated by the Gemini API.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
