// cryptoAES.js

async function getKeyMaterial(keyStr) {
    // 使用 SHA-256 哈希算法从提供的字符串创建密钥材料
    return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyStr));
}

async function importKey(keyMaterial) {
    // 导入密钥材料作为 AES-GCM 加密算法的密钥
    return crypto.subtle.importKey(
        'raw',              // raw 格式表示原始字节
        keyMaterial,        // 来自 SHA-256 的密钥材料
        { name: 'AES-GCM' },// 使用 AES-GCM 加密模式
        false,              // 不可提取，即不能导出密钥
        ['encrypt', 'decrypt'] // 此密钥可用于加密和解密
    );
}

function encode(encodedData, iv) {
    // 将 IV 和加密数据合并并编码为base64字符串
    const encodedIv = Array.from(iv).map(b => String.fromCharCode(b)).join('');
    const encodedEncryptedData = Array.from(encodedData).map(b => String.fromCharCode(b)).join('');
    return btoa(encodedIv + encodedEncryptedData);
}

function decode(input) {
    // 解码base64字符串为IV和加密数据
    const binaryStr = atob(input);
    const ivLength = 12; // GCM模式推荐的IV长度
    const iv = new Uint8Array(binaryStr.slice(0, ivLength).split('').map(ch => ch.charCodeAt(0)));
    const data = new Uint8Array(binaryStr.slice(ivLength).split('').map(ch => ch.charCodeAt(0)));
    return { iv, data };
}

export async function CryptAESEncryptWithString(data, key) {
    const keyMaterial = await getKeyMaterial(key);
    const aesKey = await importKey(keyMaterial);

    const encodedData = new TextEncoder().encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 创建12字节的随机IV

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        encodedData
    );

    return encode(new Uint8Array(encryptedData), iv);
}

export async function CryptAESDecryptWithString(encryptedBase64, key) {
    const decoded = decode(encryptedBase64);
    const keyMaterial = await getKeyMaterial(key);
    const aesKey = await importKey(keyMaterial);

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: decoded.iv,
        },
        aesKey,
        decoded.data
    );

    return new TextDecoder().decode(decryptedData);
}