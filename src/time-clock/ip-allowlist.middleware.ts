import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getAuthorizedIps } from '../config';
import { extractClientIp } from './client-ip';

@Injectable()
export class IpAllowlistMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const clientIp = extractClientIp(req);
    if (getAuthorizedIps().includes(clientIp ?? '')) {
      next();
      return;
    }

    console.log(`[BLOQUEADO] Tentativa de acesso do IP: ${clientIp}`);
    res.status(403).json({
      error: 'Acesso negado. Este dispositivo não está na rede autorizada.',
    });
  }
}
