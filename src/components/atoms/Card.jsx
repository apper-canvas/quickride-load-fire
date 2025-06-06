import { motion } from 'framer-motion'
      
      const Card = ({ children, className = '', motionProps = {}, ...props }) => {
        return (
          <motion.div
            className={`bg-white dark:bg-surface-800 rounded-2xl shadow-card ${className}`}
            {...motionProps}
            {...props}
          >;
            {children}
          &lt;/motion.div&gt;
        )
      }
      
      export default Card