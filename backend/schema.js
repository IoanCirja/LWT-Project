export const typeDefs = `#graphql
    type Reader {
        id_reader: ID!
        username: String!
        pfp: String
        lists: [List!]!
    }

    type Author {
        id_author: ID!
        name: String!
        picture: String
        born: String
        died: String
        description: String
        books: [Book!]
    }

    type Book {
        id_book: ID!
        title: String!
        description: String
        cover_art: String
        no_pages: Int
        publishing_date: String
        author: Author!
        genres: [Genre!]
        reviews: [Review!]
        avg_score: Float
        no_reviews: Int!
    }

    type Genre {
        id_genre: ID!
        name: String!
    }

    type List {
        id_list: ID!
        name: String!
        books: [Book!]
        no_books: Int!
    }

    type Review {
        reader: Reader!
        book: Book!
        score: Int!
        description: String
    }

    type PaginatedBooks {
        total_pages: Int!
        books: [Book!]!
    }

    type Query {
        me(id_reader: ID!): Reader
        book(id_book: ID!): Book
        books(page: Int!, count: Int!, id_authors: [ID]): PaginatedBooks!
        author(id_author: ID!): Author
        list(id_list: ID!): List
        search_books(term: String!, page: Int!, count: Int!, id_authors: [ID]): PaginatedBooks!
        user_reviews(id_reader: ID!): [Review!]!
    }

    input BookInput {
        title: String!
        description: String
        cover_art: String
        no_pages: Int
        publishing_date: String
        id_author: ID!
    }

    input BookUpdateInput {
        title: String
        description: String
        cover_art: String
        no_pages: Int
        publishing_date: String
        id_author: ID
    }

    type Mutation {
        register(username: String!, password: String!, pfp: String): Reader!
        login(username: String!, password: String!): Reader!
        add_book_to_list(id_list: ID!, id_book: ID!): List!
        remove_book_from_list(id_list: ID!, id_book: ID!): List!
        review_book(id_reader: ID!, id_book: ID!, score: Int!, description: String): Review!
        add_book(input: BookInput!, id_reader: ID!): Book!
        update_book(id_book: ID!, input: BookUpdateInput!, id_reader: ID!): Book
        delete_book(id_book: ID!, id_reader: ID!): Boolean
        delete_review(id_reader: ID!, id_book: ID!): Boolean
    }
`