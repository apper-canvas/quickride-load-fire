import { motion } from 'framer-motion'
      import RideCard from '@/components/molecules/RideCard'
      import Text from '@/components/atoms/Text'
      
      const RecentRidesSection = ({ rides, loading, error }) => {
        if (loading) {
          return (
            &lt;div className="flex items-center justify-center h-48"&gt;
              &lt;motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              /&gt;
              &lt;Text className="ml-2 text-surface-600 dark:text-surface-400"&gt;Loading rides...&lt;/Text&gt;
            &lt;/div&gt;
          )
        }
      
        if (error) {
          return &lt;Text className="text-center text-red-500 mt-4"&gt;Error: {error}&lt;/Text&gt;
        }
      
        if (rides.length === 0) {
          return null // or a message like "No recent rides"
        }
      
        return (
          &lt;motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          &gt;
            &lt;Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-4"&gt;
              Recent Rides
            &lt;/Text&gt;
            &lt;div className="grid gap-4"&gt;
              {rides.slice(0, 3).map((ride) => (
                &lt;RideCard key={ride.id} ride={ride} /&gt;
              ))}
            &lt;/div&gt;
          &lt;/motion.section&gt;
        )
      }
      
      export default RecentRidesSection