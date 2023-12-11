import * as diff from 'diff';

type CypressError = Cypress.CypressError & { actual: string; expected: string };
type Runner = Mocha.Runnable & { commands: { message: string }[] };

const color = {
  actual: '#cc3333',
  expected: '#008000',
};

const formatValue = (value: unknown) => (typeof value === 'object' ? JSON.stringify(value, null, 2) : value);

const insertCodeBlock = (value: string) =>
  `<pre style="max-height: 500px; overflow-y: auto; white-space: pre-wrap;">${value}</pre>`;

const formatDiff = (part: Diff.Change) =>
  `<span style="background-color:${
    part.added ? `${color.expected}; font-weight: bold;` : part.removed ? `${color.actual}; font-weight: bold;` : 'none'
  };">${part.value}</span>`;

export function onFailHandler(error: CypressError, runnable: Runner) {
  if (!error.actual) throw error;
  if (!error.expected) throw error;
  if (typeof error.actual === 'number') throw error;
  // @ts-expect-error - TODO: improve types
  if (typeof error.actual === 'object' && error.actual.constructor.name === 'jQuery') throw error;
  if (error.message.includes(' to contain text ')) throw error;

  if (error.name === 'AssertionError') {
    window.top!.document.querySelectorAll('.command-info').forEach((element) => {
      const methodSpan = element.querySelector('.command-method > span');
      const messageElement = element.querySelector('.command-message-text');
      const errorMessage = runnable.commands[runnable.commands.length - 1]!.message;
      const unboldedErrorMessage = errorMessage.replaceAll('**', '');
      const unboldedExpectedValueErrorMessage = errorMessage.replace(/\*\*([^*]+)\*\*/, '$1');
      const includesErrorMessage = (message: string) => messageElement?.textContent?.includes(message);

      if (methodSpan && methodSpan.textContent === 'assert') {
        if (
          includesErrorMessage(errorMessage) ||
          includesErrorMessage(unboldedErrorMessage) ||
          includesErrorMessage(unboldedExpectedValueErrorMessage)
        ) {
          if (messageElement) {
            methodSpan?.parentElement?.remove();

            const actual = formatValue(error.actual) as string;
            const expected = formatValue(error.expected) as string;

            const diffResult = diff.diffChars(actual, expected);

            let actualFormatted = '';
            let expectedFormatted = '';

            diffResult.forEach((part: Diff.Change) => {
              const span = formatDiff(part);
              actualFormatted += part.removed || !part.added ? span : '';
              expectedFormatted += part.added || !part.removed ? span : '';
            });

            messageElement.innerHTML = `
            <div><span style="color: ${color.expected};">Expected:</span>${insertCodeBlock(expectedFormatted)}</div>
            <div><span style="color: ${color.actual};">Actual:</span>${insertCodeBlock(actualFormatted)}</div>`;
          }
        }
      }
    });
  }

  throw error;
}
