const supertest = require('supertest');

const db = require('../database/dbConfig');

const server = require('../api/server');

const {
  find,
  findById,
  findBySub,
  insert,
  remove,
  update
} = require('../users/usersModel.js');

beforeEach(async () => {
  await db.raw('TRUNCATE users RESTART IDENTITY CASCADE');
});

describe('Testing /api/users', () => {
  it('GET / should return a 200', async () => {
    const res = await supertest(server).get('/api/users/');
    expect(res.status).toEqual(200);
  });

  it('GET /:id should find a user by the individual', async () => {
    const [newUser] = await db('users')
      .insert({
        sub: 'auth0|1234567',
        username: 'marypoppins',
        email: 'marypoppins@email.com',
        location: 'Portland',
        roles: 'conservationist'
      })
      .returning('id');

    const res = await supertest(server).get(`/api/users/${newUser}`);
    expect(res.status).toBe(200);
  });

  it('POST / should register with a 201 created ', async () => {
    let post = {
      sub: 'auth0|1234567',
      username: 'marypoppins',
      email: 'marypoppins@email.com',
      location: 'Portland',
      roles: 'conservationist'
    };

    let res = await supertest(server)
      .post('/api/users')
      .send(post);
    expect(res.status).toEqual(201);
  });

  it('PUT / should update a user that already exist', async () => {
    let post = {
      id: 542,
      sub: 'auth0|1234567',
      username: 'marypoppins',
      email: 'marypoppins@email.com',
      location: 'Portland',
      roles: 'conservationist'
    };
    await supertest(server)
      .post('/api/users')
      .send(post);
    const res = await supertest(server)
      .put('/api/users/542')
      .send({ username: 'marynobbins' });
    expect(res.status).toBe(200);
  });
});
