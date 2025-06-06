import { motion } from 'framer-motion'
      import Text from '@/components/atoms/Text'
      
const FareEstimate = ({ fare, eta }) => {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-50 dark:bg-surface-700 rounded-2xl p-4 mb-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <Text className="text-sm text-surface-600 dark:text-surface-400">Estimated Fare</Text>
                <Text as="div" className="text-2xl font-bold text-surface-900 dark:text-white">
                  ₹{fare}
                </Text>
              </div>
              <div className="text-right">
                <Text className="text-sm text-surface-600 dark:text-surface-400">ETA</Text>
                <Text as="div" className="text-lg font-semibold text-surface-900 dark:text-white">
                  {eta} mins
                </Text>
              </div>
            </div>
          </motion.div>
        )
      }
      
      export default FareEstimate