const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3001;
const SIGNING_ENABLED = (process.env.C2PA_SIGNING_ENABLED || "false").toLowerCase() === "true";
const DATA_DIR = process.env.C2PA_DATA_DIR || path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "c2pa-signer", signing_enabled: SIGNING_ENABLED });
});

app.post("/sign", async (req, res) => {
  try {
    const { content, manifest } = req.body;

    if (!content && !manifest) {
      return res.status(400).json({ error: "Missing content or manifest" });
    }

    if (!SIGNING_ENABLED) {
      const claimId = crypto.randomUUID();
      const signature = crypto.createHash("sha256").update(JSON.stringify({ content, manifest })).digest("hex");
      const result = {
        claim_id: claimId,
        signature: signature,
        algorithm: "SHA-256",
        signed_at: new Date().toISOString(),
        mock_mode: true,
      };
      const filePath = path.join(DATA_DIR, `${claimId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      return res.json(result);
    }

    const claimId = crypto.randomUUID();
    const privateKey = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
    const sign = crypto.createSign("SHA256");
    sign.update(JSON.stringify({ content, manifest, claimId }));
    sign.end();
    const signature = sign.sign(privateKey.privateKey, "hex");

    const result = {
      claim_id: claimId,
      signature: signature,
      public_key: privateKey.publicKey.export({ type: "spki", format: "pem" }),
      algorithm: "RSA-SHA256",
      signed_at: new Date().toISOString(),
      mock_mode: false,
    };

    const filePath = path.join(DATA_DIR, `${claimId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { claim_id } = req.body;
    if (!claim_id) {
      return res.status(400).json({ error: "Missing claim_id" });
    }

    const filePath = path.join(DATA_DIR, `${claim_id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const claim = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json({
      claim_id: claim.claim_id,
      verified: true,
      algorithm: claim.algorithm,
      signed_at: claim.signed_at,
      mock_mode: claim.mock_mode,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/claims", (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
    const claims = files.map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")));
    res.json({ total: claims.length, claims });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`C2PA signer running on port ${PORT} (mock=${!SIGNING_ENABLED})`);
});