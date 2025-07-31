"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import "./Toaster.css" // ⬅ Importing modern CSS

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
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
        style: {}, // CSS handles all styles now
      }}
      {...props}
    />
  )
}

export { Toaster }
