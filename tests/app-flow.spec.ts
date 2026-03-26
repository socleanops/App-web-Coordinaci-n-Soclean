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
// TEST 1: Verificar que la app carga
// ─────────────────────────────────────────────────────────
test("flujo principal del sistema", async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/soclean/i);
});

// ─────────────────────────────────────────────────────────
// TEST 2: Login de usuario
// ─────────────────────────────────────────────────────────
test("login usuario", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.waitForSelector("#email", { state: "visible", timeout: 15000 });
  await page.fill("#email", TEST_USER);
  await page.fill("#password", TEST_PASS);
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL(
      (url: URL) => url.pathname === "/" || url.pathname.includes("dashboard"),
      { timeout: 30000 }
    );
  } catch {
    const errorMsg = await page
      .locator(".text-destructive")
      .first()
      .innerText()
      .catch(() => null);
    if (errorMsg) {
      throw new Error(`Login fallido: "${errorMsg}". Verifica las credenciales.`);
    }
    throw new Error(`Timeout esperando redirección. URL actual: ${page.url()}`);
  }

  await expect(page).toHaveURL(
    (url: URL) => url.pathname === "/" || url.pathname.includes("dashboard")
  );
});

// ─────────────────────────────────────────────────────────
// TEST 3: Crear cliente
// ─────────────────────────────────────────────────────────
test("crear cliente", async ({ page }) => {
  // Login completo
  await loginAs(page, TEST_USER, TEST_PASS);

  // Navegar usando el sidebar — NO goto (rompe el contexto de Supabase)
  await page.getByRole("link", { name: /^clientes$/i }).click();
  await page.waitForURL(`${BASE_URL}/clientes`, { timeout: 15000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 });

  // Abrir formulario
  const newClientBtn = page.getByRole("button", { name: /añadir cliente/i });
  await newClientBtn.waitFor({ state: "visible", timeout: 30000 });
  await newClientBtn.click();

  // Esperar el diálogo
  await page.waitForSelector('[role="dialog"]', {
    state: "visible",
    timeout: 15000,
  });

  // ✅ Llenar campos OBLIGATORIOS (validados por Zod)
  const timestamp = Date.now();
  const clientName = `Cliente de Prueba ${timestamp}`;
  
  // 1. Razón Social (min 2 chars)
  await page.getByPlaceholder(/empresa sa o juan lópez/i).fill(clientName);
  
  // 2. RUT / Cédula (entre 8 y 12 dígitos)
  await page.getByPlaceholder(/210000.. o 1234567/i).fill("12345678");
  
  // 3. Dirección (mínimo 5 chars)
  await page.getByPlaceholder(/av. siempreviva 742/i).fill("Av. Principal 12345");

  // Guardar
  const saveBtn = page.getByRole("button", { name: "Guardar Cliente" });
  await saveBtn.scrollIntoViewIfNeeded();
  await saveBtn.click();

  // Esperar que procese y el diálogo se cierre
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 15000 });

  // ✅ Verificar que el cliente aparece en la tabla
  await expect(
    page.locator(`text=${clientName}`)
  ).toBeVisible({ timeout: 10000 });
});
