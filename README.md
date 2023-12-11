# cypress-diff

![cypress-diff](assets/cypress-diff.png)

## Installation

```bash
npm i -D cypress-diff
```

## Usage

### JavaScript

```js
// cypress/support/e2e.js
require('cypress-diff');
```

or you can add it to your `Cypress.on('fail')` handler:

```js
// cypress/support/e2e.js
const { onFailHandler } = require('cypress-diff');

Cypress.on('fail', (error, runnable) => {
  // ...
  onFailHandler(error, runnable);
  // ...
});
```

### TypeScript

```ts
// cypress/support/e2e.ts
import 'cypress-diff';
```

```ts
// cypress/support/e2e.ts
import { onFailHandler } from 'cypress-diff';

Cypress.on('fail', (error: CypressError, runnable: Runner) => {
  // ...
  onFailHandler(error, runnable);
  // ...
});
```

## License

[MIT](LICENSE)

### Author

Yevhen Laichenkov <elaichenkov@gmail.com>
