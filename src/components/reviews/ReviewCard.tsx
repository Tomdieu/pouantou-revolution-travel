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
            "p-5 bg-white border border-slate-100 rounded-xl flex flex-col h-full",
            className
        )}>
            <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-3.5 h-3.5",
                            i < stars ? "fill-slate-900 text-slate-900" : "text-slate-200"
                        )}
                    />
                ))}
            </div>

            <p className="text-slate-600 leading-relaxed text-sm mb-5 flex-1">
                &ldquo;{description}&rdquo;
            </p>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-semibold text-xs">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-medium text-slate-900 text-sm leading-tight">{name}</h4>
                    <p className="text-xs text-slate-500">{jobTitle}</p>
                </div>
            </div>
        </div>
    );
};
