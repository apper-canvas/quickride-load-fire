import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = ({ isDarkMode, setIsDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 transition-all duration-500">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft">
                <ApperIcon name="Car" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                  QuickRide
                </h1>
                <p className="text-xs text-surface-600 dark:text-surface-400">
                  Book in 60 seconds
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-surface-600 dark:text-surface-400">
                {currentTime.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  size={18} 
                  className="text-surface-700 dark:text-surface-300"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative">
        <MainFeature />
        
        {/* Quick Stats */}
        <motion.section 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card text-center">
              <ApperIcon name="Users" size={24} className="text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900 dark:text-white">50K+</div>
              <div className="text-sm text-surface-600 dark:text-surface-400">Active Users</div>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card text-center">
              <ApperIcon name="MapPin" size={24} className="text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900 dark:text-white">10+</div>
              <div className="text-sm text-surface-600 dark:text-surface-400">Cities</div>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card text-center">
              <ApperIcon name="Clock" size={24} className="text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900 dark:text-white">2 min</div>
              <div className="text-sm text-surface-600 dark:text-surface-400">Avg Wait</div>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card text-center">
              <ApperIcon name="Star" size={24} className="text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900 dark:text-white">4.8</div>
              <div className="text-sm text-surface-600 dark:text-surface-400">Rating</div>
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <h2 className="text-3xl font-heading font-bold text-center text-surface-900 dark:text-white mb-8">
            Why Choose QuickRide?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ApperIcon name="Zap" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                Book any ride in under 60 seconds with our streamlined interface
              </p>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <ApperIcon name="Shield" size={24} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                Safe & Secure
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                All drivers are verified with real-time tracking for your safety
              </p>
            </div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <ApperIcon name="DollarSign" size={24} className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                Best Prices
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                Compare prices across all vehicle types to find the best deal
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

export default Home