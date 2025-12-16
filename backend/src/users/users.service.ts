import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'full_name', 'role', 'location_id', 'is_active', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'full_name', 'role', 'location_id', 'is_active', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException(`Пользователь с email ${createUserDto.email} уже существует`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Удаляем пароль из ответа
    delete savedUser.password;
    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
