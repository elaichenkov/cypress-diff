import { onFailHandler } from './on-fail-handler';

Cypress.on('fail', onFailHandler);
