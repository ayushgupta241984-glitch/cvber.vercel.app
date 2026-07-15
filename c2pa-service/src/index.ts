import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { signFile, verifyFile } from './c2pa-handler.js';

dotenv.config();

const app = express();
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE }
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const SIGNED_FILES_DIR = path.join(process.cwd(), 'signed-files');
if (!fs.existsSync(SIGNED_FILES_DIR)) {
    fs.mkdirSync(SIGNED_FILES_DIR, { recursive: true });
}
app.use('/signed-files', express.static(SIGNED_FILES_DIR));

app.get('/health', (req, res) => {
    const certPath = process.env.C2PA_CERT || 'certs/certificate.pem';
    const keyPath = process.env.C2PA_PRIVATE_KEY || 'certs/private.key';
    const canSign = fs.existsSync(certPath) && fs.existsSync(keyPath);

    res.json({
        status: 'healthy',
        service: 'C2PA Service',
        version: '1.0.1',
        capabilities: {
            signing: canSign,
            verification: true
        },
        uptime: process.uptime()
    });
});

app.post('/sign', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` });
        }

        let metadata: any = {};
        try {
            metadata = JSON.parse(req.body.metadata || '{}');
        } catch {
            return res.status(400).json({ error: 'Invalid metadata JSON' });
        }

        const result = await signFile(req.file.buffer, {
            author: metadata.author || 'Unknown',
            timestamp: metadata.timestamp || new Date().toISOString(),
            file_name: req.file.originalname,
            scan_results: metadata.scan_results
        });

        res.json({
            signed_file_url: result.signedFileUrl,
            manifest: result.manifest,
            signature: result.signature,
            kms_key_version: result.kmsKeyVersion
        });
    } catch (error: any) {
        console.error('Sign error:', error);
        res.status(500).json({ error: 'Failed to sign file', details: error.message });
    }
});

app.post('/verify', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` });
        }

        const result = await verifyFile(req.file.buffer);
        res.json(result);
    } catch (error: any) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Failed to verify file', details: error.message });
    }
});

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`C2PA Service running on port ${PORT}`);
});
