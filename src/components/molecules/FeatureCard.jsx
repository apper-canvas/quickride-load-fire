import Card from '@/components/atoms/Card'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
const FeatureCard = ({ iconName, iconColorClass, title, description }) => {
        return (
          <Card className="p-6 hover:shadow-soft transition-shadow">
            <div className={`w-12 h-12 ${iconColorClass}/10 rounded-xl flex items-center justify-center mb-4`}>
              <ApperIcon name={iconName} size={24} className={iconColorClass} />
            </div>
            <Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              {title}
            </Text>
            <Text className="text-surface-600 dark:text-surface-400">
              {description}
            </Text>
          </Card>
        )
      }
      
      export default FeatureCard