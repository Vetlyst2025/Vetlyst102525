import React, { useState, useEffect } from 'react';
import { Clinic } from '../types';
import { Hospital, MapPin, Phone, ChevronLeft, ExternalLink, Clock, Star, Send } from 'lucide-react';

interface ClinicDetailProps {
  clinic: Clinic;
  onBack: () => void;
}

const CategoryBubble: React.FC<{ category: string }> = ({ category }) => {
    const categoryStyles: { [key: string]: string } = {
        'Emergency': 'bg-red-900/50 text-red-300 border-red-700/50',
        'Urgent Care': 'bg-orange-900/50 text-orange-300 border-orange-700/50',
        '24-Hour': 'bg-blue-900/50 text-blue-300 border-blue-700/50',
        'General Practice': 'bg-slate-600/50 text-slate-300 border-slate-500/50',
    };
    const style = categoryStyles[category] || categoryStyles['General Practice'];
    return (
        <span className={`text-sm font-semibold mr-2 px-3 py-1 rounded-full border ${style}`}>
            {category}
        </span>
    );
};

const ClinicDetail: React.FC<ClinicDetailProps> = ({ clinic, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setImageError(false);
    setFormSubmitted(false);
  }, [clinic]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log("Appointment Request Submitted (MVP):", data);
    setFormSubmitted(true);
  };

  const isEmergency = (clinic.categories || []).some(cat =>
    ['urgent care', 'emergency', '24-hour'].includes(cat.toLowerCase())
  );

  const fullAddress = `${clinic.address}, ${clinic.city}, WI`;
  const fallbackMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const mapsUrl = clinic.googleMapsUrl || fallbackMapsUrl;
  const isValidWebsiteUrl = clinic.websiteUrl && (clinic.websiteUrl.startsWith('http://') || clinic.websiteUrl.startsWith('https://'));


  return (
    <div className="bg-slate-700 rounded-lg shadow-2xl max-w-4xl mx-auto overflow-hidden animate-fade-in border border-slate-600">
        <div className="p-4">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold mb-4 transition-colors"
                aria-label="Back to clinic list"
            >
                <ChevronLeft className="h-5 w-5" />
                Back to List
            </button>
        </div>

        <div className="h-64 bg-slate-600 flex items-center justify-center">
            {clinic.photoUrl && !imageError ? (
                <img 
                    src={clinic.photoUrl} 
                    alt={clinic.name} 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            ) : (
                <Hospital className="h-16 w-16 text-slate-500" />
            )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{clinic.name}</h1>
                <div className="flex flex-wrap items-center mt-3">
                    {(clinic.categories || []).map(cat => <CategoryBubble key={cat} category={cat} />)}
                </div>
            
                {clinic.googleRating && clinic.googleReviewCount && clinic.googleMapsUrl && (
                    <div className="mt-4">
                        <a
                            href={clinic.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 group"
                            aria-label={`View ${clinic.googleReviewCount} Google reviews for ${clinic.name}`}
                        >
                            <Star className="h-5 w-5 text-amber-400 fill-current" />
                            <span className="font-bold text-lg group-hover:underline">{clinic.googleRating.toFixed(1)}</span>
                            <span className="text-slate-400 group-hover:underline">({clinic.googleReviewCount} reviews on Google)</span>
                        </a>
                    </div>
                )}

                <div className="space-y-4 text-base text-slate-300 border-t border-slate-600 pt-6 mt-6">
                    <div className="flex items-start">
                        <MapPin className="h-6 w-6 mr-4 mt-1 flex-shrink-0 text-slate-400" />
                        <p>{fullAddress}</p>
                    </div>
                    <div className="flex items-center">
                        <Phone className="h-6 w-6 mr-4 flex-shrink-0 text-slate-400" />
                        <a href={`tel:${clinic.phone}`} className="hover:text-blue-400 hover:underline">{clinic.phone}</a>
                    </div>
                    {clinic.hours && (
                        <div className="flex items-start">
                            <Clock className="h-6 w-6 mr-4 mt-1 flex-shrink-0 text-slate-400" />
                            <p className="whitespace-pre-wrap">{clinic.hours}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-slate-600 pt-6 flex flex-col sm:flex-row gap-4">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <ExternalLink className="h-5 w-5" />
                        View on Map
                    </a>
                    {isValidWebsiteUrl && (
                        <a href={clinic.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600">
                            <ExternalLink className="h-5 w-5" />
                            Visit Website
                        </a>
                    )}
                </div>
            </div>

            {isEmergency ? (
                <div className="lg:col-span-2 bg-red-900/20 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-red-800/50 flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-3">
                        <Phone className="h-6 w-6 flex-shrink-0" />
                        Emergency / Urgent Care
                    </h2>
                    <p className="text-red-300 mb-6">
                        For urgent matters, please call the clinic directly. Online appointment requests are not monitored for emergencies.
                    </p>
                    <a 
                        href={`tel:${clinic.phone}`}
                        className="w-full flex items-center justify-center gap-3 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
                    >
                        <Phone className="h-5 w-5" />
                        Call Now: {clinic.phone}
                    </a>
                </div>
            ) : (
                <div className="lg:col-span-2 bg-slate-800 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-slate-600">
                    <h2 className="text-xl font-bold text-white mb-4">Request an Appointment</h2>
                    {formSubmitted ? (
                        <div className="bg-green-900/50 border-l-4 border-green-500 text-green-200 p-4 rounded-md" role="alert">
                            <p className="font-bold">Request Sent!</p>
                            <p>The clinic will contact you shortly to confirm your appointment. This is an MVP, so no email was actually sent.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="ownerName" className="block text-sm font-medium text-slate-300">Your Name</label>
                                <input type="text" name="ownerName" id="ownerName" required className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-500 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300">Your Email</label>
                                <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-500 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Your Phone</label>
                                <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-500 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="service" className="block text-sm font-medium text-slate-300">Service Needed</label>
                                <textarea name="service" id="service" rows={3} required placeholder="e.g., Annual check-up for my dog, Fluffy." className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-500 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400"></textarea>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <Send className="h-5 w-5" />
                                Submit Request
                            </button>
                            <p className="text-xs text-slate-400 text-center">A team member will contact you to confirm your appointment time.</p>
                        </form>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ClinicDetail;