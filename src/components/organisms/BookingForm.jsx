import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import VehicleSelector from '@/components/molecules/VehicleSelector'
import LocationInput from '@/components/molecules/LocationInput'
import FareEstimate from '@/components/molecules/FareEstimate'
import rideService from '@/services/api/rideService'
import vehicleService from '@/services/api/vehicleService'
import locationService from '@/services/api/locationService'
const vehicleTypes = [
  { type: 'bike', icon: 'Bike', name: 'Bike', baseFare: 50 },
  { type: 'auto', icon: 'Car', name: 'Auto', baseFare: 80 },
  { type: 'taxi', icon: 'Car', name: 'Taxi', baseFare: 120 },
  { type: 'car', icon: 'Car', name: 'Car', baseFare: 200 }
]
      
const BookingForm = ({ onRideBooked }) => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedVehicleType, setSelectedVehicleType] = useState('bike')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [bookingTimer, setBookingTimer] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
// New state for enhanced booking features
  const [scheduleType, setScheduleType] = useState('now')
  const [scheduledDateTime, setScheduledDateTime] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [rideType, setRideType] = useState('personal')
  
  // Shared ride matching state
  const [isMatching, setIsMatching] = useState(false)
  const [matchingTimer, setMatchingTimer] = useState(0)
  const [matchResult, setMatchResult] = useState(null)
  const [showFallbackOption, setShowFallbackOption] = useState(false)
  
  // Location validation state
  const [locationError, setLocationError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [locationValid, setLocationValid] = useState(false)
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

  // Shared ride matching timer
  useEffect(() => {
    let timer
    if (isMatching && matchingTimer > 0) {
      timer = setTimeout(() => {
        setMatchingTimer(prev => prev - 1)
      }, 1000)
    } else if (isMatching && matchingTimer === 0) {
      handleMatchingTimeout()
    }
    return () => clearTimeout(timer)
  }, [isMatching, matchingTimer])

  // Validate locations when they change
  useEffect(() => {
    const validateLocations = async () => {
      if (pickupLocation.trim() && dropoffLocation.trim()) {
        setIsValidating(true)
        setLocationError('')
        
        try {
          const validation = await locationService.validateBookingLocations(
            pickupLocation.trim(),
            dropoffLocation.trim()
          )
          
          if (!validation.isValid) {
            setLocationError(validation.error)
            setLocationValid(false)
          } else {
            setLocationError('')
            setLocationValid(true)
            toast.success(`Route validated: ${validation.distance}km distance`)
          }
        } catch (err) {
          setLocationError('Failed to validate locations')
          setLocationValid(false)
        } finally {
          setIsValidating(false)
        }
      } else {
        setLocationError('')
        setLocationValid(false)
        setIsValidating(false)
      }
    }

    const debounceTimer = setTimeout(validateLocations, 1000)
    return () => clearTimeout(debounceTimer)
  }, [pickupLocation, dropoffLocation])

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
          const baseFare = Math.round(basePrice + (distance * 8))
          return rideType === 'shared' ? Math.round(baseFare * 0.7) : baseFare
        }
      
