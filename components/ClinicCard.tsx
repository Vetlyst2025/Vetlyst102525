import React, { useState, useEffect } from 'react';
import { Clinic } from '../types';
import { Hospital, MapPin, Phone, Clock, ExternalLink, Star, ChevronRight } from 'lucide-react';

interface ClinicCardProps {
  clinic: Clinic;
  onSelect: (clinic: Clinic) => void;
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
        <span className={`text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded-full border ${style}`}>
            {category}
        </span>
    );
};


const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [clinic.photoUrl]);

  const isEmergency = (clinic.categories || []).some(cat =>
    ['urgent care', 'emergency', '24-hour'].includes(cat.toLowerCase())
  );

  const sortedCategories = [...(clinic.categories || [])].sort((a, b) => {
    if (a === 'Emergency') return -1;
    if (b === 'Emergency') return 1;
    if (a === 'Urgent Care') return -1;
    if (b === 'Urgent Care') return 1;
    if (a === '24-Hour') return -1;
    if (b === '24-Hour') return 1;
    return 0;
  });

  return (
    <div
      className="bg-slate-700 rounded-lg shadow-lg hover:bg-slate-600 transition-all duration-300 flex flex-col border border-slate-600 cursor-pointer overflow-hidden group"
      onClick={() => onSelect(clinic)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(clinic)}
      aria-label={`View details for ${clinic.name}`}
    >
      <div className="h-40 bg-slate-600 flex items-center justify-center overflow-hidden">
        {clinic.photoUrl && !imageError ? (
          <img 
            src={clinic.photoUrl} 
            alt={clinic.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={() => setImageError(true)}
          />
        ) : (
          <Hospital className="h-12 w-12 text-slate-500" />
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{clinic.name}</h2>
        <div className="flex flex-wrap items-center mb-4">
            {sortedCategories.map(cat => <CategoryBubble key={cat} category={cat} />)}
        </div>
        <div className="space-y-3 text-slate-300 flex-grow">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-slate-400" />
            <span>{`${clinic.address}, ${clinic.city}, WI`}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400" />
            <a 
              href={`tel:${clinic.phone}`} 
              className="hover:text-blue-400 hover:underline"
              aria-label={`Call ${clinic.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              {clinic.phone}
            </a>
          </div>
          {clinic.googleRating && clinic.googleReviewCount ? (
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-3 flex-shrink-0 text-slate-400" />
              <a
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 group/link"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${clinic.googleReviewCount} Google reviews for ${clinic.name}`}
              >
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <span className="font-semibold group-hover/link:underline">{clinic.googleRating.toFixed(1)}</span>
                <span className="text-slate-400 group-hover/link:underline">({clinic.googleReviewCount} reviews)</span>
              </a>
            </div>
          ) : null }
        </div>
        <div className="mt-5 pt-5 border-t border-slate-600">
            <div
                className={`w-full flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-md transition-colors ${
                    isEmergency 
                        ? 'bg-red-900/40 text-red-300 group-hover:bg-red-800/60' 
                        : 'bg-blue-900/40 text-blue-300 group-hover:bg-blue-800/60'
                }`}
                aria-label={isEmergency ? `View emergency info for ${clinic.name}` : `Request an appointment with ${clinic.name}`}
            >
                {isEmergency ? 'View Emergency Info' : 'View Details & Request Appointment'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;