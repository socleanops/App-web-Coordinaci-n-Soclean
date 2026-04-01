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
  
  // Esperar a que el link de clientes esté visible y hacer click
  const clientLink = page.getByRole("link", { name: /^clientes$/i });
  await clientLink.waitFor({ state: "visible", timeout: 15000 });
  await clientLink.click();
  
  // Asegurarnos de estar en la URL correcta
  await page.waitForURL(`${BASE_URL}/clientes`, { timeout: 15000 });
  
  // Esperar a que pase el skeleton screen o carga de la tabla
  await page.waitForFunction(() => !document.body.innerText.includes("Cargando"), { timeout: 15000 }).catch(() => {});
  
  // Solo probamos que el botón y el diálogo se abren correctamente (sin guardar para no ensuciar DB)
  // Añadido waitFor para la race condition de Supabase Auth validando el Rol para mostrar el botón
  const newClientBtn = page.getByRole("button", { name: /añadir cliente/i });
  await newClientBtn.waitFor({ state: "visible", timeout: 20000 });
  await expect(newClientBtn).toBeEnabled({ timeout: 10000 });
  await newClientBtn.click();
  
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
});
