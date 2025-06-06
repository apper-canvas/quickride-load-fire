import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
const BookingConfirmation = ({ currentRide }) => {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-400">
                Ride Confirmed!
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <Text className="text-surface-600 dark:text-surface-400">Driver:</Text>
                <Text className="font-medium text-surface-900 dark:text-white">
                  {currentRide.driverInfo?.name}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-surface-600 dark:text-surface-400">Vehicle:</Text>
                <Text className="font-medium text-surface-900 dark:text-white">
                  {currentRide.driverInfo?.vehicleNumber}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-surface-600 dark:text-surface-400">ETA:</Text>
                <Text className="font-medium text-surface-900 dark:text-white">
                  {currentRide.eta}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-surface-600 dark:text-surface-400">Fare:</Text>
                <Text className="font-bold text-surface-900 dark:text-white">
                  ₹{currentRide.fare}
                </Text>
              </div>
            </div>
          </motion.div>
        )
      }
      
      export default BookingConfirmation