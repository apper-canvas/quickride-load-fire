import { motion } from 'framer-motion'
      import Text from '@/components/atoms/Text'
      
      const FareEstimate = ({ fare, eta }) => {
        return (
          &lt;motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-50 dark:bg-surface-700 rounded-2xl p-4 mb-6"
          &gt;
            &lt;div className="flex justify-between items-center"&gt;
              &lt;div&gt;
                &lt;Text className="text-sm text-surface-600 dark:text-surface-400"&gt;Estimated Fare&lt;/Text&gt;
                &lt;Text as="div" className="text-2xl font-bold text-surface-900 dark:text-white"&gt;
                  ₹{fare}
                &lt;/Text&gt;
              &lt;/div&gt;
              &lt;div className="text-right"&gt;
                &lt;Text className="text-sm text-surface-600 dark:text-surface-400"&gt;ETA&lt;/Text&gt;
                &lt;Text as="div" className="text-lg font-semibold text-surface-900 dark:text-white"&gt;
                  {eta} mins
                &lt;/Text&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/motion.div&gt;
        )
      }
      
      export default FareEstimate