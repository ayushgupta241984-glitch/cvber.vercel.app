const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

console.log('Generating keys using node-forge (this may take a moment)...');

// Generate key pair
const keys = forge.pki.rsa.generateKeyPair(2048);
console.log('Keys generated.');

// Create certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
    name: 'commonName',
    value: 'CVBER Free Dev'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'VA'
}, {
    name: 'localityName',
    value: 'Blacksburg'
}, {
    name: 'organizationName',
    value: 'CVBER Free'
}, {
    shortName: 'OU',
    value: 'Dev'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
const pemCert = forge.pki.certificateToPem(cert);

console.log('Certificate created.');

const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

fs.writeFileSync(path.join(certsDir, 'private.key'), pemKey);
fs.writeFileSync(path.join(certsDir, 'certificate.pem'), pemCert);

console.log('Success! Keys saved to certs/');
