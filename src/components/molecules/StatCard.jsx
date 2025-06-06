import ApperIcon from '@/components/ApperIcon'
      import Card from '@/components/atoms/Card'
      import Text from '@/components/atoms/Text'
      
const StatCard = ({ iconName, iconClass, value, label }) => {
        return (
          <Card className="p-4 text-center">
            <ApperIcon name={iconName} size={24} className={`mx-auto mb-2 ${iconClass}`} />
            <Text as="div" className="text-2xl font-bold text-surface-900 dark:text-white">{value}</Text>
            <Text className="text-sm text-surface-600 dark:text-surface-400">{label}</Text>
          </Card>
        )
      }
      
      export default StatCard