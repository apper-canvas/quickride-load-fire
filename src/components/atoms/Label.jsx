const Label = ({ children, className = '' }) => {
  return (
    <label className={`block text-sm font-medium text-surface-700 dark:text-surface-300 ${className}`}>
      {children}
    </label>
  )
}

export default Label