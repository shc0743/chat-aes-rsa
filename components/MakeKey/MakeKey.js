import { getHTML } from '@/assets/js/browser_side-compiler.js';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { GenerateAES256, GenerateRSA } from '@/crypt.js';
import { CryptAESEncryptWithString, CryptAESDecryptWithString } from '@/assets/js/cryptAesWithStringKey.js';

const componentId = 'd3be785c-f16f-47e2-a786-3af89327991b';

const data = {
    data() {
        return {
            usage_type: 'new',
            isLoading: false,
            keyaes_input: '',
            keyrsa_input: '',
            keyrsaprivate_input: '',
            key_primary: '',
            key_data: '',
            shouldSaveKey: true,
        }
    },

    props: {
        keyaes: String,
        keyrsa: String,
        keyrsaprivate: String,
    },

    emits: ['update:keyaes', 'update:keyrsa', 'update:keyrsaprivate'],

    components: {

    },

    methods: {
        init_data() {
            this.keyaes_input = this.keyaes;
            this.keyrsa_input = this.keyrsa;
            this.keyrsaprivate_input = this.keyrsaprivate;
        },
        getdata() {
            return JSON.stringify({
                aes: this.keyaes, rsa: { pub: this.keyrsa, priv: this.keyrsaprivate },
            });
        },
        submit(k, tip = true) {
            if (!Array.isArray(k)) k = [k];
            for (const i of k)
                this.$emit('update:' + i, this[i + '_input']);
            tip && ElMessage.success('已提交');
            if (this.shouldSaveKey) this.$nextTick(() => {
                localStorage.setItem('Project:ChatAesRsa;Type:Encryption;Key:CryptKey', this.getdata());
            });
        },
        parse_user_key() {
            this.key_data = '';
        },
        async genaes() {
            this.keyaes_input = await GenerateAES256();
        },
        async genrsa() {
            ({ public: this.keyrsa_input, private: this.keyrsaprivate_input } = await GenerateRSA());
        },
        async genall() {
            ElMessage.info('请稍候...');
            this.isLoading = true;
            try {
                await this.genrsa();
                await this.genaes();
                this.submit(['keyaes', 'keyrsa', 'keyrsaprivate'], false);
                this.usage_type = 'old';
            } catch (error) {
                ElMessage.error('密钥生成失败。' + error);
            }
            this.isLoading = false;
        },
        async export_do() {
            if (!this.key_primary) return ElMessage.error('请输入 Primary Key');
            const data = this.getdata();
            const enc = await CryptAESEncryptWithString(data, this.key_primary + '$$SALT!@#$%^&*()_+~-={}|[]:;"<>?,./');
            this.key_data = enc;
        },
        async export_copy() {
            try {
                await navigator.clipboard.writeText(this.key_data);
                ElMessage.success('已复制');
            } catch {
                ElMessage.error('复制失败，请手动复制');
            }
        },
        export_down() {
            const obj = new Blob([this.key_data], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(obj);
            window.open(url, 'download_frame');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        async parse_user_key() {
            try {
                const savedKeys = await CryptAESDecryptWithString(this.key_data, this.key_primary + '$$SALT!@#$%^&*()_+~-={}|[]:;"<>?,./');
                const keys = JSON.parse(savedKeys);
                this.keyaes_input = keys.aes;
                this.keyrsa_input = keys.rsa.pub;
                this.keyrsaprivate_input = keys.rsa.priv;
                this.key_data = '';
                this.submit(['keyaes', 'keyrsa', 'keyrsaprivate'], false);
                ElMessage.success('成功。');
            } catch (error) {
                ElMessage.error('密钥导入失败。' + error);
            }
        },
        async clearkey() {
            try { await ElMessageBox.confirm('确定吗？', '清除密钥', { confirmButtonText: '是', cancelButtonText: '不是' }) } catch { return }
            localStorage.removeItem('Project:ChatAesRsa;Type:Encryption;Key:CryptKey');
            location.reload();
        },
    },

    mounted() {
        this.init_data();
        this.usage_type = (this.keyaes || this.keyrsa) ? 'old' : 'new';
    },

    template: await getHTML(import.meta.url, componentId),

};


export default data;

