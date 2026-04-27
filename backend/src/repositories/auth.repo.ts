import { query } from '../db';

export class AuthRepository {
  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  async revokeTokenDb(userId: string) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }
}

export const authRepository = new AuthRepository();
