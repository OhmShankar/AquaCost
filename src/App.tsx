import React, { useState, useEffect } from 'react';
import './App.css';
import GettingStarted from './GettingStarted';
import { 
  estimateRainwaterCollectionCost, 
  estimateHVACCondensateSystemCost,
  validateRainwaterForm,
  validateHVACForm,
  type CalculatorResponse as CalculatorResult 
} from './calculationUtils';

function App() {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'getting-started'>('calculator');
  const [activeTab, setActiveTab] = useState<'rainwater' | 'hvac'>('rainwater');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);


  // Rainwater form state
  const [rainwaterForm, setRainwaterForm] = useState({
    roof_area_sqft: '',
    annual_rainfall_inches: '',
    piping_length_feet: '',
    potable: false,
    storage_gallons: '',
    // Advanced material options
    roof_type: 'asphalt_shingles',
    gutter_material: 'aluminum',
    piping_material: 'pvc',
    tank_material: 'polyethylene_above_ground',
    pump_size: 'mid_sized_whole_house',
    include_excavation: false,
    include_pressure_tank: true
  });

  // HVAC form state
  const [hvacForm, setHvacForm] = useState({
    num_units: '',
    tons_per_unit: '',
    days_per_year: '',
    piping_length_feet: '',
    potable: false,
    storage_gallons: '',
    // Advanced material options
    piping_material: 'pvc_tubing',
    tank_type: 'small_poly_100_500',
    pump_type: 'small_condensate'
  });


  // Auto-scroll to results when calculation completes
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Small delay to ensure the component has rendered
    }
  }, [result]);





  const handleRainwaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Validate form data
    const requestData = {
      roof_area_sqft: parseFloat(rainwaterForm.roof_area_sqft),
      annual_rainfall_inches: parseFloat(rainwaterForm.annual_rainfall_inches),
      piping_length_feet: parseFloat(rainwaterForm.piping_length_feet),
      potable: rainwaterForm.potable,
      storage_gallons: rainwaterForm.storage_gallons ? parseFloat(rainwaterForm.storage_gallons) : undefined,
      // Advanced material options
      roof_type: rainwaterForm.roof_type,
      gutter_material: rainwaterForm.gutter_material,
      piping_material: rainwaterForm.piping_material,
      tank_material: rainwaterForm.tank_material,
      pump_size: rainwaterForm.pump_size,
      include_excavation: rainwaterForm.include_excavation,
      include_pressure_tank: rainwaterForm.include_pressure_tank
    };

    // Validate input data
    const validationErrors = validateRainwaterForm(requestData);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      setLoading(false);
      return;
    }

    // Add small delay to show loading state
    setTimeout(() => {
      try {
        const result = estimateRainwaterCollectionCost(
          requestData.roof_area_sqft,
          requestData.annual_rainfall_inches,
          requestData.piping_length_feet,
          requestData.potable,
          requestData.storage_gallons,
          requestData.roof_type,
          requestData.gutter_material,
          requestData.piping_material,
          requestData.tank_material,
          requestData.pump_size,
          requestData.include_excavation,
          requestData.include_pressure_tank
        );
        setResult(result);
      } catch (error) {
        console.error('Error calculating:', error);
        alert('Calculation error. Please check your inputs.');
      } finally {
        setLoading(false);
      }
    }, 300); // Small delay to show loading state
  };

  const handleHvacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Validate form data
    const requestData = {
      num_units: parseInt(hvacForm.num_units),
      tons_per_unit: parseFloat(hvacForm.tons_per_unit),
      days_per_year: parseInt(hvacForm.days_per_year),
      piping_length_feet: parseFloat(hvacForm.piping_length_feet),
      potable: hvacForm.potable,
      storage_gallons: hvacForm.storage_gallons ? parseFloat(hvacForm.storage_gallons) : undefined,
      // Advanced material options
      piping_material: hvacForm.piping_material,
      tank_type: hvacForm.tank_type,
      pump_type: hvacForm.pump_type
    };

    // Validate input data
    const validationErrors = validateHVACForm(requestData);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      setLoading(false);
      return;
    }

    // Add small delay to show loading state
    setTimeout(() => {
      try {
        const result = estimateHVACCondensateSystemCost(
          requestData.num_units,
          requestData.tons_per_unit,
          requestData.days_per_year,
          requestData.piping_length_feet,
          requestData.potable,
          requestData.storage_gallons,
          requestData.piping_material,
          requestData.tank_type,
          requestData.pump_type
        );
        setResult(result);
      } catch (error) {
        console.error('Error calculating:', error);
        alert('Calculation error. Please check your inputs.');
      } finally {
        setLoading(false);
      }
    }, 300); // Small delay to show loading state
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helpers to present +/- 10% ranges for displayed values
  const VARIATION = 0.10;
  const getRange = (value: number, pct: number = VARIATION) => ({
    min: Math.round(value * (1 - pct)),
    max: Math.round(value * (1 + pct)),
  });
  const formatCurrencyRange = (value: number) => {
    const { min, max } = getRange(value);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };
  const formatNumberRange = (value: number) => {
    const { min, max } = getRange(value);
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  return (
    <div className="App">
      <header className={`App-header`}>
        <div className="header-content">
          <div className="app-bar">
            <div className="app-title-group">
              <span className="app-icon">💧</span>
              <div className="app-text">
                <h1 className="app-title">AquaCost</h1>
                <p className="app-subtitle">Water system cost calculator</p>
              </div>
            </div>

            <nav className="app-nav-tabs">
              <button
                className={`app-nav-tab ${currentPage === 'calculator' ? 'active' : ''}`}
                onClick={() => setCurrentPage('calculator')}
              >🧮 Calculator</button>

              <button
                className={`app-nav-tab ${currentPage === 'getting-started' ? 'active' : ''}`}
                onClick={() => setCurrentPage('getting-started')}
              >📚 Guide</button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        {currentPage === 'getting-started' ? (
          <GettingStarted />
        ) : (
          <div className="calculator-container">
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'rainwater' ? 'active' : ''}`}
                onClick={() => { setActiveTab('rainwater'); setResult(null); }}
              >
                <span className="tab-icon">🌧️</span>
                Rainwater Harvesting
              </button>
              <button 
                className={`tab-button ${activeTab === 'hvac' ? 'active' : ''}`}
                onClick={() => { setActiveTab('hvac'); setResult(null); }}
              >
                <span className="tab-icon">❄️</span>
                HVAC Condensate
              </button>
            </div>

          <div className="calculator-content">
            <div className="calculator-form">
              {activeTab === 'rainwater' ? (
                <div className="form-section">
                  <h2 className="form-title">Rainwater Harvesting System</h2>
                  <p className="form-description">
                    Calculate costs for collecting and storing rainwater from your roof surface.
                  </p>
                  
                  <form onSubmit={handleRainwaterSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="roof_area">Roof Area (sq ft)</label>
                        <input
                          type="number"
                          id="roof_area"
                          value={rainwaterForm.roof_area_sqft}
                          onChange={(e) => setRainwaterForm({...rainwaterForm, roof_area_sqft: e.target.value})}
                          placeholder="e.g., 2000"
                          required
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="rainfall">Annual Rainfall (inches)</label>
                        <input
                          type="number"
                          id="rainfall"
                          value={rainwaterForm.annual_rainfall_inches}
                          onChange={(e) => setRainwaterForm({...rainwaterForm, annual_rainfall_inches: e.target.value})}
                          placeholder="e.g., 32"
                          required
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="piping">Piping Length (feet)</label>
                        <input
                          type="number"
                          id="piping"
                          value={rainwaterForm.piping_length_feet}
                          onChange={(e) => setRainwaterForm({...rainwaterForm, piping_length_feet: e.target.value})}
                          placeholder="e.g., 100"
                          required
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="storage">Storage Tank Size (gallons)</label>
                        <input
                          type="number"
                          id="storage"
                          value={rainwaterForm.storage_gallons}
                          onChange={(e) => setRainwaterForm({...rainwaterForm, storage_gallons: e.target.value})}
                          placeholder="Auto-calculated if empty"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    
                    {/* Advanced Material Options */}
                    <div className="advanced-options">
                      <h4 className="options-title">🔧 Advanced Material Options</h4>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="roof_type">Roof Type</label>
                          <select
                            id="roof_type"
                            value={rainwaterForm.roof_type}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, roof_type: e.target.value})}
                          >
                            <option value="asphalt_shingles">Asphalt Shingles (85% efficiency)</option>
                            <option value="metal">Metal (90% efficiency)</option>
                            <option value="tile">Tile (80% efficiency)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="gutter_material">Gutter Material</label>
                          <select
                            id="gutter_material"
                            value={rainwaterForm.gutter_material}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, gutter_material: e.target.value})}
                          >
                            <option value="vinyl">Vinyl ($3-5/ft + labor)</option>
                            <option value="aluminum">Aluminum ($5-9/ft + labor)</option>
                            <option value="galvanized_steel">Galvanized Steel ($8-12/ft + labor)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="piping_material">Piping Material</label>
                          <select
                            id="piping_material"
                            value={rainwaterForm.piping_material}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, piping_material: e.target.value})}
                          >
                            <option value="pvc">PVC ($1.50-3/ft + labor)</option>
                            <option value="hdpe">HDPE ($2-4/ft + labor)</option>
                            <option value="copper">Copper ($6-10/ft + labor)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="tank_material">Tank Material</label>
                          <select
                            id="tank_material"
                            value={rainwaterForm.tank_material}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, tank_material: e.target.value})}
                          >
                            <option value="polyethylene_above_ground">Polyethylene Above Ground ($0.60-1/gal)</option>
                            <option value="fiberglass">Fiberglass ($1.50-2.50/gal)</option>
                            <option value="concrete_underground">Concrete Underground ($2.50-5/gal)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="pump_size">Pump System</label>
                          <select
                            id="pump_size"
                            value={rainwaterForm.pump_size}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, pump_size: e.target.value})}
                          >
                            <option value="small_booster">Small Booster ($300-600 + install)</option>
                            <option value="mid_sized_whole_house">Mid-Sized Whole House ($800-1500 + install)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="checkbox-group">
                      <div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={rainwaterForm.potable}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, potable: e.target.checked})}
                          />
                          <span className="checkmark"></span>
                          Potable water system (includes UV filtration)
                          < br />
                        </label>
                      </div>

                      <div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={rainwaterForm.include_pressure_tank}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, include_pressure_tank: e.target.checked})}
                          />
                          <span className="checkmark"></span>
                          Include pressure tank ($200-500)
                          < br />
                        </label>
                      </div>

                      <div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={rainwaterForm.include_excavation}
                            onChange={(e) => setRainwaterForm({...rainwaterForm, include_excavation: e.target.checked})}
                          />
                          <span className="checkmark"></span>
                          Include excavation for underground tank ($1000-5000)
                        </label>
                      </div>
                    </div>
                    
                    <button type="submit" className="btn-calculate" disabled={loading}>
                      {loading ? 'Calculating...' : '💧 Calculate Rainwater System'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="form-section">
                  <h2 className="form-title">HVAC Condensate Recovery</h2>
                  <p className="form-description">
                    Calculate costs for capturing and reusing condensate from your HVAC system.
                  </p>
                  
                  <form onSubmit={handleHvacSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="num_units">Number of HVAC Units</label>
                        <input
                          type="number"
                          id="num_units"
                          value={hvacForm.num_units}
                          onChange={(e) => setHvacForm({...hvacForm, num_units: e.target.value})}
                          placeholder="e.g., 2"
                          required
                          min="1"
                          step="1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tons_per_unit">Tons per Unit</label>
                        <input
                          type="number"
                          id="tons_per_unit"
                          value={hvacForm.tons_per_unit}
                          onChange={(e) => setHvacForm({...hvacForm, tons_per_unit: e.target.value})}
                          placeholder="e.g., 3"
                          required
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="days_per_year">Operating Days/Year</label>
                        <input
                          type="number"
                          id="days_per_year"
                          value={hvacForm.days_per_year}
                          onChange={(e) => setHvacForm({...hvacForm, days_per_year: e.target.value})}
                          placeholder="e.g., 200"
                          required
                          min="1"
                          max="365"
                          step="1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="hvac_piping">Piping Length (feet)</label>
                        <input
                          type="number"
                          id="hvac_piping"
                          value={hvacForm.piping_length_feet}
                          onChange={(e) => setHvacForm({...hvacForm, piping_length_feet: e.target.value})}
                          placeholder="e.g., 80"
                          required
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="hvac_storage">Storage Tank Size (gallons)</label>
                        <input
                          type="number"
                          id="hvac_storage"
                          value={hvacForm.storage_gallons}
                          onChange={(e) => setHvacForm({...hvacForm, storage_gallons: e.target.value})}
                          placeholder="Auto-calculated if empty"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                    
                    {/* Advanced Material Options */}
                    <div className="advanced-options">
                      <h4 className="options-title">🔧 Advanced Material Options</h4>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="hvac_piping_material">Piping Material</label>
                          <select
                            id="hvac_piping_material"
                            value={hvacForm.piping_material}
                            onChange={(e) => setHvacForm({...hvacForm, piping_material: e.target.value})}
                          >
                            <option value="pvc_tubing">PVC Tubing ($0.50-1.50/ft + labor)</option>
                            <option value="flexible_condensate">Flexible Condensate ($0.70-2/ft + labor)</option>
                            <option value="copper_rare">Copper - Rare ($5-8/ft + labor)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="tank_type">Storage Tank Type</label>
                          <select
                            id="tank_type"
                            value={hvacForm.tank_type}
                            onChange={(e) => setHvacForm({...hvacForm, tank_type: e.target.value})}
                          >
                            <option value="small_poly_100_500">Small Poly 100-500 gal ($150-700)</option>
                            <option value="large_poly_1000_plus">Large Poly 1000+ gal ($0.70-1/gal)</option>
                            <option value="indoor_sump">Indoor Sump/Condensate ($200-500)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="pump_type">Pump System Type</label>
                          <select
                            id="pump_type"
                            value={hvacForm.pump_type}
                            onChange={(e) => setHvacForm({...hvacForm, pump_type: e.target.value})}
                          >
                            <option value="small_condensate">Small Condensate ($80-200 + install)</option>
                            <option value="sump_transfer">Sump/Transfer ($200-500 + install)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={hvacForm.potable}
                          onChange={(e) => setHvacForm({...hvacForm, potable: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Potable water system (includes UV filtration)
                      </label>
                    </div>
                    
                    <button type="submit" className="btn-calculate" disabled={loading}>
                      {loading ? 'Calculating...' : '❄️ Calculate HVAC System'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {result && (
              <div className="results-section" ref={resultsRef}>
                <h3 className="results-title">💰 Cost Estimate</h3>
                
                <div className="cost-range">
                  <div className="cost-primary">
                    {formatCurrencyRange(result.breakdown.total)}
                  </div>
                  <div className="cost-note">
                    Estimated total system cost (±10% variation)
                  </div>
                </div>
                
                <div className="results-grid">
                  <div className="result-card">
                    <div className="result-value">{formatNumberRange(result.annual_water_collection)}</div>
                    <div className="result-label">Gallons/Year</div>
                  </div>
                  
                  <div className="result-card">
                    <div className="result-value">{formatNumberRange(result.tank_size)}</div>
                    <div className="result-label">Tank Size (gal)</div>
                  </div>
                </div>
                
                <div className="breakdown-section">
                  <h4 className="breakdown-title">💰 Detailed Cost Breakdown</h4>
                  <div className="breakdown-grid">
                    {/* Rainwater-specific costs */}
                    {activeTab === 'rainwater' && result.breakdown.gutter_cost && (
                      <div className="breakdown-item">
                        <span>Gutters & Downspouts</span>
                        <span>{formatCurrencyRange(result.breakdown.gutter_cost)}</span>
                      </div>
                    )}
                    
                    <div className="breakdown-item">
                      <span>Storage Tank</span>
                      <span>{formatCurrencyRange(result.breakdown.tank_cost)}</span>
                    </div>
                    
                    <div className="breakdown-item">
                      <span>Piping & Fittings</span>
                      <span>{formatCurrencyRange(result.breakdown.piping_cost)}</span>
                    </div>
                    
                    <div className="breakdown-item">
                      <span>Filtration & Treatment</span>
                      <span>{formatCurrencyRange(result.breakdown.filter_cost)}</span>
                    </div>
                    
                    <div className="breakdown-item">
                      <span>Pump System</span>
                      <span>{formatCurrencyRange(result.breakdown.pump_cost)}</span>
                    </div>
                    
                    {/* Rainwater-specific: Pressure Tank */}
                    {activeTab === 'rainwater' && result.breakdown.pressure_tank_cost && result.breakdown.pressure_tank_cost > 0 && (
                      <div className="breakdown-item">
                        <span>Pressure Tank</span>
                        <span>{formatCurrencyRange(result.breakdown.pressure_tank_cost)}</span>
                      </div>
                    )}
                    
                    {/* HVAC-specific: Unit connections */}
                    {result.breakdown.hvac_unit_cost && (
                      <div className="breakdown-item">
                        <span>HVAC Unit Connections</span>
                        <span>{formatCurrencyRange(result.breakdown.hvac_unit_cost)}</span>
                      </div>
                    )}
                    
                    <div className="breakdown-item">
                      <span className="breakdown-label-with-tooltip">
                        Miscellaneous & Permits
                        <span className="tooltip">
                          <span className="tooltip-icon">ⓘ</span>
                          <span className="tooltip-text">
                            {activeTab === 'rainwater' 
                              ? "Includes valves, unions, brackets, electrical connections, and permitting/inspection fees."
                              : "Includes mounting brackets, valves, overflow protection, electrical connections, and permitting for plumbing tie-ins."}
                          </span>
                        </span>
                      </span>
                      <span>{formatCurrencyRange(result.breakdown.misc_cost)}</span>
                    </div>
                    
                    {/* Rainwater-specific: Excavation */}
                    {activeTab === 'rainwater' && result.breakdown.excavation_cost && result.breakdown.excavation_cost > 0 && (
                      <div className="breakdown-item">
                        <span>Excavation (Underground Tank)</span>
                        <span>{formatCurrencyRange(result.breakdown.excavation_cost)}</span>
                      </div>
                    )}
                    
                    <div className="breakdown-item breakdown-total">
                      <span><strong>System Total</strong></span>
                      <span><strong>{formatCurrencyRange(result.breakdown.total)}</strong></span>
                    </div>
                  </div>
                  
                  {/* Dedicated Cost Display Section */}
                  <div className="final-cost-display">
                    <div className="cost-label">
                      {activeTab === 'rainwater' ? 'rainwater_cost' : 'hvac_cost'}
                    </div>
                    <div className="cost-value">
                      {formatCurrencyRange(result.breakdown.total)}
                    </div>
                    <div className="cost-range-display">
                      Variation: ±10% based on standard rates
                    </div>
                  </div>

                  <div className="disclaimer" style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#555' }}>
                    Disclaimer: Rates are based on standard materials and labor and may vary by region, site conditions, and contractor pricing.
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
