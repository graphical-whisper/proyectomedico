import { CatalogItem, InpatientConsultation } from '../types/consultation.js';

const API_BASE = '/api';

export async function searchCatalog(category: string, query?: string): Promise<CatalogItem[]> {
  try {
    const url = new URL(`${API_BASE}/catalogos/${category}`, window.location.origin);
    if (query && query.trim().length > 0) {
      url.searchParams.set('q', query.trim());
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Error al consultar catalogo');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
}

export async function addCustomCatalogItem(category: string, name: string): Promise<CatalogItem | null> {
  try {
    const res = await fetch(`${API_BASE}/catalogos/${category}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Error al registrar nuevo termino');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return null;
  }
}

export async function saveConsultation(consultation: InpatientConsultation): Promise<{ success: boolean; data?: InpatientConsultation; summaryText?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultation)
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Error al guardar la consulta' };
    }
    return { success: true, data: json.data, summaryText: json.summaryText };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error de conexion con el servidor' };
  }
}

export async function previewSummary(consultation: InpatientConsultation): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/consultas/preview-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultation)
    });
    if (!res.ok) return '';
    const json = await res.json();
    return json.summaryText || '';
  } catch {
    return '';
  }
}

export async function checkServerHealth(): Promise<{ databaseConnected: boolean; status: string }> {
  try {
    const res = await fetch(`${API_BASE}/salud`);
    if (!res.ok) return { databaseConnected: false, status: 'error' };
    return await res.json();
  } catch {
    return { databaseConnected: false, status: 'offline' };
  }
}
