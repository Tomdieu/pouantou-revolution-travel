'use client';

import { Building, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from '@/components/ui/credenza';
import HotelSearchForm from '@/components/HotelSearchForm';

interface HotelSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

const steps = [
  { id: 1, title: 'Destination', icon: <Building className="w-5 h-5" /> },
  { id: 2, title: 'Détails', icon: <Search className="w-5 h-5" /> },
  { id: 3, title: 'Budget & Contact', icon: <Building className="w-5 h-5" /> }
];

export default function HotelSearchDialog({
  isOpen,
  onOpenChange,
  userId,
}: HotelSearchDialogProps) {
  const [step, setStep] = useState(1);

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-3xl overflow-hidden rounded-xl border-stone-200 bg-white p-0 h-[85vh] sm:h-[80vh] flex flex-col">
        {/* Colored accent bar */}
        {/* <div className="h-2 bg-gradient-to-r from-emerald-500/50 to-teal-500/50" /> */}
        
        {/* Fixed Header */}
        <CredenzaHeader className="flex-shrink-0 border-b border-stone-100 bg-white p-6 md:p-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <CredenzaTitle className="text-2xl md:text-3xl font-black text-stone-900 italic tracking-tight">
                Réservation Hôtel
              </CredenzaTitle>
              <CredenzaDescription className="text-stone-500 font-medium mt-1">
                Dénichez le séjour parfait parmi une sélection d'établissements premium.
              </CredenzaDescription>
            </div>
          </div>
        </CredenzaHeader>

        {/* Fixed Step Indicator */}
        {step <= 3 && (
          <div className="flex-shrink-0 border-b border-stone-100 bg-white px-6 md:px-10 py-6">
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-emerald-600 z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
              <div className="flex justify-between relative z-10">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${
                        step >= s.id
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {step > s.id ? '✓' : s.id}
                    </div>
                    <span
                      className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                        step >= s.id ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Content */}
        <CredenzaBody className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <HotelSearchForm userId={userId} onDialogClose={onOpenChange} onStepChange={setStep} />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
