import ApperIcon from '@/components/ApperIcon'
      
      const IconWrapper = ({ iconName, iconSize, iconClass, wrapperClass, children }) => {
        return (
          &lt;div className={wrapperClass}&gt;
            {iconName && &lt;ApperIcon name={iconName} size={iconSize} className={iconClass} /&gt;}
            {children}
          &lt;/div&gt;
        )
      }
      
      export default IconWrapper