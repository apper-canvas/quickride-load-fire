import { motion } from 'framer-motion'
      import ApperIcon from '@/components/ApperIcon'
      
      const Button = ({ 
        children, 
        onClick, 
        className = '', 
        disabled = false, 
        iconName, 
        iconSize, 
        iconClass, 
        whileHover, 
        whileTap 
      }) => {
        const motionProps = {
          whileHover: whileHover || { scale: 1.02 },
          whileTap: whileTap || { scale: 0.98 }
        }
const buttonContent = (
          <>
            {iconName && (
              <ApperIcon name={iconName} size={iconSize} className={iconClass} />
            )}
            {children}
          </>
        )
      
        return (
          <motion.button
            onClick={onClick}
            className={className}
            disabled={disabled}
            {...motionProps}
          >
            {buttonContent}
          </motion.button>
        )
      }
      
      export default Button