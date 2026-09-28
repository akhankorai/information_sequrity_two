document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const algorithm = document.getElementById('algorithm');
    const secretKey = document.getElementById('secretKey');
    const keyGroup = document.getElementById('keyGroup');
    const decryptLabel = document.getElementById('decryptLabel');
    const modeRadios = document.getElementsByName('mode');
    const processBtn = document.getElementById('processBtn');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    
    // Error spans
    const inputError = document.getElementById('inputError');
    const algoError = document.getElementById('algoError');
    const keyError = document.getElementById('keyError');
    const copyFeedback = document.getElementById('copyFeedback');

    // UI Logic based on algorithm selection
    algorithm.addEventListener('change', () => {
        const algo = algorithm.value;
        
        // Show/hide secret key field for AES
        if (algo === 'aes') {
            keyGroup.style.display = 'flex';
        } else {
            keyGroup.style.display = 'none';
        }

        // Hashing is one-way, disable decrypt for SHA-256
        if (algo === 'sha256') {
            decryptLabel.style.opacity = '0.5';
            document.querySelector('input[value="encrypt"]').checked = true;
            document.querySelector('input[value="decrypt"]').disabled = true;
            updateBtnText();
        } else {
            decryptLabel.style.opacity = '1';
            document.querySelector('input[value="decrypt"]').disabled = false;
        }
    });

    modeRadios.forEach(radio => {
        radio.addEventListener('change', updateBtnText);
    });

    function updateBtnText() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        processBtn.textContent = mode === 'encrypt' ? 'Encrypt' : 'Decrypt';
    }

    // Process logic
    processBtn.addEventListener('click', () => {
        // Reset errors
        inputError.style.display = 'none';
        algoError.style.display = 'none';
        keyError.style.display = 'none';

        const text = inputText.value;
        const algo = algorithm.value;
        const key = secretKey.value;
        const mode = document.querySelector('input[name="mode"]:checked').value;

        let hasError = false;

        // Validation
        if (!text) {
            inputError.style.display = 'block';
            hasError = true;
        }
        if (!algo) {
            algoError.style.display = 'block';
            hasError = true;
        }
        if (algo === 'aes' && !key) {
            keyError.style.display = 'block';
            hasError = true;
        }

        if (hasError) return;

        try {
            let result = '';
            if (mode === 'encrypt') {
                result = encryptText(text, algo, key);
            } else {
                result = decryptText(text, algo, key);
            }
            outputText.value = result;
        } catch (error) {
            outputText.value = `Error during processing: ${error.message}. Ensure inputs are valid for decryption.`;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        
        navigator.clipboard.writeText(outputText.value).then(() => {
            copyFeedback.style.opacity = '1';
            setTimeout(() => {
                copyFeedback.style.opacity = '0';
            }, 2000);
        });
    });

    // Encryption implementations
    function encryptText(text, algo, key) {
        switch (algo) {
            case 'aes':
                return CryptoJS.AES.encrypt(text, key).toString();
            case 'caesar':
                return caesarCipher(text, 3);
            case 'base64':
                return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
            case 'sha256':
                return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
            default:
                throw new Error("Unknown algorithm");
        }
    }

    function decryptText(text, algo, key) {
        switch (algo) {
            case 'aes':
                const bytes = CryptoJS.AES.decrypt(text, key);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (!decrypted) throw new Error("Invalid key or corrupted data");
                return decrypted;
            case 'caesar':
                return caesarCipher(text, -3);
            case 'base64':
                return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text));
            case 'sha256':
                throw new Error("SHA-256 cannot be decrypted (one-way hash)");
            default:
                throw new Error("Unknown algorithm");
        }
    }

    // Caesar Cipher Implementation
    function caesarCipher(str, shift) {
        // Handle negative shifts
        if (shift < 0) {
            shift = (shift % 26) + 26;
        }
        
        return str.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                let start = (code >= 65 && code <= 90) ? 65 : 97;
                return String.fromCharCode(((code - start + shift) % 26) + start);
            }
            return char;
        }).join('');
    }
});
