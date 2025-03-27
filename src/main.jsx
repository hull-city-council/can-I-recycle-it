import r2wc from "@r2wc/react-to-web-component";
import App from "./App.jsx";

const CanIRecycleItComponent = r2wc(App);

customElements.define("can-i-recycle-it", CanIRecycleItComponent);