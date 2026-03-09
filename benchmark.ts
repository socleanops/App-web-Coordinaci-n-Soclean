const NUM_FACTURAS = 50000;
const ITEMS_PER_FACTURA = 20;

const facturas = Array.from({ length: NUM_FACTURAS }, (_, i) => ({
    id: `factura_${i}`,
    items: Array.from({ length: ITEMS_PER_FACTURA }, (_, j) => ({
        id: `item_${i}_${j}`,
        cantidad: Math.random() * 10
    }))
}));

console.log(`Benchmarking with ${NUM_FACTURAS} facturas, each with ${ITEMS_PER_FACTURA} items.`);

const start = performance.now();

// The exact calculation from src/pages/Billing.tsx
const total = facturas.reduce((acc, current) => acc + current.items.reduce((accItem: any, item: any) => accItem + item.cantidad, 0), 0);

const end = performance.now();

console.log(`Total: ${total}`);
console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
