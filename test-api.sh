#!/bin/bash

# Test the email API endpoint with curl
curl -X POST http://localhost:3000/api/send-quote \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "+237 6 77 91 68 32",
    "email": "test@example.com", 
    "departureCity": "Douala",
    "destination": "Paris",
    "departureDate": "2025-08-15",
    "returnDate": "2025-08-25",
    "passengers": "2",
    "travelClass": "economy",
    "preferredAirline": "air-france",
    "budget": "800000-1000000",
    "additionalInfo": "Test booking for development purposes"
  }'