const startBooking = () => {
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      toast.error('Please enter both pickup and dropoff locations')
      return
    }

    if (locationError) {
      toast.error(locationError)
      return
    }

    if (!locationValid) {
      toast.error('Please wait for location validation to complete')
      return
    }

    const availableCount = getAvailableCount(selectedVehicleType)
    if (availableCount === 0) {
      toast.error('No vehicles available for this type')
      return
    }

    if (rideType === 'shared') {
      startSharedRideMatching()
    } else {
      setIsBooking(true)
      setBookingTimer(3)
      toast.info('Processing your booking...')
    }
  }

  const startSharedRideMatching = async () => {
    setIsMatching(true)
    setMatchingTimer(300) // 5 minutes for matching
    setShowFallbackOption(false)
    toast.info('🔍 Finding shared ride matches...')

    try {
      const rideRequest = {
        pickupLocation: { address: pickupLocation },
        dropoffLocation: { address: dropoffLocation },
        vehicleType: selectedVehicleType,
        passengerCount,
        rideType: 'shared'
      }

      const matchResult = await rideService.findSharedRideMatches(rideRequest)
      setMatchResult(matchResult)

      if (matchResult.success) {
        toast.success('✅ Shared ride match found!')
        setIsMatching(false)
        setMatchingTimer(0)
        proceedWithSharedBooking(matchResult)
      } else {
        // Continue searching for a bit more time
        setTimeout(() => {
          if (isMatching) {
            handleMatchingTimeout()
          }
        }, 10000) // Show fallback after 10 seconds instead of full 5 minutes for demo
      }
    } catch (error) {
      toast.error('Error finding shared ride matches')
      handleMatchingTimeout()
    }
  }

  const handleMatchingTimeout = () => {
    setIsMatching(false)
    setMatchingTimer(0)
    setShowFallbackOption(true)
    toast.warning('No shared ride matches found. Book a personal cab instead?')
  }

  const proceedWithSharedBooking = async (matchResult) => {
    setIsBooking(true)
    setBookingTimer(3)
    toast.info('Confirming your shared ride...')
  }

  const bookPersonalCabFallback = () => {
    setRideType('personal')
    setShowFallbackOption(false)
    setIsBooking(true)
    setBookingTimer(3)
    toast.info('Booking personal cab...')
  }

  const cancelSharedRideSearch = () => {
    setIsMatching(false)
    setMatchingTimer(0)
    setShowFallbackOption(false)
    toast.info('Shared ride search cancelled')
  }
      
const completeBooking = async () => {
    try {
      const available = getAvailableVehicles()
      const selectedVehicle = available[Math.floor(Math.random() * available.length)]
      
      const originalFare = (() => {
        const basePrice = vehicleTypes.find(v => v.type === selectedVehicleType)?.baseFare || 50
        const distance = Math.random() * 10 + 2
        return Math.round(basePrice + (distance * 8))
      })()
      
      const newRide = {
        vehicleType: selectedVehicleType,
        pickupLocation: { address: pickupLocation },
        dropoffLocation: { address: dropoffLocation },
        fare: rideType === 'shared' ? Math.round(originalFare * 0.7) : originalFare,
        originalFare: originalFare,
        status: rideType === 'shared' ? 'confirmed' : 'pending',
        rideType,
        scheduleType,
        scheduledDateTime: scheduleType === 'later' ? scheduledDateTime : null,
        passengerCount,
        specialRequests: specialRequests.trim() || null,
        driverInfo: {
          name: selectedVehicle?.driverName || `Driver ${Math.floor(Math.random() * 999) + 1}`,
          rating: selectedVehicle?.rating || (4.0 + Math.random()).toFixed(1),
          vehicleNumber: selectedVehicle?.vehicleNumber || `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
          photo: `https://ui-avatars.com/api/?name=${selectedVehicle?.driverName || 'Driver'}&size=128&background=random`
        },
eta: `${Math.floor(Math.random() * 10) + 3} mins`,
        bookingId: `QR${Date.now()}`,
        bookingTime: scheduleType === 'now' ? new Date().toISOString() : (scheduledDateTime || new Date().toISOString()),
        createdAt: new Date().toISOString(),
        bookingType: scheduleType === 'now' ? 'immediate' : 'scheduled',
        ...(rideType === 'shared' && matchResult?.success && {
          matchedWith: matchResult.matchedRide?.id,
          estimatedPickupTime: matchResult.estimatedPickupTime,
          additionalPassengers: 1
        })
      }

      const createdRide = await rideService.create(newRide)
      onRideBooked?.(createdRide)
      setIsBooking(false)
      setBookingTimer(0)
      
// Reset form
      setPickupLocation('')
      setDropoffLocation('')
      setSpecialRequests('')
      setLocationError('')
      setLocationValid(false)
      setRideType('personal')
      setIsMatching(false)
      setMatchingTimer(0)
      setMatchResult(null)
      setShowFallbackOption(false)
      toast.success('🎉 Ride booked successfully!')
      
      // Navigate to booking confirmed page with ride data
      navigate('/booking-confirmed', { 
        state: { 
          bookingData: createdRide,
          bookingId: createdRide.id 
        } 
      })
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
          <div className="p-6">
            <VehicleSelector
              vehicleTypes={vehicleTypes}
              selectedVehicleType={selectedVehicleType}
              onSelect={setSelectedVehicleType}
              getAvailableCount={getAvailableCount}
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              scheduledDateTime={scheduledDateTime}
              onScheduledDateTimeChange={setScheduledDateTime}
              passengerCount={passengerCount}
              onPassengerCountChange={setPassengerCount}
              specialRequests={specialRequests}
              onSpecialRequestsChange={setSpecialRequests}
              rideType={rideType}
              onRideTypeChange={setRideType}
            />
      
            <div className="space-y-4 mb-6">
              <LocationInput
                label="Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup location (e.g., Mumbai, Delhi)"
                iconName="MapPin"
              />
              <LocationInput
                label="Dropoff Location"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Enter destination (e.g., Bangalore, Chennai)"
                iconName="Navigation"
              />
              
              {/* Location Validation Feedback */}
              {isValidating && (
                <div className="flex items-center text-blue-600 text-sm">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"
                  />
                  Validating locations...
                </div>
              )}
              
              {locationError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  <ApperIcon name="AlertCircle" size={16} className="mr-2 flex-shrink-0" />
                  {locationError}
                </motion.div>
              )}
              
              {locationValid && !locationError && pickupLocation && dropoffLocation && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  <ApperIcon name="CheckCircle" size={16} className="mr-2 flex-shrink-0" />
                  Locations validated successfully
                </motion.div>
              )}
            </div>
      
