import { useState } from 'react'
import { motion } from 'framer-motion'
import RideCard from '@/components/molecules/RideCard'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'

const BookingsSection = ({ rides, loading, error }) => {
  const [selectedStatus, setSelectedStatus] = useState('all')

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
      <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
        Your Bookings
      </Text>
      
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
              <RideCard ride={ride} showStatus={true} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  )
}

export default BookingsSection