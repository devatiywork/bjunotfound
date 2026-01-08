import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	return {
		plugins: [tailwindcss(), react()],
		server: {
			host: true, // Доступ по IP адресу (0.0.0.0)
			port: parseInt(env.VITE_PORT),
			proxy: {
				'/api': {
					target: env.VITE_BACKEND_URL,
					changeOrigin: true,
					secure: false,
					rewrite: path => path.replace(/^\/api/, '/api'),
				},
			},
		},
	}
})
