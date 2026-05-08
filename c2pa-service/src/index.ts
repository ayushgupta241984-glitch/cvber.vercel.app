import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { signFile, verifyFile } from './c2pa-handler.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'C2PA Service' });
});

// Sign file with C2PA
app.post('/sign', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const metadata = JSON.parse(req.body.metadata || '{}');

        const result = await signFile(req.file.buffer, metadata);

        res.json({
            signed_file_url: result.signedFileUrl,
            manifest: result.manifest,
            signature: result.signature,
            kms_key_version: result.kmsKeyVersion
        });
    } catch (error) {
        console.error('Sign error:', error);
        res.status(500).json({ error: 'Failed to sign file', details: (error as any).message });
    }
});

// Verify C2PA signature
app.post('/verify', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await verifyFile(req.file.buffer);

        res.json(result);
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Failed to verify file', details: (error as any).message });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`C2PA Service running on port ${PORT}`);
});
