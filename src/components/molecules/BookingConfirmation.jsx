import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import Text from '../atoms/Text'
import Button from '../atoms/Button'
import rideService from '../../services/api/rideService'

const BookingConfirmation = ({ currentRide, onBookingCancelled }) => {
  const [isCancelling, setIsCancelling] = useState(false)

  const handleContactDriver = () => {
    toast.info(`Calling ${currentRide.driverInfo?.name}...`)
    // In a real app, this would initiate a phone call or open messaging
  }

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setIsCancelling(true)
    try {
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

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={handleContactDriver}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-primary-dark transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ApperIcon name="Phone" size={18} />
          <span>Contact Driver</span>
        </Button>
        <Button
          onClick={handleCancelBooking}
          disabled={isCancelling}
          className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isCancelling ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ApperIcon name="X" size={18} />
          )}
          <span>{isCancelling ? 'Cancelling...' : 'Cancel Booking'}</span>
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Text>Driver is on the way</Text>
      </div>
    </motion.div>
  )
}

export default BookingConfirmation