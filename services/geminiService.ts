import { Clinic } from '../types';

/**
 * Fetches the list of clinics from a static JSON file.
 * The data in this file was originally generated and curated using the Gemini API 
 * and has been stored locally to ensure fast load times and a consistent user experience.
 */
export async function fetchClinics(): Promise<Clinic[]> {
  try {
    // Fetch data from the local public directory.
    const response = await fetch('/data/clinics.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Clinic[] = await response.json();
    
    // Sort clinics alphabetically by name for a consistent order, just in case the JSON isn't sorted.
    data.sort((a, b) => a.name.localeCompare(b.name));
    
    return data;
  } catch (error) {
    console.error("Error fetching static clinic data:", error);
    // Re-throw the error to be caught by the UI layer, which will display an error message.
    throw new Error("Could not retrieve clinic information.");
  }
}
