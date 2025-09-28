'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import { useState } from 'react'
import { LoginForm } from './login-form'

interface LoginDialogProps {
  children: React.ReactNode
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <LoginForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
