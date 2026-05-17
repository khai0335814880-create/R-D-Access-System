import React from 'react';
import { Construction } from 'lucide-react';

export const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-[70vh] bg-canvas flex flex-col items-center justify-center p-xl font-sans">
      <div className="bg-paper p-xxl rounded-xl shadow-floating border border-fog max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-xl border border-primary/10">
          <Construction size={32} className="text-primary" />
        </div>
        <h2 className="text-display-xs text-ink mb-md uppercase tracking-widest">{title}</h2>
        <p className="text-caption-md text-charcoal mb-xl leading-relaxed">
          This architectural component is currently undergoing maintenance or development. 
          Deployment to the production environment is pending protocol completion.
        </p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-sm"></div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
