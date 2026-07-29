import test from 'node:test'
import assert from 'node:assert/strict'
import { createAnswerChecker } from './answer.js'

const check = createAnswerChecker('Khu thi đấu')

test('only ignores letter case', () => {
  for (const answer of [
    'khu thi đấu',
    'KHU THI ĐẤU',
    'Khu Thi Đấu',
  ]) {
    assert.equal(check(answer), true, answer)
  }
})

test('rejects missing words, aliases, missing accents, punctuation and typos', () => {
  assert.equal(check('thi đấu'), false)
  assert.equal(check('KHU THI DAU'), false)
  assert.equal(check('khu-thi-đấu'), false)
  assert.equal(check('khu thi dauu'), false)
  assert.equal(check('ktd'), false)
  assert.equal(check(' khu thi đấu '), false)
  assert.equal(check(''), false)
})
