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
async validateCancellation(id) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(200);
    
    const ride = await this.getById(id);
    if (!ride) {
      return { canCancel: false, reason: 'Booking not found' };
    }

    const now = new Date();
    const bookingTime = new Date(ride.createdAt);
    const isScheduled = ride.scheduleType === 'later';

    if (isScheduled && ride.scheduledDateTime) {
      // Scheduled booking - allow cancellation up to 12 hours before
      const scheduledTime = new Date(ride.scheduledDateTime);
      const hoursUntilRide = (scheduledTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilRide <= 12) {
        return { 
          canCancel: false, 
          reason: 'Cancellation not allowed within 12 hours of scheduled time' 
        };
      }
    } else {
      // Immediate booking - allow cancellation within 5 minutes
      const minutesSinceBooking = (now - bookingTime) / (1000 * 60);
      
      if (minutesSinceBooking > 5) {
        return { 
          canCancel: false, 
          reason: 'Cancellation period expired (5 minutes after booking)' 
        };
      }
    }

    return { canCancel: true, reason: null };
  }

  async cancelBooking(id) {
    const { mockDelay } = await import('../index.js');
    await mockDelay();
    
    // Validate cancellation policy before proceeding
    const validation = await this.validateCancellation(id);
    if (!validation.canCancel) {
      throw new Error(validation.reason);
    }
    
    return this.update(id, { 
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: 'User requested'
    });
  }

  async getBookingDetails(id) {
    const { mockDelay, deepClone } = await import('../index.js');
    await mockDelay();
    
    const ride = await this.getById(id);
    if (!ride) return null;

    // Add additional booking confirmation details
    return {
      ...deepClone(ride),
      confirmationDetails: {
        bookingConfirmed: true,
        confirmationTime: ride.createdAt,
        estimatedArrival: ride.eta,
        trackingAvailable: true
      }
    };
  }
}

// Create and export service instance
const rideService = new RideService();
export default rideService;