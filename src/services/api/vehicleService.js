import { BaseService } from '../index.js';
import vehiclesData from '../mockData/vehicles.json';

class VehicleService extends BaseService {
  constructor() {
    super(vehiclesData);
  }

  async getByType(type) {
    await this.mockDelay();
    return this.data.filter(vehicle => vehicle.type === type).map(this.deepClone);
  }

  async getAvailable() {
    await this.mockDelay();
    return this.data.filter(vehicle => vehicle.available).map(this.deepClone);
  }

  async updateAvailability(id, available) {
    return this.update(id, { available });
  }
}

export default new VehicleService();