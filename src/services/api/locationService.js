// Mock coordinates for major cities (in a real app, this would use a geocoding API)
const mockCityCoordinates = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'pimpri': { lat: 18.6298, lng: 73.7997 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'vadodara': { lat: 22.3072, lng: 73.1812 }
};

class LocationService {
  constructor() {
    this.maxDistanceKm = 100;
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Validate a single location string
  validateLocation(locationString) {
    if (!locationString || typeof locationString !== 'string') {
      return { isValid: false, error: 'Location is required' };
    }

    const trimmedLocation = locationString.trim().toLowerCase();
    
    if (trimmedLocation.length < 3) {
      return { isValid: false, error: 'Location must be at least 3 characters' };
    }

    // Check if location exists in our mock database
    const cityKey = Object.keys(mockCityCoordinates).find(city => 
      trimmedLocation.includes(city) || city.includes(trimmedLocation)
    );

    if (!cityKey) {
      // For demo purposes, allow any location that looks like an address
      if (trimmedLocation.length >= 5 && /[a-zA-Z]/.test(trimmedLocation)) {
        // Generate mock coordinates for unknown locations (near Mumbai)
        const mockCoords = {
          lat: 19.0760 + (Math.random() - 0.5) * 2,
          lng: 72.8777 + (Math.random() - 0.5) * 2
        };
        return { isValid: true, coordinates: mockCoords };
      }
      return { isValid: false, error: 'Invalid location. Please enter a valid city or address' };
    }

    return { isValid: true, coordinates: mockCityCoordinates[cityKey] };
  }

  // Validate both pickup and dropoff locations and check distance
  async validateBookingLocations(pickupLocation, dropoffLocation) {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const pickupValidation = this.validateLocation(pickupLocation);
    const dropoffValidation = this.validateLocation(dropoffLocation);

    if (!pickupValidation.isValid) {
      return {
        isValid: false,
        error: `Pickup: ${pickupValidation.error}`,
        field: 'pickup'
      };
    }

    if (!dropoffValidation.isValid) {
      return {
        isValid: false,
        error: `Dropoff: ${dropoffValidation.error}`,
        field: 'dropoff'
      };
    }

    // Calculate distance between locations
    const distance = this.calculateDistance(
      pickupValidation.coordinates.lat,
      pickupValidation.coordinates.lng,
      dropoffValidation.coordinates.lat,
      dropoffValidation.coordinates.lng
    );

    if (distance > this.maxDistanceKm) {
      return {
        isValid: false,
        error: `Distance between locations (${Math.round(distance)}km) exceeds 100km limit`,
        field: 'distance',
        distance: Math.round(distance)
      };
    }

    return {
      isValid: true,
      distance: Math.round(distance),
      pickupCoordinates: pickupValidation.coordinates,
      dropoffCoordinates: dropoffValidation.coordinates
    };
  }

  // Get suggested locations (for autocomplete)
  getSuggestedLocations(query) {
    if (!query || query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    return Object.keys(mockCityCoordinates)
      .filter(city => city.includes(queryLower))
      .map(city => ({
        name: city.charAt(0).toUpperCase() + city.slice(1),
        coordinates: mockCityCoordinates[city]
      }))
      .slice(0, 5);
  }
}

// Create and export service instance
const locationService = new LocationService();
export default locationService;