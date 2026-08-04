import test from 'node:test'
import assert from 'node:assert/strict'
import { checkTestingAnswer, createTestingPlaceholder } from './testingMode.js'

test('testing rooms use a public case-insensitive test answer', () => {
  assert.equal(checkTestingAnswer('test'), true)
  assert.equal(checkTestingAnswer('TEST'), true)
  assert.equal(checkTestingAnswer(' test '), false)
  assert.equal(checkTestingAnswer('sân bóng chuyền'), false)
})

test('testing placeholders never reference the real game images', () => {
  const hint = createTestingPlaceholder('hint')
  const reward = createTestingPlaceholder('full')

  assert.match(hint, /Chỗ này sẽ hiện ảnh gợi ý/)
  assert.match(reward, /Chỗ này sẽ hiện ảnh đáp án/)
  assert.doesNotMatch(hint, /goiy/i)
  assert.doesNotMatch(reward, /goiy/i)
})