{pickupLocation && dropoffLocation && (
              <FareEstimate 
                fare={(() => {
                  const basePrice = vehicleTypes.find(v => v.type === selectedVehicleType)?.baseFare || 50
                  const distance = Math.random() * 10 + 2
                  return Math.round(basePrice + (distance * 8))
                })()} 
                eta={`${Math.floor(Math.random() * 10) + 3}`} 
                rideType={rideType}
              />
            )}
      
<AnimatePresence>
              {!isBooking && !isMatching && !showFallbackOption && (
                <Button
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-soft hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    rideType === 'shared' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-primary to-primary-dark text-white'
                  }`}
                  onClick={startBooking}
                  disabled={!pickupLocation || !dropoffLocation || !locationValid || isValidating || !!locationError}
                  motionProps={{initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }}}
                  iconName={rideType === 'shared' ? 'Users' : 'Zap'}
                  iconSize={20}
                >
                  {isValidating ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>
                      {rideType === 'shared' ? 'Find Shared Ride - 30% Off' : 'Book Now - Instant Confirmation'}
                    </span>
                  )}
                </Button>
              )}

              {/* Shared Ride Matching Status */}
              {isMatching && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"
                    />
                    <ApperIcon name="Users" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      Finding Shared Ride Match
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {Math.floor(matchingTimer / 60)}:{(matchingTimer % 60).toString().padStart(2, '0')} remaining
                    </div>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    We're finding other passengers heading in your direction...
                  </div>
                  <Button
                    onClick={cancelSharedRideSearch}
                    className="px-6 py-2 border border-green-300 dark:border-green-600 rounded-xl text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                  >
                    Cancel Search
                  </Button>
                </motion.div>
              )}

              {/* Fallback Option */}
              {showFallbackOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800"
                >
                  <div className="text-center">
                    <ApperIcon name="AlertCircle" size={24} className="text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                      No Shared Rides Available
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Would you like to book a personal cab instead?
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowFallbackOption(false)}
                      className="px-4 py-2 border border-orange-300 dark:border-orange-600 rounded-xl text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                    >
                      Try Again Later
                    </Button>
                    <Button
                      onClick={bookPersonalCabFallback}
                      className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Book Personal Cab
                    </Button>
                  </div>
                </motion.div>
              )}
      
{isBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`text-center space-y-4 p-6 rounded-2xl ${
                    rideType === 'shared' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-surface-50 dark:bg-surface-700'
                  }`}
                >
                  <div className={`text-2xl font-bold ${
                    rideType === 'shared' ? 'text-green-600' : 'text-primary'
                  }`}>
                    {bookingTimer}s
                  </div>
                  <div className="text-surface-600 dark:text-surface-400">
                    {rideType === 'shared' 
                      ? (bookingTimer > 1 ? 'Confirming your shared ride...' : 'Almost ready!')
                      : (bookingTimer > 1 ? 'Processing your booking...' : 'Almost ready!')
                    }
                  </div>
                  <Button
                    onClick={cancelBooking}
                    className="px-6 py-2 border border-surface-300 dark:border-surface-600 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </Button>
</motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }
      export default BookingForm