import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import Text from '../atoms/Text'
import Button from '../atoms/Button'
import rideService from '../../services/api/rideService'

const BookingConfirmation = ({ currentRide, onBookingCancelled }) => {
  const [isCancelling, setIsCancelling] = useState(false)
  const [canCancel, setCanCancel] = useState(true)
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const checkCancellationPolicy = () => {
      if (!currentRide) return

      const now = new Date()
      const bookingTime = new Date(currentRide.createdAt)
      const isScheduled = currentRide.scheduleType === 'later'
      
      if (isScheduled && currentRide.scheduledDateTime) {
        // Scheduled booking - allow cancellation up to 12 hours before
        const scheduledTime = new Date(currentRide.scheduledDateTime)
        const hoursUntilRide = (scheduledTime - now) / (1000 * 60 * 60)
        
        if (hoursUntilRide <= 12) {
          setCanCancel(false)
          setCancellationMessage('Cancellation not allowed within 12 hours of scheduled time')
        } else {
          setCanCancel(true)
          setCancellationMessage(`Cancellation allowed until ${Math.floor(hoursUntilRide - 12)} hours before ride`)
        }
      } else {
        // Immediate booking - allow cancellation within 5 minutes
        const minutesSinceBooking = (now - bookingTime) / (1000 * 60)
        
        if (minutesSinceBooking > 5) {
          setCanCancel(false)
          setCancellationMessage('Cancellation period expired (5 minutes)')
        } else {
          setCanCancel(true)
          const remaining = Math.ceil(5 - minutesSinceBooking)
          setTimeRemaining(`${remaining} minute${remaining !== 1 ? 's' : ''} remaining`)
          setCancellationMessage('Cancellation allowed within 5 minutes of booking')
        }
      }
    }

    checkCancellationPolicy()
    const interval = setInterval(checkCancellationPolicy, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [currentRide])

  const handleContactDriver = () => {
    toast.info(`Calling ${currentRide.driverInfo?.name}...`)
    // In a real app, this would initiate a phone call or open messaging
  }

  const handleCancelBooking = async () => {
    if (!canCancel) {
      toast.error(cancellationMessage)
      return
    }

    // Enhanced confirmation dialog
    const confirmMessage = `Are you sure you want to cancel this booking?\n\nBooking ID: #${currentRide.id?.slice(-8)}\nDriver: ${currentRide.driverInfo?.name}\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setIsCancelling(true)
    try {
      const result = await rideService.validateCancellation(currentRide.id)
      if (!result.canCancel) {
        toast.error(result.reason)
        return
      }

      await rideService.cancelBooking(currentRide.id)
      toast.success('Booking cancelled successfully')
      if (onBookingCancelled) {
        onBookingCancelled()
      }
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setIsCancelling(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 space-y-6"
    >
      {/* Header with booking confirmation */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <ApperIcon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <Text as="h3" className="text-lg font-bold text-surface-900 dark:text-white">
            Booking Confirmed!
          </Text>
          <Text className="text-sm text-surface-600 dark:text-surface-400">
            Booking ID: #{currentRide.id?.slice(-8) || 'ABC12345'}
          </Text>
        </div>
      </div>

      {/* Driver Information */}
      <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-4">
        <Text as="h4" className="font-semibold text-surface-900 dark:text-white mb-3">
          Driver Details
        </Text>
        <div className="flex items-center space-x-4">
          {/* Driver Photo Placeholder */}
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <ApperIcon name="User" size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <Text className="font-semibold text-surface-900 dark:text-white">
              {currentRide.driverInfo?.name || 'Driver Name'}
            </Text>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                <ApperIcon name="Star" size={16} className="text-yellow-500 fill-current" />
                <Text className="text-sm text-surface-600 dark:text-surface-400 ml-1">
                  {currentRide.driverInfo?.rating || 4.5}
                </Text>
              </div>
              <Text className="text-sm text-surface-500 dark:text-surface-500">•</Text>
              <Text className="text-sm text-surface-600 dark:text-surface-400">
                {currentRide.driverInfo?.vehicleNumber || 'ABC123'}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-3">
        <Text as="h4" className="font-semibold text-surface-900 dark:text-white">
          Trip Details
        </Text>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Text className="text-surface-600 dark:text-surface-400">Pickup</Text>
            <Text className="font-medium text-surface-900 dark:text-white text-right">
              {currentRide.pickupLocation?.address || 'Pickup Location'}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-surface-600 dark:text-surface-400">Destination</Text>
            <Text className="font-medium text-surface-900 dark:text-white text-right">
              {currentRide.dropoffLocation?.address || 'Destination'}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-surface-600 dark:text-surface-400">ETA</Text>
            <Text className="font-medium text-primary-600 dark:text-primary-400">
              {currentRide.eta || '5 mins'}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-surface-600 dark:text-surface-400">Fare</Text>
            <Text className="font-bold text-lg text-surface-900 dark:text-white">
              ₹{currentRide.fare || 120}
            </Text>
          </div>
        </div>
      </div>

      {/* Real-time Tracking Map Placeholder */}
      <div className="bg-surface-100 dark:bg-surface-700 rounded-xl p-6 text-center">
        <ApperIcon name="Map" size={48} className="text-surface-400 dark:text-surface-500 mx-auto mb-3" />
        <Text className="text-surface-600 dark:text-surface-400 text-sm">
          Real-time tracking map
        </Text>
        <Text className="text-xs text-surface-500 dark:text-surface-500 mt-1">
          Track your driver's location in real-time
        </Text>
      </div>
{/* Cancellation Policy Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <Text className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
              Cancellation Policy
            </Text>
            <Text className="text-blue-700 dark:text-blue-300 text-xs mt-1">
              {cancellationMessage}
              {timeRemaining && (
                <span className="block font-medium mt-1">⏱️ {timeRemaining}</span>
              )}
            </Text>
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="space-y-3">
        {/* Contact Driver Button - Always Prominent */}
        <Button
          onClick={handleContactDriver}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all transform"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ApperIcon name="Phone" size={20} />
          </div>
          <span>Contact Driver</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </Button>

        {/* Cancel Booking Button - Conditional Styling */}
        <Button
          onClick={handleCancelBooking}
          disabled={isCancelling || !canCancel}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform ${
            canCancel 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl' 
              : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed'
          } ${isCancelling ? 'opacity-75' : ''}`}
          whileHover={canCancel ? { scale: 1.02, y: -2 } : {}}
          whileTap={canCancel ? { scale: 0.98 } : {}}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            canCancel ? 'bg-white/20' : 'bg-surface-300 dark:bg-surface-600'
          }`}>
            {isCancelling ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ApperIcon 
                name={canCancel ? "X" : "Lock"} 
                size={20} 
                className={canCancel ? "text-white" : "text-surface-500"}
              />
            )}
          </div>
          <span>
            {isCancelling 
              ? 'Cancelling...' 
              : canCancel 
                ? 'Cancel Booking' 
                : 'Cancellation Unavailable'
            }
          </span>
        </Button>
        
        {/* Mobile Responsive Stack */}
        <div className="block sm:hidden space-y-2">
          <Text className="text-xs text-surface-500 dark:text-surface-400 text-center">
            Tap and hold buttons for more options
          </Text>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 rounded-lg py-3">
        <motion.div 
          className="w-3 h-3 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Text className="font-medium">Driver is on the way</Text>
        <div className="w-1 h-1 bg-surface-400 rounded-full"></div>
        <Text className="text-xs">ETA: {currentRide?.eta || '5 mins'}</Text>
      </div>
    </motion.div>
  )
}

export default BookingConfirmation