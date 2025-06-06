import ApperIcon from '@/components/ApperIcon'
      
const IconWrapper = ({ iconName, iconSize, iconClass, wrapperClass, children }) => {
        return (
          <div className={wrapperClass}>
            {iconName && <ApperIcon name={iconName} size={iconSize} className={iconClass} />}
            {children}
          </div>
        )
      }
      
      export default IconWrapper