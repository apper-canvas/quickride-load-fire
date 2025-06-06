import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import rideService from '@/services/api/rideService'

const BookingConfirmedPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [canCancel, setCanCancel] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')

  useEffect(() => {
    const bookingData = location.state?.booking
    if (bookingData) {
      setBooking(bookingData)
      checkCancellationPolicy(bookingData.id)
    } else {
      toast.error('No booking data found')
      navigate('/')
    }
    setLoading(false)
  }, [location.state, navigate])

  const checkCancellationPolicy = async (bookingId) => {
    try {
      const validation = await rideService.validateCancellation(bookingId)
      setCanCancel(validation.canCancel)
      setCancellationReason(validation.reason || '')
    } catch (error) {
      console.error('Error checking cancellation policy:', error)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleContactDriver = () => {
    if (booking?.driverInfo?.phone) {
      window.open(`tel:${booking.driverInfo.phone}`, '_self')
    } else {
      toast.info('Calling driver...', {
        autoClose: 2000,
        hideProgressBar: false,
      })
    }
  }

  const handleCancelBooking = async () => {
    if (!canCancel) {
      toast.error(cancellationReason || 'Cancellation not allowed')
      return
    }

    setCancelling(true)
    try {
      await rideService.cancelBooking(booking.id)
      toast.success('Booking cancelled successfully')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  const handleAddToCalendar = () => {
    const startDate = booking?.scheduledDateTime || new Date().toISOString()
    const title = `QuickRide Booking - ${booking?.vehicleType || 'Ride'}`
    const details = `Pickup: ${booking?.pickupLocation?.address}\nDropoff: ${booking?.dropoffLocation?.address}\nDriver: ${booking?.driverInfo?.name}\nBooking ID: ${booking?.bookingId}`
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${new Date(startDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(details)}`
    window.open(calendarUrl, '_blank')
  }

  const handleShareBooking = () => {
    const shareText = `My QuickRide booking:\nBooking ID: ${booking?.bookingId}\nPickup: ${booking?.pickupLocation?.address}\nDropoff: ${booking?.dropoffLocation?.address}\nDriver: ${booking?.driverInfo?.name}`
    
    if (navigator.share) {
      navigator.share({
        title: 'QuickRide Booking Details',
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success('Booking details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-surface-900 dark:to-surface-800 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-surface-900 dark:to-surface-800 flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Booking Not Found
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            No booking data available
          </p>
          <Button onClick={handleBack} className="px-6 py-2 bg-primary text-white rounded-lg">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-surface-900 dark:to-surface-800">
      {/* Header with Back Arrow */}
      <div className="sticky top-0 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
          <Button
            onClick={handleBack}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
            variant="ghost"
          >
            <ApperIcon name="ArrowLeft" size={20} className="text-surface-700 dark:text-surface-300" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-surface-900 dark:text-surface-100">
            Booking Confirmed
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="CheckCircle" size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            Your ride has been successfully booked
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-surface-200 dark:border-surface-700">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Booking Details
                </h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  {booking.status || 'Confirmed'}
                </span>
              </div>

              {/* Booking ID */}
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Booking ID</span>
                <span className="font-mono font-semibold text-surface-900 dark:text-surface-100">
                  {booking.bookingId}
                </span>
              </div>

              {/* Vehicle Type */}
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Vehicle Type</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100 capitalize">
                  {booking.vehicleType}
                </span>
              </div>

              {/* Fare */}
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">Total Fare</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100">
                  ₹{booking.fare}
                </span>
              </div>

              {/* Schedule Info */}
              {booking.scheduleType === 'later' && booking.scheduledDateTime && (
                <div className="flex justify-between items-center">
                  <span className="text-surface-600 dark:text-surface-400">Scheduled Time</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">
                    {new Date(booking.scheduledDateTime).toLocaleString()}
                  </span>
                </div>
              )}

              {/* ETA */}
              <div className="flex justify-between items-center">
                <span className="text-surface-600 dark:text-surface-400">
                  {booking.scheduleType === 'later' ? 'Will arrive in' : 'ETA'}
                </span>
                <span className="font-semibold text-primary">
                  {booking.eta}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Locations Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Trip Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Pickup Location</p>
                  <p className="font-medium text-surface-900 dark:text-surface-100">
                    {booking.pickupLocation?.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Dropoff Location</p>
                  <p className="font-medium text-surface-900 dark:text-surface-100">
                    {booking.dropoffLocation?.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Driver Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Driver Information
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center overflow-hidden">
                {booking.driverInfo?.photo ? (
                  <img 
                    src={booking.driverInfo.photo} 
                    alt={booking.driverInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ApperIcon name="User" size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-surface-900 dark:text-surface-100">
                  {booking.driverInfo?.name || 'Driver Name'}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <ApperIcon name="Star" size={16} className="text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium text-surface-700 dark:text-surface-300">
                      {booking.driverInfo?.rating || '4.8'}
                    </span>
                  </div>
                  <span className="text-surface-400">•</span>
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {booking.driverInfo?.vehicleNumber || 'MH01AB1234'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Real-time Tracking Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Real-time Tracking
            </h3>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
              <div className="text-center z-10">
                <ApperIcon name="Map" size={48} className="text-primary/60 mx-auto mb-2" />
                <p className="text-surface-600 dark:text-surface-400 font-medium">
                  Live tracking will be available
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-500">
                  once your driver starts the trip
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {/* Contact Driver Button */}
          <Button
            onClick={handleContactDriver}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-primary-dark transition-colors"
          >
            <ApperIcon name="Phone" size={20} />
            <span>Contact Driver</span>
          </Button>

          {/* Cancel Booking Button */}
          <Button
            onClick={handleCancelBooking}
            disabled={!canCancel || cancelling}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-colors ${
              canCancel 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed'
            }`}
          >
            {cancelling ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <ApperIcon name="X" size={20} />
                <span>{canCancel ? 'Cancel Booking' : 'Cannot Cancel'}</span>
              </>
            )}
          </Button>

          {!canCancel && cancellationReason && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center px-4">
              {cancellationReason}
            </p>
          )}
        </motion.div>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex space-x-3"
        >
          <Button
            onClick={handleAddToCalendar}
            className="flex-1 py-3 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ApperIcon name="Calendar" size={16} />
            <span>Add to Calendar</span>
          </Button>

          <Button
            onClick={handleShareBooking}
            className="flex-1 py-3 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ApperIcon name="Share2" size={16} />
            <span>Share</span>
          </Button>
        </motion.div>

        {/* Cancellation Policy Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Cancellation Policy
                </p>
                <p className="text-blue-700 dark:text-blue-400">
                  {booking.scheduleType === 'later' 
                    ? 'Free cancellation up to 12 hours before scheduled time'
                    : 'Free cancellation within 5 minutes of booking'
                  }
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default BookingConfirmedPage