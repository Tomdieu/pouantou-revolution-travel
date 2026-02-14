'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DemandSelectionModal } from './DemandSelectionModal';

interface NewDemandButtonProps {
    userId: string;
}

export function NewDemandButton({ userId }: NewDemandButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouvelle Demande
            </Button>
            <DemandSelectionModal open={open} onOpenChange={setOpen} userId={userId} />
        </>
    );
}
