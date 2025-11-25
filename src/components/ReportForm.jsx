import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReportForm({ vendorId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.reason) {
        throw new Error('Please select a reason');
      }
      if (formData.description.length < 10) {
        throw new Error('Description must be at least 10 characters');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to submit a report');
      }

      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          vendor_id: vendorId,
          reason: formData.reason,
          description: formData.description,
          status: 'pending'
        });

      if (reportError) throw reportError;

      alert('✅ Report submitted successfully! Our team will review it.');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      setFormData({ reason: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem', 
        color: '#fff', 
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ⚠️ Report Vendor
      </h3>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.2)',
          border: '1px solid rgba(239,68,68,0.5)',
          color: '#ef4444',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '500'
        }}>
          Reason *
        </label>
        <select
          value={formData.reason}
          onChange={e => setFormData({ ...formData, reason: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            marginBottom: '1rem'
          }}
        >
          <option value="">Select a reason...</option>
          <option value="Poor Food Quality">Poor Food Quality</option>
          <option value="Wrong Item">Wrong Item</option>
          <option value="Expired Food">Expired Food</option>
          <option value="Unprofessional Behavior">Unprofessional Behavior</option>
          <option value="Hygiene Concerns">Hygiene Concerns</option>
          <option value="Other">Other</option>
        </select>

        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '500'
        }}>
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please describe the issue in detail (min 10 characters)..."
          required
          minLength={10}
          rows="5"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            marginBottom: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          ⚠️ Reports are reviewed by our admin team. We take all reports seriously and will take appropriate action.
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.reason || formData.description.length < 10}
            style={{
              flex: 1,
              padding: '10px',
              background: loading || !formData.reason || formData.description.length < 10
                ? 'rgba(107,114,128,0.5)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: loading || !formData.reason || formData.description.length < 10
                ? 'not-allowed'
                : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

