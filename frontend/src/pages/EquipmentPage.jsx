import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, AlertCircle, PlusCircle } from 'lucide-react';
import EquipmentCard from '../components/EquipmentCard';
import { equipmentService } from '../services/equipmentService';

export default function EquipmentPage({
  initialCategory = 'all',
  onBookEquipment,
  onViewDetails,
}) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLab, setSelectedLab] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Sync initialCategory prop if changed externally
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Load Categories & Labs
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      try {
        const [cats, labList] = await Promise.all([
          equipmentService.getCategories(),
          equipmentService.getLabs(),
        ]);
        if (isMounted) {
          setCategories(cats);
          setLabs(labList);
        }
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    }
    loadMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Equipment on filter change
  useEffect(() => {
    let isMounted = true;
    async function fetchFilteredEquipment() {
      try {
        setLoading(true);
        const data = await equipmentService.getEquipmentList({
          search: searchQuery,
          category: selectedCategory,
          lab: selectedLab,
          condition: selectedCondition,
          availableOnly: availableOnly,
        });
        if (isMounted) setEquipmentList(data);
      } catch (err) {
        console.error('Failed to fetch equipment list', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchFilteredEquipment, 250);
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedLab, selectedCondition, availableOnly]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLab('all');
    setSelectedCondition('all');
    setAvailableOnly(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
          Campus Equipment & Instruments Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Explore research hardware, check live unit availability, and schedule booking slots.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-container">
        <div className="filter-bar-top">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by instrument name, asset tag, specs, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lab Select */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
            >
              <option value="all">All Labs & Locations</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Select */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              <option value="all">All Conditions</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="MAINTENANCE">Under Maintenance</option>
            </select>
          </div>

          {/* Available Only Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span>Available Now</span>
          </label>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== 'all' || selectedLab !== 'all' || selectedCondition !== 'all' || availableOnly) && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} title="Reset all search filters">
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Category Chips Bar */}
        <div className="category-chips">
          <button
            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories ({equipmentList.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-chip ${selectedCategory === c.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p>Fetching equipment catalog...</p>
        </div>
      ) : equipmentList.length > 0 ? (
        <div className="equipment-grid">
          {equipmentList.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onBook={onBookEquipment}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            maxWidth: '560px',
            margin: '2rem auto',
          }}
        >
          <AlertCircle size={44} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
            No Matching Equipment Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            No lab equipment matches the selected search keywords or category filters. Try resetting the filters.
          </p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
