// STRATIA Phase 3 — internal-auth guard for the stratia REST surface.
//
// Protects POST /stratia/round-robin/next-setter and POST /stratia/email/send
// from external callers. The guard is fail-closed: if STRATIA_INTERNAL_SECRET
// is unset, EVERY request is rejected so a misconfigured deploy cannot silently
// expose the round-robin / email endpoints to the public internet.
//
// The shared secret must match the x-stratia-internal-secret header the Wave 5
// workflow HTTP_REQUEST steps inject. Both Railway services (server + worker)
// must be configured with the same value — see 03-RAILWAY-ENV.md.
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

type StratiaInternalRequest = {
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class StratiaInternalGuard implements CanActivate {
  private readonly logger = new Logger(StratiaInternalGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<StratiaInternalRequest>();
    const expected = process.env.STRATIA_INTERNAL_SECRET;

    if (!expected) {
      this.logger.warn(
        'STRATIA_INTERNAL_SECRET not set — rejecting all stratia internal requests (fail-closed)',
      );

      return false;
    }

    const providedHeader = request.headers['x-stratia-internal-secret'];
    const provided = Array.isArray(providedHeader)
      ? providedHeader[0]
      : providedHeader;

    return provided === expected;
  }
}
