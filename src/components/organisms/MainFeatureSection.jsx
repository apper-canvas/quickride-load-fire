import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import BookingForm from '@/components/organisms/BookingForm'
      import RecentRidesSection from '@/components/organisms/RecentRidesSection'
      import { useState, useEffect } from 'react'
      import rideService from '@/services/api/rideService'
      
      const MainFeatureSection = () => {
        const [rides, setRides] = useState([])
        const [loadingRides, setLoadingRides] = useState(false)
        const [errorRides, setErrorRides] = useState(null)
      
        useEffect(() => {
          loadRides()
        }, [])
      
        const loadRides = async () => {
          setLoadingRides(true)
          setErrorRides(null)
          try {
            const ridesData = await rideService.getAll()
            setRides(ridesData || [])
          } catch (err) {
            setErrorRides(err.message)
          } finally {
            setLoadingRides(false)
          }
        }
      
        const handleRideBooked = (newRide) => {
          setRides(prev => [newRide, ...prev])
        }
      
        // Mock function to get available vehicles for map markers
        const getMockAvailableVehicles = (type) => {
          // In a real app, this would query based on type and availability
          // For now, return a fixed number of mock vehicles
          const mockVehicles = [
            { id: 'v1', type: 'bike', available: true },
            { id: 'v2', type: 'auto', available: true },
            { id: 'v3', type: 'taxi', available: true },
            { id: 'v4', type: 'car', available: true },
            { id: 'v5', type: 'bike', available: true },
          ];
          return mockVehicles.filter(v => v.type === type);
        };
      
        const availableMapVehicles = getMockAvailableVehicles('car'); // Showing 'car' icons on map
      
        return (
          &lt;div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"&gt;
            &lt;motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-800 rounded-3xl shadow-soft overflow-hidden"
            &gt;
              {/* Map Area */}
              &lt;div className="h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 relative overflow-hidden"&gt;
                &lt;div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515569067071-ec3b51335dd3?w=800')] bg-cover bg-center opacity-20" /&gt;
                &lt;div className="absolute inset-0 flex items-center justify-center"&gt;
                  &lt;motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
                  &gt;
                    &lt;ApperIcon name="MapPin" size={24} className="text-white" /&gt;
                  &lt;/motion.div&gt;
                &lt;/div&gt;
                
                {/* Vehicle Markers */}
                {availableMapVehicles.slice(0, 5).map((vehicle, index) => (
                  &lt;motion.div
                    key={vehicle.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="absolute w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-md"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                  &gt;
                    &lt;ApperIcon name="Car" size={14} className="text-white" /&gt;
                  &lt;/motion.div&gt;
                ))}
              &lt;/div&gt;
      
              {/* Booking Interface */}
              &lt;BookingForm onRideBooked={handleRideBooked} /&gt;
            &lt;/motion.div&gt;
      
            &lt;RecentRidesSection rides={rides} loading={loadingRides} error={errorRides} /&gt;
          &lt;/div&gt;
        )
      }
      
      export default MainFeatureSection