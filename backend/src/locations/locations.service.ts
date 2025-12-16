import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    return this.locationsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Локация с ID ${id} не найдена`);
    }

    return location;
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationsRepository.create(createLocationDto);
    return this.locationsRepository.save(location);
  }

  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    await this.findOne(id);
    await this.locationsRepository.update(id, updateLocationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationsRepository.remove(location);
  }
}
