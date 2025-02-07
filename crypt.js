function generateRandomKeyWithCryptoJS() {
    throw new DOMException('Unsafe operation. Please use WebCrypt APIs', 'SecurityError');
}
export async function GenerateAES256() {
    let base64Key;
    if (window.crypto && window.crypto.subtle) {
        try {
            // 使用 Web Crypto API 生成一个256位的随机密钥
            const cryptoKey = await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
            const rawKey = await window.crypto.subtle.exportKey("raw", cryptoKey);
            base64Key = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
        } catch (error) {
            // console.error("Error generating key with Web Crypto API:", error);
            base64Key = generateRandomKeyWithCryptoJS();
        }
    } else {
        base64Key = generateRandomKeyWithCryptoJS();
    }

    return base64Key;
}
async function exportKeyToPem(key, format, type) {
    // 导出密钥为 ArrayBuffer
    const exportedKey = await window.crypto.subtle.exportKey(format, key);
    // 将 ArrayBuffer 转换为 Base64 字符串
    const base64Key = arrayBufferToBase64(exportedKey);
    // 根据类型添加 PEM 头部和尾部，并格式化 Base64 字符串
    const pemFormattedKey = formatBase64AsPem(base64Key, `${type} KEY`);

    return pemFormattedKey;
}
function formatBase64AsPem(base64Key, pemType) {
    const pemHeader = `-----BEGIN ${pemType}-----`;
    const pemFooter = `-----END ${pemType}-----`;

    // 分割 base64 字符串，每行最多 64 个字符
    let pemLines = [];
    for (let i = 0; i < base64Key.length; i += 64) {
        pemLines.push(base64Key.substring(i, i + 64));
    }

    return `${pemHeader}\n${pemLines.join('\n')}\n${pemFooter}`;
}
function arrayBufferToBase64(arrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
export async function GenerateRSA() {
    // 使用 Web Crypto API 生成 RSA 4096 位密钥对
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537 in big-endian
            hash: { name: "SHA-512" }
        },
        true,
        ["encrypt", "decrypt"]
    );

    const rsaPublicKey = keyPair.publicKey;
    const rsaPrivateKey = keyPair.privateKey;

    // 导出公钥并转换为 PEM 格式
    const publicKeyPem = await exportKeyToPem(rsaPublicKey, 'spki', 'PUBLIC');
    // console.log('Public Key:\n', publicKeyPem);

    // 导出私钥并转换为 PEM 格式
    const privateKeyPem = await exportKeyToPem(rsaPrivateKey, 'pkcs8', 'RSA PRIVATE');
    // console.log('Private Key:\n', privateKeyPem);

    return { public: publicKeyPem, private: privateKeyPem };
}

async function CryptAESEncrypt(data, key_base64) {
    try {
        // 解析 Base64 密钥为 raw 格式的 ArrayBuffer
        const keyArray = Uint8Array.from(atob(key_base64), c => c.charCodeAt(0));
        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyArray,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );

        // 生成随机的 96-bit IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 将数据编码为 UTF-8 字节数组
        const encoder = new TextEncoder();
        const dataArray = encoder.encode(data);

        // 使用 AES-GCM 进行加密
        const encryptedDataBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            cryptoKey,
            dataArray
        );

        // 将 IV 转换为十六进制字符串
        const ivHex = Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join('');

        // 将加密后的数据转换为 Uint8Array
        const encryptedDataArray = new Uint8Array(encryptedDataBuffer);

        // 合并 IV 和加密数据
        const combinedArray = new Uint8Array(iv.length + encryptedDataArray.length);
        combinedArray.set(iv, 0);
        combinedArray.set(encryptedDataArray, iv.length);

        // 将合并后的数组转换为 Base64 字符串
        const combinedBase64 = btoa(String.fromCharCode(...combinedArray));

        return combinedBase64;
    } catch (error) {
        throw error
        // console.error("Error during AES encryption:", error);
        throw new Error("AES encryption failed.");
    }
}

async function CryptAESDecrypt(base64EncodedData, key_base64) {
    try {
        // 解析 Base64 编码的数据为 Uint8Array
        const combinedArray = Uint8Array.from(atob(base64EncodedData), c => c.charCodeAt(0));

        // 提取 IV（前 12 字节）
        const iv = combinedArray.slice(0, 12);

        // 提取加密数据（剩余部分）
        const encryptedDataArray = combinedArray.slice(12);

        // 解析 Base64 密钥为 raw 格式的 ArrayBuffer
        const keyArray = Uint8Array.from(atob(key_base64), c => c.charCodeAt(0));
        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyArray,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        // 使用 AES-GCM 进行解密
        const decryptedDataBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            cryptoKey,
            encryptedDataArray
        );

        // 将解密后的数据转换为字符串
        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedDataBuffer);

        return decryptedMessage;
    } catch (error) {
        throw error
        // console.error("Error during AES decryption:", error);
        throw new Error("AES decryption failed.");
    }
}

export { CryptAESEncrypt, CryptAESDecrypt };

