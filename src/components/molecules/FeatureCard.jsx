import Card from '@/components/atoms/Card'
      import ApperIcon from '@/components/ApperIcon'
      import Text from '@/components/atoms/Text'
      
      const FeatureCard = ({ iconName, iconColorClass, title, description }) => {
        return (
          &lt;Card className="p-6 hover:shadow-soft transition-shadow"&gt;
            &lt;div className={`w-12 h-12 ${iconColorClass}/10 rounded-xl flex items-center justify-center mb-4`}&gt;
              &lt;ApperIcon name={iconName} size={24} className={iconColorClass} /&gt;
            &lt;/div&gt;
            &lt;Text as="h3" className="text-xl font-semibold text-surface-900 dark:text-white mb-2"&gt;
              {title}
            &lt;/Text&gt;
            &lt;Text className="text-surface-600 dark:text-surface-400"&gt;
              {description}
            &lt;/Text&gt;
          &lt;/Card&gt;
        )
      }
      
      export default FeatureCard