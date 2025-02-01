import { defineConfig } from "vite";

const isProd = process.env.NODE_ENV === "production";
export default defineConfig({
    base: isProd ? `/threejs-svg-parser/` : "/",
    define: {
        __BASE_URL__: JSON.stringify(isProd ? `/threejs-svg-parser/` : "/"),
    },
});
