// Mock delay to simulate real API calls
export const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
export const generateId = () => Date.now().toString();

// Deep clone utility to ensure data immutability
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Base service class with common CRUD operations
export class BaseService {
  constructor(data = []) {
    this.data = [...data];
  }

  async getAll() {
    await mockDelay();
    return deepClone(this.data);
  }

  async getById(id) {
    await mockDelay();
    const item = this.data.find(item => item.id === id);
    return item ? deepClone(item) : null;
  }

  async create(item) {
    await mockDelay();
    const newItem = {
      ...deepClone(item),
      id: generateId()
    };
    this.data.unshift(newItem);
    return deepClone(newItem);
  }

  async update(id, updates) {
    await mockDelay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    this.data[index] = { ...this.data[index], ...updates };
    return deepClone(this.data[index]);
  }

  async delete(id) {
    await mockDelay();
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    const deleted = this.data.splice(index, 1)[0];
    return deepClone(deleted);
  }
}