import Input from '@/components/atoms/Input'
      import Label from '@/components/atoms/Label'
      import ApperIcon from '@/components/ApperIcon'
      
      const LocationInput = ({ label, value, onChange, placeholder, iconName }) => {
        const iconElement = iconName ? &lt;ApperIcon name={iconName} size={20} /&gt; : null
      
        return (
          &lt;div&gt;
            &lt;Label className="mb-2"&gt;{label}&lt;/Label&gt;
            &lt;Input
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              icon={iconElement}
            /&gt;
          &lt;/div&gt;
        )
      }
      
      export default LocationInput