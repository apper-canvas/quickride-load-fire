const Text = ({ children, className = '', as = 'p', ...props }) => {
        const Tag = as
        return <Tag className={className} {...props}>{children}</Tag>
      }
      
      export default Text