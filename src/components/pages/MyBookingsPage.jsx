import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopHeader from '@/components/organisms/TopHeader'
import RecentRidesSection from '@/components/organisms/RecentRidesSection'
import Text from '@/components/atoms/Text'
import Button from '@/components/atoms/Button'
import IconWrapper from '@/components/atoms/IconWrapper'
import ApperIcon from '@/components/ApperIcon'
import rideService from '@/services/api/rideService'

const MyBookingsPage = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRides()
  }, [])

  const loadRides = async () => {
    setLoading(true)
    setError(null)
    try {
      const ridesData = await rideService.getAll()
      setRides(ridesData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadRides()
  }

  return (
    <div className={`min-h-screen bg-surface-50 dark:bg-surface-900 ${isDarkMode ? 'dark' : ''}`}>
      <TopHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon name="ArrowLeft" size={18} className="text-surface-600 dark:text-surface-400" />
                <Text className="text-surface-600 dark:text-surface-400">Back to Home</Text>
              </Button>
              
              <div className="flex items-center space-x-3">
                <IconWrapper 
                  wrapperClass="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft"
                  iconName="BookOpen" 
                  iconSize={24} 
                  iconClass="text-white" 
                />
                <div>
                  <Text as="h1" className="text-3xl font-heading font-bold text-surface-900 dark:text-white">
                    My Bookings
                  </Text>
                  <Text className="text-surface-600 dark:text-surface-400">
                    Manage all your ride bookings
                  </Text>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <ApperIcon 
                name="RotateCcw" 
                size={18} 
                className={`${loading ? 'animate-spin' : ''}`} 
              />
              <Text className="hidden sm:inline">Refresh</Text>
            </Button>
          </div>
        </motion.div>

        {/* Bookings Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { 
              label: 'Total Bookings', 
              value: rides?.length || 0, 
              icon: 'Calendar',
              color: 'bg-blue-500'
            },
            { 
              label: 'Pending', 
              value: rides?.filter(r => r.status === 'pending').length || 0, 
              icon: 'Clock',
              color: 'bg-yellow-500'
            },
            { 
              label: 'Confirmed', 
              value: rides?.filter(r => r.status === 'confirmed').length || 0, 
              icon: 'CheckCircle',
              color: 'bg-green-500'
            },
            { 
              label: 'Completed', 
              value: rides?.filter(r => r.status === 'completed').length || 0, 
              icon: 'Flag',
              color: 'bg-purple-500'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-soft border border-surface-200 dark:border-surface-700"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <ApperIcon name={stat.icon} size={20} className="text-white" />
                </div>
                <div>
                  <Text className="text-2xl font-bold text-surface-900 dark:text-white">
                    {stat.value}
                  </Text>
                  <Text className="text-xs text-surface-600 dark:text-surface-400">
                    {stat.label}
                  </Text>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Bookings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-800 rounded-3xl shadow-soft overflow-hidden border border-surface-200 dark:border-surface-700"
        >
          <div className="p-6">
            <RecentRidesSection 
              rides={rides} 
              loading={loading} 
              error={error} 
              onRefresh={handleRefresh}
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {!loading && !error && rides?.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
              <ApperIcon name="BookOpen" size={32} className="text-surface-400 dark:text-surface-500" />
            </div>
            <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              No bookings yet
            </Text>
            <Text className="text-surface-600 dark:text-surface-400 mb-6">
              Start by booking your first ride to see your bookings here.
            </Text>
            <Button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Book Your First Ride
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MyBookingsPage