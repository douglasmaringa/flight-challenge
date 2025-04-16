import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FlightResult } from '../store/features/flightSlice';

// Fix for default marker icons in Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface FlightMapProps {
  flights: FlightResult[];
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

const FlightMap: React.FC<FlightMapProps> = ({ flights, origin, destination }) => {
  const center = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  const path: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <div className="flight-map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[origin.lat, origin.lng]}>
          <Popup>Origin Airport</Popup>
        </Marker>
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>Destination Airport</Popup>
        </Marker>
        <Polyline
          positions={path}
          color="red"
          weight={3}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  );
};

export default FlightMap; 