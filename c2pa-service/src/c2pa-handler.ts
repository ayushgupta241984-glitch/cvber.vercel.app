import { Builder, Reader, LocalSigner } from '@contentauth/c2pa-node';
import * as fs from 'fs';
import * as path from 'path';

const MAX_TEMP_FILE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const SIGNED_FILES_DIR = path.join(process.cwd(), 'signed-files');

interface SignResult {
    signedFileUrl: string;
    manifest: any;
    signature: string;
    kmsKeyVersion: string;
}

interface VerifyResult {
    valid: boolean;
    manifest: any;
    errors?: string[];
}

function getCertPaths(): { certPath: string; keyPath: string } {
    return {
        certPath: process.env.C2PA_CERT || 'certs/certificate.pem',
        keyPath: process.env.C2PA_PRIVATE_KEY || 'certs/private.key',
    };
}

function cleanupOldTempFiles(): void {
    try {
        if (!fs.existsSync(SIGNED_FILES_DIR)) return;
        const now = Date.now();
        for (const file of fs.readdirSync(SIGNED_FILES_DIR)) {
            const filePath = path.join(SIGNED_FILES_DIR, file);
            try {
                const stat = fs.statSync(filePath);
                if (now - stat.mtimeMs > MAX_TEMP_FILE_AGE_MS) {
                    fs.unlinkSync(filePath);
                }
            } catch {
                // skip files we can't stat
            }
        }
    } catch {
        // cleanup is best-effort
    }
}

function validateCertificates(certPath: string, keyPath: string): void {
    if (!fs.existsSync(certPath)) {
        throw new Error(`C2PA certificate not found at: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
        throw new Error(`C2PA private key not found at: ${keyPath}`);
    }
    const certContent = fs.readFileSync(certPath, 'utf-8');
    if (!certContent.includes('BEGIN CERTIFICATE')) {
        throw new Error('Invalid certificate format: missing BEGIN CERTIFICATE header');
    }
}

export async function signFile(
    fileBuffer: Buffer,
    metadata: {
        author: string;
        timestamp: string;
        file_name?: string;
        scan_results?: any;
    }
): Promise<SignResult> {
    let tempInputPath: string | null = null;
    let tempOutputPath: string | null = null;

    try {
        const { certPath, keyPath } = getCertPaths();
        validateCertificates(certPath, keyPath);

        const signer = LocalSigner.newSigner(
            fs.readFileSync(certPath),
            fs.readFileSync(keyPath),
            'es256'
        );

        const builder = Builder.new();

        const actionsAssertion = {
            actions: [
                {
                    action: 'c2pa.scanned',
                    when: metadata.timestamp,
                    softwareAgent: 'CVBER Free AI Scanner',
                    parameters: { author: metadata.author }
                }
            ]
        };
        builder.addAssertion('c2pa.actions', actionsAssertion);

        if (metadata.scan_results) {
            builder.addAssertion('cvber.scan_results', metadata.scan_results);
        }

        cleanupOldTempFiles();

        if (!fs.existsSync(SIGNED_FILES_DIR)) {
            fs.mkdirSync(SIGNED_FILES_DIR, { recursive: true });
        }

        const timestamp = Date.now();
        tempInputPath = path.join(SIGNED_FILES_DIR, `temp-input-${timestamp}.bin`);
        fs.writeFileSync(tempInputPath, fileBuffer);

        const outputFilename = `signed-${timestamp}.bin`;
        tempOutputPath = path.join(SIGNED_FILES_DIR, outputFilename);

        builder.signFile(
            signer,
            tempInputPath,
            { path: tempOutputPath } as any
        );

        const manifest = builder.getManifestDefinition();

        return {
            signedFileUrl: tempOutputPath,
            manifest: manifest,
            signature: 'c2pa-signature-hash',
            kmsKeyVersion: process.env.C2PA_KEY_VERSION || 'v1'
        };
    } catch (error: any) {
        console.error('C2PA signing error:', error);
        throw new Error(`Failed to sign file: ${error.message}`);
    } finally {
        // Guaranteed cleanup of temp input file
        if (tempInputPath) {
            try { fs.unlinkSync(tempInputPath); } catch { /* ignore */ }
        }
    }
}

export async function verifyFile(fileBuffer: Buffer): Promise<VerifyResult> {
    try {
        const reader = await Reader.fromAsset({ buffer: fileBuffer } as any);

        if (!reader) {
            return { valid: false, manifest: null, errors: ['No C2PA manifest found'] };
        }

        const manifestStore = reader.json();
        const storeAny = manifestStore as any;
        const validationStatus = storeAny.validation_status || storeAny.validationStatus || [];

        const isValid = validationStatus.length === 0 ||
            validationStatus.every((s: any) => s.code === 'claimSignature.validated');

        return {
            valid: isValid,
            manifest: storeAny.active_manifest || storeAny.activeManifest,
            errors: isValid ? [] : validationStatus.map((s: any) => s.explanation)
        };
    } catch (error: any) {
        console.error('C2PA verification error:', error);
        return { valid: false, manifest: null, errors: [error.message] };
    }
}
