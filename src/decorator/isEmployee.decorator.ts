import { SetMetadata } from '@nestjs/common';

export const ISEMPLOYEE_KEY = 'isEmployee';
export const IsEmployee = (isEmployee: boolean) =>
  SetMetadata(ISEMPLOYEE_KEY, isEmployee);
