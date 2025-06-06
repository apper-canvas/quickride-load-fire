import ApperIcon from '@/components/ApperIcon'
      import Card from '@/components/atoms/Card'
      import Text from '@/components/atoms/Text'
      
      const RideCard = ({ ride }) => {
        return (
          &lt;Card className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div className="flex items-center space-x-3"&gt;
                &lt;div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"&gt;
                  &lt;ApperIcon name="Car" size={20} className="text-primary" /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;Text as="div" className="font-medium text-surface-900 dark:text-white capitalize"&gt;
                    {ride.vehicleType} Ride
                  &lt;/Text&gt;
                  &lt;Text className="text-sm text-surface-600 dark:text-surface-400"&gt;
                    {ride.pickupLocation?.address} → {ride.dropoffLocation?.address}
                  &lt;/Text&gt;
                &lt;/div&gt;
              &lt;/div&gt;
              &lt;div className="text-right"&gt;
                &lt;Text as="div" className="font-bold text-surface-900 dark:text-white"&gt;
                  ₹{ride.fare}
                &lt;/Text&gt;
                &lt;Text className="text-sm text-surface-600 dark:text-surface-400"&gt;
                  {ride.status}
                &lt;/Text&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/Card&gt;
        )
      }
      
      export default RideCard