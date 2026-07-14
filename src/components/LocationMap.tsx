'use client';

import { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapRef } from 'react-map-gl';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { useRef } from 'react';
import { Phone, Clock, ExternalLink } from 'lucide-react';

const AGENCY_POSITION = {
  longitude: 11.54817617292117,
  latitude: 3.893125371490991,
};

const INITIAL_VIEW_STATE = {
  ...AGENCY_POSITION,
  zoom: 15,
  pitch: 45,
  bearing: 0,
};

export default function LocationMap() {
  const [popupInfo, setPopupInfo] = useState(false);
  const mapRef = useRef<MapRef>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden border border-slate-200">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        >
          <Marker
            longitude={AGENCY_POSITION.longitude}
            latitude={AGENCY_POSITION.latitude}
            anchor="bottom"
            onClick={(e: { originalEvent: MouseEvent }) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(!popupInfo);
            }}
          >
            <div className="cursor-pointer text-2xl">📍</div>
          </Marker>

          {popupInfo && (
            <Popup
              longitude={AGENCY_POSITION.longitude}
              latitude={AGENCY_POSITION.latitude}
              anchor="top"
              onClose={() => setPopupInfo(false)}
              closeOnClick={false}
              className="rounded-lg"
              maxWidth="280px"
            >
              <div className="p-1">
                <h3 className="font-semibold text-sm text-slate-900">Revolution Travel & Services</h3>
                <p className="text-xs text-slate-500 mt-1">En face de santa lucia ngousso</p>
              </div>
            </Popup>
          )}

          <NavigationControl position="bottom-right" />
        </Map>
      </div>

      {/* Info Panel */}
      <div className="flex flex-col gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-4">Revolution Travel & Services</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-base">📍</span>
              </div>
              <div>
                <p className="text-sm text-slate-700">En face de santa lucia ngousso</p>
                <p className="text-xs text-slate-400 mt-0.5">Yaoundé, Cameroun</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <a href="tel:677916832" className="text-sm text-slate-700 hover:text-slate-900 transition-colors">
                  6 77 91 68 32
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-700">Lundi — Samedi</p>
                <p className="text-xs text-slate-400 mt-0.5">8h00 — 18h00</p>
              </div>
            </div>
          </div>
        </div>

        <a
          href="https://maps.google.com/?q=3.893125371490991,11.54817617292117"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          Ouvrir dans Google Maps
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
