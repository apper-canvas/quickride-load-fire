import { BaseService } from '../index.js';
import ridesData from '../mockData/rides.json';
import sharedRideMatchingService from './sharedRideMatchingService.js';

class RideService extends BaseService {
  constructor() {
    super(ridesData);
    this.datesCorrected = [];
    this.matchingService = sharedRideMatchingService;
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

  // Enhanced shared ride matching with background processing
  async findSharedRideMatches(rideRequest) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(500);
    
    try {
      // Add to matching queue for background processing
      const queueEntry = await this.matchingService.addToMatchingQueue(
        `temp_${Date.now()}`, 
        rideRequest
      );
      
      this.matchingService.log('info', 'Ride added to matching queue', {
        rideRequest: {
          pickup: rideRequest.pickupLocation?.address,
          dropoff: rideRequest.dropoffLocation?.address,
          vehicleType: rideRequest.vehicleType
        }
      });

      // Simulate immediate check for existing matches
      const compatibleRides = this.data.filter(ride => 
        ride.rideType === 'shared' && 
        ride.status === 'pending' &&
        ride.vehicleType === rideRequest.vehicleType &&
        this.calculateDistance(rideRequest.pickupLocation, ride.pickupLocation) < 2 &&
        this.calculateDistance(rideRequest.dropoffLocation, ride.dropoffLocation) < 2
      );
      
      // 40% chance of immediate match for demo purposes
      const hasImmediateMatch = Math.random() > 0.6 && compatibleRides.length > 0;
      
      if (hasImmediateMatch) {
        const matchedRide = compatibleRides[0];
        this.matchingService.log('success', 'Immediate match found', {
          matchedWith: matchedRide.id,
          estimatedSavings: '30%'
        });
        
        return {
          success: true,
          matchedRide,
          estimatedPickupTime: '8-12 mins',
          message: 'Great! We found a shared ride match for you.',
          matchType: 'immediate'
        };
      }
      
      return {
        success: false,
        message: 'Searching for shared ride matches...',
        searchInProgress: true,
        estimatedWaitTime: '2-5 minutes'
      };
    } catch (error) {
      this.matchingService.log('error', 'Error in shared ride matching', { error: error.message });
      throw error;
    }
  }

  calculateDistance(location1, location2) {
    if (!location1?.address || !location2?.address) return Infinity;
    // Mock distance calculation - in reality would use proper geo calculations
    return Math.random() * 5;
  }

async createSharedRide(rideData) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(300);
    const now = new Date();
    
