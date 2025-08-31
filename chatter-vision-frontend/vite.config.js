// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    // Define global as globalThis to mimic Node.js global
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      // Provide Node.js global variables
      define: {
        global: 'globalThis',
      },
      // Enable the polyfills
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias process and buffer to their browser versions
      process: 'process/browser',
      buffer: 'buffer/',
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Inject global variables
        {
          name: 'inject-global',
          transform(code, id) {
            if (id.includes('simple-peer')) {
              return {
                code: `import { Buffer } from 'buffer'; import process from 'process'; ${code}`,
                map: null,
              }
            }
          },
        },
      ],
    },
  },
})
