import Input from '@/components/atoms/Input'
import Label from '@/components/atoms/Label'
import ApperIcon from '@/components/ApperIcon'

const LocationInput = ({ label, value, onChange, placeholder, iconName }) => {
  const iconElement = iconName ? <ApperIcon name={iconName} size={20} /> : null

  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon={iconElement}
      />
    </div>
  )
}

export default LocationInput