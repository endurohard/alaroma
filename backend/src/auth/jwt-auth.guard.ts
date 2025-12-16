import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Attach user to request
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
