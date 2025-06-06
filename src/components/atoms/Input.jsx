const Input = ({ label, value, onChange, placeholder, icon, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pr-4 py-3 border border-surface-300 dark:border-surface-600 rounded-xl bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${icon ? 'pl-10' : 'pl-4'}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input