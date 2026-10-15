import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field, Input, Select } from '../src/components/ui.tsx';

function errorId(markup: string) {
  const match = markup.match(/aria-describedby="([^"]+)"/);
  assert.ok(match);
  return match[1];
}

test('Field associates an input validation error with a stable error message id', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Field,
      { label: 'Email', error: 'Enter a valid email address.' },
      createElement(Input),
    ),
  );
  const id = errorId(markup);
  assert.match(markup, /aria-invalid="true"/);
  assert.match(markup, new RegExp(`id="${id}"`));
  assert.match(markup, /role="alert"/);
});

test('Field passes validation accessibility attributes to the custom Select', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Field,
      { label: 'Category', error: 'Choose a valid option.' },
      createElement(Select, {
        value: '',
        options: [{ value: 'venue', label: 'Venue' }],
        onChange: () => undefined,
        'aria-label': 'Category',
      }),
    ),
  );
  const id = errorId(markup);
  assert.match(markup, /role="combobox"/);
  assert.match(markup, /aria-invalid="true"/);
  assert.match(markup, new RegExp(`id="${id}"`));
});
