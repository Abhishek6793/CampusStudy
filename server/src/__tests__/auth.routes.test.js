import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

let server;

beforeAll(async () => {
  process.env.PORT = Math.floor(3000 + Math.random() * 1000);
  process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';

  // Wait for the database to be connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Seed the database with a test user
  try {
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
  } catch (error) {
    if (error.code !== 11000) { // Ignore duplicate key error
      throw error;
    }
  }

  // Start the server
  server = app.listen(process.env.PORT);
});

afterAll(async () => {
  // Clean up database
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
    await mongoose.connection.close();
  }
  
  // Close the server
  if (server) {
    server.close();
  }
});

describe('Auth Routes', () => {
  test('POST /login should return 200 for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /login should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(response.statusCode).toBe(401);
  });
});