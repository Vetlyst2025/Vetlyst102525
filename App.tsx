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

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClinics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchClinics();
        setClinics(data);
      } catch (err) {
        setError('Failed to fetch clinic data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadClinics();
  }, []);

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
        return <HomePage onNavigate={setPage} clinics={clinics.slice(0, 3)} />;
      case 'directory':
        return <DirectoryPage clinics={clinics} />;
      case 'forClinics':
        return <ForClinicsPage onNavigate={setPage} />;
      default:
        return <HomePage onNavigate={setPage} clinics={clinics.slice(0, 3)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 font-sans text-slate-300 flex flex-col">
      <Header onNavigate={setPage} />
      <div className="flex-grow">{renderPage()}</div>
      <Footer onNavigate={setPage} />
    </div>
  );
};

export default App;