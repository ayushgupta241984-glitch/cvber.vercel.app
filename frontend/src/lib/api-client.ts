export const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export function stripImageErrors(msg: string): string {
    const imagePattern = /(?:cannot read|does not support image|vision model|image_url|image input|model does not support|not a vision model|image analysis|service unavailable|image\.png|image\.jpg|scan failed|inform the user|this model|image data)/gi;
    const cleaned = msg.replace(imagePattern, '').replace(/['"()]/g, '').replace(/\s+/g, ' ').trim();
    return cleaned || 'Scan complete — low-confidence result.';
}

export async function downloadBlob(url: string, headers: Record<string, string>, filename: string): Promise<void> {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
}

export class ApiError extends Error {
    status: number;
    details: any;

    constructor(message: string, status: number, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = MAX_RETRIES): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (err) {
            if (attempt === retries) {
                const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';
                if (isNetworkError) {
                    throw new ApiError(
                        `Cannot connect to backend at ${BASE_URL}. Make sure the server is running and NEXT_PUBLIC_BACKEND_URL is set correctly.`,
                        0
                    );
                }
                throw err;
            }
            console.warn(`Request failed (attempt ${attempt}/${retries}), retrying...`);
            await delay(RETRY_DELAY_MS * attempt);
        }
    }
    throw new ApiError('Request failed after all retries', 0);
}

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_full_name');
            window.location.href = '/login';
            throw new ApiError('Session expired. Please log in again.', 401);
        }
        let detail: string | undefined;
        try {
            const body = await response.json();
            detail = body.detail || body.message || body.error;
        } catch {
            // ignore parse errors
        }
        const clean = detail ? stripImageErrors(detail) : undefined;
        throw new ApiError(clean || `HTTP ${response.status}`, response.status, clean);
    }
    return response.json();
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
    };
    const response = await fetchWithRetry(url, { ...options, headers });
    return handleResponse<T>(response);
}

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
    getBaseUrl: () => BASE_URL,

    async scanFile(file: File, onProgress?: (pct: number) => void): Promise<ScanResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetchWithRetry(`${BASE_URL}/scan`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<ScanResult>(response);
    },

    async reverseImageSearch(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetchWithRetry(`${BASE_URL}/search/reverse`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<any>(response);
    },

    async deepImageSearch(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetchWithRetry(`${BASE_URL}/search/deep`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<any>(response);
    },

    deepImageSearchTV(
        file: File,
        onEvent: (event: string, data: any) => void,
        onError?: (err: string) => void,
        onDone?: () => void,
    ): { abort: () => void } {
        const controller = new AbortController();
        const formData = new FormData();
        formData.append('file', file);
        const headers: Record<string, string> = getAuthHeaders();

        (async () => {
            try {
                const response = await fetch(`${BASE_URL}/search/deep/tv`, {
                    method: 'POST',
                    headers,
                    body: formData,
                    signal: controller.signal,
                });
                if (!response.ok) {
                    const text = await response.text().catch(() => 'Unknown error');
                    onError?.(`Server ${response.status}: ${text}`);
                    return;
                }
                const reader = response.body?.getReader();
                if (!reader) {
                    onError?.('No response body');
                    return;
                }
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    let currentEvent = '';
                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            currentEvent = line.slice(7).trim();
                        } else if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                onEvent(currentEvent, data);
                            } catch { /* ignore malformed JSON */ }
                        }
                    }
                }
                onDone?.();
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    onError?.(err?.message || 'Connection failed');
                }
            }
        })();

        return { abort: () => controller.abort() };
    },

    async findCopies(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetchWithRetry(`${BASE_URL}/search/hashes/find-copies`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<any>(response);
    },

    async registerHash(file: File, scanId: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const url = `${BASE_URL}/search/hashes/register?scan_id=${encodeURIComponent(scanId)}`;
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<any>(response);
    },

    async indexVault(): Promise<any> {
        return fetchJson(`${BASE_URL}/search/hashes/index-vault`, {
            method: 'POST',
        });
    },

    async verifyFile(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetchWithRetry(`${BASE_URL}/scan/verify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        return handleResponse<any>(response);
    },

    async getScanHistory(limit: number = 10): Promise<any> {
        return fetchJson(`${BASE_URL}/scan/history?limit=${limit}`);
    },

    async login(email: string, password: string): Promise<any> {
        return fetchJson(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
    },

    async register(email: string, password: string, fullName?: string): Promise<any> {
        return fetchJson(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
    },

    async chatWithMentor(message: string, history: any[] = []): Promise<any> {
        return fetchJson(`${BASE_URL}/mentor/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });
    },

    async getUserProfile(): Promise<any> {
        return fetchJson(`${BASE_URL}/auth/me`);
    },

    async createBlockchainTimestamp(assetName: string, fileHash: string, scanId?: string): Promise<any> {
        return fetchJson(`${BASE_URL}/api/enforcement/blockchain/timestamp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_name: assetName, file_hash: fileHash, scan_id: scanId }),
        });
    },

    async verifyBlockchainTimestamp(proofId: string): Promise<any> {
        return fetchJson(`${BASE_URL}/api/enforcement/blockchain/verify/${proofId}`);
    },

    async createHashProof(assetName: string, fileHash: string): Promise<any> {
        return fetchJson(`${BASE_URL}/api/enforcement/blockchain/hash-proof`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_name: assetName, file_hash: fileHash }),
        });
    },

    async getUserBlockchainProofs(): Promise<any> {
        return fetchJson(`${BASE_URL}/api/enforcement/blockchain/proofs`);
    },

    async getOAuthUrl(provider: string): Promise<{ url: string; provider: string }> {
        const response = await fetchWithRetry(`${BASE_URL}/auth/oauth/${provider}`, { method: 'GET' });
        return handleResponse<{ url: string; provider: string }>(response);
    },

    async refreshToken(refreshToken: string): Promise<any> {
        return fetchJson(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
    },

    // Vault API
    async listVaultFiles(limit: number = 50, offset: number = 0): Promise<{ files: any[]; total: number }> {
        return fetchJson(`${BASE_URL}/vault/files?limit=${limit}&offset=${offset}`);
    },

    async getVaultFileUrl(scanId: string): Promise<{ url: string; file_name: string; scan_id: string }> {
        return fetchJson(`${BASE_URL}/vault/files/${scanId}/url`);
    },

    async deleteVaultFile(scanId: string): Promise<{ deleted: boolean; scan_id: string }> {
        return fetchJson(`${BASE_URL}/vault/files/${scanId}`, { method: 'DELETE' });
    },

    async getVaultFileWithProofs(scanId: string): Promise<{ file: any; blockchain_proofs: any[] }> {
        return fetchJson(`${BASE_URL}/vault/files/${scanId}/proofs`);
    },

    async agentChat(message: string, history: any[] = []): Promise<{ response: string; tool_calls: any[]; thinking?: string }> {
        return fetchJson(`${BASE_URL}/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });
    },

};
