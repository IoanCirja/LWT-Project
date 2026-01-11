import { query } from "./db.js"

const getAvgScore = async (id_book) => {
    const res = await query(
        "SELECT AVG(score) AS avg_score FROM REVIEW WHERE id_book = $1",
        [id_book]
    );

    return res.rows[0].avg_score ? parseFloat(res.rows[0].avg_score) : null;
};

function requireAdmin(id) {
    if (!id || id !== "8888") {
        throw new Error("Unauthorized: admin access required");
    }
}

export const resolvers = {
    Query: {
        me: async (_, { id_reader }) => {
            const res = await query("SELECT * FROM READER WHERE id_reader = $1", [id_reader]);
            return res.rows[0];
        },

        book: async (_, { id_book }) => {
            const res = await query("SELECT * FROM BOOK WHERE id_book = $1", [id_book]);
            return res.rows[0];
        },

        books: async (_, { page, count, id_authors }) => {
            let whereClause = "";
            let params = [];

            if (id_authors && id_authors.length > 0) {

                whereClause = "WHERE id_author = ANY($1::int[])";
                params.push(id_authors);
            }

            const totalRes = await query(
                `SELECT COUNT(*) AS total FROM BOOK ${whereClause}`,
                params
            );
            const total = parseInt(totalRes.rows[0].total, 10);
            const total_pages = Math.ceil(total / count);

            const offset = (page - 1) * count;
            

            const countIdx = params.length + 1;
            const offsetIdx = params.length + 2;
            
            const finalParams = [...params, count, offset];

            const res = await query(
                `SELECT * FROM BOOK ${whereClause} ORDER BY id_book LIMIT $${countIdx} OFFSET $${offsetIdx}`,
                finalParams
            );

            return { total_pages, books: res.rows };
        },

        author: async (_, { id_author }) => {
            const res = await query("SELECT * FROM AUTHOR WHERE id_author = $1", [id_author]);
            return res.rows[0];
        },

        list: async (_, { id_list }) => {
            const res = await query("SELECT * FROM LIST WHERE id_list = $1", [id_list]);
            return res.rows[0];
        },

        search_books: async (_, { term, page, count }) => {
            const search = `%${term}%`;
            const offset = (page - 1) * count;

            const totalRes = await query(
                `   SELECT COUNT(*) AS total
                    FROM (
                        SELECT B.id_book FROM BOOK B WHERE B.title ILIKE $1
                        UNION
                        SELECT B.id_book FROM BOOK B
                        JOIN AUTHOR A ON B.id_author = A.id_author
                        WHERE A.name ILIKE $1
                        UNION
                        SELECT B.id_book FROM BOOK B
                        JOIN BOOK_GENRES BG ON B.id_book = BG.id_book
                        JOIN GENRE G ON BG.id_genre = G.id_genre
                        WHERE G.name ILIKE $1
                    )`,
                [search]
            );

            const total = parseInt(totalRes.rows[0].total, 10);
            const total_pages = Math.ceil(total / count);

            const booksRes = await query(
                `   SELECT B.*
                    FROM (
                        SELECT DISTINCT B.id_book
                        FROM BOOK B
                        LEFT JOIN AUTHOR A ON B.id_author = A.id_author
                        LEFT JOIN BOOK_GENRES BG ON B.id_book = BG.id_book
                        LEFT JOIN GENRE G ON BG.id_genre = G.id_genre
                        WHERE B.title ILIKE $1 OR A.name ILIKE $1 OR G.name ILIKE $1
                    ) ids
                    JOIN BOOK B ON B.id_book = ids.id_book
                    ORDER BY B.id_book
                    LIMIT $2 OFFSET $3`,
                [search, count, offset]
            );

            return { total_pages, books: booksRes.rows };
        },

        user_reviews: async (_, { id_reader }) => {
        const res = await query("SELECT * FROM REVIEW WHERE id_reader = $1", [id_reader]);
        return res.rows;
        },
        
    },

    Mutation: {
        register: async (_, { username, password, pfp }) => {
            const existReader = await query(
                "SELECT id_reader FROM READER WHERE username = $1",
                [username]
            );

            if (existReader.rows.length > 0) throw new Error("Username already taken");

            const res = await query(
                "INSERT INTO READER (username, password, pfp) VALUES ($1, $2, $3) RETURNING *",
                [username, password, pfp || null]
            );

            const newReader = res.rows[0];

            const defaultLists = ["want to read", "reading", "read"];
            for (const listName of defaultLists) {
                await query(
                    "INSERT INTO LIST (id_reader, name) VALUES ($1, $2)",
                    [newReader.id_reader, listName]
                );
            }

            return newReader;
        },

        login: async (_, { username, password }) => {
            const res = await query("SELECT * FROM READER WHERE username = $1", [username]);
            const user = res.rows[0];

            if (!user) throw new Error("User not found");

            if (user.password !== password) throw new Error("Invalid password");

            return user;
        },

        add_book_to_list: async (_, { id_list, id_book }) => {
            await query(
                "INSERT INTO LIST_BOOKS (id_list, id_book) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [id_list, id_book]
            );

            const res = await query("SELECT * FROM LIST WHERE id_list = $1", [id_list]);
            return res.rows[0];
        },

        remove_book_from_list: async (_, { id_list, id_book }) => {
            await query("DELETE FROM LIST_BOOKS WHERE id_list = $1 AND id_book = $2", [id_list, id_book]);
            const res = await query("SELECT * FROM LIST WHERE id_list = $1", [id_list]);
            return res.rows[0];
        },

        review_book: async (_, { id_reader, id_book, score, description }) => {
            const res = await query (
                "INSERT INTO REVIEW (id_reader, id_book, score, description) VALUES ($1, $2, $3, $4) RETURNING *",
                [id_reader, id_book, score, description]
            );
            return res.rows[0];
        },

        add_book: async (_, { input, id_reader }) => {
            requireAdmin(id_reader);

            const { title, description, cover_art, no_pages, publishing_date, id_author } = input;

            const res = await query(
                `   INSERT INTO BOOK (title, description, cover_art, no_pages, publishing_date, id_author)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *`,
                [title, description, cover_art, no_pages, publishing_date, id_author]
            );

            return res.rows[0];
        },

        update_book: async (_, { id_book, input, id_reader }) => {
            requireAdmin(id_reader);

            const fields = Object.keys(input);

            if (fields.length === 0) throw new Error("Nothing to update");

            const setClauses = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
            const values = fields.map(field => input[field]);

            const res = await query(
                `UPDATE BOOK SET ${setClauses} WHERE id_book = $${fields.length + 1} RETURNING *`,
                [...values, id_book]
            );

            if (res.rowCount === 0) throw new Error("Book not found");

            return res.rows[0];
        },

        delete_book: async (_, { id_book, id_reader }) => {
            requireAdmin(id_reader);

            const res = await query(
                "DELETE FROM BOOK WHERE id_book = $1",
                [id_book]
            );

            return res.rowCount > 0;
        },

        delete_review: async (_, { id_reader, id_book }) => {
        const res = await query(
            "DELETE FROM REVIEW WHERE id_reader = $1 AND id_book = $2",
            [id_reader, id_book]
        );
        return res.rowCount > 0;
    }
    },

    Reader: {
        lists: async (parent) => {
            const res = await query("SELECT * FROM LIST WHERE id_reader = $1", [parent.id_reader]);
            return res.rows;
        }
    },

    Author: {
        books: async (parent) => {
            const res = await query("SELECT * FROM BOOK WHERE id_author = $1", [parent.id_author]);
            return res.rows;
        }
    },

    Book: {
        author: async (parent) => {
            const res = await query("SELECT * FROM AUTHOR WHERE id_author = $1", [parent.id_author]);
            return res.rows[0];
        },

        genres: async (parent) => {
            const res = await query(
                `   Select G.* FROM GENRE G
                    JOIN BOOK_GENRES BG ON G.id_genre = BG.id_genre
                    WHERE BG.id_book = $1`,
                [parent.id_book]
            );
            return res.rows;
        },

        reviews: async (parent) => {
            const res = await query(
                `   SELECT R.* FROM REVIEW R
                    JOIN READER RE ON R.id_reader = RE.id_reader
                    WHERE R.id_book = $1`,
                [parent.id_book]
            );

            return res.rows;
        },

        avg_score: async (parent) => getAvgScore(parent.id_book),

        no_reviews: async (parent) => {
            const res = await query(
                "SELECT COUNT(*) AS count FROM REVIEW WHERE id_book = $1",
                [parent.id_book]
            );
            return parseInt(res.rows[0].count, 10);
        }
    },

    List: {
        books: async (parent) => {
            const res = await query(
                `   SELECT B.* FROM BOOK B
                    JOIN LIST_BOOKS LB ON B.id_book = LB.id_book
                    WHERE LB.id_list = $1`,
                [parent.id_list]
            );
            return res.rows;
        },

        no_books: async (parent) => {
            const res = await query(
                "SELECT COUNT(*) AS count FROM LIST_BOOKS WHERE id_list = $1",
                [parent.id_list]
            );
            return parseInt(res.rows[0].count, 10);
        }
    },

    Review: {
        reader: async (parent) => {
            const res = await query("SELECT * FROM READER WHERE id_reader = $1", [parent.id_reader]);
            return res.rows[0];
        },

        book: async (parent) => {
            const res = await query("SELECT * FROM BOOK WHERE id_book = $1", [parent.id_book]);
            return res.rows[0];
        }
    }
};