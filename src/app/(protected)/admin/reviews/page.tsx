import { prisma } from "@/lib/prisma";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { ReviewsFilter } from "@/components/admin/ReviewsFilter";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

const ITEMS_PER_PAGE = 10;

async function getReviews(page: number, status: string) {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    let where: any = {};
    if (status === 'APPROVED') {
        where.isModerated = true;
    } else if (status === 'PENDING') {
        where.isModerated = false;
    }

    const [reviews, totalCount] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: ITEMS_PER_PAGE,
            skip,
        }),
        prisma.review.count({ where }),
    ]);

    return { reviews, totalCount };
}

interface ReviewsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
    const params = await searchParams;
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
    const status = typeof params.status === 'string' ? params.status : 'ALL';

    const { reviews, totalCount } = await getReviews(page, status);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Generate pagination URL
    const createPageURL = (pageNumber: number) => {
        const newParams = new URLSearchParams(params as Record<string, string>);
        newParams.set('page', pageNumber.toString());
        return `/admin/reviews?${newParams.toString()}`;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Avis & Témoignages</h1>
                    <p className="text-slate-500 mt-2">Modérez les avis ({totalCount} total).</p>
                </div>
                <ReviewsFilter />
            </div>

            <DataTable columns={columns} data={reviews} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={page > 1 ? createPageURL(page - 1) : '#'}
                                aria-disabled={page <= 1}
                                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            // Simple pagination logic: show all for now, or improve if many pages needed
                            <PaginationItem key={p}>
                                <PaginationLink href={createPageURL(p)} isActive={p === page}>
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href={page < totalPages ? createPageURL(page + 1) : '#'}
                                aria-disabled={page >= totalPages}
                                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
