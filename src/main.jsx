import r2wc from "@r2wc/react-to-web-component";
import App from "./App.jsx";
import './index.css';

const whatGoesInThisBin = r2wc(App, {
    props: {
        bin: "string"
    },
    connectedCallback() {
        // Only inject if not already present
        if (window.__styles && this.shadowRoot && !this.shadowRoot.querySelector('#vite-plugin-css-injected-by-js')) {
            const style = document.createElement('style');
            style.id = 'vite-plugin-css-injected-by-js';
            style.textContent = window.__styles;
            this.shadowRoot.appendChild(style);
        }
    }
});

customElements.define("what-goes-in-this-bin", whatGoesInThisBin);