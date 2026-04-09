// Wave 0 RED test — imports a controller that does not exist yet.
// Wave 2 (plan 03-02) creates ../stratia-email.controller.ts.
// Test framework: Jest.
//
// POST /stratia/email/send — Internal endpoint called by the
// reworkNotificationWorkflow HTTP_REQUEST step (and possibly
// hotLeadAlertWorkflow). Validates request body and delegates to
// StratiaEmailService. Protected by the same internal auth guard as
// round-robin to prevent external abuse.
import { Test, type TestingModule } from '@nestjs/testing';

import { StratiaEmailController } from '../stratia-email.controller';
import { StratiaEmailService } from '../stratia-email.service';

type SendEmailBody = { to?: string; subject?: string; html?: string };

describe('StratiaEmailController', () => {
  let controller: StratiaEmailController;
  const mockService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    mockService.send.mockReset();
    mockService.send.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StratiaEmailController],
      providers: [
        {
          provide: StratiaEmailService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StratiaEmailController>(StratiaEmailController);
  });

  it('should return a 200-equivalent success response when body is valid', async () => {
    const body: SendEmailBody = {
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    };

    const result = await controller.send(body);
    // Controller may return { success: true } or void. Either must resolve.
    expect(result === undefined || (result as { success: boolean }).success === true).toBe(
      true,
    );
  });

  it('should delegate to StratiaEmailService.send', async () => {
    const body: SendEmailBody = {
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    };
    await controller.send(body);
    expect(mockService.send).toHaveBeenCalledWith({
      to: 'x@y.fr',
      subject: 'Test',
      html: '<p>hi</p>',
    });
  });

  it('should reject a request with missing "to" field (400 class)', async () => {
    await expect(
      controller.send({ subject: 'Test', html: '<p>hi</p>' } as SendEmailBody),
    ).rejects.toThrow();
  });

  it('should reject a request with missing or empty "subject"', async () => {
    await expect(
      controller.send({
        to: 'x@y.fr',
        subject: '',
        html: '<p>hi</p>',
      } as SendEmailBody),
    ).rejects.toThrow();

    await expect(
      controller.send({
        to: 'x@y.fr',
        html: '<p>hi</p>',
      } as SendEmailBody),
    ).rejects.toThrow();
  });

  it('should reject a request with missing or empty "html"', async () => {
    await expect(
      controller.send({
        to: 'x@y.fr',
        subject: 'Test',
        html: '',
      } as SendEmailBody),
    ).rejects.toThrow();

    await expect(
      controller.send({
        to: 'x@y.fr',
        subject: 'Test',
      } as SendEmailBody),
    ).rejects.toThrow();
  });

  it('should require an internal-auth guard to block external callers', () => {
    const metadata = Reflect.getMetadata('__guards__', controller.send);
    const classMetadata = Reflect.getMetadata(
      '__guards__',
      StratiaEmailController,
    );
    const hasGuard =
      (Array.isArray(metadata) && metadata.length > 0) ||
      (Array.isArray(classMetadata) && classMetadata.length > 0);
    expect(hasGuard).toBe(true);
  });
});
