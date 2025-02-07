import { getHTML } from '@/assets/js/browser_side-compiler.js';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { CryptAESEncrypt, CryptAESDecrypt } from '@/crypt.js';

import '../../assets/js/filePicker.js';

const componentId = '16cd9c0a-7eb2-4082-9f2d-492dba8c7aef';

const data = {
    data() {
        return {
            isLoading: false, isDone: false,
        }
    },

    components: {

    },

    methods: {
        work(cmd) {
            ElMessage.error('尚未实现')
        },
    },

    template: await getHTML(import.meta.url, componentId),

};


export default data;

