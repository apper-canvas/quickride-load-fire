import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'
import rideService from '@/services/api/rideService'

const RideCard = ({ ride, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      confirmed: 'CheckCircle',
      'in-progress': 'Car',
      completed: 'CheckCircle2',
      cancelled: 'XCircle'
    }
    return icons[status] || 'Clock'
  }

  const canCancelBooking = () => {
    if (ride.status === 'completed' || ride.status === 'cancelled') return false
    
    const bookingTime = new Date(ride.bookingTime)
    const scheduledTime = new Date(ride.scheduledTime || ride.bookingTime)
    const now = new Date()
    
    if (ride.bookingType === 'immediate') {
      // 5 minutes for immediate bookings
      const timeDiff = now - bookingTime
      return timeDiff <= 5 * 60 * 1000
    } else {
      // 12 hours for scheduled bookings
      const timeDiff = scheduledTime - now
      return timeDiff >= 12 * 60 * 60 * 1000
    }
  }

  const handleCancelBooking = async () => {
    if (!canCancelBooking()) {
      toast.error('Booking cannot be cancelled at this time')
      return
    }

    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?')
    if (!confirmCancel) return

    setIsLoading(true)
    try {
      await rideService.update(ride.id, { status: 'cancelled' })
      toast.success('Booking cancelled successfully')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactDriver = () => {
    if (ride.driver?.phone) {
      window.open(`tel:${ride.driver.phone}`)
    } else {
      toast.info('Driver contact information not available')
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Main Card Content - Always Visible */}
      <div className="p-4 cursor-pointer" onClick={toggleExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ApperIcon name="Car" size={24} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Text as="div" className="font-medium text-surface-900 dark:text-white capitalize">
                  {ride.vehicleType} Ride
                </Text>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                  {ride.status}
                </span>
              </div>
<Text className="text-sm text-surface-600 dark:text-surface-400">
                {ride.pickupLocation?.address} → {ride.dropoffLocation?.address}
              </Text>
              <Text className="text-xs text-surface-500 dark:text-surface-500 mt-1">
                {(() => {
                  const bookingDate = new Date(ride.bookingTime);
                  const isValidDate = bookingDate instanceof Date && !isNaN(bookingDate.getTime());
                  
                  if (!isValidDate) {
                    // Show current date/time for invalid dates
                    const now = new Date();
                    return `${now.toLocaleDateString()} at ${now.toLocaleTimeString()} (corrected)`;
                  }
                  
                  return `${bookingDate.toLocaleDateString()} at ${bookingDate.toLocaleTimeString()}`;
                })()}
              </Text>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <Text as="div" className="font-bold text-surface-900 dark:text-white">
                ₹{ride.fare}
              </Text>
              <Text className="text-sm text-surface-600 dark:text-surface-400">
                Booking #{ride.id?.toString().slice(-6)}
              </Text>
            </div>
<motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ApperIcon name="ChevronDown" size={20} className="text-surface-400" />
            </motion.div>
          </div>
</div>
      </div>

      {/* Action Buttons - Conditional Visibility */}
      {(ride.status === 'confirmed' && ride.driver?.phone) || canCancelBooking() ? (
        <div className="px-4 pb-4 border-t border-surface-100 dark:border-surface-700">
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            {/* Contact Driver Button - Only for confirmed bookings with driver phone */}
            {ride.status === 'confirmed' && ride.driver?.phone && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleContactDriver()
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 font-medium"
                disabled={isLoading}
              >
                <ApperIcon name="Phone" size={16} className="mr-2" />
                Contact Driver
              </Button>
            )}
            
            {/* Cancel Booking Button - Only when cancellation policy allows */}
            {canCancelBooking() && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelBooking()
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2.5 font-medium"
                disabled={isLoading}
              >
                <ApperIcon name="X" size={16} className="mr-2" />
                {isLoading ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>
          
          {/* Policy Information */}
          {ride.status !== 'completed' && ride.status !== 'cancelled' && (
            <div className="mt-2 text-xs text-surface-500 dark:text-surface-400">
              {ride.status === 'confirmed' && !ride.driver?.phone && (
                <div className="flex items-center space-x-1 mb-1">
                  <ApperIcon name="Info" size={12} />
                  <span>Driver contact will be available once assigned</span>
                </div>
              )}
              {!canCancelBooking() && (
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Clock" size={12} />
                  <span>
                    {ride.bookingType === 'immediate' 
                      ? 'Free cancellation expired (5 min limit)' 
                      : 'Free cancellation requires 12+ hours notice'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* No action buttons available - show explanation */
        ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <div className="px-4 pb-4 border-t border-surface-100 dark:border-surface-700">
            <div className="pt-3 text-center">
              <Text className="text-xs text-surface-500 dark:text-surface-400">
                {ride.status === 'pending' && 'Actions will be available once booking is confirmed'}
                {ride.status === 'in-progress' && 'Ride is currently in progress'}
              </Text>
            </div>
          </div>
        )
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-200 dark:border-surface-700">
              <div className="pt-4 space-y-4">
                
                {/* Status and Timeline */}
                <div className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                  <ApperIcon name={getStatusIcon(ride.status)} size={20} className="text-primary" />
                  <div>
                    <Text className="font-medium text-surface-900 dark:text-white">
                      Booking Status: {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </Text>
                    <Text className="text-sm text-surface-600 dark:text-surface-400">
                      {ride.status === 'confirmed' && 'Your ride is confirmed and driver is assigned'}
                      {ride.status === 'pending' && 'Waiting for driver confirmation'}
                      {ride.status === 'in-progress' && 'Driver is on the way'}
                      {ride.status === 'completed' && 'Trip completed successfully'}
                      {ride.status === 'cancelled' && 'Booking has been cancelled'}
                    </Text>
                  </div>
                </div>

                {/* Driver Information */}
                {ride.driver && (
                  <div className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {ride.driver.photo ? (
                        <img src={ride.driver.photo} alt={ride.driver.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <ApperIcon name="User" size={24} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Text className="font-medium text-surface-900 dark:text-white">
                        {ride.driver.name || 'Driver Assigned'}
                      </Text>
                      <div className="flex items-center space-x-2">
                        <Text className="text-sm text-surface-600 dark:text-surface-400">
                          {ride.driver.phone || 'Phone not available'}
                        </Text>
                        {ride.driver.rating && (
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Star" size={14} className="text-yellow-400 fill-current" />
                            <Text className="text-sm text-surface-600 dark:text-surface-400">
                              {ride.driver.rating}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vehicle Information */}
                {ride.vehicle && (
                  <div className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="Car" size={24} className="text-primary" />
                    </div>
                    <div>
                      <Text className="font-medium text-surface-900 dark:text-white">
                        {ride.vehicle.model || `${ride.vehicleType} Vehicle`}
                      </Text>
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        {ride.vehicle.licensePlate || 'License plate not available'}
                      </Text>
                    </div>
                  </div>
                )}

                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Text className="font-medium text-surface-900 dark:text-white">Trip Details</Text>
                    <div className="space-y-1">
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Distance: {ride.distance || 'N/A'} km
                      </Text>
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Duration: {ride.estimatedDuration || 'N/A'} mins
                      </Text>
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Booking Type: {ride.bookingType === 'immediate' ? 'Book Now' : 'Scheduled'}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Text className="font-medium text-surface-900 dark:text-white">Payment Details</Text>
                    <div className="space-y-1">
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Fare: ₹{ride.fare}
                      </Text>
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Payment: {ride.paymentMethod || 'Cash'}
                      </Text>
                      <Text className="text-sm text-surface-600 dark:text-surface-400">
                        Status: {ride.paymentStatus || 'Pending'}
                      </Text>
                    </div>
                  </div>
                </div>

{/* Additional Actions in Expanded View */}
                {ride.status === 'completed' && (
                  <div className="pt-4">
                    <Text className="text-sm text-surface-500 dark:text-surface-400 text-center py-2">
                      This is a past booking. No actions available.
                    </Text>
                  </div>
                )}

                {/* Cancellation Policy Info */}
                {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                  <div className="text-xs text-surface-500 dark:text-surface-400 p-2 bg-surface-100 dark:bg-surface-700/50 rounded">
                    <Text>
                      Cancellation Policy: {ride.bookingType === 'immediate' 
                        ? 'Free cancellation within 5 minutes of booking' 
                        : 'Free cancellation up to 12 hours before scheduled time'}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default RideCard