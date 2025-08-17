'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { MapContainer as MapContainerType, TileLayer as TileLayerType } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Chargement de la carte...</p>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
) as any;

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
) as any;

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
) as any;

// Coordinates for the agency
const AGENCY_POSITION = [3.893125371490991, 11.54817617292117] as [number, number];

export default function LocationMap() {
  useEffect(() => {
    // Fix Leaflet's icon loading issue
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={AGENCY_POSITION}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={AGENCY_POSITION}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Revolution Travel & Services</h3>
              <p className="text-sm">Notre agence de voyage à Yaoundé En face de santa lucia ngousso</p>
              <p className="text-xs mt-2 text-gray-600">
                Coordonnées: {AGENCY_POSITION[0].toFixed(6)}, {AGENCY_POSITION[1].toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
