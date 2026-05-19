// ==UserScript==
// @name         天翼云盘 CAS 时间刷新器
// @namespace    http://tampermonkey.net/
// @version      0.3.2
// @description  扫描个人/家庭空间当前目录 .cas 文件，刷新 create_time 为当前时间并使用新版接口覆盖上传，任务完成后自动刷新页面
// @author       liyk
// @match        https://cloud.189.cn/*
// @match        https://m.cloud.189.cn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      cloud.189.cn
// @connect      api.cloud.189.cn
// @connect      upload.cloud.189.cn
// @connect      *
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const WEB_URL = 'https://cloud.189.cn';
    const API_URL = 'https://api.cloud.189.cn';
    const UPLOAD_URL = 'https://upload.cloud.189.cn';
    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    const STORAGE_KEYS = {
        familyRequestContext: 'cloud189_family_request_context'
    };

    const Utils = {
        async md5(data) {
            const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
            const encoder = new TextEncoder();
            const buffer = encoder.encode(text);
            const hashBuffer = await crypto.subtle.digest('MD5', buffer).catch(() => null);
            if (!hashBuffer) return this.simpleMD5(text);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        },

        simpleMD5(string) {
            function md5cycle(x, k) {
                let a = x[0], b = x[1], c = x[2], d = x[3];
                a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
                a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
                a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
                a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
                a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
                a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
                a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
                a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
                a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
                a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
                a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
                a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
                a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
                a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
                a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
                a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
                x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
            }
            function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
            function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
            function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
            function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
            function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
            function md51(s) {
                const n = s.length;
                const state = [1732584193, -271733879, -1732584194, 271733878];
                let i;
                for (i = 64; i <= s.length; i += 64) md5cycle(state, md5blk(s.substring(i - 64, i)));
                s = s.substring(i - 64);
                const tail = new Array(16).fill(0);
                for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
                tail[i >> 2] |= 0x80 << ((i % 4) << 3);
                if (i > 55) {
                    md5cycle(state, tail);
                    for (i = 0; i < 16; i++) tail[i] = 0;
                }
                tail[14] = n * 8;
                md5cycle(state, tail);
                return state;
            }
            function md5blk(s) {
                const md5blks = [];
                for (let i = 0; i < 64; i += 4) md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
                return md5blks;
            }
            const hexChr = '0123456789abcdef'.split('');
            function rhex(n) {
                let s = '';
                for (let j = 0; j < 4; j++) s += hexChr[(n >> (j * 8 + 4)) & 0x0f] + hexChr[(n >> (j * 8)) & 0x0f];
                return s;
            }
            function hex(x) { for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]); return x.join(''); }
            function add32(a, b) { return (a + b) & 0xffffffff; }
            return hex(md51(string)).toUpperCase();
        },

        base64Encode(str) {
            try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return btoa(str); }
        },

        base64Decode(str) {
            try { return decodeURIComponent(escape(atob(str))); } catch (e) { return atob(str); }
        },

        randomUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        },

        randomString(length = 16) {
            const chars = '0123456789abcdef';
            let result = '';
            for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        },

        timestamp() {
            return Date.now();
        },

        timestampSeconds() {
            return Math.floor(Date.now() / 1000);
        },

        parseXmlResponse(xmlString) {
            const result = {};
            const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
            const errorCode = doc.querySelector('errorCode');
            if (errorCode) {
                result.errorCode = errorCode.textContent || '';
                const errorMsg = doc.querySelector('errorMsg');
                if (errorMsg) result.errorMsg = errorMsg.textContent || '';
                return result;
            }
            ['pubKey', 'pkId', 'expire', 'ver'].forEach(name => {
                const el = doc.querySelector(name) || doc.querySelector(`keyPair > ${name}`);
                if (el) result[name] = name === 'expire' ? parseInt(el.textContent || '0', 10) : (el.textContent || '');
            });
            return result;
        },

        parseCasContent(content) {
            const text = String(content || '').trim();
            if (!text) return null;
            const candidates = [text, ...text.split(/[\r\n]+/).map(item => item.trim()).filter(Boolean)];
            for (const candidate of candidates) {
                if (candidate.startsWith('{')) {
                    try { return JSON.parse(candidate); } catch (e) {}
                }
                try {
                    const decoded = this.base64Decode(candidate);
                    if (decoded.startsWith('{')) return JSON.parse(decoded);
                } catch (e) {}
            }
            return null;
        },

        serializeCasJson(json) {
            return this.base64Encode(JSON.stringify(json));
        },

        applyOuterFileName(json, outerName) {
            const name = String(outerName || '').replace(/\.cas$/i, '');
            if (!json || !name) return;
            const keys = ['file_name', 'filename', 'fileName', 'name'];
            const existingKey = keys.find(key => Object.prototype.hasOwnProperty.call(json, key));
            json[existingKey || 'file_name'] = name;
        },

        toArrayBuffer(text) {
            return new TextEncoder().encode(text).buffer;
        },

        arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        },

        hexToBase64(hex) {
            const clean = String(hex || '').replace(/[^0-9a-f]/gi, '');
            if (!clean || clean.length % 2 !== 0) return '';
            let binary = '';
            for (let i = 0; i < clean.length; i += 2) {
                binary += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
            }
            return btoa(binary);
        },

        normalizeHeaderMap(input) {
            const result = {};
            if (!input) return result;
            if (typeof input === 'string') {
                input.split('&').forEach(pair => {
                    const index = pair.indexOf('=');
                    if (index <= 0) return;
                    const key = pair.slice(0, index).trim();
                    const value = pair.slice(index + 1).trim();
                    if (key) result[key] = value;
                });
                return result;
            }
            if (Array.isArray(input)) {
                input.forEach(entry => {
                    if (Array.isArray(entry) && entry.length >= 2) {
                        result[String(entry[0])] = String(entry[1]);
                    } else if (entry && typeof entry === 'object') {
                        const key = entry.name || entry.key;
                        const value = entry.value;
                        if (key != null && value != null) result[String(key)] = String(value);
                    }
                });
                return result;
            }
            if (typeof input === 'object') {
                Object.keys(input).forEach(key => {
                    if (input[key] != null) result[String(key)] = String(input[key]);
                });
            }
            return result;
        },

        sanitizeUploadHeaders(headers) {
            const normalized = this.normalizeHeaderMap(headers);
            const blocked = new Set([
                'host',
                'content-length',
                'origin',
                'referer',
                'sec-fetch-site',
                'sec-fetch-mode',
                'sec-fetch-dest'
            ]);
            const result = {};
            Object.keys(normalized).forEach(key => {
                const value = normalized[key];
                if (!blocked.has(key.toLowerCase()) && value !== '') result[key] = value;
            });
            return result;
        },

        omitHeaders(headers, names = []) {
            const blocked = new Set(names.map(name => String(name).toLowerCase()));
            const result = {};
            Object.keys(headers || {}).forEach(key => {
                if (!blocked.has(key.toLowerCase())) result[key] = headers[key];
            });
            return result;
        }
    };

    const RSA = {
        formatPublicKey(publicKey) {
            const normalized = String(publicKey || '').replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').replace(/[\n\r ]/g, '').trim();
            return `-----BEGIN PUBLIC KEY-----\n${normalized}\n-----END PUBLIC KEY-----`;
        },

        loadJSEncrypt() {
            return new Promise((resolve, reject) => {
                if (typeof JSEncrypt !== 'undefined') {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('加载 JSEncrypt 失败'));
                document.head.appendChild(script);
            });
        },

        async encryptBase64(publicKey, data) {
            await this.loadJSEncrypt();
            const jsEncrypt = new JSEncrypt();
            jsEncrypt.setPublicKey(this.formatPublicKey(publicKey));
            const encrypted = jsEncrypt.encrypt(data);
            if (!encrypted) throw new Error('RSA 加密失败');
            return encrypted;
        }
    };

    const CryptoHelper = {
        _cryptoJSPromise: null,

        loadCryptoJS() {
            if (window.CryptoJSLoaded) return Promise.resolve(window.CryptoJSLoaded);
            if (this._cryptoJSPromise) return this._cryptoJSPromise;
            this._cryptoJSPromise = new Promise((resolve, reject) => {
                if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
                    window.CryptoJSLoaded = CryptoJS;
                    resolve(CryptoJS);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js';
                script.onload = () => {
                    window.CryptoJSLoaded = CryptoJS;
                    resolve(CryptoJS);
                };
                script.onerror = () => reject(new Error('加载 CryptoJS 失败'));
                document.head.appendChild(script);
            });
            return this._cryptoJSPromise;
        },

        async aesEncrypt(data, key) {
            const params = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
            const lib = await this.loadCryptoJS();
            return lib.AES.encrypt(lib.enc.Utf8.parse(params), lib.enc.Utf8.parse(key), {
                mode: lib.mode.ECB,
                padding: lib.pad.Pkcs7
            }).ciphertext.toString().toUpperCase();
        },

        async hmacSha1(data, key) {
            const params = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
            const lib = await this.loadCryptoJS();
            return lib.HmacSHA1(params, key).toString().toUpperCase();
        }
    };

    class Cloud189Client {
        constructor() {
            this.sessionKey = null;
            this.accessToken = null;
            this.rsaKey = null;
            this.familyId = null;
            this.familyRootFolderId = null;
            this.parentFolderId = '-11';
            this.familyRequestContext = this.getStoredFamilyRequestContext();
        }

        getSessionKey() {
            if (this.sessionKey) return this.sessionKey;
            try {
                const sk = sessionStorage.getItem('sessionKey');
                if (sk) {
                    this.sessionKey = sk;
                    return sk;
                }
            } catch (e) {}
            const cookies = document.cookie.split(';').map(item => item.trim());
            for (const cookie of cookies) {
                for (const name of ['SESSION_KEY', 'sessionKey', 'SESSIONKEY', 'SSON']) {
                    if (cookie.startsWith(`${name}=`)) {
                        this.sessionKey = cookie.slice(name.length + 1);
                        return this.sessionKey;
                    }
                }
            }
            return null;
        }

        async fetchSessionKey() {
            const existing = this.getSessionKey();
            if (existing) return existing;
            try {
                const response = await fetch(`${WEB_URL}/api/portal/getUserSizeInfo.action`, { method: 'GET', credentials: 'include' });
                const sk = response.headers.get('SessionKey') || response.headers.get('sessionkey');
                if (sk) {
                    this.sessionKey = sk;
                    return sk;
                }
            } catch (e) {}
            return null;
        }

        getCurrentFolderId() {
            if (this.isFamilySpace()) {
                const pathname = window.location.pathname || '';
                if (pathname.includes('/web/family/file/folder/home')) {
                    this.parentFolderId = '';
                    return '';
                }
                const familyMatch = pathname.match(/\/web\/family\/file\/folder\/([^\/\?]+)/);
                if (familyMatch) {
                    const folderId = familyMatch[1] === 'home' ? '' : familyMatch[1];
                    this.parentFolderId = folderId;
                    return folderId;
                }
            }
            const pathname = window.location.pathname || '';
            let match = pathname.match(/\/folder\/([^\/\?]+)/);
            if (match) {
                this.parentFolderId = match[1];
                return match[1];
            }
            match = window.location.hash.match(/folder[\/=]([^&\/]+)/);
            if (match) {
                this.parentFolderId = match[1];
                return match[1];
            }
            const params = new URLSearchParams(window.location.search);
            const folderId = params.get('folderId') || params.get('currentFolderId');
            if (folderId) {
                this.parentFolderId = folderId;
                return folderId;
            }
            return this.parentFolderId;
        }

        isFamilySpace() {
            return String(window.location.pathname || '').includes('/web/family');
        }

        getAccessToken() {
            if (this.accessToken) return this.accessToken;
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    this.accessToken = token;
                    return token;
                }
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    const value = localStorage.getItem(key);
                    if (key && key.toLowerCase().includes('accesstoken') && value) {
                        this.accessToken = value;
                        return value;
                    }
                }
            } catch (e) {}
            return null;
        }

        getStoredFamilyRequestContext() {
            try {
                const raw = sessionStorage.getItem(STORAGE_KEYS.familyRequestContext) || localStorage.getItem(STORAGE_KEYS.familyRequestContext);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        }

        buildFamilySignature(url, accessToken = '', extraParams = null) {
            if (!url || !accessToken) return null;
            try {
                const parsedUrl = new URL(url, API_URL);
                const signEntries = Array.from(parsedUrl.searchParams.entries());
                if (extraParams && typeof extraParams === 'object') {
                    for (const [key, value] of Object.entries(extraParams)) {
                        signEntries.push([key, value == null ? '' : String(value)]);
                    }
                }
                signEntries.sort((a, b) => a[0].localeCompare(b[0]));
                const timestamp = Utils.timestamp().toString();
                const signItems = [`AccessToken=${accessToken}`, `Timestamp=${timestamp}`];
                for (const [key, value] of signEntries) signItems.push(`${key}=${value}`);
                return {
                    timestamp,
                    signature: Utils.simpleMD5(signItems.join('&')).toLowerCase()
                };
            } catch (e) {
                return null;
            }
        }

        buildFamilyHeaders(url = '', extraParams = null) {
            this.familyRequestContext = this.getStoredFamilyRequestContext() || this.familyRequestContext;
            const headers = {
                'Accept': 'application/json;charset=UTF-8',
                'Sign-Type': '1',
                'User-Agent': UserAgent
            };
            const accessToken = this.getAccessToken();
            if (accessToken) headers.AccessToken = accessToken;
            if (this.familyRequestContext?.browserId) headers['Browser-Id'] = this.familyRequestContext.browserId;
            const signatureInfo = this.buildFamilySignature(url, accessToken, extraParams);
            if (signatureInfo) {
                headers.Signature = signatureInfo.signature;
                headers.Timestamp = signatureInfo.timestamp;
            }
            return headers;
        }

        async familyFetchJson(url) {
            const response = await this.gmRequest({
                method: 'GET',
                url,
                headers: this.buildFamilyHeaders(url),
                errorMessage: '家庭接口请求失败'
            });
            return JSON.parse(response.responseText || '{}');
        }

        async getCurrentFamilyId() {
            if (this.familyId) return this.familyId;
            const accessToken = this.getAccessToken();
            if (!accessToken) return null;
            const result = await this.familyFetchJson(`${API_URL}/open/family/manage/getFamilyList.action`);
            const familyList = result.familyInfoResp || [];
            const currentFamily = familyList.find(item => item.useFlag === 1) || familyList[0];
            this.familyId = currentFamily?.familyId ? String(currentFamily.familyId) : null;
            return this.familyId;
        }

        async getFamilyRootFolderId() {
            if (this.familyRootFolderId) return this.familyRootFolderId;
            const familyId = await this.getCurrentFamilyId();
            if (!familyId) return '';
            try {
                const result = await this.familyFetchJson(`${API_URL}/open/family/file/listFiles.action?familyId=${encodeURIComponent(familyId)}&folderId=&needPath=true`);
                const pathItems = Array.isArray(result.path) ? result.path : [];
                const familyRoot = [...pathItems].reverse().find(item => item && item.fileId && item.fileName === '家庭云')
                    || [...pathItems].reverse().find(item => item && item.fileId && item.fileId !== '-11' && item.fileId !== '-16');
                this.familyRootFolderId = familyRoot?.fileId ? String(familyRoot.fileId) : '';
                return this.familyRootFolderId;
            } catch (e) {
                return '';
            }
        }

        gmRequest(options) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: options.method || 'GET',
                    url: options.url,
                    headers: options.headers || {},
                    data: options.data,
                    binary: options.binary || false,
                    responseType: options.responseType,
                    onload: response => {
                        const shouldCheckStatus = options.checkStatus !== false;
                        if (shouldCheckStatus && (response.status < 200 || response.status >= 300)) {
                            const detail = response.responseText || response.statusText || `HTTP ${response.status}`;
                            reject(new Error(`${options.errorMessage || '请求失败'}: HTTP ${response.status} ${detail}`));
                            return;
                        }
                        resolve(response);
                    },
                    onerror: () => reject(new Error(options.errorMessage || '请求失败'))
                });
            });
        }

        async listFiles(folderId, pageNum = 1) {
            const response = await this.gmRequest({
                url: `${WEB_URL}/api/open/file/listFiles.action?folderId=${encodeURIComponent(folderId)}&mediaType=0&orderBy=lastOpTime&descending=true&pageNum=${pageNum}&pageSize=60`,
                headers: {
                    'Accept': 'application/json;charset=UTF-8',
                    'Sign-Type': '1',
                    'User-Agent': UserAgent
                },
                errorMessage: '获取文件列表失败'
            });
            return JSON.parse(response.responseText || '{}');
        }

        async getCurrentFolderCasFiles() {
            const folderId = this.getCurrentFolderId();
            const familyId = this.isFamilySpace() ? await this.getCurrentFamilyId() : null;
            const effectiveFolderId = familyId && !folderId ? await this.getFamilyRootFolderId() : folderId;
            let pageNum = 1;
            let items = [];
            while (true) {
                const result = familyId
                    ? await this.familyFetchJson(`${API_URL}/open/family/file/listFiles.action?pageSize=60&pageNum=${pageNum}&mediaType=0&familyId=${encodeURIComponent(familyId)}&folderId=${encodeURIComponent(effectiveFolderId || '')}&iconOption=5&orderBy=3&descending=true`)
                    : await this.listFiles(effectiveFolderId, pageNum);
                const fileListAO = result.fileListAO || {};
                const files = fileListAO.fileList || [];
                items = items.concat(files);
                const count = Number(fileListAO.count || 0);
                if (!count || items.length >= count || files.length === 0) break;
                pageNum += 1;
            }
            return items.filter(item => item && item.name && item.name.toLowerCase().endsWith('.cas'));
        }

        async getFileDownloadUrl(fileId) {
            if (this.isFamilySpace()) {
                const familyId = await this.getCurrentFamilyId();
                if (!familyId) throw new Error('无法获取 familyId');
                const result = await this.familyFetchJson(`${API_URL}/open/family/file/getFileDownloadUrl.action?fileId=${encodeURIComponent(fileId)}&familyId=${encodeURIComponent(familyId)}&type=1`);
                return result.fileDownloadUrl ? result.fileDownloadUrl.replace(/&amp;/g, '&') : '';
            }
            const response = await this.gmRequest({
                url: `${WEB_URL}/api/open/file/getFileDownloadUrl.action?fileId=${encodeURIComponent(fileId)}`,
                headers: {
                    'Accept': 'application/json;charset=UTF-8',
                    'Sign-Type': '1',
                    'User-Agent': UserAgent
                },
                errorMessage: '获取下载链接失败'
            });
            const json = JSON.parse(response.responseText || '{}');
            return json.fileDownloadUrl || '';
        }

        async downloadFileText(fileId) {
            const downloadUrl = await this.getFileDownloadUrl(fileId);
            if (!downloadUrl) throw new Error('无法获取下载链接');
            const response = await this.gmRequest({
                url: downloadUrl,
                headers: { 'User-Agent': UserAgent },
                errorMessage: '下载文件失败'
            });
            return response.responseText || '';
        }

        async generateRsaKey() {
            if (this.rsaKey && this.rsaKey.expire > Date.now()) return this.rsaKey;
            let sk = this.getSessionKey();
            if (!sk) sk = await this.fetchSessionKey();
            if (!sk) throw new Error('无法获取 SessionKey');
            const ts = Utils.timestamp().toString();
            const signParams = { AppKey: '600100422', Timestamp: ts };
            const paramStr = Object.entries(signParams).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join('&');
            const signature = Utils.simpleMD5(paramStr);
            const response = await this.gmRequest({
                method: 'GET',
                url: `${WEB_URL}/api/security/generateRsaKey.action?sessionKey=${encodeURIComponent(sk)}`,
                headers: {
                    'Sign-Type': '1',
                    'Signature': signature,
                    'Timestamp': ts,
                    'AppKey': '600100422',
                    'SessionKey': sk,
                    'User-Agent': UserAgent,
                    'Accept': 'application/json'
                },
                errorMessage: '获取 RSA 密钥失败'
            });
            const text = response.responseText || '';
            const result = text.trim().startsWith('{') ? JSON.parse(text) : Utils.parseXmlResponse(text);
            if (result.errorCode) throw new Error(result.errorMsg || result.errorCode);
            if (!result.pubKey) throw new Error('RSA 密钥无效');
            this.rsaKey = {
                pubKey: result.pubKey,
                pkId: result.pkId,
                expire: result.expire || (Date.now() + 300000),
                ver: result.ver
            };
            return this.rsaKey;
        }

        async buildUploadRequest(params, requestUri, method = 'GET') {
            const rsaKey = await this.generateRsaKey();
            const sk = this.getSessionKey();
            if (!sk) throw new Error('缺少 SessionKey');
            const uuid = Utils.randomString(16);
            const ts = Utils.timestamp().toString();
            const encryptedParams = await CryptoHelper.aesEncrypt(params, uuid);
            const encryptionText = await RSA.encryptBase64(rsaKey.pubKey, uuid);
            const signature = await CryptoHelper.hmacSha1({
                SessionKey: sk,
                Operate: method,
                RequestURI: requestUri,
                Date: ts,
                params: encryptedParams
            }, uuid);
            return {
                url: `${UPLOAD_URL}${requestUri}?params=${encryptedParams}`,
                headers: {
                    'X-Request-Date': ts,
                    'X-Request-ID': Utils.randomUUID(),
                    'SessionKey': sk,
                    'EncryptionText': encryptionText,
                    'PkId': rsaKey.pkId,
                    'Signature': signature,
                    'User-Agent': UserAgent
                }
            };
        }

        partSize(fileSize) {
            const unit = 10485760;
            if (fileSize > unit * 2 * 999) return Math.max(Math.ceil(fileSize / 1999 / unit), 5) * unit;
            if (fileSize > unit * 999) return unit * 2;
            return unit;
        }

        async getMultiUploadUrls(uploadFileId, partInfo, useFamilyUpload = false) {
            const { url, headers } = await this.buildUploadRequest({
                uploadFileId,
                partInfo
            }, useFamilyUpload ? '/family/getMultiUploadUrls' : '/person/getMultiUploadUrls');
            const response = await this.gmRequest({
                method: 'GET',
                url,
                headers,
                errorMessage: '获取分片上传地址失败'
            });
            return JSON.parse(response.responseText || '{}');
        }

        normalizeUploadUrlItems(result) {
            const data = result?.data || result || {};
            const items = data.uploadUrls || data.partUploadUrlList || data.uploadUrlList || data.urls || [];
            if (Array.isArray(items)) return items;
            if (items && typeof items === 'object') return Object.values(items);
            return [];
        }

        normalizeUploadTarget(item, fallbackPartNumber) {
            return {
                requestURL: item.RequestURL || item.requestURL || item.requestUrl || item.url || '',
                headers: Utils.normalizeHeaderMap(item.Headers || item.headers || item.requestHeader || item.RequestHeader || ''),
                partNumber: Number(item.PartNumber || item.partNumber || item.partNo || fallbackPartNumber || 1)
            };
        }

        async initMultiUpload(parentFolderId, fileName, fileSize, sliceSize, fileMd5, sliceMd5, useFamilyUpload = false) {
            const params = {
                parentFolderId,
                fileName: encodeURIComponent(fileName),
                fileSize,
                sliceSize
            };
            if (useFamilyUpload) {
                const familyId = await this.getCurrentFamilyId();
                if (!familyId) throw new Error('无法获取 familyId');
                params.familyId = familyId;
            }
            if (fileMd5 && sliceMd5) {
                params.fileMd5 = fileMd5;
                params.sliceMd5 = sliceMd5;
            } else {
                params.lazyCheck = '1';
            }
            const { url, headers } = await this.buildUploadRequest(params, useFamilyUpload ? '/family/initMultiUpload' : '/person/initMultiUpload');
            const response = await this.gmRequest({
                method: 'GET',
                url,
                headers,
                errorMessage: '初始化上传失败'
            });
            return JSON.parse(response.responseText || '{}');
        }

        async commitMultiUpload(uploadFileId, fileMd5, sliceMd5, useFamilyUpload = false) {
            const { url, headers } = await this.buildUploadRequest({
                uploadFileId,
                fileMd5,
                sliceMd5,
                lazyCheck: 1,
                isLog: 0,
                opertype: 3
            }, useFamilyUpload ? '/family/commitMultiUploadFile' : '/person/commitMultiUploadFile');
            const response = await this.gmRequest({
                method: 'GET',
                url,
                headers,
                errorMessage: '提交上传失败'
            });
            return JSON.parse(response.responseText || '{}');
        }

        async uploadPart(requestURL, headers, chunk) {
            const uploadHeaders = Utils.sanitizeUploadHeaders(headers);
            const body = new TextEncoder().encode(chunk);
            const response = await this.gmRequest({
                method: 'PUT',
                url: requestURL,
                headers: uploadHeaders,
                data: body.buffer,
                binary: true,
                checkStatus: false,
                errorMessage: '上传分片失败'
            });
            const text = String(response.responseText || '').trim();
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`上传分片失败: HTTP ${response.status} ${text || response.statusText || ''}`.trim());
            }
            return { status: response.status, responseText: text };
        }

        async uploadPartWithFallbacks(requestURL, headers, chunk) {
            const baseHeaders = Utils.sanitizeUploadHeaders(headers);
            const attempts = [
                { label: 'server-headers', headers: baseHeaders },
                { label: 'without-content-type', headers: Utils.omitHeaders(baseHeaders, ['content-type']) },
                { label: 'without-auth-headers', headers: Utils.omitHeaders(baseHeaders, ['authorization', 'x-amz-content-sha256', 'x-amz-date']) },
                { label: 'no-headers', headers: {} }
            ];

            let lastError = null;
            for (const attempt of attempts) {
                try {
                    console.log('[CAS 刷新器] PUT 尝试:', attempt.label, attempt.headers);
                    return await this.uploadPart(requestURL, attempt.headers, chunk);
                } catch (error) {
                    lastError = error;
                    console.log('[CAS 刷新器] PUT 失败:', attempt.label, error.message);
                    if (!/SignatureDoesNotMatch|403/i.test(error.message)) throw error;
                }
            }
            throw lastError || new Error('上传分片失败');
        }

        async uploadWithNewApi(file, content) {
            const useFamilyUpload = this.isFamilySpace();
            let folderId = this.getCurrentFolderId();
            if (useFamilyUpload && !folderId) {
                folderId = await this.getFamilyRootFolderId();
            }
            const fileSize = new Blob([content]).size;
            const partSize = this.partSize(fileSize);
            const fileMd5 = await Utils.md5(content);
            const partMd5 = await Utils.md5(content);
            const sliceMd5 = fileSize <= 10485760 ? fileMd5 : await Utils.md5(partMd5);
            const partInfo = `1-${Utils.hexToBase64(partMd5)}`;

            const initResult = await this.initMultiUpload(folderId, file.name, fileSize, partSize, fileMd5, sliceMd5, useFamilyUpload);
            if (initResult.errorCode) throw new Error(initResult.errorMsg || initResult.errorCode);
            if (initResult.code && initResult.code !== 'SUCCESS') throw new Error(initResult.msg || '初始化上传失败');

            const uploadFileId = initResult?.data?.uploadFileId;
            if (!uploadFileId) throw new Error('未获取到 uploadFileId');

            const uploadUrlsResult = await this.getMultiUploadUrls(uploadFileId, partInfo, useFamilyUpload);
            if (uploadUrlsResult.errorCode) throw new Error(uploadUrlsResult.errorMsg || uploadUrlsResult.errorCode);
            const uploadTargets = this.normalizeUploadUrlItems(uploadUrlsResult).map((item, index) => this.normalizeUploadTarget(item, index + 1));
            if (!uploadTargets.length || !uploadTargets[0].requestURL) throw new Error('未获取到分片上传地址');

            console.log('[CAS 刷新器] PUT URL:', uploadTargets[0].requestURL);
            console.log('[CAS 刷新器] PUT headers:', uploadTargets[0].headers);
            const putResponse = await this.uploadPartWithFallbacks(uploadTargets[0].requestURL, uploadTargets[0].headers, content);
            const putBody = (putResponse.responseText || '').trim();
            if (putBody) {
                console.log('[CAS 刷新器] PUT 响应:', putResponse.status, putBody);
            } else {
                console.log('[CAS 刷新器] PUT 响应:', putResponse.status, '<empty>');
            }

            const commitResult = await this.commitMultiUpload(uploadFileId, fileMd5, sliceMd5, useFamilyUpload);
            if (commitResult.errorCode) throw new Error(commitResult.errorMsg || commitResult.errorCode);
            if (commitResult.code && commitResult.code !== 'SUCCESS') throw new Error(commitResult.msg || '提交上传失败');
            return commitResult;
        }
    }

    const UI = {
        addStyles() {
            GM_addStyle(`
                .cas-refresh-panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 640px; max-width: calc(100vw - 32px); max-height: 85vh; display: flex; flex-direction: column; background: #fff; border-radius: 12px; box-shadow: 0 14px 40px rgba(0, 0, 0, .24); z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
                .cas-refresh-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, .48); z-index: 999998; }
                .cas-refresh-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; color: #fff; border-radius: 12px 12px 0 0; background: linear-gradient(135deg, #0f766e, #155e75); }
                .cas-refresh-title { font-size: 17px; font-weight: 700; }
                .cas-refresh-close { border: none; background: rgba(255,255,255,.18); color: #fff; width: 28px; height: 28px; border-radius: 999px; cursor: pointer; font-size: 18px; }
                .cas-refresh-body { padding: 18px; overflow: auto; }
                .cas-refresh-info { font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
                .cas-refresh-actions { display: flex; gap: 10px; margin-bottom: 14px; }
                .cas-refresh-btn { border: none; border-radius: 8px; padding: 11px 14px; cursor: pointer; font-size: 14px; font-weight: 600; }
                .cas-refresh-btn-primary { background: linear-gradient(135deg, #0f766e, #155e75); color: #fff; }
                .cas-refresh-btn-secondary { background: #e2e8f0; color: #0f172a; }
                .cas-refresh-btn:disabled { opacity: .6; cursor: not-allowed; }
                .cas-refresh-list { border: 1px solid #dbe2ea; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
                .cas-refresh-row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 12px; border-bottom: 1px solid #eef2f7; font-size: 13px; }
                .cas-refresh-row:last-child { border-bottom: none; }
                .cas-refresh-name { color: #0f172a; word-break: break-all; }
                .cas-refresh-status { color: #475569; max-width: 260px; word-break: break-all; text-align: right; }
                .cas-refresh-log { width: 100%; min-height: 220px; box-sizing: border-box; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; resize: vertical; font: 12px/1.5 Consolas, Monaco, monospace; }
                .cas-refresh-float { position: fixed; right: 20px; bottom: 146px; width: 56px; height: 56px; border: none; border-radius: 999px; background: linear-gradient(135deg, #0f766e, #155e75); color: #fff; font-size: 24px; box-shadow: 0 10px 24px rgba(15, 118, 110, .34); cursor: pointer; z-index: 99999; }
            `);
        },

        appendLog(box, message) {
            const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
            box.value += `[${time}] ${message}\n`;
            box.scrollTop = box.scrollHeight;
        },

        showToast(message) {
            window.alert(message);
        },

        async showPanel() {
            document.querySelectorAll('.cas-refresh-panel,.cas-refresh-overlay').forEach(el => el.remove());
            const overlay = document.createElement('div');
            overlay.className = 'cas-refresh-overlay';
            const panel = document.createElement('div');
            panel.className = 'cas-refresh-panel';
            panel.innerHTML = `
                <div class="cas-refresh-header">
                    <div class="cas-refresh-title">CAS 时间刷新器 v0.3.2</div>
                    <button class="cas-refresh-close">×</button>
                </div>
                <div class="cas-refresh-body">
                    <div class="cas-refresh-info">
                        使用新版上传接口：<code>initMultiUpload -> getMultiUploadUrls -> PUT -> commitMultiUploadFile</code>。<br>
                        同名处理当前走覆盖语义，提交时使用 <code>opertype=3</code>。
                    </div>
                    <div class="cas-refresh-actions">
                        <button class="cas-refresh-btn cas-refresh-btn-secondary" id="cas-refresh-scan">扫描当前目录</button>
                        <button class="cas-refresh-btn cas-refresh-btn-primary" id="cas-refresh-run" disabled>刷新并覆盖</button>
                    </div>
                    <div class="cas-refresh-list" id="cas-refresh-list"></div>
                    <textarea class="cas-refresh-log" id="cas-refresh-log" placeholder="运行日志会显示在这里..."></textarea>
                </div>
            `;
            document.body.appendChild(overlay);
            document.body.appendChild(panel);

            const close = () => {
                panel.remove();
                overlay.remove();
            };
            overlay.onclick = close;
            panel.querySelector('.cas-refresh-close').onclick = close;

            const client = new Cloud189Client();
            const scanBtn = panel.querySelector('#cas-refresh-scan');
            const runBtn = panel.querySelector('#cas-refresh-run');
            const listBox = panel.querySelector('#cas-refresh-list');
            const logBox = panel.querySelector('#cas-refresh-log');

            let casFiles = [];

            const renderList = () => {
                if (!casFiles.length) {
                    listBox.innerHTML = '<div class="cas-refresh-row"><div class="cas-refresh-name">当前还没有扫描结果</div><div class="cas-refresh-status"></div></div>';
                    return;
                }
                listBox.innerHTML = casFiles.map(item => `
                    <div class="cas-refresh-row">
                        <div class="cas-refresh-name">${item.name}</div>
                        <div class="cas-refresh-status">${item.status || '待处理'}</div>
                    </div>
                `).join('');
            };

            renderList();

            scanBtn.onclick = async () => {
                scanBtn.disabled = true;
                runBtn.disabled = true;
                logBox.value = '';
                this.appendLog(logBox, '开始扫描当前目录 .cas 文件');
                try {
                    casFiles = await client.getCurrentFolderCasFiles();
                    casFiles = casFiles.map(item => ({ ...item, status: '待处理' }));
                    renderList();
                    this.appendLog(logBox, `扫描完成，共 ${casFiles.length} 个 .cas 文件`);
                    runBtn.disabled = casFiles.length === 0;
                    if (!casFiles.length) this.showToast('当前目录没有 .cas 文件');
                } catch (error) {
                    this.appendLog(logBox, `扫描失败: ${error.message}`);
                    this.showToast(error.message);
                } finally {
                    scanBtn.disabled = false;
                }
            };

            runBtn.onclick = async () => {
                if (!casFiles.length) return;
                scanBtn.disabled = true;
                runBtn.disabled = true;
                this.appendLog(logBox, `开始刷新 ${casFiles.length} 个 .cas 文件`);
                let ok = 0;
                let fail = 0;
                for (let i = 0; i < casFiles.length; i++) {
                    const file = casFiles[i];
                    try {
                        file.status = '下载中';
                        renderList();
                        this.appendLog(logBox, `下载 ${file.name}`);
                        const content = await client.downloadFileText(file.id);
                        const json = Utils.parseCasContent(content);
                        if (!json || typeof json !== 'object') throw new Error('CAS 内容无法解析');
                        Utils.applyOuterFileName(json, file.name);
                        json.create_time = String(Utils.timestampSeconds());
                        const nextContent = Utils.serializeCasJson(json);
                        file.status = '上传中';
                        renderList();
                        this.appendLog(logBox, `新版接口覆盖上传 ${file.name}`);
                        await client.uploadWithNewApi(file, nextContent);
                        file.status = '已完成';
                        ok += 1;
                        this.appendLog(logBox, `完成 ${file.name}`);
                    } catch (error) {
                        file.status = `失败: ${error.message}`;
                        fail += 1;
                        this.appendLog(logBox, `失败 ${file.name}: ${error.message}`);
                    }
                    renderList();
                }
                this.appendLog(logBox, `任务结束，成功 ${ok}，失败 ${fail}`);
                scanBtn.disabled = false;
                runBtn.disabled = false;
                if (ok > 0) {
                    this.appendLog(logBox, '2 秒后自动刷新页面');
                    setTimeout(() => location.reload(), 2000);
                }
            };
        },

        createFloatButton() {
            if (document.querySelector('.cas-refresh-float')) return;
            if (!document.body) {
                setTimeout(() => this.createFloatButton(), 500);
                return;
            }
            const button = document.createElement('button');
            button.className = 'cas-refresh-float';
            button.title = 'CAS 时间刷新器';
            button.textContent = '🕒';
            button.onclick = () => this.showPanel();
            document.body.appendChild(button);
        }
    };

    function init() {
        installFamilyRequestHook();
        UI.addStyles();
        UI.createFloatButton();
        GM_registerMenuCommand('打开 CAS 时间刷新器', () => UI.showPanel());
        console.log('[CAS 时间刷新器] v0.3.2 已加载');
    }

    function installFamilyRequestHook() {
        const persistCapturedContext = (detail = {}) => {
            const headers = detail.headers || {};
            const context = {
                browserId: headers['Browser-Id'] || headers['browser-id'] || headers.browserId || '',
                accessToken: headers.accesstoken || headers.AccessToken || ''
            };
            if (!context.browserId && !context.accessToken) return;
            try {
                const serialized = JSON.stringify({
                    ...context,
                    url: detail.url || '',
                    updatedAt: Date.now()
                });
                sessionStorage.setItem(STORAGE_KEYS.familyRequestContext, serialized);
                localStorage.setItem(STORAGE_KEYS.familyRequestContext, serialized);
            } catch (e) {}
        };

        document.addEventListener('cloud189-family-request', event => {
            persistCapturedContext(event.detail || {});
        });

        const script = document.createElement('script');
        script.textContent = `
            (function() {
                if (window.__cloud189FamilyHookInstalled) return;
                window.__cloud189FamilyHookInstalled = true;
                function shouldCapture(url) {
                    return typeof url === 'string' && url.indexOf('/open/family/') !== -1;
                }
                function normalizeHeaders(input) {
                    var result = {};
                    if (!input) return result;
                    try {
                        if (typeof Headers !== 'undefined' && input instanceof Headers) {
                            input.forEach(function(value, key) { result[key] = value; });
                            return result;
                        }
                    } catch (e) {}
                    if (Array.isArray(input)) {
                        input.forEach(function(entry) {
                            if (Array.isArray(entry) && entry.length >= 2) result[String(entry[0])] = entry[1];
                        });
                        return result;
                    }
                    if (typeof input === 'object') {
                        Object.keys(input).forEach(function(key) { result[key] = input[key]; });
                    }
                    return result;
                }
                function emit(url, headers) {
                    try {
                        document.dispatchEvent(new CustomEvent('cloud189-family-request', {
                            detail: { url: url, headers: normalizeHeaders(headers) }
                        }));
                    } catch (e) {}
                }
                if (window.fetch) {
                    var originalFetch = window.fetch;
                    window.fetch = function(input, init) {
                        var url = typeof input === 'string' ? input : (input && input.url) || '';
                        if (shouldCapture(url)) {
                            var requestHeaders = {};
                            if (input && input.headers) Object.assign(requestHeaders, normalizeHeaders(input.headers));
                            if (init && init.headers) Object.assign(requestHeaders, normalizeHeaders(init.headers));
                            emit(url, requestHeaders);
                        }
                        return originalFetch.apply(this, arguments);
                    };
                }
                var originalOpen = XMLHttpRequest.prototype.open;
                var originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
                var originalSend = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.open = function(method, url) {
                    this.__cloud189RequestUrl = url;
                    this.__cloud189RequestHeaders = {};
                    return originalOpen.apply(this, arguments);
                };
                XMLHttpRequest.prototype.setRequestHeader = function(key, value) {
                    try {
                        if (this.__cloud189RequestHeaders) this.__cloud189RequestHeaders[key] = value;
                    } catch (e) {}
                    return originalSetRequestHeader.apply(this, arguments);
                };
                XMLHttpRequest.prototype.send = function() {
                    if (shouldCapture(this.__cloud189RequestUrl)) {
                        emit(this.__cloud189RequestUrl, this.__cloud189RequestHeaders || {});
                    }
                    return originalSend.apply(this, arguments);
                };
            })();
        `;
        document.documentElement.appendChild(script);
        script.remove();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
