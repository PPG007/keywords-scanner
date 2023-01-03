# keywords-scanner

This action will check if there are any keyword matched in files.

## Inputs

- keywords: the keywords to check, json array.
- ignoreCase: should ignore keyword character case, boolean.
- ignoredDirs: which dir won't be checked, json array.

## Example usage

```yaml
on: [push]

jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: Scan Keywords
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Scan Keywords
        uses: PPG007/keywords-scanner@v1.0
        with:
          keywords: '["qq", "File"]'
          ignoreCase: true
          ignoredDirs: '[".git", "node_modules", "package.json"]'
```
