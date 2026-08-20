# Environment Files

These files are read in the `local` and `test` environments only. Elsewhere the runtime platform injects configuration into the process; see the [runtime contract](../docs/operations/runtime-contract.md#설정).

Where they are read, `.env.<environment>` wins over `.env.default`, and a value already present in the process wins over both.

| File                 | Committed | Purpose                                |
| -------------------- | --------- | -------------------------------------- |
| `.env.default`       | yes       | Non-sensitive shared defaults.         |
| `.env.example`       | yes       | Template of required keys. Not loaded. |
| `.env.<environment>` | no        | Real values, including secrets.        |

Copy `.env.example` to `.env.<environment>` and fill it in before running the service for the first time.

Never put a secret in a committed file. When adding a key, list it in `.env.example` and set the real value in your own `.env.<environment>`.
