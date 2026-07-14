import { prisma } from "@/lib/prisma";
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
import { ReviewsFilter } from "@/components/admin/ReviewsFilter";

const ITEMS_PER_PAGE = 10;

async function getReviews(page: number, status: string) {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    let where: any = {};
    if (status === "APPROVED") {
        where.isModerated = true;
    } else if (status === "PENDING") {
        where.isModerated = false;
    }

    const [reviews, totalCount] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: { createdAt: "desc" },
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
    const page =
        typeof params.page === "string" ? parseInt(params.page) : 1;
    const status =
        typeof params.status === "string" ? params.status : "ALL";

    const { reviews, totalCount } = await getReviews(page, status);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const createPageURL = (pageNumber: number) => {
        const newParams = new URLSearchParams(
            params as Record<string, string>
        );
        newParams.set("page", pageNumber.toString());
        return `/admin/reviews?${newParams.toString()}`;
    };

    const pending = await prisma.review.count({
        where: { isModerated: false },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                        Avis
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {totalCount} avis · {pending} en attente
                    </p>
                </div>
                <ReviewsFilter />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <DataTable columns={columns} data={reviews} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={
                                        page > 1
                                            ? createPageURL(page - 1)
                                            : "#"
                                    }
                                    aria-disabled={page <= 1}
                                    className={
                                        page <= 1
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        href={createPageURL(p)}
                                        isActive={p === page}
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href={
                                        page < totalPages
                                            ? createPageURL(page + 1)
                                            : "#"
                                    }
                                    aria-disabled={page >= totalPages}
                                    className={
                                        page >= totalPages
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
