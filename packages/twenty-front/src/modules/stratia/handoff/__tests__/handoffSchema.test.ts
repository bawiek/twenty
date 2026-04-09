// Wave 0 RED test — imports a schema that does not exist yet.
// Wave 3 (plan 03-03) creates ../schemas/handoffSchema.ts to make this green.
// Test framework: Jest (Phase 2 precedent — twenty-front uses Jest globals;
// `from 'vitest'` would not resolve, vitest.config.ts is Storybook-only).
import { handoffSchema } from '../schemas/handoffSchema';

// Reference literal min(1) and max(5) — temperature must be an int 1..5.
describe('handoffSchema', () => {
  const validQualification = {
    budget: false,
    autorite: false,
    besoin: false,
    timing: false,
    problematique: false,
    solution: false,
    objection: false,
    dispoRdv: false,
  };

  it('should accept a valid payload with temperature=3', () => {
    expect(() =>
      handoffSchema.parse({
        qualification: { ...validQualification, budget: true },
        temperature: 3,
        objections: '',
        nextStep: '',
      }),
    ).not.toThrow();
  });

  it('should reject temperature below 1 (min(1))', () => {
    expect(() =>
      handoffSchema.parse({
        qualification: validQualification,
        temperature: 0,
      }),
    ).toThrow(/1.*5|min|range/i);
  });

  it('should reject temperature above 5 (max(5))', () => {
    expect(() =>
      handoffSchema.parse({
        qualification: validQualification,
        temperature: 6,
      }),
    ).toThrow(/1.*5|max|range/i);
  });

  it('should reject non-integer temperature (2.5)', () => {
    expect(() =>
      handoffSchema.parse({
        qualification: validQualification,
        temperature: 2.5,
      }),
    ).toThrow(/int/i);
  });

  it('should reject missing temperature', () => {
    expect(() =>
      handoffSchema.parse({
        qualification: validQualification,
      }),
    ).toThrow();
  });

  it('should default qualification booleans to false when only temperature is provided', () => {
    // When the caller omits a qualification boolean, the schema's defaults
    // should fill it with false. This test will drive the Wave 3 schema to
    // use `.default(false)` on each boolean inside the qualification object.
    const parsed = handoffSchema.parse({
      qualification: {},
      temperature: 4,
    });
    expect(parsed.qualification.budget).toBe(false);
    expect(parsed.qualification.autorite).toBe(false);
    expect(parsed.qualification.besoin).toBe(false);
    expect(parsed.qualification.timing).toBe(false);
    expect(parsed.qualification.problematique).toBe(false);
    expect(parsed.qualification.solution).toBe(false);
    expect(parsed.qualification.objection).toBe(false);
    expect(parsed.qualification.dispoRdv).toBe(false);
  });
});
