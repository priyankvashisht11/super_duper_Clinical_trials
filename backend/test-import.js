async function test() {
  try {
    const controller = await import('./src/controllers/protocol.controller.ts');
    console.log('Controller exports:', Object.keys(controller));
    console.log('Default export:', controller.default);
    console.log('Default export keys:', controller.default ? Object.keys(controller.default) : 'undefined');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
