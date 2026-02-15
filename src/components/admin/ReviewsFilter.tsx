'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ReviewsFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentFilter = searchParams.get('status') || 'ALL';

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'ALL') {
            params.delete('status');
        } else {
            params.set('status', value);
        }
        params.set('page', '1'); // Reset to page 1 on filter change
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-[400px]">
            <TabsList>
                <TabsTrigger value="ALL">Tous</TabsTrigger>
                <TabsTrigger value="PENDING">En attente</TabsTrigger>
                <TabsTrigger value="APPROVED">Approuvés</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
