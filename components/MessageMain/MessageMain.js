import { getHTML } from '@/assets/js/browser_side-compiler.js';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { CryptAESEncrypt, CryptAESDecrypt } from '@/crypt.js';


const componentId = '04e6a330-c7c0-4192-9f7e-fdb4ba9fb9f5';

const data = {
    data() {
        return {
            text: '',
            messages: [],
            isLoading: false,
            next_message: 0,
            MAX_TEXT_LENGTH: 1024,
        }
    },

    props: {
        keyaes: String,
    },

    components: {

    },

    computed: {
        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
    },

    methods: {
        onInputBoxKeyDown(ev) {
            if (this.isMobileDevice) return;
            if (ev.shiftKey || ev.ctrlKey) return;
            ev.preventDefault();
            queueMicrotask(() => this[ev.altKey ? 'send_message' : (this.next_message === 0 ? 'send_message' : 'decrypt_message')]());
        },
        optimizeList() {
            this.$refs.ui.scrollTo({ top: this.$refs.ui.scrollHeight, left: 0, behavior: 'smooth' });
        },
        send_message() {
            if (this.isLoading) return ElMessage.error('正在发送，请稍等');
            if (!this.keyaes) return ElMessage.error('请先填写密钥');
            if (!this.text) {
                this.next_message = (this.next_message + 1) % 2;
                return;
            }
            this.isLoading = true;
            const text = this.text; this.text = '正在发送...';
            ((async (text) => {
                const cryption = await CryptAESEncrypt(text, this.keyaes);
                const data = {
                    sender: 0,
                    message: text,
                    data: cryption,
                    message_id: newid(),
                };
                this.messages.push(data);
            })(text)).then(v => {
                this.text = '';
                this.next_message = (this.next_message + 1) % 2;
            }).catch(error => {
                ElMessage.error('消息发送失败。' + error);
                this.text = text;
            }).finally(() => this.isLoading = false);
        },
        decrypt_message() {
            if (this.isLoading) return ElMessage.error('正在解密，请稍等');
            if (!this.keyaes) return ElMessage.error('请先填写密钥');
            if (!this.text) {
                this.next_message = (this.next_message + 1) % 2;
                return;
            }
            this.isLoading = true;
            const text = this.text; this.text = '正在解密...';
            ((async (text) => {
                const decryption = await CryptAESDecrypt(text, this.keyaes);
                const data = {
                    sender: 1,
                    message: decryption,
                    data: text,
                    message_id: newid(),
                };
                this.messages.push(data);
            })(text)).then(v => {
                this.text = '';
                this.next_message = (this.next_message + 1) % 2;
            }).catch(error => {
                ElMessage.error('消息解密失败。' + error);
                this.text = text;
            }).finally(() => this.isLoading = false);
        },
        newConversation() {
            this.messages.length = 0;
            this.next_message = 0;
            this.text = '';
            this.messages.push({ type: 'system', content: '已清除上下文' });
        },
        async copydata(data) {
            try {
                await navigator.clipboard.writeText(data);
                // ElMessage.success('已复制');
            } catch {
                ElMessage.error('复制失败，请手动复制');
            }
        },
        async showMenu(ev, item) {
            const s = window.getSelection();
            if (!s.isCollapsed) return;
            ev.preventDefault();
            await import('../../assets/js/winmenu-helper.js');
            const menu = CreatePopupMenu();
            AppendMenu(menu, String, {}, '复制', () => {
                this.copydata(item.message);
            });
            AppendMenu(menu, String, {}, '全选', () => {
                const s = window.getSelection();
                if (s.rangeCount > 0) s.removeAllRanges();
                const node = this.$el.querySelector(`.chat-message-item[data-id="${item.message_id}"] .chat-message-text`);
                if (!node) return;
                const range = document.createRange();
                range.selectNode(node);
                s.addRange(range);
            });
            AppendMenu(menu, String, {}, '删除', () => {
                const index = this.messages.findIndex(value => value.message_id === item.message_id);
                if (index > -1) this.messages.splice(index, 1);
            });
            TrackPopupMenu(menu, ev.x, ev.y);
        },
    },

    template: await getHTML(import.meta.url, componentId),

};


export default data;

import('../../assets/js/winmenu-helper.js');


function newid() {
    return (new Date().getTime()) + '0' + Math.floor(Math.random() * 100000);
}


