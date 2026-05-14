import { useState, useContext } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { GlobalContext } from '../context/GlobalContext';

export default function AddPropertyModal({ setIsModalOpen }) {
  // Pulling the passport and the refresh engine from the vault
  const { fetchAnalytics } = useContext(GlobalContext);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '', purchasePrice: '', mortgageBalance: '', interestRate: '', weeklyRent: '', strataFees: ''
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      portfolio_id: 1, 
      name_or_symbol: formData.name,
      asset_type: 'REAL_ESTATE',
      total_value: Number(formData.purchasePrice), 
      asset_metadata: {
        purchase_price: Number(formData.purchasePrice),
        mortgage_balance: Number(formData.mortgageBalance),
        interest_rate: Number(formData.interestRate),
        weekly_rent: Number(formData.weeklyRent),
        strata_fees_annual: Number(formData.strataFees)
      }
    };

    try {
      const response = await fetch('http://localhost:8000/assets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.[0]?.msg || "Failed to inject asset into the vault.");
      }

      setIsModalOpen(false);
      fetchAnalytics(); // Instantly update the global state!

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 25, 47, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '540px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0a192f', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Add Investment Property</h2>
            <p style={{ margin: '4px 0 0 0', color: '#8a9ab0', fontSize: '13px', fontWeight: '500' }}>Inject a new asset directly into your TimescaleDB vault.</p>
          </div>
          <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: '4px' }}><X size={24} /></button>
        </div>

        {errorMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fdf2f2', color: '#800020', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', border: '1px solid #f9dada' }}>
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleAddProperty} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Property Name / Address</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Apartment - Parramatta" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Current Value ($)</label><input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} placeholder="650000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Mortgage Balance ($)</label><input type="number" name="mortgageBalance" value={formData.mortgageBalance} onChange={handleInputChange} placeholder="600000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Interest Rate (%)</label><input type="number" step="0.01" name="interestRate" value={formData.interestRate} onChange={handleInputChange} placeholder="6.8" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Weekly Rent ($)</label><input type="number" name="weeklyRent" value={formData.weeklyRent} onChange={handleInputChange} placeholder="500" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
            <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0a192f', marginBottom: '6px' }}>Annual Strata & Rates ($)</label><input type="number" name="strataFees" value={formData.strataFees} onChange={handleInputChange} placeholder="6000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '15px' }} required /></div>
          </div>

          <button type="submit" disabled={isSaving} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%', padding: '14px', backgroundColor: '#9e1b32', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '12px', transition: 'opacity 0.2s', opacity: isSaving ? 0.8 : 1 }}>
            {isSaving ? <><Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} /> Injecting...</> : 'Confirm & Add to Portfolio'}
          </button>
        </form>

      </div>
    </div>
  );
}