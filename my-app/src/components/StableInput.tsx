import React, { memo } from 'react'
import { FormControl, FormLabel, Input } from '@mui/joy'
import { motion } from 'framer-motion'

interface StableInputProps {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  autoComplete?: string
  isInitialLoad: boolean
  delay: number
  styles: any
  inputKey: string
}

const StableInput = memo(({ 
  label, 
  type, 
  placeholder, 
  value, 
  onChange, 
  disabled = false, 
  autoComplete, 
  isInitialLoad, 
  delay, 
  styles,
  inputKey 
}: StableInputProps) => {
  return (
    <motion.div
      key={`${inputKey}-container`}
      initial={isInitialLoad ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Input
          key={`${inputKey}-input`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          size="lg"
          sx={styles}
        />
      </FormControl>
    </motion.div>
  )
})

StableInput.displayName = 'StableInput'

export default StableInput
