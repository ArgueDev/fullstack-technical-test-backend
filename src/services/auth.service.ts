import UserModel from '../models/user.model.js';
import {
  hashPassword,
  comparePassword,
} from '../utils/auth.js';
import { generateToken } from '../utils/jwt.js';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterUserInput) => {
  const existingUser = await UserModel.findOne({
    email: data.email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await hashPassword(data.password);

  return UserModel.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: 'user',
  });
};

export const loginUser = async (data: LoginUserInput) => {
  const user = await UserModel.findOne({
    email: data.email.toLowerCase(),
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.password as string
  );

  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = generateToken({
    userId: user.id,
    role: user.role as 'admin' | 'user',
  });

  return {
    user,
    token,
  };
};