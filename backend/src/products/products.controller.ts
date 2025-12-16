import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все товары' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(search, categoryId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск товаров' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать товар' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить товар' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
