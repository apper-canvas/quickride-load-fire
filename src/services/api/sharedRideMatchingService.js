import { BaseService } from '../index.js';

class SharedRideMatchingService extends BaseService {
  constructor() {
    super([]);
    this.matchingQueue = new Map();
    this.activeMatches = new Map();
    this.matchingLogs = [];
    this.isProcessing = false;
    this.matchingInterval = null;
    this.config = {
maxMatchingTime: 180000, // 3 minutes (180 seconds)
      proximityRadius: 2, // 2km
      timeWindow: 1800000, // 30 minutes
      maxPassengers: 4,
      retryInterval: 3000, // 3 seconds for faster response
      matchingCheckInterval: 5000, // 5 seconds for more frequent checks
    };
  }

  // Logging system
  log(type, message, data = {}) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type, // 'info', 'success', 'error', 'warning'
      message,
      data,
    };
    
    this.matchingLogs.push(logEntry);
    console.log(`[SharedRideMatching ${type.toUpperCase()}]`, message, data);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.matchingLogs.length > 1000) {
      this.matchingLogs = this.matchingLogs.slice(-1000);
    }
    
    return logEntry;
  }

  // Calculate distance between two locations (mock implementation)
  calculateDistance(location1, location2) {
    if (!location1?.address || !location2?.address) return Infinity;
    
    // Mock distance calculation - in production, use proper geo APIs
    const distance = Math.random() * 5;
    this.log('info', 'Distance calculated', {
      from: location1.address,
      to: location2.address,
      distance: `${distance.toFixed(2)}km`
    });
    
    return distance;
  }

  // Check if two rides are compatible for sharing
  isCompatibleRide(ride1, ride2) {
    try {
      // Check vehicle type compatibility
      if (ride1.vehicleType !== ride2.vehicleType) {
        return { compatible: false, reason: 'Different vehicle types' };
      }

      // Check passenger capacity
      const totalPassengers = (ride1.passengerCount || 1) + (ride2.passengerCount || 1);
      if (totalPassengers > this.config.maxPassengers) {
        return { compatible: false, reason: 'Exceeds passenger capacity' };
      }

      // Check proximity for pickup locations
      const pickupDistance = this.calculateDistance(ride1.pickupLocation, ride2.pickupLocation);
      if (pickupDistance > this.config.proximityRadius) {
        return { compatible: false, reason: 'Pickup locations too far apart' };
      }

      // Check proximity for dropoff locations
      const dropoffDistance = this.calculateDistance(ride1.dropoffLocation, ride2.dropoffLocation);
      if (dropoffDistance > this.config.proximityRadius) {
        return { compatible: false, reason: 'Dropoff locations too far apart' };
      }

      // Check time window compatibility
      const time1 = new Date(ride1.bookingTime || ride1.createdAt);
      const time2 = new Date(ride2.bookingTime || ride2.createdAt);
      const timeDiff = Math.abs(time1.getTime() - time2.getTime());
      
      if (timeDiff > this.config.timeWindow) {
        return { compatible: false, reason: 'Time windows incompatible' };
      }

      return {
        compatible: true,
        score: this.calculateMatchScore(ride1, ride2, pickupDistance, dropoffDistance, timeDiff)
      };
    } catch (error) {
      this.log('error', 'Error checking ride compatibility', { error: error.message, ride1: ride1.id, ride2: ride2.id });
      return { compatible: false, reason: 'Compatibility check failed' };
    }
  }

  // Calculate match score for prioritizing best matches
  calculateMatchScore(ride1, ride2, pickupDistance, dropoffDistance, timeDiff) {
    // Lower distance and time difference = higher score
    const distanceScore = Math.max(0, 100 - (pickupDistance + dropoffDistance) * 10);
    const timeScore = Math.max(0, 100 - (timeDiff / 60000)); // Convert to minutes
    const passengerScore = ride1.passengerCount === ride2.passengerCount ? 20 : 0;
    
    return Math.round(distanceScore + timeScore + passengerScore);
  }

  // Add ride to matching queue
  async addToMatchingQueue(rideId, rideData) {
    try {
      const { mockDelay } = await import('../index.js');
      await mockDelay(100);

      const queueEntry = {
        rideId,
        rideData: { ...rideData },
        addedAt: new Date().toISOString(),
        status: 'queued',
        attempts: 0,
        lastAttempt: null,
      };

      this.matchingQueue.set(rideId, queueEntry);
      
      this.log('info', 'Ride added to matching queue', {
        rideId,
        vehicleType: rideData.vehicleType,
        pickup: rideData.pickupLocation?.address,
        dropoff: rideData.dropoffLocation?.address,
        queueSize: this.matchingQueue.size
      });

      // Start background processing if not already running
      this.startBackgroundMatching();
      
      return queueEntry;
    } catch (error) {
      this.log('error', 'Failed to add ride to matching queue', { rideId, error: error.message });
      throw error;
    }
  }

  // Start background matching process
  startBackgroundMatching() {
    if (this.isProcessing) {
      this.log('info', 'Background matching already running');
      return;
    }

    this.isProcessing = true;
    this.log('info', 'Starting background matching process');

    this.matchingInterval = setInterval(() => {
      this.processMatchingQueue();
    }, this.config.matchingCheckInterval);
  }

  // Stop background matching process
  stopBackgroundMatching() {
    if (this.matchingInterval) {
      clearInterval(this.matchingInterval);
      this.matchingInterval = null;
    }
    
    this.isProcessing = false;
    this.log('info', 'Background matching process stopped');
  }

  // Process the matching queue
  async processMatchingQueue() {
    if (this.matchingQueue.size === 0) {
      return;
    }

    this.log('info', 'Processing matching queue', { queueSize: this.matchingQueue.size });

    const queuedRides = Array.from(this.matchingQueue.values())
      .filter(entry => entry.status === 'queued');

    for (const entry of queuedRides) {
      try {
        await this.attemptMatching(entry);
      } catch (error) {
        this.log('error', 'Error processing ride in queue', {
          rideId: entry.rideId,
          error: error.message
        });
      }
    }

    // Clean up expired entries
    this.cleanupExpiredEntries();
  }

  // Attempt to find a match for a specific ride
  async attemptMatching(queueEntry) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(200);

    queueEntry.attempts++;
    queueEntry.lastAttempt = new Date().toISOString();
    queueEntry.status = 'matching';

    this.log('info', 'Attempting to match ride', {
      rideId: queueEntry.rideId,
      attempt: queueEntry.attempts,
      addedAt: queueEntry.addedAt
    });

    // Check if matching time has expired
    const addedTime = new Date(queueEntry.addedAt).getTime();
    const currentTime = Date.now();
    
    if (currentTime - addedTime > this.config.maxMatchingTime) {
      this.handleMatchingTimeout(queueEntry);
      return;
    }

    // Look for compatible rides in the queue
    const compatibleRides = this.findCompatibleRides(queueEntry);
    
    if (compatibleRides.length > 0) {
      const bestMatch = compatibleRides[0]; // Highest score first
      await this.createMatch(queueEntry, bestMatch);
    } else {
      // No match found, update status back to queued
      queueEntry.status = 'queued';
      this.log('info', 'No compatible rides found', {
        rideId: queueEntry.rideId,
        queueSize: this.matchingQueue.size - 1
      });
    }
  }

  // Find compatible rides for a given queue entry
  findCompatibleRides(targetEntry) {
    const compatibleRides = [];

    for (const [rideId, entry] of this.matchingQueue) {
      // Skip same ride and non-queued rides
      if (rideId === targetEntry.rideId || entry.status !== 'queued') {
        continue;
      }

      const compatibility = this.isCompatibleRide(targetEntry.rideData, entry.rideData);
      
      if (compatibility.compatible) {
        compatibleRides.push({
          entry,
          score: compatibility.score
        });
        
        this.log('info', 'Compatible ride found', {
          targetRide: targetEntry.rideId,
          compatibleRide: rideId,
          score: compatibility.score
        });
      }
    }

    // Sort by score descending (best matches first)
    return compatibleRides.sort((a, b) => b.score - a.score);
  }

  // Create a match between two rides
  async createMatch(entry1, matchData) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(500);

    try {
      const entry2 = matchData.entry;
      const matchId = `match_${Date.now()}`;
      
      const matchInfo = {
        id: matchId,
        ride1: entry1.rideId,
        ride2: entry2.rideId,
        score: matchData.score,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        estimatedSavings: '30%',
        sharedRoute: {
          pickupOrder: [entry1.rideId, entry2.rideId],
          dropoffOrder: [entry1.rideId, entry2.rideId]
        }
      };

      this.activeMatches.set(matchId, matchInfo);

      // Remove both rides from matching queue
      this.matchingQueue.delete(entry1.rideId);
      this.matchingQueue.delete(entry2.rideId);

      this.log('success', 'Match created successfully', {
        matchId,
        ride1: entry1.rideId,
        ride2: entry2.rideId,
        score: matchData.score
      });

      // Notify both riders (mock notification)
      await this.notifyRiders(matchInfo);
      
      return matchInfo;
    } catch (error) {
      this.log('error', 'Failed to create match', {
        ride1: entry1.rideId,
        ride2: matchData.entry.rideId,
        error: error.message
      });
      throw error;
    }
  }

  // Handle matching timeout
  async handleMatchingTimeout(queueEntry) {
    try {
      queueEntry.status = 'timeout';
      
      this.log('warning', 'Ride matching timeout', {
        rideId: queueEntry.rideId,
        addedAt: queueEntry.addedAt,
        attempts: queueEntry.attempts
      });

      // Remove from queue
      this.matchingQueue.delete(queueEntry.rideId);

      // Notify rider about timeout (mock notification)
      await this.notifyMatchingTimeout(queueEntry);
      
    } catch (error) {
      this.log('error', 'Error handling matching timeout', {
        rideId: queueEntry.rideId,
        error: error.message
      });
    }
  }

  // Clean up expired entries
  cleanupExpiredEntries() {
    const currentTime = Date.now();
    const expiredEntries = [];

    for (const [rideId, entry] of this.matchingQueue) {
      const addedTime = new Date(entry.addedAt).getTime();
      
      if (currentTime - addedTime > this.config.maxMatchingTime) {
        expiredEntries.push(rideId);
      }
    }

    expiredEntries.forEach(rideId => {
      const entry = this.matchingQueue.get(rideId);
      this.handleMatchingTimeout(entry);
    });

    if (expiredEntries.length > 0) {
      this.log('info', 'Cleaned up expired entries', { count: expiredEntries.length });
    }
  }

  // Mock notification methods
  async notifyRiders(matchInfo) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(200);
    
    this.log('info', 'Notifying riders about match', {
      matchId: matchInfo.id,
      method: 'push_notification_and_email'
    });
    
    // In production, implement actual push notifications and email
    return { success: true, notificationsSent: 2 };
  }

  async notifyMatchingTimeout(queueEntry) {
    const { mockDelay } = await import('../index.js');
    await mockDelay(100);
    
    this.log('info', 'Notifying rider about matching timeout', {
      rideId: queueEntry.rideId,
      method: 'push_notification'
    });
    
    return { success: true, notificationsSent: 1 };
  }

  // Manual trigger for testing
  async triggerMatching() {
    this.log('info', 'Manual matching trigger activated');
    
    if (!this.isProcessing) {
      this.startBackgroundMatching();
    }
    
    await this.processMatchingQueue();
    
    return {
      success: true,
      queueSize: this.matchingQueue.size,
      activeMatches: this.activeMatches.size,
      message: 'Matching process triggered successfully'
    };
  }

  // Get matching status for a specific ride
  getMatchingStatus(rideId) {
    const queueEntry = this.matchingQueue.get(rideId);
    
    if (!queueEntry) {
      // Check if it's in active matches
      for (const match of this.activeMatches.values()) {
        if (match.ride1 === rideId || match.ride2 === rideId) {
          return {
            status: 'matched',
            matchId: match.id,
            matchedWith: match.ride1 === rideId ? match.ride2 : match.ride1,
            createdAt: match.createdAt
          };
        }
      }
      
      return { status: 'not_found' };
    }

    const addedTime = new Date(queueEntry.addedAt).getTime();
    const currentTime = Date.now();
    const remainingTime = Math.max(0, this.config.maxMatchingTime - (currentTime - addedTime));

    return {
      status: queueEntry.status,
      addedAt: queueEntry.addedAt,
      attempts: queueEntry.attempts,
      remainingTime: Math.floor(remainingTime / 1000), // in seconds
      lastAttempt: queueEntry.lastAttempt
    };
  }

  // Get system stats
  getStats() {
    return {
      queueSize: this.matchingQueue.size,
      activeMatches: this.activeMatches.size,
      totalLogs: this.matchingLogs.length,
      isProcessing: this.isProcessing,
      config: this.config
    };
  }

  // Get recent logs
  getRecentLogs(limit = 50) {
    return this.matchingLogs
      .slice(-limit)
      .reverse(); // Most recent first
  }

  // Clear logs
  clearLogs() {
    this.matchingLogs = [];
    this.log('info', 'Logs cleared');
  }
}

// Create and export service instance
const sharedRideMatchingService = new SharedRideMatchingService();
export default sharedRideMatchingService;