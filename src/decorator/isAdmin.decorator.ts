import { SetMetadata } from '@nestjs/common';

export const ISADMIN_KEY = 'isAdmin';
export const IsAdmin = (isAdmin: boolean) => SetMetadata(ISADMIN_KEY, isAdmin);
