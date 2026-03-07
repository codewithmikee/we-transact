'use client'

import {
  CloseButton,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DialogMaxWidth =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'

const maxWidthClasses: Record<DialogMaxWidth, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
}

interface AppDialogProps {
  open: boolean
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /**
   * Controls whether the dialog can be closed via escape, backdrop click, or the close button.
   * Defaults to true. Set to false while running critical async actions (e.g. delete).
   */
  canClose?: boolean
  /**
   * Maximum width of the dialog panel on larger screens.
   * Defaults to "md".
   */
  maxWidth?: DialogMaxWidth
  /**
   * Extra classes for the dialog panel (size, padding, etc.)
   */
  panelClassName?: string
  /**
   * Extra classes for the backdrop (colors, blur, etc.)
   */
  backdropClassName?: string
  /**
   * Toggle the default close button in the top-right corner.
   */
  showCloseButton?: boolean
}

export default function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  canClose = true,
  maxWidth = 'md',
  panelClassName,
  backdropClassName,
  showCloseButton = true,
}: AppDialogProps) {
  const handleClose = () => {
    if (!canClose) return
    if (onClose) {
      onClose()
    }
  }

  const showClose = showCloseButton && !!onClose

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      as="div"
      className="relative z-1000 focus:outline-none"
    >
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/50 duration-300 ease-out data-closed:opacity-0',
          backdropClassName,
        )}
      />

      <div className="fixed inset-0 z-50 flex w-screen items-center justify-center p-4 sm:p-6">
        <DialogPanel
          transition
          className={cn(
            'relative w-full rounded-lg border border-border bg-popover p-6 text-left text-popover-foreground shadow-xl duration-300 ease-out data-closed:translate-y-2 data-closed:opacity-0 sm:my-8 sm:p-8',
            maxWidthClasses[maxWidth],
            panelClassName,
          )}
        >
          {showClose && (
            <CloseButton
              onClick={canClose ? handleClose : undefined}
              disabled={!canClose}
              aria-disabled={!canClose}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Close dialog"
            >
              ×
            </CloseButton>
          )}

          {title && (
            <DialogTitle
              as="h3"
              className="pr-8 text-base font-semibold leading-6 text-popover-foreground"
            >
              {title}
            </DialogTitle>
          )}

          {description && (
            <Description className="mt-1 text-sm text-muted-foreground">
              {description}
            </Description>
          )}

          {children && <div className="mt-4">{children}</div>}

          {footer && <div className="mt-6">{footer}</div>}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
