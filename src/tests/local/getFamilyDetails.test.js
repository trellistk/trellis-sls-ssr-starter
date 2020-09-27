'use strict'

require('dotenv').config()

const API_DOMAIN_LOCAL = process.env.API_DOMAIN_LOCAL

const test = require('tape')
const offline = require('../test-utils/offline')
const fetch = require('node-fetch')
const { userFactory } = require('../test-utils/data_factories')

test('Happy path Get a user from the database', async t => {
  await offline.start()

  await fetch(`${API_DOMAIN_LOCAL}/signup`, {
    method: 'POST',
    body: JSON.stringify(userFactory.correct)
  })

  const loginUserRes = await fetch(`${API_DOMAIN_LOCAL}/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: userFactory.correct.email,
      password: userFactory.correct.password,
      chapter: userFactory.correct.chapter
    })
  })

  const loginJson = await loginUserRes.json()
  const token = loginJson.data

  const getUserRes = await fetch(`${API_DOMAIN_LOCAL}/family`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })

  const getJson = await getUserRes.json()

  t.equals(getUserRes.status, 200, 'Returns http 200')
  t.equals(getJson.message, getJson.message, 'Returns a correct response body') // TODO: Can we actually check equality?

  await offline.stop()
  t.end()
})

test('Should return 403 forbidden if user provides malformed authorization/token', async t => {
  await offline.start()

  const getUserRes = await fetch(`${API_DOMAIN_LOCAL}/family`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + 'wrongauthorization' }
  })

  const getJson = await getUserRes.json()

  t.equals(getUserRes.status, 403, 'Returns http 403')
  t.equals(getJson.message, 'User is not authorized to access this resource', 'Returns correct response body')

  await offline.stop()
  t.end()
})

// TODO test if user provides token from a different user.

test('Should return 403 forbidden if user provides no authorization/token', async t => {
  await offline.start()

  const res3 = await fetch(`${API_DOMAIN_LOCAL}/family`)

  const getJson = await res3.json()
  const expectedBody = 'Unauthorized'

  t.equals(res3.status, 401, 'Returns http 401')
  t.equals(getJson.message, expectedBody, 'Returns correct response body')

  await offline.stop()
  t.end()
})
