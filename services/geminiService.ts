import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Clinic } from '../types';

const CACHE_KEY = 'madisonVetFinderClinics';
const TIMESTAMP_KEY = 'madisonVetFinderClinicsTimestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to safely parse JSON from a Gemini response
const safelyParseJsonResponse = (response: GenerateContentResponse): any => {
  try {
    const jsonString = response.text?.trim();
    if (jsonString) {
      // Sometimes the model returns markdown with JSON inside, like ```json ... ```
      const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
      return JSON.parse(cleanedJsonString);
    }
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
  const COUNTY_NAME = 'Dane County, Wisconsin'; // Variable for easy duplication to new cities

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // --- Step 2: Use grounding tools to find clinic information as text ---
    const findClinicsPrompt = `
      Use your search and map tools to find comprehensive information about all veterinary clinics with a physical address in ${COUNTY_NAME}.
      For each clinic, list all of the following details you can find:
      - Name
      - Full street address
      - City
      - Phone number
      - Hours of operation (e.g., 'Mon-Fri 8am-5pm, Sat 9am-12pm')
      - A link to their official website
      - A URL for a high-quality, publicly available photo (from their website or business listing).
      - Relevant service categories. Prioritize terms like "Emergency", "Urgent Care", or "24-Hour". If none of those apply, use "General Practice".
      - Google Maps star rating (as a number, e.g., 4.7)
      - The total number of Google reviews (as a number, e.g., 152)
      - A direct link to their Google Maps listing.
      
      Present this as a clear, well-formatted list. Do not use JSON for this step.
    `;

    const findResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: findClinicsPrompt,
      config: {
        tools: [{googleMaps: {}}, {googleSearch: {}}],
      },
    });

    const clinicInfoText = findResponse.text;
    if (!clinicInfoText || clinicInfoText.trim() === '') {
        throw new Error("Gemini API did not return any clinic information in the first step.");
    }

    // --- Step 3: Format the unstructured text into reliable JSON ---
    const formatJsonPrompt = `
      Based on the following text, extract the information for each veterinary clinic and format it as a valid JSON array of objects.
      Each object must conform to the provided schema.
      
      Here is the text to process:
      ---
      ${clinicInfoText}
      ---
    `;
    
    const formatResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: formatJsonPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        address: { type: Type.STRING },
                        city: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        hours: { type: Type.STRING },
                        websiteUrl: { type: Type.STRING },
                        categories: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        photoUrl: { type: Type.STRING },
                        googleRating: { type: Type.NUMBER },
                        googleReviewCount: { type: Type.INTEGER },
                        googleMapsUrl: { type: Type.STRING }
                    },
                    required: ["name", "address", "city", "phone", "categories"]
                }
            }
        }
    });

    const parsedData = safelyParseJsonResponse(formatResponse);
    
    if (!parsedData || !Array.isArray(parsedData)) {
        console.error("Received invalid or empty data from Gemini API on formatting step", parsedData);
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
    
    // --- Step 4: Enrich data with targeted follow-up calls for missing websites ---
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
     // --- End of Manual Corrections ---


    const uniqueClinics = Array.from(uniqueClinicsMap.values());
    
    // Sort clinics alphabetically by name for a consistent order
    uniqueClinics.sort((a, b) => a.name.localeCompare(b.name));

    // --- Step 5: Cache the newly fetched and processed data ---
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueClinics));
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
        console.log("Clinic data fetched from API and cached successfully.");
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