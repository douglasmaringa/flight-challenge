import FlightSearch from './components/FlightSearch';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Google Flights Clone (Core)</h1>
        <FlightSearch />
      </div>
    </div>
  );
}

export default App;