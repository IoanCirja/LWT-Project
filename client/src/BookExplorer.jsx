import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import {
  GET_BOOKS,
  GET_USER_LISTS,
  ADD_BOOK_TO_LIST,
  REVIEW_BOOK_MUTATION,
  SEARCH_BOOKS,
  GET_AUTHORS,
  GET_BOOK_DETAILS,
} from "./mutations.js";
import { useNavigate } from "react-router-dom";
import BookDetailsModal from "./BookDetailsModal.jsx";

function BookExplorer({ user, setUser }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const { data: userData } = useQuery(GET_USER_LISTS, {
    variables: { id_reader: user.id_reader },
  });

  const { data: authorsData } = useQuery(GET_AUTHORS);

  const isSearching = searchQuery.trim().length > 0;

  const { loading, error, data } = useQuery(
    isSearching ? SEARCH_BOOKS : GET_BOOKS,
    {
      variables: {
        page,
        count: 5,
        id_authors: selectedAuthors.length > 0 ? selectedAuthors : null,
        ...(isSearching && { term: searchQuery }),
      },
    }
  );

  const [addReview] = useMutation(REVIEW_BOOK_MUTATION, {
    refetchQueries: [
      {
        query: isSearching ? SEARCH_BOOKS : GET_BOOKS,
        variables: {
          page,
          count: 5,
          id_authors: selectedAuthors.length > 0 ? selectedAuthors : null,
          ...(isSearching && { term: searchQuery }),
        },
      },
    ],
  });

  const [addToList] = useMutation(ADD_BOOK_TO_LIST, {
    refetchQueries: [
      { query: GET_USER_LISTS, variables: { id_reader: user.id_reader } },
    ],
  });

  const [fetchBookDetails, { data: detailedData }] =
    useLazyQuery(GET_BOOK_DETAILS);

  useEffect(() => {
    if (detailedData?.book) {
      setSelectedBook(detailedData.book);
    }
  }, [detailedData]);

  const handleSearchClick = () => {
    setSearchQuery(inputText);
    setPage(1);
  };

  const handleClearSearch = () => {
    setInputText("");
    setSearchQuery("");
    setPage(1);
  };

  const handleAuthorChange = (id) => {
    handleClearSearch();
    const stringId = String(id);
    if (selectedAuthors.includes(stringId)) {
      setSelectedAuthors(selectedAuthors.filter((aId) => aId !== stringId));
    } else {
      setSelectedAuthors([...selectedAuthors, stringId]);
    }
  };

  const bookResults = isSearching ? data?.search_books : data?.books;

  const uniqueAuthors = Array.from(
    new Map(
      authorsData?.books?.books
        ?.filter((b) => b.author)
        .map((b) => [String(b.author.id_author), b.author])
    ).values()
  );

  const filteredBooks = bookResults?.books || [];

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ score: 5, text: "" });

  const handleReviewSubmit = async () => {
    try {
      await addReview({
        variables: {
          id_reader: user.id_reader,
          id_book: reviewModal.id_book,
          score: parseInt(reviewData.score),
          description: reviewData.text,
        },
      });
      setReviewModal(null);
      setReviewData({ score: 5, text: "" });
    } catch (err) {}
  };

  const handleAdd = async (listId, bookId, e) => {
    if (!listId) return;
    try {
      await addToList({ variables: { id_list: listId, id_book: bookId } });
    } catch (err) {}
  };

  const getBookListId = (bookId) => {
    const listWithBook = userData?.me?.lists.find((list) =>
      list.books.some((b) => String(b.id_book) === String(bookId))
    );
    return listWithBook ? listWithBook.id_list : "";
  };

  if (loading && !data) return <div style={centerStyle}>Loading...</div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "2000px",
        margin: "0 auto",
        fontSize: "1.1rem",
      }}
    >
      <header style={headerStyle}>
        <div>👤 {user.username}</div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", fontSize: "1.2rem" }}
          >
            <b>Home</b>
          </div>
          <div
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer", fontSize: "1.2rem" }}
          >
            <b>My Books</b>
          </div>
          {user.id_reader === "8888" && (
            <div
              onClick={() => navigate("/admin")}
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
            >
              <b>Admin</b>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isSearching && (
            <button onClick={handleClearSearch} style={clearButtonStyle}>
              ✕
            </button>
          )}
          <input
            type="text"
            placeholder="Search title, author..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={searchInputStyle}
          />
          <button onClick={handleSearchClick} style={searchButtonStyle}>
            🔍
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
          }}
          style={logoutButtonStyle}
        >
          Logout
        </button>
      </header>

      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "2.2rem",
        }}
      >
        {isSearching ? `Results for "${searchQuery}"` : ""}
      </h1>

      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <select
          style={{ ...selectStyle, fontSize: "1.1rem", padding: "10px 20px" }}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "all") setSelectedAuthors([]);
            else if (val !== "") handleAuthorChange(val);
          }}
          value=""
        >
          <option value="" disabled>
            Filter Authors ({selectedAuthors.length})
          </option>
          <option value="all">All Authors</option>
          {uniqueAuthors.map((auth) => (
            <option key={auth.id_author} value={auth.id_author}>
              {selectedAuthors.includes(auth.id_author)
                ? `✓ ${auth.name}`
                : auth.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAuthors.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {selectedAuthors.map((id) => {
            const authObj = uniqueAuthors.find((a) => a.id_author === id);
            return (
              <span
                key={id}
                style={{ ...tagStyle, fontSize: "1rem", padding: "6px 15px" }}
                onClick={() => handleAuthorChange(id)}
              >
                {authObj?.name} ✕
              </span>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div
              key={book.id_book}
              style={rowStyle}
              onClick={() =>
                fetchBookDetails({ variables: { id_book: book.id_book } })
              }
            >
              <img src={book.cover_art} alt="" style={thumbnailStyle} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <h2 style={{ margin: "0 0 10px 0", fontSize: "1.8rem" }}>
                  {book.title}
                </h2>
                <p style={{ margin: "0", color: "#555", fontSize: "1.3rem" }}>
                  {book.author.name}
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#f39c12",
                  }}
                >
                  ⭐ {book.avg_score ? book.avg_score.toFixed(1) : "N/A"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setReviewModal(book)}
                  style={{
                    ...reviewButtonStyle,
                    fontSize: "1.1rem",
                    padding: "10px 20px",
                  }}
                >
                  Review
                </button>
                <select
                  style={{
                    ...selectStyle,
                    fontSize: "1.1rem",
                    minWidth: "200px",
                  }}
                  onChange={(e) => handleAdd(e.target.value, book.id_book, e)}
                  value={getBookListId(book.id_book)}
                >
                  <option
                    value=""
                    disabled={getBookListId(book.id_book) !== ""}
                  >
                    {getBookListId(book.id_book) !== ""
                      ? "✔ Added"
                      : "Add to list..."}
                  </option>

                  {!userData ? (
                    <option disabled>Loading your lists...</option>
                  ) : userData?.me?.lists?.length > 0 ? (
                    userData.me.lists.map((list) => (
                      <option key={list.id_list} value={list.id_list}>
                        {list.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No lists found (check user ID)</option>
                  )}
                </select>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.5rem" }}>
            No books found.
          </p>
        )}
      </div>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      {reviewModal && (
        <div style={modalOverlayStyle} onClick={() => setReviewModal(null)}>
          <div
            style={{ ...modalContentStyle, maxWidth: "550px", padding: "40px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{ fontSize: "2rem", marginBottom: "10px", color: "#333" }}
            >
              Add a Review
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#666",
                marginBottom: "25px",
              }}
            >
              What do you think about <strong>{reviewModal.title}</strong>?
            </p>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Your Score:
              </label>
              <select
                value={reviewData.score}
                onChange={(e) =>
                  setReviewData({ ...reviewData, score: e.target.value })
                }
                style={{
                  ...selectStyle,
                  width: "100%",
                  fontSize: "1.2rem",
                  padding: "12px",
                  border: "2px solid #007bff",
                  background: "#f0f7ff",
                }}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n === 5
                      ? "⭐⭐⭐⭐⭐ Excellent"
                      : n === 4
                      ? "⭐⭐⭐⭐ Very Good"
                      : n === 3
                      ? "⭐⭐⭐ Good"
                      : n === 2
                      ? "⭐⭐ Satisfactory"
                      : "⭐ Poor"}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Your Comment (optional):
              </label>
              <textarea
                placeholder="Write a few words about this book..."
                value={reviewData.text}
                onChange={(e) =>
                  setReviewData({ ...reviewData, text: e.target.value })
                }
                style={{
                  width: "100%",
                  height: "150px",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "1.1rem",
                  fontFamily: "inherit",
                  resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
              <button
                onClick={handleReviewSubmit}
                style={{ ...navButtonStyle, flex: 2, fontSize: "1.2rem" }}
              >
                Submit Review
              </button>
              <button
                onClick={() => setReviewModal(null)}
                style={{
                  ...navButtonStyle,
                  flex: 1,
                  background: "#6c757d",
                  fontSize: "1.2rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {bookResults?.total_pages > 1 && (
        <div style={paginationStyle}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={navButtonStyle}
          >
            Prev
          </button>
          <span style={{ fontSize: "1.2rem" }}>
            Page {page} of {bookResults.total_pages}
          </span>
          <button
            disabled={page === bookResults.total_pages}
            onClick={() => setPage((p) => p + 1)}
            style={navButtonStyle}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 30px",
  marginBottom: "30px",
  background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
  borderRadius: "12px",
  border: "1px solid #dee2e6",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "40px",
  padding: "25px",
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const thumbnailStyle = {
  width: "140px",
  height: "210px",
  objectFit: "cover",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
};

const selectStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  cursor: "pointer",
  background: "#fff",
  fontSize: "1.1rem",
};

const logoutButtonStyle = {
  padding: "10px 20px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};

const navButtonStyle = {
  padding: "12px 25px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "500",
};

const paginationStyle = {
  textAlign: "center",
  marginTop: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
};

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "100px",
  fontSize: "1.5rem",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  maxWidth: "700px",
  width: "90%",
};

const searchInputStyle = {
  padding: "12px 20px",
  borderRadius: "25px 0 0 25px",
  border: "1px solid #ccc",
  width: "250px",
  fontSize: "1rem",
  outline: "none",
};

const reviewButtonStyle = {
  padding: "10px 20px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const searchButtonStyle = {
  padding: "12px 20px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "0 25px 25px 0",
  cursor: "pointer",
};

const clearButtonStyle = {
  padding: "12px",
  background: "#f8f9fa",
  color: "#333",
  border: "1px solid #ccc",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  marginRight: "5px",
};

const tagStyle = {
  background: "#e9ecef",
  padding: "8px 16px",
  borderRadius: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #dee2e6",
};

export default BookExplorer;
