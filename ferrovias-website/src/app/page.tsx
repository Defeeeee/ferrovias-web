import Header from '@/components/Header';
import TrainMap from '@/components/TrainMap';
import StationDepartures from '@/components/StationDepartures';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Footer from '@/components/Footer';
import { MapPin, Clock, Users, Zap, BarChart3, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Track Trains in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Real-Time
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Modern, responsive train tracking for the Belgrano Norte railway line. 
              Get live updates on train positions and arrival times to plan your journey better.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>23 stations</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Live API data</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                <span>Station analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Mobile-friendly</span>
              </div>
            </div>
            <a
              href="#map"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              View Live Map
            </a>
          </div>
        </div>
      </section>

      {/* Main Map Section */}
      <section id="map" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrainMap />
        </div>
      </section>

      {/* Station Departures Section */}
      <section id="departures" className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Station Departures</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Get detailed departure information for individual stations with real-time updates and status indicators.
            </p>
          </div>
          <StationDepartures />
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section id="analytics" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Railway Analytics</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Comprehensive punctuality statistics, performance metrics, and data analysis based on historical timetable data. Import your own CSV data for custom analytics.
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our system processes real-time data from railway stations to estimate train positions along the track.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <div className="bg-blue-600 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Data Collection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We continuously fetch arrival time data from all 23 stations along the Belgrano Norte line, 
                processing updates every 30 seconds.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <div className="bg-emerald-600 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Position Calculation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Using sophisticated algorithms, we calculate estimated train positions between stations based on 
                arrival times and known travel durations.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <div className="bg-purple-600 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Live Visualization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The interactive map displays trains with color-coded destinations, smooth animations, 
                and detailed tooltips for the best user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">API Integration</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built on reliable API endpoints that provide comprehensive station and train data.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Real-time Data Source</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Our application connects to the official railway API to fetch live station data. 
                  When the API is unavailable, we seamlessly fall back to mock data to ensure 
                  continuous service.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Live API endpoint monitoring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Automatic fallback system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Error handling & recovery</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="text-xs text-slate-500 mb-2">API Endpoint</div>
                <code className="text-emerald-400 text-sm break-all">
                  https://ferrovias.fdiaznem.com.ar/stations/all/status
                </code>
                <div className="mt-4 text-xs text-slate-500">
                  Returns JSON data with arrival times for all trains at each station.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