    try {
      const sharedRideData = {
        ...rideData,
        id: Date.now(),
        rideType: 'shared',
        fare: Math.round(rideData.fare * 0.7), // 30% discount
        isMatching: false, // No visible matching UI
        matchingStartTime: now.toISOString(),
        status: 'pending', // Start as pending for background matching
        bookingTime: now.toISOString(),
        matchingTimeout: now.getTime() + (3 * 60 * 1000) // 3 minutes from now
      };
      
      const savedRide = await this.create(sharedRideData);
      
      // Add to matching service queue
      await this.matchingService.addToMatchingQueue(savedRide.id, savedRide);
      
      // Set up background matching with 3-minute timeout handling
      this.setupBackgroundMatching(savedRide);
      
      this.matchingService.log('info', 'Shared ride created and added to 3-minute matching queue', {
        rideId: savedRide.id,
        pickup: savedRide.pickupLocation?.address,
        dropoff: savedRide.dropoffLocation?.address,
        timeoutInMinutes: 3
      });
      
      return savedRide;
    } catch (error) {
      this.matchingService.log('error', 'Failed to create shared ride', { error: error.message });
      throw new Error('Failed to save shared ride booking. Please try again.');
    }
  }
  async setupBackgroundMatching(savedRide) {
    const { mockDelay } = await import('../index.js');
    
    // Simulate background matching process with 3-minute timeout
    const matchingProcess = async () => {
      try {
        // Check every 5 seconds for matches (more frequent for 3-minute window)
        const checkInterval = setInterval(async () => {
          const currentTime = Date.now();
          
          // Check if 3-minute timeout has been reached
          if (currentTime > savedRide.matchingTimeout) {
            clearInterval(checkInterval);
            await this.handleMatchingTimeout(savedRide.id);
            return;
          }
          
          // Get current matching status
          const matchingStatus = this.matchingService.getMatchingStatus(savedRide.id);
          
          if (matchingStatus.status === 'matched') {
            clearInterval(checkInterval);
            await this.handleSuccessfulMatch(savedRide.id, matchingStatus);
            return;
          }
          
          // Continue searching...
          const remainingSeconds = Math.floor((savedRide.matchingTimeout - currentTime) / 1000);
          this.matchingService.log('info', 'Continuing 3-minute search for matches', {
            rideId: savedRide.id,
            remainingSeconds: remainingSeconds
          });
          
        }, 5000); // Check every 5 seconds for more responsive updates
        
        // Simulate finding a match after random delay (30-120 seconds for 3-minute window)
        const matchDelay = Math.random() * 90000 + 30000; // 30-120 seconds
        
        setTimeout(async () => {
          // Check if timeout hasn't been reached yet
          if (Date.now() < savedRide.matchingTimeout) {
            const shouldFindMatch = Math.random() > 0.4; // 60% chance of finding match
            
            if (shouldFindMatch) {
              clearInterval(checkInterval);
              await this.simulateMatchFound(savedRide.id);
            }
          }
        }, matchDelay);
        
      } catch (error) {
        this.matchingService.log('error', 'Error in 3-minute background matching process', {
          rideId: savedRide.id,
          error: error.message
        });
      }
    };
    
    // Start the background matching process
    matchingProcess();
  }

  async simulateMatchFound(rideId) {
    try {
      const matchedDriverInfo = {
        name: `Driver ${Math.floor(Math.random() * 999) + 1}`,
        rating: (4.0 + Math.random()).toFixed(1),
        vehicleNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
        photo: `https://ui-avatars.com/api/?name=Driver&size=128&background=random`
      };

      await this.update(rideId, {
        status: 'confirmed',
        isMatching: false,
        matchingCompletedAt: new Date().toISOString(),
        driverInfo: matchedDriverInfo,
        matchedPassengers: 1,
        estimatedPickupTime: '8-12 mins',
        sharedRideDetails: {
          totalPassengers: 2,
          estimatedSavings: '30%',
          matchFoundAt: new Date().toISOString()
        }
      });

      this.matchingService.log('success', 'Match simulation completed', {
        rideId,
        driverAssigned: matchedDriverInfo.name
      });

    } catch (error) {
      this.matchingService.log('error', 'Error simulating match', {
        rideId,
        error: error.message
      });
    }
  }

  async handleSuccessfulMatch(rideId, matchingStatus) {
    try {
      await this.update(rideId, {
        status: 'confirmed',
        isMatching: false,
        matchingCompletedAt: new Date().toISOString(),
        matchedWith: matchingStatus.matchedWith,
        driverInfo: {
          name: `Driver ${Math.floor(Math.random() * 999) + 1}`,
          rating: (4.0 + Math.random()).toFixed(1),
          vehicleNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
          photo: `https://ui-avatars.com/api/?name=Driver&size=128&background=random`
        }
      });

      this.matchingService.log('success', 'Successful match processed', {
        rideId,
        matchedWith: matchingStatus.matchedWith
      });

    } catch (error) {
      this.matchingService.log('error', 'Error handling successful match', {
        rideId,
        error: error.message
      });
    }
  }

  async handleMatchingTimeout(rideId) {
    try {
      await this.update(rideId, {
        status: 'match_failed',
        isMatching: false,
        matchingCompletedAt: new Date().toISOString(),
        matchingResult: 'timeout',
        fallbackOptions: {
          personalCabAvailable: true,
          estimatedFare: null, // Will be calculated when user chooses fallback
          message: 'No shared ride matches found. Would you like to book a personal cab instead?'
        }
      });

      this.matchingService.log('warning', 'Matching timeout handled', { rideId });

    } catch (error) {
      this.matchingService.log('error', 'Error handling matching timeout', {
        rideId,
        error: error.message
      });
    }
  }

