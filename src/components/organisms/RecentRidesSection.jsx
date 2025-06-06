import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import RideCard from '@/components/molecules/RideCard'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import rideService from '@/services/api/rideService'

const BookingsSection = ({ rides, loading, error, onRefresh }) => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showDateCorrectionNotice, setShowDateCorrectionNotice] = useState(false)
  const [correctedDatesCount, setCorrectedDatesCount] = useState(0)
  // Check for corrected dates when component mounts or rides change
  useEffect(() => {
    if (rides && rides.length > 0) {
      const correctedLog = rideService.getCorrectedDatesLog()
      if (correctedLog.length > 0) {
        setCorrectedDatesCount(correctedLog.length)
        setShowDateCorrectionNotice(true)
        toast.info(`${correctedLog.length} invalid booking dates were automatically corrected to current time`)
        
        // Clear the log after showing notification
        setTimeout(() => {
          rideService.clearCorrectedDatesLog()
        }, 5000)
      }
    }
  }, [rides])

  const statusOptions = [
    { value: 'all', label: 'All', count: rides?.length || 0 },
    { value: 'pending', label: 'Pending', count: rides?.filter(r => r.status === 'pending').length || 0 },
    { value: 'confirmed', label: 'Confirmed', count: rides?.filter(r => r.status === 'confirmed').length || 0 },
    { value: 'completed', label: 'Completed', count: rides?.filter(r => r.status === 'completed').length || 0 },
    { value: 'cancelled', label: 'Cancelled', count: rides?.filter(r => r.status === 'cancelled').length || 0 }
  ]

  const filteredRides = selectedStatus === 'all' 
    ? rides 
    : rides?.filter(ride => ride.status === selectedStatus) || []

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
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
<div className="flex items-center justify-between mb-4">
        <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white">
          Your Bookings
        </Text>
        {correctedDatesCount > 0 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            {correctedDatesCount} dates corrected
          </span>
        )}
      </div>

      {/* Date Correction Notice */}
      <AnimatePresence>
        {showDateCorrectionNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <ApperIcon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Text className="text-sm text-blue-700 dark:text-blue-300">
                  We found and corrected {correctedDatesCount} invalid booking date(s) to the current time for better accuracy.
                </Text>
              </div>
              <Button
                onClick={() => setShowDateCorrectionNotice(false)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <ApperIcon name="X" size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            onClick={() => setSelectedStatus(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedStatus === option.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedStatus === option.value
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
              }`}>
                {option.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredRides.length === 0 ? (
        <div className="text-center py-8">
          <Text className="text-surface-500 dark:text-surface-400">
            {selectedStatus === 'all' ? 'No bookings yet' : `No ${selectedStatus} bookings`}
          </Text>
        </div>
      ) : (
<div className="grid gap-4">
          {filteredRides.map((ride) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
>
              <RideCard 
                ride={ride} 
                showStatus={true}
                onUpdate={() => {
                  // Refresh the bookings list
                  if (onRefresh) {
                    onRefresh()
                  } else {
                    window.location.reload()
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  )
}

export default BookingsSection