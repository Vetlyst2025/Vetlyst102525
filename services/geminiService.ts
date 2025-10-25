import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Clinic } from '../types';

const CACHE_KEY = 'madisonVetFinderClinics';
const TIMESTAMP_KEY = 'madisonVetFinderClinicsTimestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to safely parse JSON from a Gemini response
const safelyParseJsonResponse = (response: GenerateContentResponse): any => {
  try {
    const text = response.text?.trim();
    if (!text) {
        return null;
    }

    // Find the start of the JSON array. The model sometimes adds introductory text.
    const startIndex = text.indexOf('[');
    if (startIndex === -1) {
        console.warn("Could not find the start of a JSON array `[` in the response.", text);
        return null;
    }

    // Find the end of the JSON array.
    const endIndex = text.lastIndexOf(']');
    if (endIndex === -1) {
        console.warn("Could not find the end of a JSON array `]` in the response.", text);
        return null;
    }

    // Extract just the JSON part of the string.
    const jsonString = text.substring(startIndex, endIndex + 1);
    
    // Now, attempt to parse the extracted string.
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Failed to parse JSON response:", response.text, error);
  }
  return null;
};

export async function fetchClinics(): Promise<Clinic[]> {
  // --- Step 1: Check for fresh cached data ---
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

  if (cachedData && cachedTimestamp) {
    const age = Date.now() - parseInt(cachedTimestamp, 10);
    if (age < CACHE_DURATION_MS) {
      console.log("Loading clinic data from local cache.");
      return JSON.parse(cachedData);
    } else {
      console.log("Cache expired. Fetching fresh data from API.");
    }
  }

  console.log("No valid cache found. Fetching fresh clinic data from Gemini API.");
  const COUNTY_NAME = 'Dane County, Wisconsin';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // --- Step 2: A single, robust call to find and structure clinic data ---
    const findAndFormatPrompt = `
      Use your search and map tools to perform an exhaustive search and create a complete directory of all veterinary clinics with a physical address in ${COUNTY_NAME}.
      It is critical that you find as many unique clinics as possible and do not provide a summarized or truncated list.
      For each clinic, provide all of the following details you can find, formatted as a JSON array of objects:
      - name: The clinic's name.
      - address: The full street address.
      - city: The city.
      - phone: The phone number.
      - hours: Hours of operation (e.g., 'Mon-Fri 8am-5pm, Sat 9am-12pm').
      - websiteUrl: A link to their official website.
      - photoUrl: A URL for a high-quality, publicly available photo (from their website or business listing).
      - categories: An array of relevant service categories. Prioritize terms like "Emergency", "Urgent Care", or "24-Hour". If none of those apply, use "General Practice".
      - googleRating: Google Maps star rating (as a number, e.g., 4.7).
      - googleReviewCount: The total number of Google reviews (as a number, e.g., 152).
      - googleMapsUrl: A direct link to their Google Maps listing.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: findAndFormatPrompt,
        config: {
            tools: [{googleMaps: {}}, {googleSearch: {}}],
        }
    });

    const parsedData = safelyParseJsonResponse(response);
    
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
        console.error("Received invalid or empty data from Gemini API", parsedData);
        throw new Error("Could not parse clinic information from the API response.");
    }
    
    let allClinics: Clinic[] = parsedData;

    // Use a map for easy lookup, deduplication, and modification.
    const uniqueClinicsMap = new Map<string, Clinic>();
    allClinics.forEach(clinic => {
      if (clinic.name && clinic.address) {
        const key = `${clinic.name.toLowerCase().trim()}|${clinic.address.toLowerCase().trim()}`;
        if (!uniqueClinicsMap.has(key)) {
          clinic.categories = Array.isArray(clinic.categories) ? clinic.categories : ['General Practice'];
          clinic.photoUrl = clinic.photoUrl || '';
          clinic.hours = clinic.hours || '';
          clinic.websiteUrl = clinic.websiteUrl || '';
          clinic.googleRating = clinic.googleRating || 0;
          clinic.googleReviewCount = clinic.googleReviewCount || 0;
          clinic.googleMapsUrl = clinic.googleMapsUrl || '';
          uniqueClinicsMap.set(key, clinic);
        }
      }
    });
    
    // --- Step 3: Enrich data with targeted follow-up calls for missing websites ---
    const enrichmentPromises: Promise<void>[] = [];
    uniqueClinicsMap.forEach((clinic, key) => {
        const isValidUrl = clinic.websiteUrl && (clinic.websiteUrl.startsWith('http://') || clinic.websiteUrl.startsWith('https://'));
        if (!isValidUrl) {
            const promise = async () => {
                try {
                    const findWebsitePrompt = `Find the official website URL for the veterinary clinic named "${clinic.name}" located at "${clinic.address}, ${clinic.city}". Respond with only the URL and nothing else.`;
                    const websiteResponse = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: findWebsitePrompt,
                    });
                    const foundUrl = websiteResponse.text?.trim();
                    if (foundUrl && (foundUrl.startsWith('http://') || foundUrl.startsWith('https://'))) {
                       const updatedClinic = uniqueClinicsMap.get(key);
                       if(updatedClinic) {
                           updatedClinic.websiteUrl = foundUrl;
                           uniqueClinicsMap.set(key, updatedClinic);
                       }
                    }
                } catch (e) {
                    console.warn(`Could not find website for ${clinic.name}:`, e);
                }
            };
            enrichmentPromises.push(promise());
        }
    });
    await Promise.all(enrichmentPromises);


    // --- Manual Data Corrections and Additions ---

    // 1. Correct Capital City Vet Clinic's category
    for (const [key, clinic] of uniqueClinicsMap.entries()) {
        if (clinic.name.toLowerCase().includes('capital city veterinary clinic')) {
            clinic.categories = ['Urgent Care'];
            uniqueClinicsMap.set(key, clinic); // Update the map entry
            break; 
        }
    }

    // 2. Correct All Pets Veterinary Clinic URL
    for (const [key, clinic] of uniqueClinicsMap.entries()) {
        if (clinic.name.toLowerCase().includes('all pets veterinary clinic')) {
            clinic.websiteUrl = 'https://allpetsvc.com/';
            uniqueClinicsMap.set(key, clinic);
            break;
        }
    }

    // 3. Add ACES if it's missing
    const acesName = 'ACES (Animal Critical Care and Emergency Services)';
    const acesAddress = '4221 E Towne Blvd';
    const acesKey = `${acesName.toLowerCase().trim()}|${acesAddress.toLowerCase().trim()}`;
    
    let acesExists = false;
    for (const key of uniqueClinicsMap.keys()) {
        if (key.toLowerCase().includes('aces')) {
            acesExists = true;
            break;
        }
    }

    if (!acesExists) {
        const acesClinic: Clinic = {
            name: acesName,
            address: acesAddress,
            city: 'Madison',
            phone: '(608) 222-2455',
            categories: ['Urgent Care', 'Emergency', '24-Hour'],
            photoUrl: '',
            hours: 'Open 24 hours',
            websiteUrl: 'https://acesvetmed.com/',
            googleMapsUrl: 'https://www.google.com/maps/place/ACES+(Animal+Critical+Care+and+Emergency+Services)/@43.120251,-89.3096277,17z/data=!3m1!4b1!4m6!3m5!1s0x8806517a6501a305:0xe844519f72cb1a5!8m2!3d43.1202471!4d-89.3070528!16s%2Fg%2F1tdy0wtr?entry=ttu'
        };
        uniqueClinicsMap.set(acesKey, acesClinic);
    }
    
    // 4. Correct/Add Veterinary Emergency Service (Middleton)
    const vesName = 'Veterinary Emergency Service';
    const vesAddress = '1612 N High Point Rd';
    const vesKey = `${vesName.toLowerCase().trim()}|${vesAddress.toLowerCase().trim()}`;

    let vesExists = false;
    let existingVesKey: string | null = null;

    // Look for a partial match, as the API might name it slightly differently or have a slightly different address
    for (const [key, clinic] of uniqueClinicsMap.entries()) {
        if (key.toLowerCase().includes('veterinary emergency service') && key.toLowerCase().includes('high point')) {
            vesExists = true;
            existingVesKey = key;
            break;
        }
    }

    if (vesExists && existingVesKey) {
        // If it exists, ensure its data is correct
        const existingClinic = uniqueClinicsMap.get(existingVesKey)!;
        existingClinic.name = vesName; // Standardize name
        existingClinic.city = 'Middleton'; // Correct city
        existingClinic.categories = ['Emergency', 'Urgent Care', '24-Hour'];
        existingClinic.phone = '(608) 831-1101';
        existingClinic.websiteUrl = 'https://www.vesmadison.com/';
        existingClinic.hours = 'Open 24 hours';
        uniqueClinicsMap.set(existingVesKey, existingClinic);
        console.log("Corrected existing Veterinary Emergency Service entry.");
    } else {
        // If it doesn't exist at all, add it
        const vesClinic: Clinic = {
            name: vesName,
            address: vesAddress,
            city: 'Middleton',
            phone: '(608) 831-1101',
            categories: ['Emergency', 'Urgent Care', '24-Hour'],
            photoUrl: '',
            hours: 'Open 24 hours',
            websiteUrl: 'https://www.vesmadison.com/',
            googleMapsUrl: 'https://www.google.com/maps/place/Veterinary+Emergency+Service/@43.0711942,-89.518626,17z/data=!3m1!4b1!4m6!3m5!1s0x8807663f42155555:0x87724fa7110c7320!8m2!3d43.0711903!4d-89.5160511!16s%2Fg%2F1tdw1v42?entry=ttu',
        };
        uniqueClinicsMap.set(vesKey, vesClinic);
        console.log("Added missing Veterinary Emergency Service entry.");
    }
     // --- End of Manual Corrections ---


    const uniqueClinics = Array.from(uniqueClinicsMap.values());
    
    // Sort clinics alphabetically by name for a consistent order
    uniqueClinics.sort((a, b) => a.name.localeCompare(b.name));

    // --- Step 4: Cache the newly fetched and processed data ---
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueClinics));
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
        console.log(`Clinic data fetched from API and cached successfully. Found ${uniqueClinics.length} clinics.`);
    } catch (cacheError) {
        console.error("Failed to cache clinic data:", cacheError);
        // This might happen if localStorage is full. The app will still function.
    }

    return uniqueClinics;

  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    // If the API fails, try to return stale cache data if it exists
    if (cachedData) {
        console.warn("API fetch failed. Returning stale data from cache.");
        return JSON.parse(cachedData);
    }
    throw new Error("Could not retrieve clinic information.");
  }
}