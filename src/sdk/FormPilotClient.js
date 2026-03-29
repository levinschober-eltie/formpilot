// ═══ FormPilot SDK — Headless API Client ═══
// Use in Node.js or browser without React

export class FormPilotClient {
  constructor({ apiKey, baseUrl = '' }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}/api/v1${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    return data.data ?? data;
  }

  // ═══ Templates ═══
  async getTemplates() { return this.request('/templates'); }
  async getTemplate(id) { return this.request(`/templates/${id}`); }
  async createTemplate(template) { return this.request('/templates', { method: 'POST', body: JSON.stringify(template) }); }
  async updateTemplate(id, data) { return this.request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteTemplate(id) { return this.request(`/templates/${id}`, { method: 'DELETE' }); }

  // ═══ Submissions ═══
  async getSubmissions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.templateId) params.set('templateId', filters.templateId);
    const qs = params.toString();
    return this.request(`/submissions${qs ? '?' + qs : ''}`);
  }
  async getSubmission(id) { return this.request(`/submissions/${id}`); }
  async createSubmission(data) { return this.request('/submissions', { method: 'POST', body: JSON.stringify(data) }); }
  async updateSubmission(id, data) { return this.request(`/submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteSubmission(id) { return this.request(`/submissions/${id}`, { method: 'DELETE' }); }

  // ═══ Customers ═══
  async getCustomers() { return this.request('/customers'); }
  async createCustomer(data) { return this.request('/customers', { method: 'POST', body: JSON.stringify(data) }); }

  // ═══ Usage ═══
  async getUsage() { return this.request('/usage'); }
}

// Factory function
export function createFormPilotClient(options) {
  return new FormPilotClient(options);
}
