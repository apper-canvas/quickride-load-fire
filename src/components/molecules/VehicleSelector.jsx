import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
      const VehicleSelector = ({ vehicleTypes, selectedVehicleType, onSelect, getAvailableCount }) => {
        return (
          &lt;div className="mb-6"&gt;
            &lt;Text as="h3" className="text-lg font-semibold text-surface-900 dark:text-white mb-3"&gt;
              Choose Your Ride
            &lt;/Text&gt;
            &lt;div className="grid grid-cols-2 sm:grid-cols-4 gap-3"&gt;
              {vehicleTypes.map((vehicle) => {
                const isSelected = selectedVehicleType === vehicle.type
                const availableCount = getAvailableCount(vehicle.type)
                return (
                  &lt;motion.button
                    key={vehicle.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(vehicle.type)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-neu-light dark:shadow-neu-dark'
                        : 'border-surface-200 dark:border-surface-600 hover:border-surface-300 dark:hover:border-surface-500'
                    }`}
                  &gt;
                    &lt;ApperIcon 
                      name={vehicle.icon} 
                      size={24} 
                      className={`mx-auto mb-2 ${
                        isSelected ? 'text-primary' : 'text-surface-600 dark:text-surface-400'
                      }`} 
                    /&gt;
                    &lt;Text className={`text-sm font-medium ${
                      isSelected ? 'text-primary' : 'text-surface-700 dark:text-surface-300'
                    }`} as="div"&gt;
                      {vehicle.name}
                    &lt;/Text&gt;
                    &lt;Text className="text-xs text-surface-500 dark:text-surface-400" as="div"&gt;
                      ₹{vehicle.baseFare}+ • {availableCount} available
                    &lt;/Text&gt;
                  &lt;/motion.button&gt;
                )
              })}
            &lt;/div&gt;
          &lt;/div&gt;
        )
      }
      
      export default VehicleSelector