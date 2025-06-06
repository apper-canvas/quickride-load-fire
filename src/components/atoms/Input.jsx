const Input = ({ label, value, onChange, placeholder, icon, ...props }) => {
        return (
          &lt;div&gt;
            {label && (
              &lt;label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2"&gt;
                {label}
              &lt;/label&gt;
            )}
            &lt;div className="relative"&gt;
              {icon && (
                &lt;div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400"&gt;
                  {icon}
                &lt;/div&gt;
              )}
              &lt;input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${icon ? 'pl-10' : 'pl-4'}`}
                {...props}
              /&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        )
      }
      
      export default Input