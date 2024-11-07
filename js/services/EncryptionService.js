// EncryptionService.js
import CryptoJS from 'crypto-js';

class EncryptionService {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    encrypt(data) {
        return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    }

    decrypt(encryptedData) {
        const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

export default EncryptionService;
