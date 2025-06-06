import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
      const BookingConfirmation = ({ currentRide }) => {
        return (
          &lt;motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
          &gt;
            &lt;div className="flex items-center space-x-2 mb-3"&gt;
              &lt;ApperIcon name="CheckCircle" size={20} className="text-green-600" /&gt;
              &lt;span className="font-semibold text-green-800 dark:text-green-400"&gt;
                Ride Confirmed!
              &lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="space-y-2 text-sm"&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;Text className="text-surface-600 dark:text-surface-400"&gt;Driver:&lt;/Text&gt;
                &lt;Text className="font-medium text-surface-900 dark:text-white"&gt;
                  {currentRide.driverInfo?.name}
                &lt;/Text&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;Text className="text-surface-600 dark:text-surface-400"&gt;Vehicle:&lt;/Text&gt;
                &lt;Text className="font-medium text-surface-900 dark:text-white"&gt;
                  {currentRide.driverInfo?.vehicleNumber}
                &lt;/Text&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;Text className="text-surface-600 dark:text-surface-400"&gt;ETA:&lt;/Text&gt;
                &lt;Text className="font-medium text-surface-900 dark:text-white"&gt;
                  {currentRide.eta}
                &lt;/Text&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;Text className="text-surface-600 dark:text-surface-400"&gt;Fare:&lt;/Text&gt;
                &lt;Text className="font-bold text-surface-900 dark:text-white"&gt;
                  ₹{currentRide.fare}
                &lt;/Text&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/motion.div&gt;
        )
      }
      
      export default BookingConfirmation