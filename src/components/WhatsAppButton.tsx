import React from 'react';
import { WHATSAPP_NUMBER } from '../constants';
import { getWhatsAppUrl } from '../utils';

export const WhatsAppButton: React.FC = () => {
  const url = getWhatsAppUrl(WHATSAPP_NUMBER);
  const isCustomScheme = url.startsWith('whatsapp://');

  return (
    <a
      href={url}
      target={isCustomScheme ? "_self" : "_blank"}
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-[70] bg-[#25D366] text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center group"
      aria-label="Contact on WhatsApp"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp"
        className="w-6 h-6 md:w-7 md:h-7"
      />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-bold uppercase tracking-widest text-xs whitespace-nowrap">
        Direct Message
      </span>
    </a>
  );
};
