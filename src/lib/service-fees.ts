/**
 * Constants and utilities for calculating service fees across the application.
 */

export const FLIGHT_FEE_TIERS = {
    LOW: {
        THRESHOLD: 304,
        FEE: 53.36,
    },
    MEDIUM: {
        THRESHOLD: 1067,
        FEE: 68.60,
    },
    HIGH: {
        FEE: 83.85,
    },
} as const;

/**
 * Calculates the service fee for a flight based on its base price.
 * 
 * Logic:
 * - basePrice < 304 EUR -> Fee: 53.36 EUR
 * - 304 EUR <= basePrice <= 1067 EUR -> Fee: 68.60 EUR
 * - basePrice > 1067 EUR -> Fee: 83.85 EUR
 * 
 * @param basePrice The raw flight price from the provider
 * @returns The calculated service fee
 */
export function calculateFlightServiceFee(basePrice: number): number {
    if (basePrice < FLIGHT_FEE_TIERS.LOW.THRESHOLD) {
        return FLIGHT_FEE_TIERS.LOW.FEE;
    }

    if (basePrice > FLIGHT_FEE_TIERS.MEDIUM.THRESHOLD) {
        return FLIGHT_FEE_TIERS.HIGH.FEE;
    }

    return FLIGHT_FEE_TIERS.MEDIUM.FEE;
}
