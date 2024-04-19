import * as diff from 'diff'

type CypressError = Cypress.CypressError & { actual: string; expected: string }
type Runner = Mocha.Runnable & { commands: { message: string }[] }

const color = {
  actual: '#cc3333',
  expected: '#008000',
}

const formatValue = (value: unknown) =>
  typeof value === 'object' ? JSON.stringify(value, null, 2) : value

const insertCodeBlock = (value: string) =>
  `<pre style="max-height: 100px; overflow-y: auto; white-space: pre-wrap;">${value}</pre>`

const formatDiff = (part: Diff.Change) =>
  `<span ${
    part.added || part.removed ? 'class="haschanges"' : ''
  } style="background-color:${
    part.added
      ? `${color.expected}; font-weight: bold;`
      : part.removed
      ? `${color.actual}; font-weight: bold;`
      : 'none'
  };">${part.value}</span>`

export function onFailHandler(error: CypressError, runnable: Runner) {
  if (!error.actual) throw error
  if (!error.expected) throw error
  if (typeof error.actual === 'number') throw error
  // @ts-expect-error - TODO: improve types
  if (typeof error.actual === 'object' && error.actual.constructor.name === 'jQuery')
    throw error
  if (error.message.includes(' to contain text ')) throw error

  if (error.name === 'AssertionError') {
    window
      .top!.document.querySelectorAll('.command-info')
      .forEach((element) => {
        const methodSpan = element.querySelector('.command-method > span')
        const messageElement = element.querySelector('.command-message-text')
        if (messageElement) (messageElement as any).style.display = 'flex'
        if (messageElement) (messageElement as any).style.flexWrap = 'wrap'
        const errorMessage =
          runnable.commands[runnable.commands.length - 1]!.message
        const unboldedErrorMessage = errorMessage.replaceAll('**', '')
        const unboldedExpectedValueErrorMessage = errorMessage.replace(
          /\*\*([^*]+)\*\*/,
          '$1'
        )
        const includesErrorMessage = (message: string) =>
          messageElement?.textContent?.includes(message)

        if (methodSpan && methodSpan.textContent === 'assert') {
          if (
            includesErrorMessage(errorMessage) ||
            includesErrorMessage(unboldedErrorMessage) ||
            includesErrorMessage(unboldedExpectedValueErrorMessage)
          ) {
            if (messageElement) {
              methodSpan?.parentElement?.remove()

              const actual = formatValue(error.actual) as string
              const expected = formatValue(error.expected) as string

              const diffResult = diff.diffChars(actual, expected)

              let actualFormatted = ''
              let expectedFormatted = ''

              diffResult.forEach((part: Diff.Change) => {
                const span = formatDiff(part)
                actualFormatted += part.removed || !part.added ? span : ''
                expectedFormatted += part.added || !part.removed ? span : ''
              })

              messageElement.innerHTML = `
            <div id="controls" style="flex-basis: 100%; justify-content: flex-end; background: transparent;display:flex;">
              <svg id="toggleView" width="30px" height="30px" style="transform: rotate(90deg);" class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge  css-c1sh5i" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ViewStreamIcon" aria-label="fontSize large"><path fill="#9095ad" d="M3 17v-2c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2M3 7v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2"></path></svg>
            </div>
            <div id="expected" style="flex-basis: 50%;"><span style="color: ${
              color.expected
            };">Expected:</span>${insertCodeBlock(expectedFormatted)}</div>
            <div id="actual" style="flex-basis: 50%;"><span style="color: ${
              color.actual
            };">Actual:</span>${insertCodeBlock(actualFormatted)}</div>`
              const block1 = window.top!.document.querySelector('#expected pre')
              const block2 = window.top!.document.querySelector('#actual pre')
              const toggleView = window.top!.document.querySelector(
                '#controls #toggleView'
              )
              const hasChanges =
                window.top!.document.querySelectorAll('.haschanges')

              if (block1 && block2) {
                block1.addEventListener('scroll', function () {
                  block2.scrollTop = block1.scrollTop
                })
                block2.addEventListener('scroll', function () {
                  block1.scrollTop = block2.scrollTop
                })
              }
              toggleView?.addEventListener('click', function (e) {
                e.preventDefault()
                e.stopImmediatePropagation()
                if ((messageElement as any).style.flexDirection === 'column') {
                  ;(messageElement as any).style.flexDirection = 'row'
                  toggleView?.setAttribute('style', 'transform: rotate(90deg);')
                } else {
                  ;(messageElement as any).style.flexDirection = 'column'
                  toggleView?.setAttribute('style', 'transform: rotate(0deg);')
                }
              })
              if (hasChanges && hasChanges.length > 0) {
                hasChanges?.[0]?.scrollIntoView({ block: 'center' })
              }
            }
          }
        }
      })
  }

  throw error
}
