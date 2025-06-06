import { motion } from 'framer-motion'
      import Text from '@/components/atoms/Text'
      
const FareEstimate = ({ fare, eta, rideType }) => {
const originalFare = fare
        const sharedFare = Math.round(fare * 0.7) // 30% discount for shared rides
        const displayFare = rideType === 'shared' ? sharedFare : originalFare
        const savings = originalFare - sharedFare

        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 mb-6 ${
              rideType === 'shared' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-surface-50 dark:bg-surface-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Text className="text-sm text-surface-600 dark:text-surface-400">
                    {rideType === 'shared' ? 'Shared Ride Fare' : 'Estimated Fare'}
                  </Text>
                  {rideType === 'shared' && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                      30% OFF
                    </span>
                  )}
                </div>
                <Text as="div" className={`text-2xl font-bold ${
                  rideType === 'shared' ? 'text-green-700 dark:text-green-300' : 'text-surface-900 dark:text-white'
                }`}>
                  ₹{displayFare}
                </Text>
                {rideType === 'shared' && (
                  <Text className="text-xs text-green-600 dark:text-green-400" as="div">
                    You save ₹{savings}
                  </Text>
                )}
              </div>
              <div className="text-right">
                <Text className="text-sm text-surface-600 dark:text-surface-400">ETA</Text>
                <Text as="div" className="text-lg font-semibold text-surface-900 dark:text-white">
                  {eta} mins
                </Text>
                {rideType === 'shared' && (
                  <Text className="text-xs text-surface-500 dark:text-surface-400" as="div">
                    +5-10 mins possible
                  </Text>
                )}
              </div>
            </div>
          </motion.div>
        )
      }
      
      export default FareEstimate