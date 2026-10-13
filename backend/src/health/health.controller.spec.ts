import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns an OK status', () => {
    const controller = new HealthController();

    expect(controller.check()).toMatchObject({
      status: 'ok',
      service: 'monkyforce-backend',
    });
  });
});
