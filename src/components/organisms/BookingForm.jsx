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
// Enhanced shared ride matching state (background only)
  const [matchResult, setMatchResult] = useState(null)
  
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
// Process booking directly for both shared and personal rides
    setIsBooking(true)
    setBookingTimer(3)
    toast.info('Processing your booking...')
  }
      
const completeBooking = async () => {
    let saveAttempts = 0;
    const maxSaveAttempts = 3;
    
    const attemptBookingSave = async () => {
      saveAttempts++;
      
      try {
        // Show saving progress
        toast.info(`💾 Saving booking... (Attempt ${saveAttempts}/${maxSaveAttempts})`)
        
        const available = getAvailableVehicles()
        if (available.length === 0) {
          throw new Error('No vehicles available for selected type')
        }
        
        const selectedVehicle = available[Math.floor(Math.random() * available.length)]
        
        const originalFare = (() => {
          const basePrice = vehicleTypes.find(v => v.type === selectedVehicleType)?.baseFare || 50
          const distance = Math.random() * 10 + 2
          return Math.round(basePrice + (distance * 8))
        })()
        
        // Pre-validate all required data
        const pickupAddress = pickupLocation.trim()
        const dropoffAddress = dropoffLocation.trim()
        
        if (!pickupAddress || !dropoffAddress) {
          throw new Error('Both pickup and dropoff locations are required')
        }
        
        if (!selectedVehicleType) {
          throw new Error('Vehicle type selection is required')
        }
        
        if (originalFare <= 0) {
          throw new Error('Invalid fare calculation')
        }
        
        if (passengerCount < 1 || passengerCount > 6) {
          throw new Error('Passenger count must be between 1 and 6')
        }
        
        const newRide = {
          vehicleType: selectedVehicleType,
          pickupLocation: { address: pickupAddress },
          dropoffLocation: { address: dropoffAddress },
          fare: rideType === 'shared' ? Math.round(originalFare * 0.7) : originalFare,
          originalFare: originalFare,
          status: 'pending', // Always start as pending for consistency
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
          userAgent: navigator.userAgent,
          clientTimestamp: Date.now(),
          ...(rideType === 'shared' && matchResult?.success && {
            matchedWith: matchResult.matchedRide?.id,
            estimatedPickupTime: matchResult.estimatedPickupTime,
            additionalPassengers: 1
          })
        }

        let createdRide;
        
        // Use different service methods based on ride type with enhanced error handling
        if (rideType === 'shared') {
          console.log('Creating shared ride booking:', newRide)
          createdRide = await rideService.createSharedRide(newRide)
        } else {
          console.log('Creating personal ride booking:', newRide)
          createdRide = await rideService.create(newRide)
        }
        
        // Comprehensive validation of saved booking
        if (!createdRide) {
          throw new Error('Save operation returned null result')
        }
        
        if (!createdRide.id) {
          throw new Error('Booking ID not generated')
        }

        // Verify all critical data was saved correctly
        const validationErrors = []
        
        if (!createdRide.pickupLocation?.address) {
          validationErrors.push('Pickup location not saved')
        }
        
        if (!createdRide.dropoffLocation?.address) {
          validationErrors.push('Dropoff location not saved')
        }
        
        if (!createdRide.vehicleType) {
          validationErrors.push('Vehicle type not saved')
        }
        
        if (!createdRide.fare || createdRide.fare <= 0) {
          validationErrors.push('Fare not saved correctly')
        }
        
        if (!createdRide.status) {
          validationErrors.push('Booking status not set')
        }
        
        if (!createdRide.bookingTime) {
          validationErrors.push('Booking time not saved')
        }
        
        if (validationErrors.length > 0) {
          throw new Error(`Data integrity check failed: ${validationErrors.join(', ')}`)
        }
        
        // Verify data consistency
        if (createdRide.pickupLocation.address !== pickupAddress) {
          throw new Error('Pickup location data mismatch detected')
        }
        
        if (createdRide.dropoffLocation.address !== dropoffAddress) {
          throw new Error('Dropoff location data mismatch detected')
        }
        
        if (createdRide.vehicleType !== selectedVehicleType) {
          throw new Error('Vehicle type data mismatch detected')
        }
        
        console.log('Booking validation completed successfully:', {
          id: createdRide.id,
          vehicleType: createdRide.vehicleType,
          rideType: createdRide.rideType,
          status: createdRide.status,
          fare: createdRide.fare
        })
        
        // Show success message
        const bookingType = rideType === 'shared' ? 'Shared ride' : 'Personal cab'
        toast.success(`✅ ${bookingType} booking saved successfully! All data verified.`, {
          autoClose: 5000
        })
        
        // Update parent component with new booking
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
        setMatchResult(null)
        
        // Navigate to booking confirmed page with ride data
        navigate('/booking-confirmed', { 
          state: { 
            bookingData: createdRide,
            bookingId: createdRide.id 
          } 
        })
        
        return createdRide;
        
      } catch (err) {
        console.error(`Booking save attempt ${saveAttempts} failed:`, err)
        
        // Determine if we should retry
        const isRetryableError = err.message.includes('network') || 
                                err.message.includes('timeout') || 
                                err.message.includes('connection') ||
                                err.message.includes('Save operation returned') ||
                                saveAttempts < 2;
        
        if (saveAttempts < maxSaveAttempts && isRetryableError) {
          toast.warning(`⚠️ Save attempt ${saveAttempts} failed. Retrying in 2 seconds...`, {
            autoClose: 2000
          })
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000))
          return attemptBookingSave()
        } else {
          // Final failure
          setError(err.message || 'Failed to save booking')
          setIsBooking(false)
          setBookingTimer(0)
          
          let errorMessage = err.message || 'Failed to save booking'
          let actionableTips = ''
          
          if (err.message.includes('network') || err.message.includes('connection')) {
            actionableTips = ' Please check your internet connection and try again.'
          } else if (err.message.includes('validation')) {
            actionableTips = ' Please verify all fields are filled correctly.'
          } else if (err.message.includes('integrity') || err.message.includes('mismatch')) {
            actionableTips = ' Please refresh the page and try booking again.'
          } else {
            actionableTips = ' Please try again or contact support if the issue persists.'
          }
          
          toast.error(`❌ ${errorMessage}${actionableTips}`, {
            autoClose: 10000,
            closeButton: true
          })
          
          // Show retry option for certain error types
          if (isRetryableError) {
            setTimeout(() => {
              toast.info('💡 You can try booking again when ready.', {
                autoClose: 5000
              })
            }, 1000)
          }
          
          throw err;
        }
      }
    }
    
    // Start the booking save process
    try {
      await attemptBookingSave()
    } catch (finalError) {
      console.error('All booking save attempts failed:', finalError)
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
              {!isBooking && (
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
                      {rideType === 'shared' ? 'Book Shared Ride - 30% Off' : 'Book Now - Instant Confirmation'}
                    </span>
                  )}
                </Button>
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