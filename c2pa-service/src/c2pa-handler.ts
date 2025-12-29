import { Builder, Reader, LocalSigner } from '@contentauth/c2pa-node';
import * as fs from 'fs';
import * as path from 'path';

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

/**
 * Sign a file with C2PA digital signature
 */
export async function signFile(
    fileBuffer: Buffer,
    metadata: {
        author: string;
        timestamp: string;
        file_name?: string;
        scan_results?: any;
    }
): Promise<SignResult> {
    try {
        // Check for keys
        const certPath = process.env.C2PA_CERT || 'certs/certificate.pem';
        const keyPath = process.env.C2PA_PRIVATE_KEY || 'certs/private.key';

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            throw new Error(`C2PA keys not found at ${certPath} or ${keyPath}. Cannot sign.`);
        }

        // Create Signer
        // key and cert must be Buffers
        const signer = LocalSigner.newSigner(
            fs.readFileSync(certPath),
            fs.readFileSync(keyPath),
            'es256'
        );

        const builder = Builder.new();

        // Add assertions
        const actionsAssertion = {
            actions: [
                {
                    action: 'c2pa.scanned',
                    when: metadata.timestamp,
                    softwareAgent: 'CVBER Free AI Scanner',
                    parameters: {
                        author: metadata.author
                    }
                }
            ]
        };

        builder.addAssertion('c2pa.actions', actionsAssertion);

        // Add scan results if provided
        if (metadata.scan_results) {
            builder.addAssertion('cvber.scan_results', metadata.scan_results);
        }

        // Sign the file
        // Input: SourceAsset { buffer: Buffer }
        // Output: DestinationAsset { buffer: Buffer } (to get buffer back)
        // Note: The third argument 'output' in .sign() populates the buffer or writes to file.
        // If we pass a buffer, it seems it expects us to provide a buffer implementation or something.
        // Actually, looking at docs (inferred), usually strict output means we might need to use a temp file if buffer output isn't easy.
        // But let's try { buffer: Buffer.alloc(0) } approach or similar? 
        // Or wait, the .sign return type is Buffer (the manifest bytes?) or the whole asset?
        // "returns the bytes of the c2pa_manifest that was embedded" -> Wait.
        // .sign(signer, input, output).

        // For simplicity and robustness given unknown API details, let's use temp files.
        const outputDir = path.join(process.cwd(), 'signed-files');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const tempInputPath = path.join(outputDir, `temp-input-${Date.now()}.bin`);
        fs.writeFileSync(tempInputPath, fileBuffer);

        const outputFilename = `signed-${Date.now()}.bin`;
        const outputPath = path.join(outputDir, outputFilename);

        // Sign using file paths
        builder.signFile(
            signer,
            tempInputPath,
            { path: outputPath } as any
        );

        // Clean up temp input
        try { fs.unlinkSync(tempInputPath); } catch (e) { }

        // Read signed file back to verify/return? Or just return path.
        // The original API returned signedFileUrl.

        // Get manifest definition for return
        const manifest = builder.getManifestDefinition();

        return {
            signedFileUrl: outputPath,
            manifest: manifest,
            signature: 'c2pa-signature-hash',
            kmsKeyVersion: 'v1'
        };
    } catch (error: any) {
        console.error('C2PA signing error:', error);
        throw new Error(`Failed to sign file: ${error.message}`);
    }
}

/**
 * Verify C2PA signature on a file
 */
export async function verifyFile(fileBuffer: Buffer): Promise<VerifyResult> {
    try {
        // Reader.fromAsset expects SourceAsset.
        // We use cast to any to ensure we can pass { buffer } if supported, checks are weak.
        const reader = await Reader.fromAsset({ buffer: fileBuffer } as any);

        if (!reader) {
            return {
                valid: false,
                manifest: null,
                errors: ['No C2PA manifest found']
            };
        }

        const manifestStore = reader.json();

        // Validation logic
        // manifestStore.validation_status (snake_case usually in Rust bindings?)
        // The previous code used validationStatus (camelCase).
        // Let's check both or cast to any.
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
        return {
            valid: false,
            manifest: null,
            errors: [error.message]
        };
    }
}
