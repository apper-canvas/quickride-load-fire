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
          &lt;motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50"
          &gt;
            &lt;div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
              &lt;div className="flex justify-between items-center h-16"&gt;
                &lt;div className="flex items-center space-x-3"&gt;
                  &lt;IconWrapper 
                    wrapperClass="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft"
                    iconName="Car" 
                    iconSize={20} 
                    iconClass="text-white" 
                  /&gt;
                  &lt;div&gt;
                    &lt;Text as="h1" className="text-2xl font-heading font-bold text-surface-900 dark:text-white"&gt;
                      QuickRide
                    &lt;/Text&gt;
                    &lt;Text className="text-xs text-surface-600 dark:text-surface-400"&gt;
                      Book in 60 seconds
                    &lt;/Text&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                
                &lt;div className="flex items-center space-x-4"&gt;
                  &lt;Text className="hidden sm:block text-sm text-surface-600 dark:text-surface-400"&gt;
                    {currentTime.toLocaleTimeString()}
                  &lt;/Text&gt;
                  &lt;Button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                    iconName={isDarkMode ? "Sun" : "Moon"} 
                    iconSize={18} 
                    iconClass="text-surface-700 dark:text-surface-300"
                  /&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/motion.header&gt;
        )
      }
      
      export default TopHeader