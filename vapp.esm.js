/*
main JavaScript file for myalioss

*/

pg_statistics.ML = new Date() - ST;// module load



const updateLoadStat = (globalThis.ShowLoadProgress) ? globalThis.ShowLoadProgress : function () { };

globalThis.appInstance_ = {};


export function delay(timeout = 0) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}


updateLoadStat('Waiting');
await new Promise(resolve => setTimeout(resolve));

import { registerResizableWidget } from './modules/util/BindMove.js';
registerResizableWidget();

// break long tasks
await delay();

updateLoadStat('Loading Vue.js');
import { createApp } from 'vue';

// break long tasks
await delay();

if (localStorage.getItem('theme-dark-theme-4d862b9a') === 'true')
    document.documentElement.classList.add('dark');

// break long tasks
await delay();

updateLoadStat('Loading Vue Application');
const Vue_App = (await import('./components/App/App.js')).default;
pg_statistics.AL = new Date() - ST;// app load

updateLoadStat('Creating Vue application');
const app = createApp(Vue_App);
globalThis.appInstance_.app = app;
// break long tasks
await delay();
updateLoadStat('Loading Element-Plus');
{
    const element = await import('element-plus');
    app.use(element);
    // for (const i in element) {
    //     if (i.startsWith('El')) app.component(i, element[i]);
    // }
}
// break long tasks
await delay();
updateLoadStat('Creating app instance');
app.config.unwrapInjectedRef = true;
app.config.compilerOptions.isCustomElement = (tag) => tag.includes('-');
app.config.compilerOptions.comments = true;

// app.mount('#app');

updateLoadStat('Finding #myApp');
const myApp = document.getElementById('myApp');
console.assert(myApp); if (!myApp) throw new Error('FATAL: #myApp not found');

// break long tasks
await delay(10);

updateLoadStat('Mounting application to document');
app.mount(myApp);
pg_statistics.MNT = new Date() - ST;// app mount

// break long tasks
await delay();
updateLoadStat('Finishing');
globalThis.FinishLoad?.call(globalThis);
pg_statistics.OK = new Date() - ST;// app ok





// break long tasks
await delay();



queueMicrotask(() => {
    globalThis.CreateDynamicResizableView = function (element, title, width, height) {
        const el = document.createElement('resizable-widget');
        el.style.width = Math.min(window.innerWidth, width) + 'px';
        el.style.height = Math.min(window.innerHeight, height) + 'px';
        document.getElementById('app').append(el);

        const caption = document.createElement('widget-caption');
        caption.slot = 'widget-caption';
        caption.append(title);
        const close_button = document.createElement('button');
        close_button.innerText = 'x';
        close_button.style.float = 'right';
        close_button.dataset.excludeBindmove = 'true';
        close_button.addEventListener('click', () => el.remove());
        caption.append(close_button);

        el.append(caption, element);
        el.open = true;

        return el;
    };
    globalThis.document.addEventListener('click', ev => {
        const target = ev.target;
        if (!target || target.tagName !== 'A') return;
        if (target.target !== '_blank') return;
        if ((new URL(target.href, location.href).hostname === location.hostname)) return;
        // external link detected
        ev.preventDefault();
        queueMicrotask(() => {
            const frame = document.createElement('iframe');
            // frame.sandbox = 'allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox';
            frame.src = new URL(target.href, location.href).href;
            frame.setAttribute('style', 'width: 100%; height: 100%; overflow: hidden; border: 0; box-sizing: border-box; display: flex; flex-direction: column;');

            CreateDynamicResizableView(frame, 'External Link', 720, 1000);
        });
    });
});



// 预加载子组件，提升用户体验
setTimeout(() => {
    const preload_list = [
    ];
    for (const i of preload_list) import(i).then(() => {
        console.info('[preload]', 'Module has been successfully prefetched:', i);
    }).catch(error => {
        console.warn('[preload]', 'Failed to prefetch module:', i, error);
    });
});










