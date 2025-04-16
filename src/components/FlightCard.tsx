import React from 'react';
import { FlightResult } from '../store/features/flightSlice';

interface FlightCardProps {
  flight: FlightResult;
  onSelect?: () => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatStops = (stops: number) => {
    if (stops === 0) return 'Direct';
    return `${stops} ${stops === 1 ? 'stop' : 'stops'}`;
  };

  return (
    <div className="flight-card">
      <div className="flight-card-header">
        <div className="airline-info">
          <img 
            src={`https://pics.avs.io/200/200/${flight.airlineCode}.png`} 
            alt={flight.airline}
            className="airline-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/200x200?text=Airline';
            }}
          />
          <div className="airline-details">
            <span className="airline-name">{flight.airline}</span>
            <span className="flight-number">{flight.flightNumber}</span>
          </div>
        </div>
        <div className="flight-price">
          <span className="price-label">Price</span>
          <span className="price-value">{flight.price}</span>
        </div>
      </div>

      <div className="flight-details">
        <div className="flight-time">
          <div className="time-block">
            <span className="time">{formatTime(flight.departureTime)}</span>
            <span className="airport">{flight.origin}</span>
          </div>
          <div className="duration">
            <div className="duration-line"></div>
            <span className="duration-text">{flight.duration}</span>
            <span className="stops-text">{formatStops(flight.stops)}</span>
          </div>
          <div className="time-block">
            <span className="time">{formatTime(flight.arrivalTime)}</span>
            <span className="airport">{flight.destination}</span>
          </div>
        </div>
      </div>

      <div className="flight-card-footer">
        <button 
          className="select-flight-btn"
          onClick={onSelect}
        >
          Select Flight
        </button>
      </div>
    </div>
  );
};

export default FlightCard; 