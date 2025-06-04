import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'API is running');
  });
}); 