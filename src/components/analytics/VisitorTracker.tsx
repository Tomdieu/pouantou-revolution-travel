"use client";

import { useEffect } from "react";
import { trackVisit } from "@/actions/analytics-actions";

export function VisitorTracker() {
    useEffect(() => {
        trackVisit();
    }, []);

    return null; // This component renders nothing
}
