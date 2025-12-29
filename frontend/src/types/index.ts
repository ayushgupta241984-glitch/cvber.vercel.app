export interface RiskReport {
    overall_risk_score: number;
    threat_categories: ThreatCategory[];
    detailed_findings: DetailedFinding[];
    recommendations: Recommendation[];
    confidence_level: number;
    scan_timestamp: string;
    file_metadata: {
        file_name: string;
        file_type: string;
        file_size: number;
    };
}

export interface ThreatCategory {
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
}

export interface DetailedFinding {
    category: string;
    description: string;
    evidence?: string;
    line_number?: number;
}

export interface Recommendation {
    priority: 'low' | 'medium' | 'high';
    action: string;
    rationale: string;
}

export interface ScanResult {
    scan_id: string;
    status: 'pending' | 'scanning' | 'completed' | 'failed';
    risk_report?: RiskReport;
    message?: string;
}

export interface FileItem {
    id: string;
    name: string;
    size: number;
    status: 'scanning' | 'safe' | 'warning' | 'danger';
    riskScore?: number;
    uploadedAt: string;
}
