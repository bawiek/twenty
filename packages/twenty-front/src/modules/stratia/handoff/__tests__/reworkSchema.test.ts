// Wave 0 RED test — imports a schema that does not exist yet.
// Wave 3 (plan 03-03) creates ../schemas/reworkSchema.ts to make this green.
// Test framework: Jest (Phase 2 precedent — twenty-front uses Jest globals).
import { reworkSchema } from '../schemas/reworkSchema';

describe('reworkSchema', () => {
  it('should accept a valid rework note of 10+ characters', () => {
    expect(() =>
      reworkSchema.parse({
        reworkNote: 'Budget pas clair, il faut reprendre la découverte.',
      }),
    ).not.toThrow();
  });

  it('should reject a rework note of exactly 9 characters', () => {
    expect(() =>
      reworkSchema.parse({
        reworkNote: 'trop cour',
      }),
    ).toThrow(/La note doit contenir au moins 10 caractères/);
  });

  it('should reject an empty rework note', () => {
    expect(() =>
      reworkSchema.parse({
        reworkNote: '',
      }),
    ).toThrow(/La note doit contenir au moins 10 caractères/);
  });

  it('should reject a missing reworkNote (required)', () => {
    expect(() => reworkSchema.parse({})).toThrow();
  });
});
