import { defineConfig, devices } from '@playwright/test'

const PUERTO = 5174
const API_SIMULADA = 'http://localhost:5167'

// E2E herméticos: la API se simula con page.route (ver e2e/), no requiere backend ni base de datos.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: 'on-first-retry',
    // SLOWMO=800 npx playwright test --headed: ralentiza cada acción para verla.
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_URL: API_SIMULADA },
  },
})
