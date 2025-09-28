'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import { useState } from 'react'
import { SignupForm } from './signup-form'

interface SignupDialogProps {
  children: React.ReactNode
}

export function SignupDialog({ children }: SignupDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Enter your information to create a new account.</DialogDescription>
        </DialogHeader>
        <SignupForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
