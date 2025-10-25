import React, { useState, useMemo } from 'react';
import { Clinic } from '../../types';
import ClinicCard from '../ClinicCard';
import ClinicDetail from '../ClinicDetail';
import SearchBar from '../SearchBar';
import { PawPrint } from 'lucide-react';

interface DirectoryPageProps {
    clinics: Clinic[];
}

const DirectoryPage: React.FC<DirectoryPageProps> = ({ clinics }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    const filteredClinics = useMemo(() => {
        if (!searchTerm) {
            return clinics;
        }
        const term = searchTerm.toLowerCase();
        return clinics.filter((clinic) => {
            const nameMatch = clinic.name.toLowerCase().includes(term);
            const addressMatch = clinic.address.toLowerCase().includes(term);
            const cityMatch = clinic.city.toLowerCase().includes(term);
            const categoryMatch = clinic.categories.some(cat => cat.toLowerCase().includes(term));
            return nameMatch || addressMatch || cityMatch || categoryMatch;
        });
    }, [clinics, searchTerm]);

    const handleClinicSelect = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        window.scrollTo(0, 0);
    };

    const handleBackToList = () => {
        setSelectedClinic(null);
    };

    return (
        <main className="container mx-auto p-4 md:p-8 animate-fade-in">
            {selectedClinic ? (
                <ClinicDetail clinic={selectedClinic} onBack={handleBackToList} />
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Find a Trusted Vet in Dane County</h1>
                        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Search our directory of local veterinary clinics to find the perfect care for your pet.</p>
                    </div>
                    
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClinics.length > 0 ? (
                            filteredClinics.map((clinic, index) => (
                                <ClinicCard
                                    key={`${clinic.name}-${index}`}
                                    clinic={clinic}
                                    onSelect={handleClinicSelect}
                                />
                            ))
                        ) : (
                            <div className="col-span-full mt-8 flex flex-col items-center justify-center text-center p-6 bg-slate-700 border border-slate-600 rounded-lg">
                                <PawPrint className="h-12 w-12 text-slate-500 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-300">No Clinics Found</h2>
                                <p className="text-slate-400 mt-2">Try adjusting your search terms.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default DirectoryPage;