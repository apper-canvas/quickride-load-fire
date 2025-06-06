import { useState, useEffect } from 'react'
      import { AnimatePresence, motion } from 'framer-motion'
      import { toast } from 'react-toastify'
      import ApperIcon from '@/components/ApperIcon'
      import Button from '@/components/atoms/Button'
      import VehicleSelector from '@/components/molecules/VehicleSelector'
      import LocationInput from '@/components/molecules/LocationInput'
      import FareEstimate from '@/components/molecules/FareEstimate'
      import BookingConfirmation from '@/components/molecules/BookingConfirmation'
      import rideService from '@/services/api/rideService'
      import vehicleService from '@/services/api/vehicleService'
      
      const vehicleTypes = [
        { type: 'bike', icon: 'Bike', name: 'Bike', baseFare: 50 },
        { type: 'auto', icon: 'Car', name: 'Auto', baseFare: 80 },
        { type: 'taxi', icon: 'Car', name: 'Taxi', baseFare: 120 },
        { type: 'car', icon: 'Car', name: 'Car', baseFare: 200 }
      ]
      
      const BookingForm = ({ onRideBooked }) => {
        const [vehicles, setVehicles] = useState([])
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState(null)
        const [selectedVehicleType, setSelectedVehicleType] = useState('bike')
        const [pickupLocation, setPickupLocation] = useState('')
        const [dropoffLocation, setDropoffLocation] = useState('')
        const [bookingTimer, setBookingTimer] = useState(0)
        const [isBooking, setIsBooking] = useState(false)
        const [currentRide, setCurrentRide] = useState(null)
      
        useEffect(() => {
          loadVehicles()
        }, [])
      
        useEffect(() => {
          let timer
          if (isBooking && bookingTimer > 0) {
            timer = setTimeout(() => {
              setBookingTimer(prev => prev - 1)
            }, 1000)
          } else if (isBooking && bookingTimer === 0) {
            completeBooking()
          }
          return () => clearTimeout(timer)
        }, [isBooking, bookingTimer])
      
        const loadVehicles = async () => {
          setLoading(true)
          setError(null)
          try {
            const vehiclesData = await vehicleService.getAll()
            setVehicles(vehiclesData || [])
          } catch (err) {
            setError(err.message)
            toast.error('Failed to load vehicle data')
          } finally {
            setLoading(false)
          }
        }
      
        const getAvailableVehicles = (type = selectedVehicleType) => {
          return vehicles?.filter(vehicle => 
            vehicle.type === type && vehicle.available
          ) || []
        }
      
        const getAvailableCount = (type) => {
          return getAvailableVehicles(type).length
        }
      
        const calculateFare = () => {
          const basePrice = vehicleTypes.find(v => v.type === selectedVehicleType)?.baseFare || 50
          const distance = Math.random() * 10 + 2 // Mock distance
          return Math.round(basePrice + (distance * 8))
        }
      
        const startBooking = () => {
          if (!pickupLocation.trim() || !dropoffLocation.trim()) {
            toast.error('Please enter both pickup and dropoff locations')
            return
          }
      
          const availableCount = getAvailableCount(selectedVehicleType)
          if (availableCount === 0) {
            toast.error('No vehicles available for this type')
            return
          }
      
          setIsBooking(true)
          setBookingTimer(60)
          toast.info('Finding the best ride for you...')
        }
      
        const completeBooking = async () => {
          try {
            const available = getAvailableVehicles()
            const selectedVehicle = available[Math.floor(Math.random() * available.length)]
            
            const newRide = {
              vehicleType: selectedVehicleType,
              pickupLocation: { address: pickupLocation },
              dropoffLocation: { address: dropoffLocation },
              fare: calculateFare(),
              status: 'confirmed',
              driverInfo: {
                name: selectedVehicle?.driverName || 'Driver',
                rating: selectedVehicle?.rating || 4.5,
                vehicleNumber: selectedVehicle?.vehicleNumber || 'ABC123'
              },
              eta: `${Math.floor(Math.random() * 10) + 3} mins`
            }
      
            const createdRide = await rideService.create(newRide)
            setCurrentRide(createdRide)
            onRideBooked(createdRide)
            setIsBooking(false)
            setBookingTimer(0)
            
            toast.success('Ride booked successfully!')
          } catch (err) {
            setError(err.message)
            toast.error('Failed to book ride')
            setIsBooking(false)
            setBookingTimer(0)
          }
        }
      
        const cancelBooking = () => {
          setIsBooking(false)
          setBookingTimer(0)
          toast.info('Booking cancelled')
        }
      
        if (loading) {
          return (
            &lt;div className="flex items-center justify-center h-96"&gt;
              &lt;motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              /&gt;
            &lt;/div&gt;
          )
        }
      
        return (
          &lt;div className="p-6"&gt;
            &lt;VehicleSelector
              vehicleTypes={vehicleTypes}
              selectedVehicleType={selectedVehicleType}
              onSelect={setSelectedVehicleType}
              getAvailableCount={getAvailableCount}
            /&gt;
      
            &lt;div className="space-y-4 mb-6"&gt;
              &lt;LocationInput
                label="Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup location"
                iconName="MapPin"
              /&gt;
              &lt;LocationInput
                label="Dropoff Location"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Enter destination"
                iconName="Navigation"
              /&gt;
            &lt;/div&gt;
      
            {pickupLocation && dropoffLocation && (
              &lt;FareEstimate fare={calculateFare()} eta={`${Math.floor(Math.random() * 10) + 3}`} /&gt;
            )}
      
            &lt;AnimatePresence&gt;
              {!isBooking && !currentRide && (
                &lt;Button
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-soft hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  onClick={startBooking}
                  disabled={!pickupLocation || !dropoffLocation}
                  motionProps={{initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }}}
                  iconName="Zap"
                  iconSize={20}
                &gt;
                  &lt;span&gt;Book Now - 60 Second Guarantee&lt;/span&gt;
                &lt;/Button&gt;
              )}
      
              {isBooking && (
                &lt;motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-4"
                &gt;
                  &lt;div className="text-2xl font-bold text-primary"&gt;
                    {bookingTimer}s
                  &lt;/div&gt;
                  &lt;div className="text-surface-600 dark:text-surface-400"&gt;
                    Finding your perfect ride...
                  &lt;/div&gt;
                  &lt;Button
                    onClick={cancelBooking}
                    className="px-6 py-2 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  &gt;
                    Cancel
                  &lt;/Button&gt;
                &lt;/motion.div&gt;
              )}
      
              {currentRide && (
                &lt;BookingConfirmation currentRide={currentRide} /&gt;
              )}
            &lt;/AnimatePresence&gt;
          &lt;/div&gt>
        )
      }
      
      export default BookingForm