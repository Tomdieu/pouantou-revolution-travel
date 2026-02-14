export interface FlightSearchData {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  nonStop?: boolean;
}

export interface SelectedOffer {
  id: string;
  price: {
    total: number;
    currency: string;
    displayTotal: string;
  };
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  airline: string;
  duration?: string;
  stops: number;
  bookableSeats?: number;
  instantTicketing?: boolean;
  lastTicketingDate?: string;
  rawOffer?: any;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export interface FlightSearchTeamRequest {
  searchData: FlightSearchData;
  selectedOffer: SelectedOffer;
  contactInfo: ContactInfo;
  timestamp?: string;
}

export interface FlightSearchRequestEmailProps {
  searchData: FlightSearchData;
  selectedOffer: SelectedOffer;
  contactInfo: ContactInfo;
  searchError?: string;
}
