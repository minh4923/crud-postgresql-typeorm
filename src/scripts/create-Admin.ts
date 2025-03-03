import { NestFactory} from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserRepository } from '../modules/user/repositories/user.repository';
import * as bcrypt from 'bcrypt';

export async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(UserRepository);
  const adminExists = await userRepository.getUserByEmail('admin@gmail.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await userRepository.createUser({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created');
  }else{
    console.log('Admin user already exists');
  }
  await app.close();
}
createAdmin();