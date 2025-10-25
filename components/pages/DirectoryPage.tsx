import React, { useState, useMemo } from 'react';
import { Clinic } from '../../types';
import ClinicCard from '../ClinicCard';
import ClinicDetail from '../ClinicDetail';
import SearchBar from '../SearchBar';
import { PawPrint, AlertTriangle } from 'lucide-react';

interface DirectoryPageProps {
    clinics: Clinic[];
    selectedClinic: Clinic | null;
    onSelectClinic: (clinic: Clinic) => void;
    onClearSelection: () => void;
}

const DirectoryPage: React.FC<DirectoryPageProps> = ({ clinics, selectedClinic, onSelectClinic, onClearSelection }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [emergencyFilterActive, setEmergencyFilterActive] = useState(false);

    const filteredClinics = useMemo(() => {
        let results = clinics;

        if (emergencyFilterActive) {
            results = results.filter(clinic => 
                (clinic.categories || []).some(cat => 
                    ['urgent care', 'emergency', '24-hour'].includes(cat.toLowerCase())
                )
            );
        }

        if (searchTerm) {
            // Clean the search term to be more forgiving for location-based searches like "Middleton, WI"
            const term = searchTerm
                .toLowerCase()
                .replace(/,?\s+wi(?:sconsin)?$/, '')
                .trim();

            if (term) { // Proceed with filtering only if the term is not empty after cleaning
                results = results.filter((clinic) => {
                    const nameMatch = clinic.name.toLowerCase().includes(term);
                    const addressMatch = clinic.address.toLowerCase().includes(term);
                    const cityMatch = clinic.city.toLowerCase().includes(term);
                    const categoryMatch = clinic.categories.some(cat => cat.toLowerCase().includes(term));
                    return nameMatch || addressMatch || cityMatch || categoryMatch;
                });
            }
        }
        
        return results;
    }, [clinics, searchTerm, emergencyFilterActive]);

    return (
        <main className="container mx-auto p-4 md:p-8 animate-fade-in">
            {selectedClinic ? (
                <ClinicDetail clinic={selectedClinic} onBack={onClearSelection} />
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Find a Trusted Vet in Dane County</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Search our directory of local veterinary clinics to find the perfect care for your pet.</p>
                    </div>
                    
                    <div className="sticky top-[76px] bg-slate-800/80 backdrop-blur-lg z-10 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-700/50"> 
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setEmergencyFilterActive(!emergencyFilterActive)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                                    emergencyFilterActive
                                        ? 'bg-red-900/50 text-red-200 border-red-600 scale-105 shadow-md shadow-red-900/50'
                                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                                }`}
                                aria-pressed={emergencyFilterActive}
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Emergency Clinics
                            </button>
                        </div>
                    </div>


                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClinics.length > 0 ? (
                            filteredClinics.map((clinic, index) => (
                                <ClinicCard
                                    key={`${clinic.name}-${index}`}
                                    clinic={clinic}
                                    onSelect={onSelectClinic}
                                />
                            ))
                        ) : (
                            <div className="col-span-full mt-8 flex flex-col items-center justify-center text-center p-6 bg-slate-700 border border-slate-600 rounded-lg">
                                <PawPrint className="h-12 w-12 text-slate-500 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-300">No Clinics Found</h2>
                                <p className="text-slate-400 mt-2">Try adjusting your search terms or filter.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default DirectoryPage;