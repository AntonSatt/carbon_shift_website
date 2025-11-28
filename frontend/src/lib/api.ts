import { SimulationRequest, SimulationResponse, MetadataResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getMetadata(): Promise<MetadataResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/metadata`);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return response.json();
  }

  async runSimulation(request: SimulationRequest): Promise<SimulationResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Simulation failed' }));
      throw new Error(error.detail || 'Simulation failed');
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
