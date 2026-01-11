import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id_reader
      username
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $pfp: String) {
    register(username: $username, password: $password, pfp: $pfp) {
      id_reader
      username
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks($page: Int!, $count: Int!, $id_authors: [ID]) {
    books(page: $page, count: $count, id_authors: $id_authors) {
      total_pages
      books {
        id_book
        title
        description        # Added
        cover_art
        avg_score
        no_pages           # Added
        publishing_date    # Added
        genres {           # Added
          id_genre
          name
        }
        reviews {
          score
          description
          reader {
            username
          }
        }
        author { 
          name 
          id_author
        }
      }
    }
  }
`;

// Do the same for SEARCH_BOOKS
export const SEARCH_BOOKS = gql`
  query SearchBooks($term: String!, $page: Int!, $count: Int!, $id_authors: [ID]) {
    search_books(term: $term, page: $page, count: $count, id_authors: $id_authors) {
      total_pages
      books {
        id_book
        title
        description        
        cover_art
        avg_score
        no_pages           
        publishing_date    
        genres {           
          id_genre
          name
        }
        reviews {
          score
          description
          reader { username }
        }
        author { 
          name
          id_author
        }
      }
    }
  }
`;

export const GET_BOOK_DETAILS = gql`
  query GetBookDetails($id_book: ID!) {
    book(id_book: $id_book) {
      id_book
      title
      description
      cover_art
      avg_score
      no_pages
      publishing_date
      genres {
        id_genre
        name
      }
      author {
        name
        id_author
      }
      reviews {
        score
        description
        reader {
          username
        }
      }
    }
  }
`;

export const GET_USER_LISTS = gql`
  query GetUserLists($id_reader: ID!) {
    me(id_reader: $id_reader) {
      lists {
        id_list
        name
        books {
          id_book
          title
          cover_art
          author { name }
        }
      }
    }
  }
`;

export const ADD_BOOK_TO_LIST = gql`
  mutation AddBookToList($id_list: ID!, $id_book: ID!) {
    add_book_to_list(id_list: $id_list, id_book: $id_book) {
      id_list
      name
    }
  }
`;

export const REMOVE_BOOK_FROM_LIST = gql`
  mutation RemoveBookFromList($id_list: ID!, $id_book: ID!) {
    remove_book_from_list(id_list: $id_list, id_book: $id_book) {
      id_list
    }
  }
`;

export const REVIEW_BOOK_MUTATION = gql`
  mutation ReviewBook($id_reader: ID!, $id_book: ID!, $score: Int!, $description: String) {
    review_book(id_reader: $id_reader, id_book: $id_book, score: $score, description: $description) {
      score
    }
  }
`;

export const GET_USER_REVIEWS = gql`
  query GetUserReviews($id_reader: ID!) {
    user_reviews(id_reader: $id_reader) {
      score
      description
      book {
        id_book
        title
      }
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id_reader: ID!, $id_book: ID!) {
    delete_review(id_reader: $id_reader, id_book: $id_book)
  }
`;


export const ADD_BOOK_MUTATION = gql`
  mutation AddBook($input: BookInput!, $id_reader: ID!) {
    add_book(input: $input, id_reader: $id_reader) {
      id_book
      title
    }
  }
`;

export const UPDATE_BOOK_MUTATION = gql`
  mutation UpdateBook($id_book: ID!, $input: BookUpdateInput!, $id_reader: ID!) {
    update_book(id_book: $id_book, input: $input, id_reader: $id_reader) {
      id_book
      title
    }
  }
`;

export const DELETE_BOOK_MUTATION = gql`
  mutation DeleteBook($id_book: ID!, $id_reader: ID!) {
    delete_book(id_book: $id_book, id_reader: $id_reader)
  }
`;

export const GET_BOOKS_ADMIN = gql`
  query GetBooksAdmin($page: Int!, $count: Int!) {
    books(page: $page, count: $count) {
      total_pages
      books {
        id_book
        title
        description
        cover_art
        no_pages
        publishing_date
        author {
          id_author
          name
        }
      }
    }
  }
`;

export const GET_AUTHORS = gql`
  query GetAuthors {
    books(page: 1, count: 100) {
      books {
        author {
          id_author
          name
        }
      }
    }
  }
`;