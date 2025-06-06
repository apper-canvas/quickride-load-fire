import { BaseService } from '../index.js';
import ridesData from '../mockData/rides.json';

class RideService extends BaseService {
  constructor() {
    super(ridesData);
}

  async getByStatus(status) {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    return this.data.filter(ride => ride.status === status).map(deepClone);
  }

  async getByVehicleType(vehicleType) {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    return this.data.filter(ride => ride.vehicleType === vehicleType).map(deepClone);
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
    
    const sharedRideData = {
      ...rideData,
      rideType: 'shared',
      fare: Math.round(rideData.fare * 0.7), // 30% discount
      isMatching: true,
      matchingStartTime: new Date().toISOString(),
      status: 'finding_match'
    };
    
    return this.create(sharedRideData);
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