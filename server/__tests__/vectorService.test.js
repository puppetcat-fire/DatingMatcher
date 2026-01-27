// 只测试向量服务中独立的函数，避免数据库依赖
const { cosineSimilarity } = require('../services/vectorService');

describe('Vector Service - Independent Functions', () => {
  describe('cosineSimilarity', () => {
    test('should return 1 for identical vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 3];
      expect(cosineSimilarity(vec1, vec2)).toBe(1);
    });

    test('should return -1 for completely opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      expect(cosineSimilarity(vec1, vec2)).toBe(-1);
    });

    test('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      expect(cosineSimilarity(vec1, vec2)).toBe(0);
    });

    test('should return correct similarity for non-trivial vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5, 6];
      // Manual calculation: (1*4 + 2*5 + 3*6) / (sqrt(14) * sqrt(77)) ≈ 32 / (3.7417 * 8.7750) ≈ 32 / 32.832 ≈ 0.9746
      expect(cosineSimilarity(vec1, vec2)).toBeCloseTo(0.9746, 4);
    });

    test('should return 0 for empty vectors', () => {
      const vec1 = [];
      const vec2 = [];
      expect(cosineSimilarity(vec1, vec2)).toBe(0);
    });

    test('should return 0 for vectors of different lengths', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];
      expect(cosineSimilarity(vec1, vec2)).toBe(0);
    });
  });
});
