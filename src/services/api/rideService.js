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
}

// Create and export service instance
const rideService = new RideService();
export default rideService;