import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import rideService from '../services/api/rideService'
import vehicleService from '../services/api/vehicleService'

const MainFeature = () => {
  const [rides, setRides] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedVehicleType, setSelectedVehicleType] = useState('bike')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [bookingTimer, setBookingTimer] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
  const [currentRide, setCurrentRide] = useState(null)

  const vehicleTypes = [
    { type: 'bike', icon: 'Bike', name: 'Bike', baseFare: 50 },
    { type: 'auto', icon: 'Car', name: 'Auto', baseFare: 80 },
    { type: 'taxi', icon: 'Car', name: 'Taxi', baseFare: 120 },
    { type: 'car', icon: 'Car', name: 'Car', baseFare: 200 }
  ]

  useEffect(() => {
    loadData()
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

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ridesData, vehiclesData] = await Promise.all([
        rideService.getAll(),
        vehicleService.getAll()
      ])
      setRides(ridesData || [])
      setVehicles(vehiclesData || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableVehicles = () => {
    return vehicles?.filter(vehicle => 
      vehicle.type === selectedVehicleType && vehicle.available
    ) || []
  }

  const calculateFare = () => {
    const basePrice = vehicleTypes.find(v => v.type === selectedVehicleType)?.baseFare || 50
    const distance = Math.random() * 10 + 2 // Mock distance
    return Math.round(basePrice + (distance * 8))
  }

  const startBooking = async () => {
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      toast.error('Please enter both pickup and dropoff locations')
      return
    }

    const availableVehicles = getAvailableVehicles()
    if (availableVehicles.length === 0) {
      toast.error('No vehicles available for this type')
      return
    }

    setIsBooking(true)
    setBookingTimer(60)
    toast.info('Finding the best ride for you...')
  }

  const completeBooking = async () => {
    try {
      const availableVehicles = getAvailableVehicles()
      const selectedVehicle = availableVehicles[Math.floor(Math.random() * availableVehicles.length)]
      
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
      setRides(prev => [createdRide, ...prev])
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
      <div className="flex items-center justify-center h-96">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-800 rounded-3xl shadow-soft overflow-hidden"
      >
        {/* Map Area */}
        <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515569067071-ec3b51335dd3?w=800')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <ApperIcon name="MapPin" size={24} className="text-white" />
            </motion.div>
          </div>
          
          {/* Vehicle Markers */}
          {getAvailableVehicles().slice(0, 5).map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-md"
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + index * 10}%`
              }}
            >
              <ApperIcon name="Car" size={14} className="text-white" />
            </motion.div>
          ))}
        </div>

        {/* Booking Interface */}
        <div className="p-6">
          {/* Vehicle Type Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3">
              Choose Your Ride
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {vehicleTypes.map((vehicle) => {
                const isSelected = selectedVehicleType === vehicle.type
                const availableCount = getAvailableVehicles().length
                return (
                  <motion.button
                    key={vehicle.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVehicleType(vehicle.type)}
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
                    <div className={`text-sm font-medium ${
                      isSelected ? 'text-primary' : 'text-surface-700 dark:text-surface-300'
                    }`}>
                      {vehicle.name}
                    </div>
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      ₹{vehicle.baseFare}+ • {availableCount} available
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Location Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <ApperIcon name="MapPin" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full pl-10 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Dropoff Location
              </label>
              <div className="relative">
                <ApperIcon name="Navigation" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full pl-10 pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Fare Estimate */}
          {pickupLocation && dropoffLocation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-50 dark:bg-surface-700 rounded-2xl p-4 mb-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-surface-600 dark:text-surface-400">Estimated Fare</div>
                  <div className="text-2xl font-bold text-surface-900 dark:text-white">
                    ₹{calculateFare()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-surface-600 dark:text-surface-400">ETA</div>
                  <div className="text-lg font-semibold text-surface-900 dark:text-white">
                    {Math.floor(Math.random() * 10) + 3} mins
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Booking Button */}
          <AnimatePresence>
            {!isBooking && !currentRide && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startBooking}
                disabled={!pickupLocation || !dropoffLocation}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-soft hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ApperIcon name="Zap" size={20} />
                  <span>Book Now - 60 Second Guarantee</span>
                </div>
              </motion.button>
            )}

            {isBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4"
              >
                <div className="text-2xl font-bold text-primary">
                  {bookingTimer}s
                </div>
                <div className="text-surface-600 dark:text-surface-400">
                  Finding your perfect ride...
                </div>
                <button
                  onClick={cancelBooking}
                  className="px-6 py-2 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {currentRide && (
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
                    <span className="text-surface-600 dark:text-surface-400">Driver:</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {currentRide.driverInfo?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">Vehicle:</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {currentRide.driverInfo?.vehicleNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">ETA:</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {currentRide.eta}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">Fare:</span>
                    <span className="font-bold text-surface-900 dark:text-white">
                      ₹{currentRide.fare}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recent Rides */}
      {rides.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
            Recent Rides
          </h3>
          <div className="grid gap-4">
            {rides.slice(0, 3).map((ride) => (
              <div 
                key={ride.id} 
                className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <ApperIcon name="Car" size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-surface-900 dark:text-white capitalize">
                        {ride.vehicleType} Ride
                      </div>
                      <div className="text-sm text-surface-600 dark:text-surface-400">
                        {ride.pickupLocation?.address} → {ride.dropoffLocation?.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-surface-900 dark:text-white">
                      ₹{ride.fare}
                    </div>
                    <div className="text-sm text-surface-600 dark:text-surface-400">
                      {ride.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}

export default MainFeature