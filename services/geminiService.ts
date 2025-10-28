import { Clinic } from '../types';
import { supabase } from './supabaseClient';

/**
 * Parses a PostgreSQL array string or a simple comma-separated string 
 * into a JavaScript array of strings.
 * Handles cases where the data is already a valid array (from local JSON),
 * a PostgreSQL array string like "{Emergency,"Urgent Care"}", or a simple
 * string like "Emergency, Urgent Care".
 * @param categories The raw value from the database.
 * @returns A string array of categories.
 */
function parsePostgresArray(categories: any): string[] {
  if (Array.isArray(categories)) {
    // Value is already a valid array (e.g., from clinics.json).
    return categories.filter((c): c is string => typeof c === 'string');
  }
  
  if (typeof categories !== 'string') {
    return [];
  }

  const trimmedCategories = categories.trim();

  // Case 1: PostgreSQL array string like "{Emergency,"Urgent Care"}".
  if (trimmedCategories.startsWith('{') && trimmedCategories.endsWith('}')) {
    const content = trimmedCategories.slice(1, -1);
    if (content === '') return [];
    // Split by comma and clean up whitespace and quotes.
    return content.split(',').map(c => c.trim().replace(/"/g, ''));
  }

  // Case 2: Simple comma-separated string like "Emergency, Urgent Care".
  if (trimmedCategories.length > 0) {
      return trimmedCategories.split(',').map(c => c.trim());
  }

  // Return an empty array for any other unexpected format.
  return [];
}


/**
 * Fetches the list of clinics from the local JSON file.
 * This is used as a fallback if Supabase is unavailable or returns no data.
 */
async function fetchClinicsFromJson(): Promise<Clinic[]> {
  try {
    const response = await fetch('/data/clinics.json');
    if (!response.ok) {
      console.error("Could not fetch local clinics.json file.");
      return [];
    }
    const data: Clinic[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error parsing local clinics.json:", error);
    return [];
  }
}

interface FetchClinicsResult {
  clinics: Clinic[];
  source: 'supabase' | 'local';
}

/**
 * Fetches the list of clinics.
 * It first tries to fetch from the Supabase database.
 * If Supabase returns no clinics or if the request fails,
 * it falls back to a local JSON file.
 */
export async function fetchClinics(): Promise<FetchClinicsResult> {
  let clinicsData: any[] = [];
  let source: 'supabase' | 'local' = 'supabase';

  try {
    const { data, error } = await supabase
      .from('clinics_madison_wi')
      .select('*');

    if (error) {
      // Don't throw, just log it and proceed to fallback.
      console.warn("Supabase fetch error, falling back to local data:", error.message);
    } else if (data && data.length > 0) {
      // Add a console log to help with debugging. This shows the exact data structure received.
      console.log("Raw data received from Supabase:", data);

      // Supabase returned data. Map potentially varied column names to our camelCase properties.
      clinicsData = data.map((clinic: any) => {
        const existingCategories = parsePostgresArray(clinic.categories || clinic['Categories']);
        const emergencyStatus = clinic.emergency_status;

        // Use a Set to automatically handle duplicate categories.
        const allCategories = new Set<string>();

        // Add the primary emergency status category first if it exists.
        if (emergencyStatus && typeof emergencyStatus === 'string' && emergencyStatus.trim()) {
            allCategories.add(emergencyStatus.trim());
        }
        
        // Add any other categories from the 'categories' field.
        existingCategories.forEach(cat => allCategories.add(cat));

        // If no categories have been assigned, default to 'General Practice'.
        if (allCategories.size === 0) {
            allCategories.add('General Practice');
        }
        
        return {
            name: clinic.name || clinic.clinic_name || clinic['Clinic Name'],
            address: clinic.full_address || clinic.address || clinic['Address'] || 'Address not available',
            city: clinic.city || clinic['City'] || 'Dane County',
            phone: clinic.phone || clinic.phone_number || clinic['Phone Number'] || 'Phone not available',
            categories: Array.from(allCategories),
            photoUrl: clinic.photo_url || clinic['photo_url'] || clinic['Photo URL'],
            hours: clinic.hours || clinic['Hours'],
            websiteUrl: clinic.website_url || clinic['website_url'] || clinic['Website URL'] || clinic.website,
            googleRating: clinic.google_rating || clinic['google_rating'] || clinic['Google Rating'] || clinic.rating,
            googleReviewCount: clinic.google_review_count || clinic['google_review_count'] || clinic['Google Review Count'] || clinic.reviews,
            googleMapsUrl: clinic.google_maps_url || clinic['google_maps_url'] || clinic['Google Maps URL'],
        };
      });
    }
  } catch (error) {
    console.error("An unexpected error occurred while fetching from Supabase:", error);
  }

  // If Supabase fetch failed or returned no data, try the local JSON fallback.
  if (clinicsData.length === 0) {
    console.log("No data from Supabase, attempting to load from local clinics.json");
    clinicsData = await fetchClinicsFromJson();
    source = 'local';
  }
  
  // Filter out any records that are null or missing a 'name' property.
  // This prevents the 'localeCompare of undefined' error if the data is malformed.
  const clinics: Clinic[] = clinicsData.filter(
    (clinic): clinic is Clinic => clinic && typeof clinic.name === 'string' && clinic.name.trim() !== ''
  );

  // Sort clinics alphabetically by name for a consistent order.
  clinics.sort((a, b) => a.name.localeCompare(b.name));
  
  return { clinics, source };
}