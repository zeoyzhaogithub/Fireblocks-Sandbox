// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  { type: 'lib', ignores: ['skills/**'] },
  {
    rules: {
      'import/no-mutable-exports': 'off',
      'ts/explicit-function-return-type': 'off',
      'ts/consistent-type-imports': 'off',
      'ts/no-require-imports': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/yaml-enforce-settings': 'off',
    },
    ignores: [
      'reusables/**',
    ],
  },
)
