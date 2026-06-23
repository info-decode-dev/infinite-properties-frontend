interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
  success: boolean;
  error?: string;
}

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    await waitForRateLimit();
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "InfiniteProperties/1.0 (Real Estate Website)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return {
        latitude: null,
        longitude: null,
        success: false,
        error: "No results found for the given address",
      };
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    if (isNaN(lat) || isNaN(lon)) {
      return {
        latitude: null,
        longitude: null,
        success: false,
        error: "Invalid coordinates returned",
      };
    }

    return { latitude: lat, longitude: lon, success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Geocoding failed";
    return { latitude: null, longitude: null, success: false, error: message };
  }
}

export async function geocodeLocation(location: {
  exactLocation?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}): Promise<GeocodeResult> {
  const addressParts: string[] = [];
  if (location.exactLocation) addressParts.push(location.exactLocation);
  if (location.pincode) addressParts.push(location.pincode);
  if (location.city) addressParts.push(location.city);
  if (location.state) addressParts.push(location.state);
  if (location.country) addressParts.push(location.country);

  if (addressParts.length === 0) {
    return {
      latitude: null,
      longitude: null,
      success: false,
      error: "No address information provided",
    };
  }

  return geocodeAddress(addressParts.join(", "));
}
