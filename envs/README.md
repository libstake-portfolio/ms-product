# Environment Files

`.env.default` is loaded first, then `.env.<environment>` — one of `local`, `dev`, `prod` — overrides it.

| File                 | Committed | Purpose                                |
| -------------------- | --------- | -------------------------------------- |
| `.env.default`       | yes       | Non-sensitive shared defaults.         |
| `.env.example`       | yes       | Template of required keys. Not loaded. |
| `.env.<environment>` | no        | Real values, including secrets.        |

Never put a secret in a committed file. When adding a key, list it in `.env.example` and set the real value in your own `.env.<environment>`.
