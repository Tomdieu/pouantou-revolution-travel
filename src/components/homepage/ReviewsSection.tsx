'use client';

import { ReviewCard } from '../reviews/ReviewCard';
import { ReviewForm } from '../reviews/ReviewForm';
import { useEffect, useState } from 'react';
import { getApprovedReviews } from '@/actions/review-actions';

export const ReviewsSection = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const data = await getApprovedReviews();
            setReviews(data);
            setIsLoading(false);
        };
        fetchReviews();
    }, []);

    if (isLoading) return null;
    if (reviews.length === 0) return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4">
                <ReviewForm />
            </div>
        </section>
    );

    const isMarquee = reviews.length > 3;

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    Ce que nos voyageurs en disent
                </h2>
                <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                    Découvrez les témoignages de ceux qui nous ont fait confiance pour leurs aventures.
                </p>
            </div>

            <div className="relative overflow-hidden">
                {isMarquee ? (
                    <div className="flex gap-6 animate-marquee py-6 w-max">
                        {[...reviews, ...reviews].map((review, i) => (
                            <div key={`${review.id}-${i}`} className="w-[360px] shrink-0">
                                <ReviewCard
                                    name={review.name}
                                    jobTitle={review.jobTitle}
                                    description={review.description}
                                    stars={review.stars}
                                    image={review.user?.image}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                name={review.name}
                                jobTitle={review.jobTitle}
                                description={review.description}
                                stars={review.stars}
                                image={review.user?.image}
                            />
                        ))}
                    </div>
                )}

                {isMarquee && (
                    <>
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
                    </>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-20">
                <ReviewForm />
            </div>
        </section>
    );
};
