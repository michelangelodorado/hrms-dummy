import react from '@vitejs/plugin-react';

export default 
  {
  plugins: [react()],
  server: {
    host: true,        // 0.0.0.0
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      protocol: 'ws',
      port: 5173
    }
  }
};

