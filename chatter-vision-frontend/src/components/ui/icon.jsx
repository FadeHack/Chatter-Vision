import * as Icons from "lucide-react"

export function Icon({ name, ...props }) {
  const IconComponent = Icons[name]
  
  if (!IconComponent) {
    return null
  }

  return <IconComponent {...props} />
} 