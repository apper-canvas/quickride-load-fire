import ApperIcon from '@/components/ApperIcon'
      import Card from '@/components/atoms/Card'
      import Text from '@/components/atoms/Text'
      
      const StatCard = ({ iconName, iconClass, value, label }) => {
        return (
          &lt;Card className="p-4 text-center"&gt;
            &lt;ApperIcon name={iconName} size={24} className={`mx-auto mb-2 ${iconClass}`} /&gt;
            &lt;Text as="div" className="text-2xl font-bold text-surface-900 dark:text-white"&gt;{value}&lt;/Text&gt;
            &lt;Text className="text-sm text-surface-600 dark:text-surface-400"&gt;{label}&lt;/Text&gt;
          &lt;/Card&gt;
        )
      }
      
      export default StatCard