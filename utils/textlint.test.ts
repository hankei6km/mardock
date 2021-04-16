import { mergeRules } from './textlint';

describe('mergeRules()', () => {
  it('should merge rules by each items', () => {
    expect(
      mergeRules(
        [
          { ruleId: '1', field: '1-1' },
          { ruleId: '2', field: '1-2' }
        ],
        [{ ruleId: '1', field: 'm1' }]
      )
    ).toStrictEqual([
      { ruleId: '1', field: 'm1' },
      { ruleId: '2', field: '1-2' }
    ]);
    expect(
      mergeRules(
        [
          { ruleId: '1', field: '1-1' },
          { ruleId: '2', field: '1-2' }
        ],
        [{ ruleId: '3', field: 'm' }]
      )
    ).toStrictEqual([
      { ruleId: '1', field: '1-1' },
      { ruleId: '2', field: '1-2' }
    ]);
    expect(
      mergeRules(
        [
          { ruleId: '1', field: '1-1' },
          { ruleId: '2', field: '1-2' }
        ],
        (undefined as unknown) as any[]
      )
    ).toStrictEqual([
      { ruleId: '1', field: '1-1' },
      { ruleId: '2', field: '1-2' }
    ]);
  });
});
