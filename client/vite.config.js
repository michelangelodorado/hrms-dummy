import react from '@vitejs/plugin-react';

export default 
  {
  plugins: [react()],
  server: {
    host: true,        // 0.0.0.0
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',  // what your browser uses to reach the dev server
      protocol: 'ws',
      port: 5173
    }
  }
};

