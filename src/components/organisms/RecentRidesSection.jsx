import { motion } from 'framer-motion'
      import RideCard from '@/components/molecules/RideCard'
      import Text from '@/components/atoms/Text'
      
const RecentRidesSection = ({ rides, loading, error }) => {
        if (loading) {
          return (
            <div className="flex items-center justify-center h-48">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              />
              <Text className="ml-2 text-surface-600 dark:text-surface-400">Loading rides...</Text>
            </div>
          )
        }
      
        if (error) {
          return <Text className="text-center text-red-500 mt-4">Error: {error}</Text>
        }
      
        if (rides.length === 0) {
          return null // or a message like "No recent rides"
        }
      
        return (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
              Recent Rides
            </Text>
            <div className="grid gap-4">
              {rides.slice(0, 3).map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </motion.section>
        )
      }
      
      export default RecentRidesSection