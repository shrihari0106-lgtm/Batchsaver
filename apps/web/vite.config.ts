import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@batchsaver/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@batchsaver/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
      '@batchsaver/config': path.resolve(__dirname, '../../packages/config/src'),
      '@batchsaver/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src'),
      '@batchsaver/module-dashboard': path.resolve(__dirname, '../../modules/dashboard/src'),
    },
  },
});
