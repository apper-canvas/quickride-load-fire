import { BaseService } from '../index.js';
import ridesData from '../mockData/rides.json';

class RideService extends BaseService {
  constructor() {
    super(ridesData);
    this.datesCorrected = [];
  }

  // Date validation and correction utilities
  isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
  }

  correctInvalidDate(ride) {
    const now = new Date();
    let corrected = false;
    const correctedRide = { ...ride };

    // Check and correct bookingTime
    if (!this.isValidDate(ride.bookingTime)) {
      correctedRide.bookingTime = now.toISOString();
      corrected = true;
    }

    // Check and correct createdAt
    if (!this.isValidDate(ride.createdAt)) {
      correctedRide.createdAt = now.toISOString();
      corrected = true;
    }

    // Check and correct scheduledTime if it exists
    if (ride.scheduledTime && !this.isValidDate(ride.scheduledTime)) {
      correctedRide.scheduledTime = now.toISOString();
      corrected = true;
    }

    if (corrected) {
      this.datesCorrected.push({
        rideId: ride.id,
        originalBookingTime: ride.bookingTime,
        correctedBookingTime: correctedRide.bookingTime,
        timestamp: now.toISOString()
      });
    }

    return { ride: correctedRide, corrected };
  }

  validateAndCorrectDates(rides) {
    const correctedRides = [];
    let totalCorrected = 0;

    rides.forEach(ride => {
      const { ride: correctedRide, corrected } = this.correctInvalidDate(ride);
      correctedRides.push(correctedRide);
      if (corrected) totalCorrected++;
    });

    return { rides: correctedRides, correctedCount: totalCorrected };
  }

  async getAll() {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    
    const rawData = this.data.map(deepClone);
    const { rides, correctedCount } = this.validateAndCorrectDates(rawData);
    
    if (correctedCount > 0) {
      console.log(`Corrected ${correctedCount} invalid dates in Your Bookings`);
    }
    
    return rides;
  }

  async getByStatus(status) {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    
    const filteredData = this.data.filter(ride => ride.status === status).map(deepClone);
    const { rides } = this.validateAndCorrectDates(filteredData);
    
    return rides;
}

  async getByVehicleType(vehicleType) {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    
    const filteredData = this.data.filter(ride => ride.vehicleType === vehicleType).map(deepClone);
    const { rides } = this.validateAndCorrectDates(filteredData);
    
    return rides;
  }

  getCorrectedDatesLog() {
    return this.datesCorrected;
  }

  clearCorrectedDatesLog() {
    this.datesCorrected = [];
  }
  async updateStatus(id, status) {
    const { mockDelay } = await import('../index.js');
    await mockDelay();
    return this.update(id, { status });
  }

async cancelBooking(id) {
    const { mockDelay } = await import('../index.js');
    await mockDelay();
    return this.update(id, { 
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });
  }

  async findSharedRideMatches(rideRequest) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(2000); // Simulate matching process
    
    // Mock matching algorithm - in reality this would check database for compatible rides
    const compatibleRides = this.data.filter(ride => 
      ride.rideType === 'shared' && 
      ride.status === 'confirmed' &&
      this.calculateDistance(rideRequest.pickupLocation, ride.pickupLocation) < 2 && // Within 2km
      this.calculateDistance(rideRequest.dropoffLocation, ride.dropoffLocation) < 2
    );
    
    // Simulate random matching success (70% chance of finding a match)
    const hasMatch = Math.random() > 0.3 && compatibleRides.length > 0;
    
    if (hasMatch) {
      const matchedRide = compatibleRides[0];
      return {
        success: true,
        matchedRide,
        estimatedPickupTime: '8-12 mins',
        message: 'Great! We found a shared ride match for you.'
      };
    }
    
    return {
      success: false,
      message: 'No shared ride matches found at the moment. Would you like to book a personal cab instead?'
    };
  }

  calculateDistance(location1, location2) {
    // Mock distance calculation - in reality would use proper geo calculations
    return Math.random() * 5;
  }

async createSharedRide(rideData) {
    const { mockDelay } = await import('../index.js');
    await mockDelay();
    const now = new Date();
    
    try {
      const sharedRideData = {
        ...rideData,
        id: Date.now(),
        rideType: 'shared',
        fare: Math.round(rideData.fare * 0.7), // 30% discount
        isMatching: false, // Set to false so it appears in pending bookings
        matchingStartTime: now.toISOString(),
        status: 'pending', // Start as pending so it appears in Your Bookings
        bookingTime: now.toISOString(),
        createdAt: now.toISOString(),
        // Ensure all required fields are present
        pickupLocation: rideData.pickupLocation || { address: '' },
        dropoffLocation: rideData.dropoffLocation || { address: '' },
        vehicleType: rideData.vehicleType || 'bike',
        passengerCount: rideData.passengerCount || 1,
        bookingId: rideData.bookingId || `QR${Date.now()}`
      };
      
      // Save to persistent storage
      const savedRide = await this.create(sharedRideData);
      
      // Simulate shared ride confirmation after a short delay
      setTimeout(async () => {
        try {
          await this.update(savedRide.id, {
            status: 'confirmed',
            isMatching: false,
            matchingCompletedAt: now.toISOString(),
            driverInfo: savedRide.driverInfo || {
              name: `Driver ${Math.floor(Math.random() * 999) + 1}`,
              rating: (4.0 + Math.random()).toFixed(1),
              vehicleNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
              photo: `https://ui-avatars.com/api/?name=Driver&size=128&background=random`
            }
          });
        } catch (error) {
          console.error('Failed to update shared ride status:', error);
        }
      }, 3000);
      
      return savedRide;
    } catch (error) {
      console.error('Failed to create shared ride:', error);
      throw new Error('Failed to save shared ride booking. Please try again.');
    }
  }

  async create(data) {
    const now = new Date();
    
    try {
      const enhancedData = {
        ...data,
        id: data.id || Date.now(),
        bookingTime: data.bookingTime || now.toISOString(),
        createdAt: data.createdAt || now.toISOString(),
        // Ensure scheduledTime is valid if provided
        ...(data.scheduledTime && !this.isValidDate(data.scheduledTime) && {
          scheduledTime: now.toISOString()
        })
      };
      
      const result = await super.create(enhancedData);
      
      // Verify the booking was saved successfully
      if (!result || !result.id) {
        throw new Error('Failed to save booking data');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to create ride:', error);
      throw new Error('Failed to save booking. Please try again.');
    }
  }

async updateMatchingStatus(id, matchResult) {
    const { mockDelay } = await import('../index.js');
    await mockDelay();
    
    if (matchResult.success) {
      return this.update(id, {
        status: 'confirmed',
        isMatching: false,
        matchedWith: matchResult.matchedRide.id,
        estimatedPickupTime: matchResult.estimatedPickupTime,
        matchingCompletedAt: new Date().toISOString()
      });
    } else {
      return this.update(id, {
        status: 'match_failed',
        isMatching: false,
        matchingCompletedAt: new Date().toISOString()
      });
    }
  }
}

// Create and export service instance
const rideService = new RideService();
export default rideService;