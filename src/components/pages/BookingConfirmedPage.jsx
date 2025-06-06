import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import Text from '../atoms/Text'
import Button from '../atoms/Button'
import BookingConfirmation from '../molecules/BookingConfirmation'
import rideService from '../../services/api/rideService'

const BookingConfirmedPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentRide, setCurrentRide] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get booking data from navigation state or URL params
    const bookingData = location.state?.bookingData
    const bookingId = location.state?.bookingId || new URLSearchParams(location.search).get('id')

    if (bookingData) {
      setCurrentRide(bookingData)
      setLoading(false)
    } else if (bookingId) {
      // Fetch booking data by ID
      loadBookingData(bookingId)
    } else {
      // No booking data available, redirect to home
      toast.error('No booking data found')
      navigate('/')
    }
  }, [location, navigate])

  const loadBookingData = async (bookingId) => {
    try {
      const booking = await rideService.getById(bookingId)
      if (booking) {
        setCurrentRide(booking)
      } else {
        toast.error('Booking not found')
        navigate('/')
      }
    } catch (error) {
      toast.error('Failed to load booking data')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleBackNavigation = () => {
    navigate('/')
  }

  const handleBookingCancelled = () => {
    toast.success('Booking cancelled successfully')
    navigate('/')
  }

  const handleAddToCalendar = () => {
    toast.info('Adding to calendar...')
    // In a real app, this would integrate with calendar APIs
  }

  const handleShareBooking = () => {
    if (navigator.share && currentRide) {
      navigator.share({
        title: 'QuickRide Booking Confirmed',
        text: `My ride is confirmed! Booking ID: ${currentRide.id?.slice(-8) || 'ABC12345'}`,
        url: window.location.href
      }).catch(() => {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.href)
        toast.success('Booking link copied to clipboard')
      })
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast.success('Booking link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!currentRide) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <Text className="text-surface-600 dark:text-surface-400">
            Booking data not found
          </Text>
          <Button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Header with back navigation */}
      <div className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBackNavigation}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="ArrowLeft" size={20} className="text-surface-700 dark:text-surface-300" />
            </Button>
            <div className="flex-1">
              <Text as="h1" className="text-xl font-bold text-surface-900 dark:text-white">
                Booking Confirmed
              </Text>
              <Text className="text-sm text-surface-600 dark:text-surface-400">
                Your ride has been successfully booked
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <Text as="h2" className="text-lg font-bold text-green-900 dark:text-green-100">
                🎉 Booking Successful!
              </Text>
              <Text className="text-green-700 dark:text-green-300">
                Your driver will arrive shortly
              </Text>
            </div>
          </div>
        </motion.div>

        {/* Booking Confirmation Component */}
        <BookingConfirmation 
          currentRide={currentRide} 
          onBookingCancelled={handleBookingCancelled}
        />

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-2 gap-3"
        >
          <Button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center space-x-2 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Calendar" size={18} />
            <span>Add to Calendar</span>
          </Button>
          <Button
            onClick={handleShareBooking}
            className="flex items-center justify-center space-x-2 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Share2" size={18} />
            <span>Share</span>
          </Button>
        </motion.div>

        {/* Cancellation Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <Text as="h4" className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Cancellation Policy
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300">
                • Free cancellation within 5 minutes for immediate bookings
                <br />
                • Free cancellation up to 12 hours before scheduled rides
                <br />
                • Charges may apply for late cancellations
              </Text>
            </div>
          </div>
        </motion.div>

        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </div>
    </div>
  )
}

export default BookingConfirmedPage