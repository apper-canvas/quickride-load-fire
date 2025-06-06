import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
const VehicleSelector = ({ 
        vehicleTypes, 
        selectedVehicleType, 
        onSelect, 
        getAvailableCount,
        scheduleType,
        onScheduleTypeChange,
        scheduledDateTime,
        onScheduledDateTimeChange,
        passengerCount,
        onPassengerCountChange,
        specialRequests,
        onSpecialRequestsChange
      }) => {
        const incrementPassengers = () => {
          if (passengerCount < 6) {
            onPassengerCountChange(passengerCount + 1)
          }
        }

        const decrementPassengers = () => {
          if (passengerCount > 1) {
            onPassengerCountChange(passengerCount - 1)
          }
        }

        const formatDateTime = () => {
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, '0')
          const day = String(now.getDate()).padStart(2, '0')
          const hours = String(now.getHours()).padStart(2, '0')
          const minutes = String(now.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        return (
          <div className="mb-6">
            <Text as="h3" className="text-lg font-semibold text-surface-900 dark:text-white mb-3">
              Choose Your Ride
            </Text>
            
            {/* Vehicle Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {vehicleTypes.map((vehicle) => {
                const isSelected = selectedVehicleType === vehicle.type
                const availableCount = getAvailableCount(vehicle.type)
                return (
                  <motion.button
                    key={vehicle.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(vehicle.type)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-neu-light dark:shadow-neu-dark'
                        : 'border-surface-200 dark:border-surface-600 hover:border-surface-300 dark:hover:border-surface-500'
                    }`}
                  >
                    <ApperIcon 
                      name={vehicle.icon} 
                      size={24} 
                      className={`mx-auto mb-2 ${
                        isSelected ? 'text-primary' : 'text-surface-600 dark:text-surface-400'
                      }`} 
                    />
                    <Text className={`text-sm font-medium ${
                      isSelected ? 'text-primary' : 'text-surface-700 dark:text-surface-300'
                    }`} as="div">
                      {vehicle.name}
                    </Text>
                    <Text className="text-xs text-surface-500 dark:text-surface-400" as="div">
                      ₹{vehicle.baseFare}+ • {availableCount} available
                    </Text>
                  </motion.button>
                )
              })}
            </div>

            {/* Date and Time Selection */}
            <div className="mb-6">
              <Text className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                When do you need the ride?
              </Text>
              <div className="flex gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onScheduleTypeChange('now')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'now'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <ApperIcon name="Zap" size={16} className="mx-auto mb-1" />
                  <Text className="text-sm font-medium" as="div">Now</Text>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onScheduleTypeChange('later')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'later'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <ApperIcon name="Clock" size={16} className="mx-auto mb-1" />
                  <Text className="text-sm font-medium" as="div">Schedule Later</Text>
                </motion.button>
              </div>
              
              {scheduleType === 'later' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => onScheduledDateTimeChange(e.target.value)}
                    min={formatDateTime()}
                    className="w-full p-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </motion.div>
              )}
            </div>

            {/* Passenger Count */}
            <div className="mb-6">
              <Text className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                Number of passengers
              </Text>
              <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-700 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" size={20} className="text-surface-600 dark:text-surface-400" />
                  <Text className="text-surface-700 dark:text-surface-300">Passengers</Text>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={decrementPassengers}
                    disabled={passengerCount <= 1}
                    className="w-8 h-8 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    <ApperIcon name="Minus" size={16} />
                  </motion.button>
                  <Text className="text-lg font-semibold text-surface-900 dark:text-white min-w-[2rem] text-center">
                    {passengerCount}
                  </Text>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={incrementPassengers}
                    disabled={passengerCount >= 6}
                    className="w-8 h-8 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    <ApperIcon name="Plus" size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <Text className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                Special requests (optional)
              </Text>
              <div className="relative">
                <ApperIcon 
                  name="MessageSquare" 
                  size={20} 
                  className="absolute left-3 top-3 text-surface-400"
                />
                <textarea
                  value={specialRequests}
                  onChange={(e) => onSpecialRequestsChange(e.target.value)}
                  placeholder="Any special requirements for your ride..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )
      }
      
      export default VehicleSelector