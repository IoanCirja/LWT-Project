import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'; // Add createHttpLink
import { ApolloProvider } from '@apollo/client/react';
import App from './App';

// 1. Explicitly create the HTTP link to your backend
const link = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// 2. Initialize the client with the link and cache
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);