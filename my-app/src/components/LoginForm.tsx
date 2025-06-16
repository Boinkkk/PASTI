import React, { memo } from 'react'
import { Box, Stack, Alert, Typography, Button, CircularProgress } from '@mui/joy'
import { motion, AnimatePresence } from 'framer-motion'
import StableInput from './StableInput'

interface LoginFormProps {
  email: string
  password: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
  success: string | null
  isInitialLoad: boolean
  inputStyles: any
  buttonStyles: any
}

const LoginForm = memo(({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
  success,
  isInitialLoad,
  inputStyles,
  buttonStyles
}: LoginFormProps) => {
  return (
    <motion.div
      initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
        <Stack spacing={2}>
          {/* Error Alert dengan AnimatePresence */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert color="danger" variant="soft">
                  <Typography level="body-sm">{error}</Typography>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Success Alert dengan AnimatePresence */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert color="success" variant="soft">
                  <Typography level="body-sm">{success}</Typography>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <StableInput
            label="Email"
            type="email"
            placeholder="Masukkan email Anda"
            value={email}
            onChange={onEmailChange}
            disabled={loading}
            autoComplete="username"
            isInitialLoad={isInitialLoad}
            delay={0.7}
            styles={inputStyles}
            inputKey="email"
          />

          {/* Password Input */}
          <StableInput
            label="Password"
            type="password"
            placeholder="Masukkan password Anda"
            value={password}
            onChange={onPasswordChange}
            disabled={loading}
            autoComplete="current-password"
            isInitialLoad={isInitialLoad}
            delay={0.8}
            styles={inputStyles}
            inputKey="password"
          />

          {/* Login Button */}
          <motion.div
            key="button-container"
            initial={isInitialLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit"
              size="lg"
              disabled={loading}
              startDecorator={loading ? <CircularProgress size="sm" /> : null}
              sx={buttonStyles}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </motion.div>
        </Stack>
      </Box>
    </motion.div>
  )
})

LoginForm.displayName = 'LoginForm'

export default LoginForm
