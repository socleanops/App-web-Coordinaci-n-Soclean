import { test, expect, Page } from "@playwright/test";

const BASE_URL = "https://app-web-coordinaci-n-soclean.vercel.app";
const TEST_USER = "lmacaris@soclean.com.uy";
const TEST_PASS = "Hereford12";

// ─────────────────────────────────────────────────────────
// HELPER: Login reutilizable
// ─────────────────────────────────────────────────────────
async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);

  await page.waitForSelector("#email", { state: "visible", timeout: 15000 });

  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');

  await page.waitForURL(
    (url: URL) => url.pathname === "/" || url.pathname.includes("dashboard"),
    { timeout: 30000 }
  );

  await page.waitForLoadState("networkidle", { timeout: 60000 });

  await page.waitForFunction(
    () => !document.body.innerText.includes("Cargando aplicación"),
    { timeout: 60000 }
  );

  await page.waitForTimeout(3000);
}

// ─────────────────────────────────────────────────────────
// TEST 1: Smoke Test - ¿La app responde?
// ─────────────────────────────────────────────────────────
test("Smoke Test: Carga de Aplicación", async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/soclean/i);
});

// ─────────────────────────────────────────────────────────
// TEST 2: Funcionalidad Crítica - Login y Datos
// ─────────────────────────────────────────────────────────
test("Flujo Crítico: Login y Verificación de Datos", async ({ page }) => {
  await loginAs(page, TEST_USER, TEST_PASS);
  
  // Navegar a Clientes
  await page.getByRole("link", { name: /^clientes$/i }).click();
  await page.waitForURL(`${BASE_URL}/clientes`, { timeout: 15000 });
  
  // Verificar que la tabla cargó registros (no está vacía)
  const rows = page.locator('table tr');
  await expect(rows.count()).toBeGreaterThan(1); // Header + al menos 1 cliente
  
  console.log('✅ Verificación de datos completada exitosamente.');
});

// ─────────────────────────────────────────────────────────
// TEST 3: Operatividad Escritura - Crear Cliente (Opcional en CI)
// ─────────────────────────────────────────────────────────
test("Operatividad: Apertura de Formulario de Creación", async ({ page }) => {
  await loginAs(page, TEST_USER, TEST_PASS);
  await page.getByRole("link", { name: /^clientes$/i }).click();
  
  // Solo probamos que el botón y el diálogo se abren correctamente (sin guardar para no ensuciar DB)
  const newClientBtn = page.getByRole("button", { name: /añadir cliente/i });
  await newClientBtn.click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
