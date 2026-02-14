'use client';

import { ReviewCard } from '../reviews/ReviewCard';
import { ReviewForm } from '../reviews/ReviewForm';
import { cn } from '@/lib/utils';
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
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-4xl mx-auto px-4">
                <ReviewForm />
            </div>
        </section>
    );

    const isMarquee = reviews.length > 3;

    return (
        <section className="py-24 bg-gray-50/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-20 text-center space-y-4">
                <h2 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
                    Ce que nos <span className="text-blue-600 italic">Voyageurs</span> en disent
                </h2>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
                    Découvrez les témoignages de ceux qui nous ont fait confiance pour leurs aventures aux quatre coins du monde.
                </p>
            </div>

            <div className="relative">
                {isMarquee ? (
                    <div className="flex gap-8 animate-marquee whitespace-nowrap py-10">
                        {[...reviews, ...reviews].map((review, i) => (
                            <div key={`${review.id}-${i}`} className="w-[400px] shrink-0">
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
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
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

                {/* Gradient overlays for marquee */}
                {isMarquee && (
                    <>
                        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
                    </>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-24">
                <ReviewForm />
            </div>

            <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
};
