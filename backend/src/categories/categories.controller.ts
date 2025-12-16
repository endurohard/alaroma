import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все категории' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить категорию' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
