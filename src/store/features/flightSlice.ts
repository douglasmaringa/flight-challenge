import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Interface for airport data from the API
export interface Airport {
  skyId: string;
  entityId: string;
  presentation: {
    title: string;
    suggestionTitle: string;
    subtitle: string;
  };
  navigation: {
    entityId: string;
    entityType: string;
  };
}

// Interface for processed flight results
export interface FlightResult {
  airline: string;
  airlineCode: string;
  price: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  stops: number;
  flightNumber: string;
}

// Main state interface for the flight slice
interface FlightState {
  airports: {
    origin: Airport | null;
    destination: Airport | null;
  };
  flightData: FlightResult[];
  loading: boolean;
  error: string | null;
}

// Initial state for the flight slice
const initialState: FlightState = {
  airports: {
    origin: null,
    destination: null
  },
  flightData: [],
  loading: false,
  error: null
};

// Thunk to search for airports using the API
export const searchAirports = createAsyncThunk(
  'flights/searchAirports',
  async (query: string) => {
    const response = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
          'x-rapidapi-key': '498e0ba7ebmsh9e5605def0dfbdbp177606jsna5148e5b858e'
        }
      }
    );

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || 'Failed to search airports');
    }
    return data.data || [];
  }
);

// Thunk to search for flights using selected airports
export const searchFlights = createAsyncThunk(
  'flights/search',
  async (params: { origin: Airport; destination: Airport; date: string }) => {
    const { origin, destination, date } = params;
    
    const searchUrl = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?originSkyId=${origin.skyId}&destinationSkyId=${destination.skyId}&originEntityId=${origin.entityId}&destinationEntityId=${destination.entityId}&date=${date}&adults=1&currency=USD&locale=en-US&market=en-US&cabinClass=economy&countryCode=US`;

    const response = await fetch(searchUrl, {
      headers: {
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
        'x-rapidapi-key': '498e0ba7ebmsh9e5605def0dfbdbp177606jsna5148e5b858e'
      }
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || 'Failed to search flights');
    }

    // Process flight results to extract relevant information
    const itineraries = data.data?.itineraries;
    const flightResults = itineraries?.slice(0, 10).map((item: any) => {
      const leg = item.legs?.[0];
      return {
        price: item.price?.formatted || 'N/A',
        airline: leg?.carriers?.marketing?.[0]?.name || 'Unknown',
        duration: leg?.durationInMinutes
          ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m`
          : 'Unknown',
      };
    }) || [];

    return flightResults;
  }
);

// Create the flight slice with reducers and extra reducers
export const flightSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    // Set selected airport (origin or destination)
    setAirport: (state, action: PayloadAction<{ type: 'origin' | 'destination'; airport: Airport }>) => {
      if (action.payload.type === 'origin') {
        state.airports.origin = action.payload.airport;
      } else {
        state.airports.destination = action.payload.airport;
      }
    },
    // Clear flight data and error state
    clearFlightData: (state) => {
      state.flightData = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle airport search states
      .addCase(searchAirports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAirports.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(searchAirports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search airports';
      })
      // Handle flight search states
      .addCase(searchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flightData = action.payload;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search flights';
      });
  }
});

export const { setAirport, clearFlightData } = flightSlice.actions;
export default flightSlice.reducer;
