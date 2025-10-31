import React, { useState, useMemo } from 'react';
import { Clinic } from '../../types';
import ClinicCard from '../ClinicCard';
import ClinicDetail from '../ClinicDetail';
import SearchBar from '../SearchBar';
import { PawPrint, AlertTriangle, Info, ArrowDownAZ, Star } from 'lucide-react';

interface DirectoryPageProps {
    clinics: Clinic[];
    selectedClinic: Clinic | null;
    onSelectClinic: (clinic: Clinic) => void;
    onClearSelection: () => void;
    dataSource: 'supabase' | 'local' | null;
}

const DirectoryPage: React.FC<DirectoryPageProps> = ({ clinics, selectedClinic, onSelectClinic, onClearSelection, dataSource }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [emergencyFilterActive, setEmergencyFilterActive] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'rating'>('name');

    const filteredAndSortedClinics = useMemo(() => {
        let results = clinics;

        if (emergencyFilterActive) {
            results = results.filter(clinic => 
                (clinic.categories || []).some(cat => {
                    const lowerCat = cat.toLowerCase();
                    // Use includes() for more robust matching against data variations
                    // like "Emergency Services", "Urgent", "24 hour", etc.
                    return lowerCat.includes('urgent') || lowerCat.includes('emergency') || (lowerCat.includes('24') && lowerCat.includes('hour'));
                })
            );
        }

        if (searchTerm) {
            const term = searchTerm
                .toLowerCase()
                .replace(/,?\s+wi(?:sconsin)?$/, '')
                .trim();

            if (term) {
                results = results.filter((clinic) => {
                    const nameMatch = clinic.name?.toLowerCase().includes(term);
                    const addressMatch = clinic.address?.toLowerCase().includes(term);
                    const cityMatch = clinic.city?.toLowerCase().includes(term);
                    const categoryMatch = (clinic.categories || []).some(cat => cat.toLowerCase().includes(term));
                    return nameMatch || addressMatch || cityMatch || categoryMatch;
                });
            }
        }
        
        // Create a shallow copy before sorting to avoid side effects
        const sortedResults = [...results];

        sortedResults.sort((a, b) => {
            if (sortBy === 'rating') {
                // Use -1 to push clinics without a rating to the bottom
                const ratingA = a.googleRating ?? -1;
                const ratingB = b.googleRating ?? -1;
                if (ratingB !== ratingA) {
                    return ratingB - ratingA; // Higher rating first
                }
            }
            // Default sort by name, or as a fallback for equal ratings
            return a.name.localeCompare(b.name);
        });

        return sortedResults;
    }, [clinics, searchTerm, emergencyFilterActive, sortBy]);
    
    // --- NEW: Enhanced feedback logic ---
    if (clinics.length === 0) {
        let title = "Could Not Load Clinic Data";
        let message = "We were unable to fetch any clinic information. This might be a temporary issue. Please try refreshing the page.";
        let details = null;

        if (dataSource === 'supabase') {
            title = "No Valid Clinic Data Found in Database";
            message = "We connected to your Supabase database but didn't find any valid clinics to display.";
            details = (
                <p className="text-sm text-slate-400 mt-4 max-w-xl">
                    Please ensure your <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">clinics_madison_wi</code> table is not empty and that every row has a non-empty value in the 'name' column. Also, verify that your RLS policy allows public read access.
                </p>
            );
        } else if (dataSource === 'local') {
            title = "Database Connection Failed";
            message = "We couldn't connect to your Supabase database, and the local backup data could not be loaded either.";
            details = (
                <p className="text-sm text-slate-400 mt-4 max-w-xl">
                    Please check your Supabase credentials and RLS policies. Also, check the browser's developer console for any errors related to fetching the backup data file.
                </p>
            );
        }

        return (
            <main className="container mx-auto p-4 md:p-8 animate-fade-in">
                <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-slate-700 border border-slate-600 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
                    <p className="text-slate-300 mt-2">{message}</p>
                    {details}
                </div>
            </main>
        );
    }
    // --- End of new logic ---


    return (
        <main className="container mx-auto p-4 md:p-8 animate-fade-in">
            {selectedClinic ? (
                <ClinicDetail clinic={selectedClinic} onBack={onClearSelection} />
            ) : (
                <>
                    {dataSource === 'local' && (
                        <div className="mb-8 p-4 bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-200 rounded-r-lg flex gap-4 items-start">
                            <Info className="h-6 w-6 flex-shrink-0 mt-1 text-yellow-400" />
                            <div>
                                <h3 className="font-bold">Displaying Sample Data</h3>
                                <p className="text-sm text-yellow-300">
                                    We couldn't connect to your Supabase database, so we've loaded a sample set of clinics. Please check your Supabase credentials, table name, and RLS policies to see your live data.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Find a Trusted Vet in Dane County</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Search our directory of local veterinary clinics to find the perfect care for your pet.</p>
                    </div>
                    
                    <div className="sticky top-[76px] bg-slate-800/80 backdrop-blur-lg z-10 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-700/50"> 
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
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
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-400">Sort by:</span>
                                <div className="flex items-center gap-1 rounded-full bg-slate-700 border-2 border-slate-600 p-1">
                                    <button
                                        onClick={() => setSortBy('name')}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                                            sortBy === 'name' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                                        }`}
                                        aria-pressed={sortBy === 'name'}
                                        aria-label="Sort by name alphabetically"
                                    >
                                        <ArrowDownAZ className="h-4 w-4" />
                                        Name
                                    </button>
                                    <button
                                        onClick={() => setSortBy('rating')}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                                            sortBy === 'rating' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                                        }`}
                                        aria-pressed={sortBy === 'rating'}
                                        aria-label="Sort by Google rating, highest first"
                                    >
                                        <Star className="h-4 w-4" />
                                        Rating
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedClinics.length > 0 ? (
                            filteredAndSortedClinics.map((clinic, index) => (
                                <ClinicCard
                                    key={`${clinic.name}-${index}`}
                                    clinic={clinic}
                                    onSelect={onSelectClinic}
                                />
                            ))
                        ) : (
                            <div className="col-span-full mt-8 flex flex-col items-center justify-center text-center p-6 bg-slate-700 border border-slate-600 rounded-lg">
                                <PawPrint className="h-12 w-12 text-slate-500 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-300">No Clinics Match Your Search</h2>
                                <p className="text-slate-400 mt-2">Try adjusting your search terms or removing the 'Emergency' filter.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default DirectoryPage;