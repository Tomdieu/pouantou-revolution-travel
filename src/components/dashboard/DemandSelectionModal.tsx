'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Building, Car } from 'lucide-react';
import FlightSearchForm from '@/components/FlightSearchForm';
import HotelSearchForm from '@/components/HotelSearchForm';
import CarRentalForm from '@/components/CarRentalForm';
import {
    Credenza,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaDescription,
    CredenzaBody,
} from '@/components/ui/credenza';

interface DemandSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
}

type ServiceType = 'flight' | 'hotel' | 'car' | null;

export function DemandSelectionModal({ open, onOpenChange, userId }: DemandSelectionModalProps) {
    const [selectedService, setSelectedService] = useState<ServiceType>(null);

    const services = [
        {
            id: 'flight' as ServiceType,
            title: 'Vol International',
            description: 'Recherchez et réservez des vols',
            icon: Plane,
            form: <FlightSearchForm userId={userId} />,
        },
        {
            id: 'hotel' as ServiceType,
            title: 'Hôtel',
            description: 'Trouvez votre hébergement',
            icon: Building,
            form: <HotelSearchForm userId={userId} />,
        },
        {
            id: 'car' as ServiceType,
            title: 'Location de Voiture',
            description: 'Louez un véhicule',
            icon: Car,
            form: <CarRentalForm userId={userId} />,
        },
    ];

    const selectedServiceData = services.find(s => s.id === selectedService);

    const handleServiceSelect = (serviceId: ServiceType) => {
        setSelectedService(serviceId);
    };

    const handleCloseServiceModal = () => {
        setSelectedService(null);
    };

    const handleCloseMainModal = (open: boolean) => {
        if (!open) setSelectedService(null);
        onOpenChange(open);
    };

    return (
        <>
            <Dialog open={open && !selectedService} onOpenChange={handleCloseMainModal}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-lg font-semibold">Nouvelle Demande</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Sélectionnez le type de service
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-6">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <button
                                    key={service.id}
                                    onClick={() => handleServiceSelect(service.id)}
                                    className="flex flex-col items-center gap-3 p-6 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                        <Icon className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{service.title}</h3>
                                        <p className="text-xs text-slate-500">{service.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {selectedServiceData && (
                <Credenza open={!!selectedService} onOpenChange={(open) => !open && handleCloseServiceModal()}>
                    <CredenzaContent className="max-w-3xl">
                        <CredenzaHeader>
                            <CredenzaTitle className="text-lg font-semibold">
                                {selectedServiceData.title}
                            </CredenzaTitle>
                            <CredenzaDescription>
                                {selectedServiceData.description}
                            </CredenzaDescription>
                        </CredenzaHeader>
                        <CredenzaBody className="overflow-y-auto max-h-[70vh]">
                            {selectedServiceData.form}
                        </CredenzaBody>
                    </CredenzaContent>
                </Credenza>
            )}
        </>
    );
}
