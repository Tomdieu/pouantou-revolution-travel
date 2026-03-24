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
            "p-6 rounded-xl bg-white border border-gray-100 flex flex-col h-full transition-all hover:border-blue-200",
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

            <p className="text-gray-600 leading-relaxed text-sm mb-6 flex-1">
                "{description}"
            </p>

            <div className="flex items-center gap-3 mt-auto">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-sm">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{jobTitle}</p>
                </div>
            </div>
        </div>
    );
};
