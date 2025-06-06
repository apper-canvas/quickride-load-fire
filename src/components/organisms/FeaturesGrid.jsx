import { motion } from 'framer-motion'
      import FeatureCard from '@/components/molecules/FeatureCard'
      import Text from '@/components/atoms/Text'
      
      const features = [
        {
          iconName: "Zap",
          iconColorClass: "text-primary",
          title: "Lightning Fast",
          description: "Book any ride in under 60 seconds with our streamlined interface"
        },
        {
          iconName: "Shield",
          iconColorClass: "text-accent",
          title: "Safe & Secure",
          description: "All drivers are verified with real-time tracking for your safety"
        },
        {
          iconName: "DollarSign",
          iconColorClass: "text-green-500",
          title: "Best Prices",
          description: "Compare prices across all vehicle types to find the best deal"
        }
      ]
      
const FeaturesGrid = () => {
        return (
          <motion.section 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <Text as="h2" className="text-3xl font-heading font-bold text-center text-surface-900 dark:text-white mb-8">
              Why Choose QuickRide?
            </Text>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  iconName={feature.iconName}
                  iconColorClass={feature.iconColorClass}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </motion.section>
        )
      }
      
      export default FeaturesGrid