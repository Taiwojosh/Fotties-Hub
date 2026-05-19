export const getWhatsAppUrl = (phone: string, message?: string) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check if the app is running inside an iframe (like the AI Studio preview)
  const isInIframe = window.self !== window.top;
  
  const encodedMessage = message ? `&text=${encodeURIComponent(message)}` : '';
  const messageParamWaMe = message ? `?text=${encodeURIComponent(message)}` : '';

  // Iframes block custom URI schemes (like whatsapp://) for security reasons.
  // If we are in the preview, we MUST use the standard web link so it works.
  if (isInIframe) {
    return `https://wa.me/${phone}${messageParamWaMe}`;
  }
  
  // On actual mobile devices (or compiled Capacitor apps), use the native URI scheme
  if (isMobile) {
    return `whatsapp://send?phone=${phone}${encodedMessage}`;
  }
  
  // Fallback for desktop web
  return `https://wa.me/${phone}${messageParamWaMe}`;
};
