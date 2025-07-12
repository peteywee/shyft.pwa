# TODO

- **Clipboard API Error:** The `NotAllowedError` is a known issue with the Next.js development overlay in some environments. It is safe to ignore for now, as it will not affect the production application.
- **CodeQL Scan:**
  - Install the CodeQL CLI: [https://docs.github.com/en/code-security/code-scanning/get-started-with-code-scanning/setting-up-code-scanning-for-a-compiled-language#installing-the-codeql-cli](https://docs.github.com/en/code-security/code-scanning/get-started-with-code-scanning/setting-up-code-scanning-for-a-compiled-language#installing-the-codeql-cli)
  - Create a CodeQL database: `codeql database create <database-name> --language=typescript`
  - Run a CodeQL analysis: `codeql database analyze <database-name> --format=sarif-latest --output=scan-results.sarif`
  - Review the `scan-results.sarif` file for any security vulnerabilities.
