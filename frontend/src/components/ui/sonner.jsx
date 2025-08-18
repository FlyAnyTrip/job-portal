"use client"

import { Toaster as Sonner } from "sonner"
import "./Toaster.css"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="system" // 👈 directly use system, or "light"/"dark"
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      duration={3000}
      expand={true}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast: "toast",
          description: "toast-description",
          actionButton: "toast-action",
          cancelButton: "toast-cancel",
          closeButton: "toast-close",
          success: "toast-success",
          error: "toast-error",
          warning: "toast-warning",
          info: "toast-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
