import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(SQL_CONNECTION)
    private readonly db: PgConnection,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check - no authentication required' })
  async check() {
    try {
      await this.db.execute('SELECT 1');
      return {
        status: 'ok',
        db: 'up',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        db: 'down',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
