import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Seeding destinations...');

    const destinations = [
        {
            name: 'Paris',
            country: 'France',
            description: 'Ville lumière et romance',
            price: 450000,
            currency: 'FCFA',
            emoji: '🗼',
            badge: 'Plus Populaire',
            isPopular: true,
            isActive: true,
            order: 1,
        },
        {
            name: 'New York',
            country: 'États-Unis',
            description: 'La ville qui ne dort jamais',
            price: 650000,
            currency: 'FCFA',
            emoji: '🗽',
            badge: 'Best Seller',
            isPopular: true,
            isActive: true,
            order: 2,
        },
        {
            name: 'Dubai',
            country: 'Émirats Arabes Unis',
            description: 'Luxe et modernité',
            price: 380000,
            currency: 'FCFA',
            emoji: '🕌',
            badge: 'Prix Mini',
            isPopular: true,
            isActive: true,
            order: 3,
        },
        {
            name: 'Londres',
            country: 'Royaume-Uni',
            description: 'Histoire et tradition',
            price: 420000,
            currency: 'FCFA',
            emoji: '🏰',
            badge: 'Exclusif',
            isPopular: true,
            isActive: true,
            order: 4,
        },
        {
            name: 'Istanbul',
            country: 'Turquie',
            description: 'Pont entre deux continents',
            price: 350000,
            currency: 'FCFA',
            emoji: '🕌',
            badge: 'Tendance',
            isPopular: true,
            isActive: true,
            order: 5,
        },
        {
            name: 'Casablanca',
            country: 'Maroc',
            description: 'Perle du Maghreb',
            price: 280000,
            currency: 'FCFA',
            emoji: '🏛️',
            badge: 'Promo',
            isPopular: true,
            isActive: true,
            order: 6,
        },
    ];

    for (const destination of destinations) {
        await prisma.destination.upsert({
            where: { id: `seed-${destination.name.toLowerCase().replace(/\s+/g, '-')}` },
            update: destination,
            create: {
                id: `seed-${destination.name.toLowerCase().replace(/\s+/g, '-')}`,
                ...destination,
            },
        });
    }

    console.log(`Seeded ${destinations.length} destinations`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
