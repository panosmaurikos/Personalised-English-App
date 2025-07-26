import { useState } from "react";

/**
 * useToast custom hook
 * Provides state and methods to manage toast notifications.
 * @returns {object} - Toast state, setter, and handler function
 */
export default function useToast() {
  // State for toast message, visibility, and background color
  const [toast, setToast] = useState({ show: false, message: "", bg: "" });

  /**
   * Show a toast with a message and background color, then auto-hide after 2s
   * @param {string} message - The message to display
   * @param {string} bg - The background color (Bootstrap bg value)
   */
  const handleToast = (message, bg = "success") => {
    setToast({ show: true, message, bg });
    setTimeout(() => setToast({ show: false, message: "", bg: "" }), 2000);
  };

  return { toast, setToast, handleToast };
}
