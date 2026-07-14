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
  { id: 1, title: 'Destination' },
  { id: 2, title: 'Détails' },
  { id: 3, title: 'Contact' },
];

export default function HotelSearchDialog({
  isOpen,
  onOpenChange,
  userId,
}: HotelSearchDialogProps) {
  const [step, setStep] = useState(1);

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-3xl overflow-hidden rounded-xl border-slate-200 bg-white p-0 h-[85vh] sm:h-[80vh] flex flex-col">
        <CredenzaHeader className="flex-shrink-0 border-b border-slate-100 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CredenzaTitle className="text-lg font-semibold text-slate-900">
                Réservation hôtel
              </CredenzaTitle>
              <CredenzaDescription className="text-sm text-slate-500 mt-0.5">
                Trouvez l&apos;établissement parfait pour votre séjour.
              </CredenzaDescription>
            </div>
          </div>
        </CredenzaHeader>

        {step <= 3 && (
          <div className="flex-shrink-0 border-b border-slate-100 px-6 py-4">
            <div className="relative">
              <div className="absolute top-3 left-0 w-full h-px bg-slate-200" />
              <div
                className="absolute top-3 left-0 h-px bg-slate-900 transition-all duration-500"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
              <div className="flex justify-between relative z-10">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        step >= s.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {step > s.id ? '✓' : s.id}
                    </div>
                    <span className={`mt-2 text-[11px] font-medium transition-colors ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <CredenzaBody className="flex-1 overflow-y-auto p-6">
          <HotelSearchForm userId={userId} onDialogClose={onOpenChange} onStepChange={setStep} />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
