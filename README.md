# cypress-diff

![cypress-diff](assets/cypress-diff.png)

## Installation

```bash
npm i -D cypress-diff
```

## Usage

Add the following line to your `cypress/support/index.js` file:

### JavaScript

```js
// cypress/support/e2e.js
require('cypress-diff');
```

### TypeScript

```ts
// cypress/support/e2e.ts
import 'cypress-diff';
```

## Configuration (optional)

In case you are using a `Cypress.on('fail')` handler in your tests already then you can configure the plugin like this:

```js
// cypress/support/e2e.js
const { onFailHandler } = require('cypress-diff');

Cypress.on('fail', (error, runnable) => {
  // ...
  onFailHandler(error, runnable);
  // ...
});
```

## License

[MIT](LICENSE)

### Author

Yevhen Laichenkov <elaichenkov@gmail.com>
