import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все локации' })
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить локацию по ID' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать локацию' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить локацию' })
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить локацию' })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
