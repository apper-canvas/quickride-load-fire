import { BaseService } from '../index.js';
import ridesData from '../mockData/rides.json';

class RideService extends BaseService {
  constructor() {
    super(ridesData);
  }

  async getByStatus(status) {
    await this.mockDelay();
    return this.data.filter(ride => ride.status === status).map(this.deepClone);
  }

  async getByVehicleType(vehicleType) {
    await this.mockDelay();
    return this.data.filter(ride => ride.vehicleType === vehicleType).map(this.deepClone);
  }

  async updateStatus(id, status) {
    return this.update(id, { status });
  }
}

export default new RideService();