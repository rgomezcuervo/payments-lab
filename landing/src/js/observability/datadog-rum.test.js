import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initDatadogRum } from './datadog-rum.js';

const init = vi.fn();
const startSessionReplayRecording = vi.fn();

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    init,
    startSessionReplayRecording,
  },
}));

describe('initDatadogRum', () => {
  beforeEach(() => {
    init.mockClear();
    startSessionReplayRecording.mockClear();
  });

  it('skips when credentials are missing', async () => {
    const r = await initDatadogRum({ applicationId: '', clientToken: '', mode: 'production' });
    expect(r.started).toBe(false);
    expect(r.reason).toBe('missing_credentials');
    expect(init).not.toHaveBeenCalled();
  });

  it('skips in development without allowInDev', async () => {
    const r = await initDatadogRum({
      applicationId: 'app',
      clientToken: 'tok',
      mode: 'development',
      allowInDev: false,
    });
    expect(r.started).toBe(false);
    expect(r.reason).toBe('development_skipped');
  });

  it('initializes when allowed in dev with credentials', async () => {
    const r = await initDatadogRum({
      applicationId: 'app-id',
      clientToken: 'client-tok',
      service: 'svc',
      env: 'staging',
      mode: 'development',
      allowInDev: true,
    });
    expect(r.started).toBe(true);
    expect(r.reason).toBe('ok');
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'app-id',
        clientToken: 'client-tok',
        service: 'svc',
        env: 'staging',
      }),
    );
    expect(startSessionReplayRecording).toHaveBeenCalled();
  });
});
