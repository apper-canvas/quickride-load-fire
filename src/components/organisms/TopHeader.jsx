import { useState, useEffect } from 'react'
      import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      import Button from '@/components/atoms/Button'
      import IconWrapper from '@/components/atoms/IconWrapper'
      
      const TopHeader = ({ isDarkMode, setIsDarkMode }) => {
        const [currentTime, setCurrentTime] = useState(new Date())
      
        useEffect(() => {
          const timer = setInterval(() => setCurrentTime(new Date()), 1000)
          return () => clearInterval(timer)
        }, [])
return (
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <IconWrapper 
                    wrapperClass="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft"
                    iconName="Car" 
                    iconSize={20} 
                    iconClass="text-white" 
                  />
                  <div>
                    <Text as="h1" className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                      QuickRide
                    </Text>
                    <Text className="text-xs text-surface-600 dark:text-surface-400">
                      Book in 60 seconds
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Text className="hidden sm:block text-sm text-surface-600 dark:text-surface-400">
                    {currentTime.toLocaleTimeString()}
                  </Text>
                  <Button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                    iconName={isDarkMode ? "Sun" : "Moon"} 
                    iconSize={18} 
                    iconClass="text-surface-700 dark:text-surface-300"
                  />
                </div>
              </div>
            </div>
          </motion.header>
        )
      }
      
      export default TopHeader