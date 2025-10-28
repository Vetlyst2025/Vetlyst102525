import React, { useState, useEffect } from 'react';
import { Clinic } from './types';
import { fetchClinics } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import DirectoryPage from './components/pages/DirectoryPage';
import ForClinicsPage from './components/pages/ForClinicsPage';
import LoadingSpinner from './components/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

type Page = 'home' | 'directory' | 'forClinics';
type DataSource = 'supabase' | 'local' | null;

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(null);

  useEffect(() => {
    const loadClinics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { clinics: data, source } = await fetchClinics();
        setClinics(data);
        setDataSource(source);
      } catch (err) {
        setError('Failed to fetch clinic data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadClinics();
  }, []);
  
  const handleNavigate = (page: Page) => {
    // Clear any active clinic selection when navigating to a main page
    if (page === 'directory' || page === 'home' || page === 'forClinics') {
      setSelectedClinic(null);
    }
    setPage(page);
    window.scrollTo(0, 0);
  };

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setPage('directory'); // Navigate to directory page to show the detail view
    window.scrollTo(0, 0);
  };


  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex-grow">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
       return (
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="mt-8 flex flex-col items-center justify-center text-center p-6 bg-red-900/50 border border-red-700 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-red-200">An Error Occurred</h2>
                <p className="text-red-300 mt-2">{error}</p>
            </div>
        </main>
       )
    }

    switch (page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onSelectClinic={handleSelectClinic} clinics={clinics.slice(0, 3)} totalClinics={clinics.length} />;
      case 'directory':
        return <DirectoryPage clinics={clinics} selectedClinic={selectedClinic} onSelectClinic={handleSelectClinic} onClearSelection={() => setSelectedClinic(null)} dataSource={dataSource} />;
      case 'forClinics':
        return <ForClinicsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} onSelectClinic={handleSelectClinic} clinics={clinics.slice(0, 3)} totalClinics={clinics.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 font-sans text-slate-300 flex flex-col">
      <Header onNavigate={handleNavigate} />
      <div className="flex-grow">{renderPage()}</div>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;