const Text = ({ children, className = '', as = 'p', ...props }) => {
        const Tag = as
        return &lt;Tag className={className} {...props}&gt;{children}&lt;/Tag&gt;
      }
      
      export default Text