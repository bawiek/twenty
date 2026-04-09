// Wave 0 RED test — imports a service that does not exist yet.
// Wave 2 (plan 03-02) creates ../stratia-email.service.ts.
// Test framework: Jest.
//
// AUTO-03 / FLOW-04 — StratiaEmailService forwards outbound emails to the
// Resend HTTP API. Mocks global.fetch to verify headers, body, and error
// handling behavior. Keys to assert:
//   - POST https://api.resend.com/emails
//   - Authorization: Bearer <RESEND_API_KEY>
//   - content-type: application/json
//   - JSON body with from, to[], subject, html
//   - graceful no-op when RESEND_API_KEY env var is unset
//   - throws when Resend returns a non-2xx status
import { Test, type TestingModule } from '@nestjs/testing';

import { StratiaEmailService } from '../stratia-email.service';

describe('StratiaEmailService', () => {
  let service: StratiaEmailService;
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.RESEND_API_KEY = 'test-key';
    process.env.STRATIA_EMAIL_FROM = 'StratIA <test@stratia.fr>';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StratiaEmailService],
    }).compile();

    service = module.get<StratiaEmailService>(StratiaEmailService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  it('should POST to https://api.resend.com/emails exactly once', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'email-1' }),
      text: async () => '{"id":"email-1"}',
    });

    await service.send({
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
  });

  it('should include Authorization: Bearer <RESEND_API_KEY> and content-type: application/json headers', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'email-1' }),
      text: async () => '{"id":"email-1"}',
    });

    await service.send({ to: 'x@y.fr', subject: 'Test', html: '<p>hi</p>' });

    const [, init] = fetchMock.mock.calls[0];
    const headers = (init as { headers: Record<string, string> }).headers;
    expect(headers['Authorization']).toBe('Bearer test-key');
    expect(headers['content-type']).toBe('application/json');
  });

  it('should send a JSON body containing from, to array, subject, and html', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'email-1' }),
      text: async () => '{"id":"email-1"}',
    });

    await service.send({
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(
      (init as { body: string }).body,
    ) as { from: string; to: string[]; subject: string; html: string };

    expect(body.from).toBe('StratIA <test@stratia.fr>');
    expect(body.to).toEqual(['x@y.fr']);
    expect(body.subject).toBe('Test');
    expect(body.html).toBe('<p>hi</p>');
  });

  it('should log a warning and return (no-op) when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    await expect(
      service.send({ to: 'x@y.fr', subject: 'Test', html: '<p>hi</p>' }),
    ).resolves.toBeUndefined();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should throw an error with the response body text when Resend returns 400', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid "to" address',
      json: async () => ({ error: 'Invalid "to" address' }),
    });

    await expect(
      service.send({ to: 'bad', subject: 'Test', html: '<p>hi</p>' }),
    ).rejects.toThrow(/Invalid "to" address/);
  });

  it('should resolve without error when Resend returns 200', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'email-1' }),
      text: async () => '{"id":"email-1"}',
    });
    await expect(
      service.send({ to: 'x@y.fr', subject: 'Test', html: '<p>hi</p>' }),
    ).resolves.toBeUndefined();
  });

  it('should default the "from" address to STRATIA_EMAIL_FROM env var, fallback to StratIA <noreply@stratia.fr>', async () => {
    // Case A: env var set
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'a' }),
      text: async () => '',
    });
    await service.send({ to: 'x@y.fr', subject: 'Test', html: '<p>hi</p>' });
    const [, initA] = fetchMock.mock.calls[0];
    const bodyA = JSON.parse((initA as { body: string }).body) as { from: string };
    expect(bodyA.from).toBe('StratIA <test@stratia.fr>');

    // Case B: env var unset, expect the documented fallback constant.
    fetchMock.mockClear();
    delete process.env.STRATIA_EMAIL_FROM;

    // Rebuild the service so it re-reads the env var at construction time
    // (the implementation may cache the value).
    const module: TestingModule = await Test.createTestingModule({
      providers: [StratiaEmailService],
    }).compile();
    const freshService = module.get<StratiaEmailService>(StratiaEmailService);

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'b' }),
      text: async () => '',
    });
    await freshService.send({
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    });
    const [, initB] = fetchMock.mock.calls[0];
    const bodyB = JSON.parse((initB as { body: string }).body) as { from: string };
    expect(bodyB.from).toBe('StratIA <noreply@stratia.fr>');
  });
});
