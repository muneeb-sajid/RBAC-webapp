import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

export default function Dropdown({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    if (open) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: align === 'right' ? rect.right + window.scrollX : rect.left + window.scrollX,
      })
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, align])

  return (
    <>
      <div ref={triggerRef} onClick={() => setOpen((o) => !o)}>
        {trigger}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: align === 'right' ? coords.left : coords.left,
              transform: align === 'right' ? 'translateX(-100%)' : 'none',
            }}
            className="z-50 min-w-[180px] animate-fade-in rounded-xl border border-surface-border bg-white py-1.5 shadow-popover"
          >
            {items.map((item, idx) =>
              item.divider ? (
                <div key={idx} className="my-1 border-t border-surface-border" />
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  disabled={item.disabled}
                  className={clsx(
                    'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    item.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink-900 hover:bg-surface-muted'
                  )}
                >
                  {item.icon && <item.icon size={15} />}
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  )
}
