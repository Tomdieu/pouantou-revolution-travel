'use client';

import { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapRef } from 'react-map-gl';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl, ScaleControl, ViewStateChangeEvent } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useRef } from 'react';

// Agency coordinates (longitude, latitude)
const AGENCY_POSITION = {
  longitude: 11.54817617292117,
  latitude: 3.893125371490991,
};

const INITIAL_VIEW_STATE = {
  ...AGENCY_POSITION,
  zoom: 15,
  pitch: 45, // Add a slight tilt for better 3D effect
  bearing: 0,
};

export default function LocationMap() {
  const [popupInfo, setPopupInfo] = useState(false);
  const mapRef = useRef<MapRef>(null);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={true}
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
          <div className="cursor-pointer text-2xl animate-bounce">📍</div>
        </Marker>

        {popupInfo && (
          <Popup
            longitude={AGENCY_POSITION.longitude}
            latitude={AGENCY_POSITION.latitude}
            anchor="top"
            onClose={() => setPopupInfo(false)}
            closeOnClick={false}
            className="rounded-lg"
            maxWidth="300px"
          >
            <div className="text-center p-2">
              <h3 className="font-bold text-lg mb-2">Revolution Travel & Services</h3>
              <p className="text-sm mb-2">Notre agence de voyage à Yaoundé</p>
              <p className="text-sm">En face de santa lucia ngousso</p>
              <p className="text-xs mt-2 text-gray-600">
                {AGENCY_POSITION.latitude.toFixed(6)}, {AGENCY_POSITION.longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        )}

        <NavigationControl position="bottom-right" />
      </Map>

      {/* Custom overlay with agency info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
        <h4 className="font-semibold text-primary">Revolution Travel & Services</h4>
        <p className="text-sm text-gray-600 mt-1">En face de santa lucia ngousso, Yaoundé</p>
      </div>
    </div>
  );
}
