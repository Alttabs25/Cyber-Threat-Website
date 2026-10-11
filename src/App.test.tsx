import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

test('shows login as the landing page when there is no authenticated user', async () => {
  localStorage.clear();
  render(<App />);

  expect(await screen.findByText('Welcome Back!')).toBeInTheDocument();
});

test('redirects a signed-out user away from the cart', async () => {
  window.history.replaceState({}, '', '/cart');
  render(<App />);

  expect(await screen.findByText('Welcome Back!')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
});

test('does not let a signed-out user add an item to the cart', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/products');
  render(<App />);

  await user.click((await screen.findAllByRole('button', { name: /add to cart/i }))[0]);

  expect(await screen.findByText('Welcome Back!')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
});

test('allows spaces in the signup full-name field', async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, '', '/signup');
  render(<App />);

  const nameInput = await screen.findByPlaceholderText('John Doe');
  await user.type(nameInput, 'John Doe');

  expect(nameInput).toHaveValue('John Doe');
});
