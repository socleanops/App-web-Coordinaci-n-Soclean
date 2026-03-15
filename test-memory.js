// Monitoreo básico
setInterval(() => {
  const memory = window.performance.memory;
  const domElements = document.querySelectorAll('*').length;
  const eventListeners = getEventListeners ? 'No disponible' : 'Verifica con DevTools';

  console.clear();
  console.log('=== MONITOREO DE RECURSOS ===');
  if(memory) {
    console.log('Memoria JS:', Math.round(memory.usedJSHeapSize / 1024), 'KB');
    console.log('Límite:', Math.round(memory.jsHeapSizeLimit / 1024), 'KB');
  }
  console.log('Elementos DOM:', domElements);
  console.log('LocalStorage keys:', localStorage.length);
  console.log('============================');
}, 3000);
