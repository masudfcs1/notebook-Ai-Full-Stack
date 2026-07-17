import { Request } from 'express';
import { User } from '@prisma/client';

export type AuthenticatedUser = Omit<User, 'password'>;

export interface IAuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
