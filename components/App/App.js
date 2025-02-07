import { getHTML } from '@/assets/js/browser_side-compiler.js';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { RefreshLeft, Fold } from 'icons-vue';
import { defineAsyncComponent } from 'vue';



const MessageMain = defineAsyncComponent(() => import('../MessageMain/MessageMain.js'));
const FTUI = defineAsyncComponent(() => import('../FTUI/FTUI.js'));
const MakeKey = defineAsyncComponent(() => import('../MakeKey/MakeKey.js'));



const componentId = '5092a8a4-af54-4fc8-9335-2ee10ae42af7';

const data = {
    data() {
        return {
            isConnected: false, isLoading: false,
            appVersion: '--',
            appLoadTime: 0,
            appTabs: [{ text: 'Chat', tab: 'chat' }, { text: '文件传输', tab: 'transfer' }, { text: '密钥管理', tab: 'key' }, { text: '设置', tab: 'set' }],
            active_panel: 'chat',
            loadCopyRightFrame: false,
            key_aes: '',
            key_rsa: '', key_rsa_private: '',
            colorDark: false,
            autologon: false,
        }
    },

    components: {
        MessageMain, FTUI, MakeKey,
    },

    computed: {
        isSupported() {
            return (window.crypto && window.crypto.subtle && true) || false;
        },
    },

    methods: {
        changeTheme() {
            if (this.colorDark) {
                localStorage.removeItem('theme-dark-theme-4d862b9a');
            } else {
                localStorage.setItem('theme-dark-theme-4d862b9a', 'true');
            }
            this.colorDark = !this.colorDark;
            document.documentElement.classList.toggle('dark');
        },
        connect() {
            this.isConnected = true;
            if (this.autologon) {
                localStorage.setItem('Project:ChatAesRsa;Type:Logon;Key:AutoLogon', 'true');
            }
        },
        async reset() {
            try { await ElMessageBox.confirm('确定吗？', '清除数据', { confirmButtonText: '是', cancelButtonText: '不是' }) } catch { return }
            localStorage.removeItem('Project:ChatAesRsa;Type:Encryption;Key:CryptKey');
            localStorage.removeItem('Project:ChatAesRsa;Type:Logon;Key:AutoLogon');
            location.reload();
        },
    },

    created() {
        this.colorDark = ('true' === localStorage.getItem('theme-dark-theme-4d862b9a'));
    },

    mounted() {
        fetch('./assets/data/version.json').then(v => v.json()).then(json => {
            if (json.schema_version === 1) {
                this.appVersion = json.data.values['app.version.id'];
            } else {
                console.warn('[version]', 'Unsupported schema version:', json.schema_version);
                this.appVersion = '0.0.0.0';
            }
        }).catch(() => this.appVersion = '0.0.0.0');

        queueMicrotask(() => {
            const savedKeys = localStorage.getItem('Project:ChatAesRsa;Type:Encryption;Key:CryptKey');
            if (savedKeys) try {
                const keys = JSON.parse(savedKeys);
                this.key_aes = keys.aes;
                this.key_rsa = keys.rsa.pub;
                this.key_rsa_private = keys.rsa.priv;
            } catch { }
        });
        queueMicrotask(() => {
            if ('true' === localStorage.getItem('Project:ChatAesRsa;Type:Logon;Key:AutoLogon'))
                queueMicrotask(() => this.$nextTick(() => this.connect()));
        });

        this.appLoadTime = pg_statistics.ASL = new Date() - ST;//App Script Loaded
    },

    template: await getHTML(import.meta.url, componentId),

};


export default data;



