import ApperIcon from '@/components/ApperIcon'
      import Card from '@/components/atoms/Card'
      import Text from '@/components/atoms/Text'
      
      const RideCard = ({ ride }) => {
return (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ApperIcon name="Car" size={20} className="text-primary" />
              </div>
              <div>
                <Text as="div" className="font-medium text-surface-900 dark:text-white capitalize">
                  {ride.vehicleType} Ride
                </Text>
                <Text className="text-sm text-surface-600 dark:text-surface-400">
                  {ride.pickupLocation?.address} → {ride.dropoffLocation?.address}
                </Text>
              </div>
            </div>
            <div className="text-right">
              <Text as="div" className="font-bold text-surface-900 dark:text-white">
                ₹{ride.fare}
              </Text>
              <Text className="text-sm text-surface-600 dark:text-surface-400">
                {ride.status}
              </Text>
            </div>
          </div>
        </Card>
      )
    }
      
      export default RideCard