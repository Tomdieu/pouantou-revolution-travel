import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ReviewCardProps {
    name: string;
    jobTitle: string;
    description: string;
    stars: number;
    image?: string;
    className?: string;
}

export const ReviewCard = ({
    name,
    jobTitle,
    description,
    stars,
    image,
    className,
}: ReviewCardProps) => {
    return (
        <div className={cn(
            "p-6 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col h-full transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10",
            className
        )}>
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-4 h-4",
                            i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                        )}
                    />
                ))}
            </div>

            <p className="text-gray-600 leading-relaxed italic mb-6 flex-1">
                "{description}"
            </p>

            <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-blue-50 ring-2 ring-blue-500/10">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-black text-gray-900 leading-tight">{name}</h4>
                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">{jobTitle}</p>
                </div>
            </div>
        </div>
    );
};