async create(data) {
    const now = new Date();
    
    // Comprehensive validation before save attempt
    const validationErrors = this.validateBookingData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Booking validation failed: ${validationErrors.join(', ')}`);
    }
    
    try {
      const enhancedData = {
        ...data,
        id: data.id || Date.now(),
        bookingTime: data.bookingTime || now.toISOString(),
        createdAt: data.createdAt || now.toISOString(),
        // Ensure scheduledTime is valid if provided
        ...(data.scheduledTime && !this.isValidDate(data.scheduledTime) && {
          scheduledTime: now.toISOString()
        }),
        // Add save attempt metadata
        saveAttemptCount: 1,
        lastSaveAttempt: now.toISOString()
      };
      
      // Attempt to save with retry logic
      const result = await this.attemptSaveWithRetry(enhancedData, 3);
      
      // Comprehensive verification of saved data
      const verification = await this.verifySavedBooking(result);
      if (!verification.isValid) {
        throw new Error(`Data integrity check failed: ${verification.errors.join(', ')}`);
      }
      
      console.log('Booking saved successfully:', {
        id: result.id,
        vehicleType: result.vehicleType,
        rideType: result.rideType,
        status: result.status,
        saveTime: result.createdAt
      });
      
      return result;
    } catch (error) {
      console.error('Failed to create ride:', error);
      // Provide more specific error messages based on error type
      if (error.message.includes('validation')) {
        throw new Error(`Invalid booking data: ${error.message}`);
      } else if (error.message.includes('integrity')) {
        throw new Error(`Booking save verification failed: ${error.message}`);
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error occurred. Please check your connection and try again.');
      } else {
        throw new Error('Failed to save booking. Please verify your information and try again.');
      }
    }
  }

  // Validate booking data before save attempt
  validateBookingData(data) {
    const errors = [];
    
    // Required field validation
    if (!data.pickupLocation || !data.pickupLocation.address || !data.pickupLocation.address.trim()) {
      errors.push('Pickup location is required');
    }
    
    if (!data.dropoffLocation || !data.dropoffLocation.address || !data.dropoffLocation.address.trim()) {
      errors.push('Dropoff location is required');
    }
    
    if (!data.vehicleType || !data.vehicleType.trim()) {
      errors.push('Vehicle type is required');
    }
    
    if (!data.fare || data.fare <= 0) {
      errors.push('Valid fare amount is required');
    }
    
    if (!data.rideType || !['personal', 'shared'].includes(data.rideType)) {
      errors.push('Valid ride type is required');
    }
    
    // Business logic validation
    if (data.passengerCount && (data.passengerCount < 1 || data.passengerCount > 6)) {
      errors.push('Passenger count must be between 1 and 6');
    }
    
    if (data.scheduledDateTime) {
      const scheduledTime = new Date(data.scheduledDateTime);
      if (isNaN(scheduledTime.getTime()) || scheduledTime < new Date()) {
        errors.push('Scheduled time must be in the future');
      }
    }
    
    return errors;
  }

  // Attempt save with retry logic
  async attemptSaveWithRetry(data, maxRetries = 3) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Save attempt ${attempt}/${maxRetries} for booking`);
        
        const result = await super.create({
          ...data,
          saveAttemptCount: attempt,
          lastSaveAttempt: new Date().toISOString()
        });
        
        // Verify the result immediately
        if (!result || !result.id) {
          throw new Error('Save operation returned invalid result');
        }
        
        console.log(`Save attempt ${attempt} successful`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`Save attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delayMs = Math.pow(2, attempt) * 500;
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw new Error(`Failed to save after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  // Verify saved booking data integrity
  async verifySavedBooking(savedData) {
    const errors = [];
    
    try {
      // Check if booking can be retrieved
      const retrievedData = await this.getById(savedData.id);
      if (!retrievedData) {
        errors.push('Booking not found after save');
        return { isValid: false, errors };
      }
      
      // Verify critical fields
      if (!retrievedData.pickupLocation?.address) {
        errors.push('Pickup location missing in saved data');
      }
      
      if (!retrievedData.dropoffLocation?.address) {
        errors.push('Dropoff location missing in saved data');
      }
      
      if (!retrievedData.vehicleType) {
        errors.push('Vehicle type missing in saved data');
      }
      
      if (!retrievedData.fare || retrievedData.fare <= 0) {
        errors.push('Valid fare missing in saved data');
      }
      
      if (!retrievedData.status) {
        errors.push('Booking status missing in saved data');
      }
      
      if (!retrievedData.bookingTime || !this.isValidDate(retrievedData.bookingTime)) {
        errors.push('Valid booking time missing in saved data');
      }
      
      // Verify data consistency
      if (savedData.pickupLocation?.address !== retrievedData.pickupLocation?.address) {
        errors.push('Pickup location data inconsistency detected');
      }
      
      if (savedData.dropoffLocation?.address !== retrievedData.dropoffLocation?.address) {
        errors.push('Dropoff location data inconsistency detected');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        retrievedData
      };
      
    } catch (error) {
      errors.push(`Verification failed: ${error.message}`);
      return { isValid: false, errors };
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

  // Get matching status for UI updates
  getMatchingStatus(rideId) {
    return this.matchingService.getMatchingStatus(rideId);
  }

  // Manual trigger for testing (REST endpoint simulation)
  async triggerManualMatching() {
    return await this.matchingService.triggerMatching();
  }

  // Get matching service stats
  getMatchingStats() {
    return this.matchingService.getStats();
  }

  // Get matching logs
  getMatchingLogs(limit = 50) {
    return this.matchingService.getRecentLogs(limit);
  }
}

// Create and export service instance
const rideService = new RideService();
export default rideService;