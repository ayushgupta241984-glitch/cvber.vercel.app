const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface ScanResult {
    scan_id: string;
    status: string;
    risk_report?: {
        overall_risk_score: number;
        threat_categories: Array<{
            name: string;
            severity: string;
            confidence: number;
            description: string;
        }>;
        detailed_findings: Array<{
            category: string;
            description: string;
            evidence?: string;
        }>;
        recommendations: Array<{
            priority: string;
            action: string;
            rationale: string;
        }>;
        confidence_level: number;
    };
}

export const apiClient = {
    async scanFile(file: File): Promise<ScanResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/scan/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Scan failed');
        }

        return response.json();
    },

    async verifyFile(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/scan/verify`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Verification failed');
        }

        return response.json();
    },

    async getScanHistory(limit: number = 10): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/scan/history?limit=${limit}`);

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        return response.json();
    },

    async login(email: string, password: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        return response.json();
    },

    async register(email: string, password: string, fullName?: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, full_name: fullName }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        return response.json();
    },

    async chatWithMentor(message: string, history: any[] = []): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/mentor/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history }),
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        return response.json();
    },
};
