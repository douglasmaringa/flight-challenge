import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { searchAirports, searchFlights, setAirport } from '../store/features/flightSlice';
import { Airport } from '../store/features/flightSlice';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './FlightSearch.css';
import FlightMap from './FlightMap';
import FlightCard from './FlightCard';

const FlightSearch = () => {
  // Redux hooks for state management
  const dispatch = useAppDispatch();
  const { 
    airports, 
    flightData, 
    loading, 
    error 
  } = useAppSelector(state => state.flights);

  // Form state with default values
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date('2025-04-20'),
    adults: 1,
  });

  const [searchResults, setSearchResults] = useState<{
    origin: Airport[];
    destination: Airport[];
  }>({
    origin: [],
    destination: [],
  });

  const [showDropdown, setShowDropdown] = useState<{
    origin: boolean;
    destination: boolean;
  }>({
    origin: false,
    destination: false,
  });

  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (originDropdownRef.current && !originDropdownRef.current.contains(target)) {
        setShowDropdown(prev => ({ ...prev, origin: false }));
      }
      
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(target)) {
        setShowDropdown(prev => ({ ...prev, destination: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search airports when input changes
  const handleAirportSearch = async (type: 'origin' | 'destination', query: string) => {
    if (query.length < 2) return;
    
    try {
      const result = await dispatch(searchAirports(query));
      if (searchAirports.fulfilled.match(result)) {
        setSearchResults(prev => ({
          ...prev,
          [type]: result.payload.filter((a: Airport) => a.navigation.entityType === 'AIRPORT')
        }));
      }
    } catch (err) {
      console.error('Failed to search airports:', err);
    }
  };

  // Handle airport selection
  const handleAirportSelect = (type: 'origin' | 'destination', airport: Airport) => {
    dispatch(setAirport({ type, airport }));
    setFormData(prev => ({
      ...prev,
      [type]: airport.presentation.suggestionTitle
    }));
    setShowDropdown(prev => ({ ...prev, [type]: false }));
  };

  // Fetch flights when airports are selected
  useEffect(() => {
    const fetchFlights = async () => {
      if (!airports.origin || !airports.destination) return;

      try {
        await dispatch(searchFlights({
          origin: airports.origin,
          destination: airports.destination,
          date: formData.date.toISOString().split('T')[0]
        }));
      } catch (err) {
        console.error('Failed to fetch flights:', err);
      }
    };

    fetchFlights();
  }, [dispatch, airports.origin, airports.destination, formData.date]);

  // Add this function to get coordinates from airport data
  const getAirportCoordinates = (airport: any) => {
    console.log('Airport data:', airport);
    if (airport?.navigation?.coordinates) {
      const coords = {
        lat: airport.navigation.coordinates.latitude,
        lng: airport.navigation.coordinates.longitude
      };
      console.log('Coordinates:', coords);
      return coords;
    }
    console.log('No coordinates found, using default');
    return { lat: 0, lng: 0 }; // Default coordinates if not available
  };

  // Add debugging for flight data
  useEffect(() => {
    console.log('Flight Data:', flightData);
    console.log('Airports:', airports);
  }, [flightData, airports]);

  return (
    <div className="flight-search-container">
      <div className="flight-search-content">
        {/* Search Form */}
        <div className="search-form">
          <div className="search-form-header">
            <h1>Search flights</h1>
            <button className="round-trip-button">Round trip</button>
          </div>
          
          <div className="search-form-grid">
            {/* Origin Input */}
            <div className="form-group" ref={originDropdownRef}>
              <label>From</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, origin: e.target.value }));
                    handleAirportSearch('origin', e.target.value);
                    setShowDropdown(prev => ({ ...prev, origin: true }));
                  }}
                  placeholder="City or airport"
                />
                {showDropdown.origin && searchResults.origin.length > 0 && (
                  <div className="dropdown">
                    {searchResults.origin.map((airport) => (
                      <div
                        key={airport.skyId}
                        onClick={() => handleAirportSelect('origin', airport)}
                        className="dropdown-item"
                      >
                        <div className="airport-info">
                          <div className="airport-name">{airport.presentation.suggestionTitle}</div>
                          <div className="airport-location">{airport.presentation.subtitle}</div>
                        </div>
                        <div className="airport-type">{airport.navigation.entityType}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Destination Input */}
            <div className="form-group" ref={destinationDropdownRef}>
              <label>To</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, destination: e.target.value }));
                    handleAirportSearch('destination', e.target.value);
                    setShowDropdown(prev => ({ ...prev, destination: true }));
                  }}
                  placeholder="City or airport"
                />
                {showDropdown.destination && searchResults.destination.length > 0 && (
                  <div className="dropdown">
                    {searchResults.destination.map((airport) => (
                      <div
                        key={airport.skyId}
                        onClick={() => handleAirportSelect('destination', airport)}
                        className="dropdown-item"
                      >
                        <div className="airport-info">
                          <div className="airport-name">{airport.presentation.suggestionTitle}</div>
                          <div className="airport-location">{airport.presentation.subtitle}</div>
                        </div>
                        <div className="airport-type">{airport.navigation.entityType}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Picker */}
            <div className="form-group">
              <label>Departure</label>
              <DatePicker
                selected={formData.date}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, date }));
                  }
                }}
                minDate={new Date()}
                dateFormat="EEE, MMM d"
              />
            </div>

            {/* Passengers */}
            <div className="form-group">
              <label>Passengers</label>
              <select
                value={formData.adults}
                onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-button-container">
            <button
              onClick={() => {
                if (airports.origin && airports.destination) {
                  dispatch(searchFlights({
                    origin: airports.origin,
                    destination: airports.destination,
                    date: formData.date.toISOString().split('T')[0]
                  }));
                }
              }}
              className="search-button"
            >
              Search
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Flight Results */}
        {flightData.length > 0 && (
          <div className="flight-results">
            <div className="flight-results-header">
              <h2>Available Flights</h2>
              <div className="results-count">{flightData.length} flights found</div>
            </div>
            <div className="flight-cards-container">
              {flightData.map((flight, index) => (
                <FlightCard key={index} flight={flight} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch; 