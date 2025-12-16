import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все продажи' })
  findAll(@Query() query: {
    locationId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить продажу по ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать продажу' })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.salesService.create(createSaleDto, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Отменить продажу' })
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
