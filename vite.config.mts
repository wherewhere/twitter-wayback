import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import simpleHtmlPlugin from "vite-plugin-simple-html";
import cssnano from "cssnano";

export default defineConfig({
    base: "./",
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: tag => tag.includes('-')
                }
            }
        }),
        simpleHtmlPlugin({
            minify: {
                minifyJs: true,
                sortSpaceSeparatedAttributeValues: true,
                sortAttributes: true,
                tagOmission: false
            }
        })
    ],
    css: {
        postcss: {
            plugins: [
                cssnano({
                    preset: "advanced"
                })
            ]
        },
        devSourcemap: true
    },
    build: {
        outDir: "dist",
        sourcemap: true,
        minify: "terser"
    }
});