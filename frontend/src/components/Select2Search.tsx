import React, { useState, useEffect, useRef } from 'react';
import { CatalogItem } from '../types/consultation.js';
import { searchCatalog, addCustomCatalogItem } from '../services/api.js';

interface Select2SearchProps {
  category: 'alergia' | 'medicamento' | 'diagnostico' | 'motivo_consulta' | 'antecedente' | 'hallazgo_examen';
  placeholder?: string;
  isMulti?: boolean;
  values?: string[]; // for multi
  value?: string; // for single
  onChangeMulti?: (values: string[]) => void;
  onChangeSingle?: (value: string) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export const Select2Search: React.FC<Select2SearchProps> = ({
  category,
  placeholder = 'Escriba para buscar o seleccionar...',
  isMulti = false,
  values = [],
  value = '',
  onChangeMulti,
  onChangeSingle,
  label,
  helperText,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CatalogItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar opciones iniciales y filtrar al escribir con debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      const items = await searchCatalog(category, query);
      setOptions(items);
      setLoading(false);
      setHighlightedIndex(items.length > 0 ? 0 : -1);
    }, 200);

    return () => clearTimeout(timer);
  }, [category, query, isOpen]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (itemText: string) => {
    if (isMulti) {
      if (!values.includes(itemText)) {
        const next = [...values, itemText];
        onChangeMulti?.(next);
      }
      setQuery('');
      inputRef.current?.focus();
    } else {
      onChangeSingle?.(itemText);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleRemoveChip = (e: React.MouseEvent, itemText: string) => {
    e.stopPropagation();
    if (isMulti) {
      const next = values.filter(v => v !== itemText);
      onChangeMulti?.(next);
    }
  };

  const handleCreateCustom = async () => {
    if (!query.trim()) return;
    const customText = query.trim();
    // Guardar en backend
    await addCustomCatalogItem(category, customText);
    handleSelectItem(customText);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelectItem(options[highlightedIndex].name);
      } else if (query.trim().length > 0) {
        handleCreateCustom();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const exactMatchExists = options.some(opt => opt.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className={`select2-wrapper ${disabled ? 'is-disabled' : ''}`} ref={containerRef}>
      {label && <label className="select2-label">{label}</label>}

      <div
        className={`select2-box ${isOpen ? 'is-open' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {/* Renderizado de Chips si es Multi */}
        {isMulti && values.length > 0 && (
          <div className="select2-chips-container">
            {values.map((v, idx) => (
              <span key={idx} className="select2-chip">
                <span className="select2-chip-text">{v}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="select2-chip-remove"
                    onClick={(e) => handleRemoveChip(e, v)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Valor actual si es Single y no hay texto buscado */}
        {!isMulti && value && !query && (
          <div className="select2-single-value">{value}</div>
        )}

        {/* Input de búsqueda interactivo */}
        <input
          ref={inputRef}
          type="text"
          className="select2-input"
          value={query}
          placeholder={(!isMulti && value) ? '' : placeholder}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        <div className="select2-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {helperText && <span className="select2-helper">{helperText}</span>}

      {/* Menú desplegable flotante con resultados */}
      {isOpen && !disabled && (
        <div className="select2-dropdown animate-fade-in">
          {loading && <div className="select2-loading">Buscando en catálogo médico...</div>}

          {!loading && options.length === 0 && !query && (
            <div className="select2-no-results">Escriba para buscar opciones...</div>
          )}

          {!loading && (
            <ul className="select2-options-list">
              {options.map((opt, idx) => {
                const isSelected = isMulti ? values.includes(opt.name) : value === opt.name;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={opt.id}
                    className={`select2-option ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                    onClick={() => handleSelectItem(opt.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="select2-option-content">
                      {opt.code && <span className="select2-option-code">{opt.code}</span>}
                      <span className="select2-option-name">{opt.name}</span>
                    </div>
                    {isSelected && (
                      <span className="select2-check-icon">✓</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Opción de agregar término personalizado si no coincide exactamente */}
          {query.trim().length > 0 && !exactMatchExists && (
            <div
              className="select2-custom-add"
              onClick={handleCreateCustom}
            >
              <span>+ Usar término no listado: <strong>"{query.trim()}"</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
