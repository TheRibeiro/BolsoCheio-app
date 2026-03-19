import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmToastProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmToast({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmToastProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Toast Panel */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[201] px-4 pb-8 pt-2"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div
              className="w-full max-w-md mx-auto rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              }}
            >
              {/* Pull bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
              </div>

              {/* Content */}
              <div className="px-5 pt-3 pb-5">
                <p
                  className="text-base font-bold mb-1 text-center"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </p>
                <p
                  className="text-sm text-center mb-5 leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {description}
                </p>

                <div className="flex flex-col gap-2">
                  <motion.button
                    onClick={onConfirm}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white"
                    style={{
                      background: danger
                        ? 'var(--color-danger)'
                        : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    }}
                  >
                    {confirmLabel}
                  </motion.button>

                  <motion.button
                    onClick={onCancel}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {cancelLabel}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
