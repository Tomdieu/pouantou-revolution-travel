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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            form: <FlightSearchForm userId={userId} />,
        },
        {
            id: 'hotel' as ServiceType,
            title: 'Hôtel',
            description: 'Trouvez votre hébergement',
            icon: Building,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            form: <HotelSearchForm userId={userId} />,
        },
        {
            id: 'car' as ServiceType,
            title: 'Location de Voiture',
            description: 'Louez un véhicule',
            icon: Car,
            color: 'text-sky-600',
            bgColor: 'bg-sky-50',
            borderColor: 'border-sky-200',
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
        if (!open) {
            setSelectedService(null);
        }
        onOpenChange(open);
    };

    return (
        <>
            {/* Main Selection Dialog */}
            <Dialog open={open && !selectedService} onOpenChange={handleCloseMainModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Nouvelle Demande</DialogTitle>
                        <DialogDescription>
                            Sélectionnez le type de service que vous souhaitez réserver
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <Card
                                    key={service.id}
                                    className={`cursor-pointer transition-all hover:border-blue-400 hover:shadow-md ${service.borderColor}`}
                                    onClick={() => handleServiceSelect(service.id)}
                                >
                                    <CardContent className="p-6 text-center space-y-4">
                                        <div className={`w-16 h-16 ${service.bgColor} border ${service.borderColor} mx-auto flex items-center justify-center`}>
                                            <Icon className={`w-8 h-8 ${service.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{service.title}</h3>
                                            <p className="text-sm text-gray-500">{service.description}</p>
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            Sélectionner
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Service Form Modal */}
            {selectedServiceData && (
                <Credenza open={!!selectedService} onOpenChange={(open) => !open && handleCloseServiceModal()}>
                    <CredenzaContent className="max-w-3xl">
                        <CredenzaHeader>
                            <CredenzaTitle className="flex items-center gap-3 text-2xl">
                                <div className={`w-12 h-12 ${selectedServiceData.bgColor} border ${selectedServiceData.borderColor} flex items-center justify-center`}>
                                    <selectedServiceData.icon className={`w-6 h-6 ${selectedServiceData.color}`} />
                                </div>
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
