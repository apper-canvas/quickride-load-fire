const Label = ({ children, className = '' }) => {
        return (
          &lt;label className={`block text-sm font-medium text-surface-700 dark:text-surface-300 ${className}`}&gt;
            {children}
          &lt;/label&gt;
        )
      }
      
      export default Label