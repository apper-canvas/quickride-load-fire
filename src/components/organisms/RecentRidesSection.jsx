import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import RideCard from '@/components/molecules/RideCard'
import BookingConfirmation from '@/components/molecules/BookingConfirmation'
import rideService from '@/services/api/rideService'

const RecentRidesSection = ({ refreshTrigger, confirmedBooking }) => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

useEffect(() => {
    loadRides()
  }, [refreshTrigger])

  useEffect(() => {
    if (confirmedBooking) {
      setSelectedBooking(confirmedBooking)
      setShowConfirmation(true)
    }
  }, [confirmedBooking])

  const loadRides = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rideService.getUserRides()
      setRides(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load rides')
      toast.error('Failed to load rides')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRide = async (rideId) => {
    try {
      setDeletingId(rideId)
      await rideService.deleteRide(rideId)
      setRides(rides.filter(ride => ride.id !== rideId))
      toast.success('Ride deleted successfully')
    } catch (error) {
      toast.error('Failed to delete ride')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewBookingConfirmation = async (ride) => {
    try {
      const bookingDetails = await rideService.getBookingDetails(ride.id)
      setSelectedBooking(bookingDetails)
      setShowConfirmation(true)
    } catch (error) {
      toast.error('Failed to load booking details')
    }
  }

  const handleBookingCancelled = () => {
    setShowConfirmation(false)
    setSelectedBooking(null)
    loadRides()
  }

  const tabConfig = [
    { key: 'all', label: 'All Rides', icon: 'Clock' },
    { key: 'confirmed', label: 'Confirmed', icon: 'CheckCircle2' },
    { key: 'completed', label: 'Completed', icon: 'CheckCircle' },
    { key: 'pending', label: 'Pending', icon: 'Clock' },
    { key: 'cancelled', label: 'Cancelled', icon: 'XCircle' }
  ]

  const getStatusCounts = () => {
    return {
      all: rides.length,
      confirmed: rides.filter(ride => ride.status === 'pending' && ride.driverInfo).length,
      completed: rides.filter(ride => ride.status === 'completed').length,
      pending: rides.filter(ride => ride.status === 'pending').length,
      cancelled: rides.filter(ride => ride.status === 'cancelled').length
    }
  }

  const getDisplayRides = () => {
    if (activeTab === 'all') return rides
    if (activeTab === 'confirmed') {
      return rides.filter(ride => ride.status === 'pending' && ride.driverInfo)
    }
    return rides.filter(ride => ride.status === activeTab)
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
        <Text className="ml-2 text-surface-600 dark:text-surface-400">Loading bookings...</Text>
      </div>
    )
  }

  if (error) {
    return <Text className="text-center text-red-500 mt-4">Error: {error}</Text>
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <Card className="p-6">
        <motion.div>
          <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
            Your Bookings
          </Text>
          
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabConfig.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                }`}
              >
                <ApperIcon name={tab.icon} size={16} className="mr-2" />
                {tab.label}
                {statusCounts[tab.key] > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
                  }`}>
                    {statusCounts[tab.key]}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Rides List */}
          <AnimatePresence mode="wait">
            {getDisplayRides().length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <ApperIcon name="Car" size={48} className="mx-auto text-surface-400 dark:text-surface-500 mb-4" />
                <Text className="text-surface-600 dark:text-surface-400">
                  {activeTab === 'all' ? 'No rides found' : `No ${activeTab} rides found`}
                </Text>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {getDisplayRides().map((ride) => (
                  <motion.div
                    key={ride.id}
                    layout
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <RideCard
                      ride={ride}
                      onDelete={() => handleDeleteRide(ride.id)}
                      isDeleting={deletingId === ride.id}
                    />
                    
                    {/* Show booking confirmation button for confirmed rides */}
                    {ride.status === 'pending' && ride.driverInfo && (
                      <Button
                        onClick={() => handleViewBookingConfirmation(ride)}
                        className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ApperIcon name="Eye" size={14} className="mr-1" />
                        View Details
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Booking Confirmation Modal */}
          <AnimatePresence>
            {showConfirmation && selectedBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setShowConfirmation(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Text as="h3" className="text-lg font-bold text-surface-900 dark:text-white">
                      Booking Confirmation
                    </Text>
                    <Button
                      onClick={() => setShowConfirmation(false)}
                      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <ApperIcon name="X" size={20} className="text-surface-600 dark:text-surface-400" />
                    </Button>
                  </div>
                  
                  <BookingConfirmation 
                    currentRide={selectedBooking} 
                    onBookingCancelled={handleBookingCancelled}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </motion.div>
  )
}

export default RecentRidesSection