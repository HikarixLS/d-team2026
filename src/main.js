import { createApp } from 'vue';
import * as XLSX from 'xlsx';
import App from './App.vue';
import './style.css';

if (typeof window !== 'undefined' && !window.XLSX) {
    window.XLSX = XLSX;
}

createApp(App).mount('#app');
