/**
 * @file apps/api/src/routes/auth.route.ts
 * @description REST Route definitions for /api/v1/auth
 */

import { LoginRequestDto, LoginResponseDto, ApiResponse } from '@batchsaver/api-contracts';
import { User } from '@batchsaver/shared-types';

export interface IAuthController {
  login(dto: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>>;
  getCurrentUser(token: string): Promise<ApiResponse<User>>;
  logout(token: string): Promise<ApiResponse<{ success: boolean }>>;
}
