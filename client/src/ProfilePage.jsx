import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import {
  GET_USER_LISTS,
  REMOVE_BOOK_FROM_LIST,
  GET_USER_REVIEWS,
  DELETE_REVIEW_MUTATION,
  GET_BOOK_DETAILS,
} from "./mutations.js";
import { useNavigate } from "react-router-dom";
import BookDetailsModal from "./BookDetailsModal";

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);

  const {
    loading: loadingLists,
    data: listData,
    refetch: refetchLists,
  } = useQuery(GET_USER_LISTS, {
    variables: { id_reader: user.id_reader },
  });

  const { data: reviewData, refetch: refetchReviews } = useQuery(
    GET_USER_REVIEWS,
    {
      variables: { id_reader: user.id_reader },
    }
  );

  const [removeBook] = useMutation(REMOVE_BOOK_FROM_LIST);
  const [deleteReview] = useMutation(DELETE_REVIEW_MUTATION);

  const handleDeleteReview = async (bookId, e) => {
    e.stopPropagation();
    await deleteReview({
      variables: { id_reader: user.id_reader, id_book: bookId },
    });
    refetchReviews();
  };

  const handleRemoveFromList = async (listId, bookId, e) => {
    e.stopPropagation();
    await removeBook({ variables: { id_list: listId, id_book: bookId } });
    refetchLists();
  };

  const [fetchBookDetails, { data: detailedData }] = useLazyQuery(GET_BOOK_DETAILS);

  useEffect(() => {
    if (detailedData?.book) {
      setSelectedBook(detailedData.book);
    }
  }, [detailedData]);

  const handleOpenBook = (id_book) => {
    fetchBookDetails({ variables: { id_book } });
  };

  if (loadingLists) return <div style={centerStyle}>Loading Profile...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1800px", margin: "0 auto", fontSize: "1.1rem" }}>
      

      <header style={headerStyle}>
        <div>👤 {user.username}</div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div onClick={() => navigate("/")} style={{ cursor: "pointer", fontSize: "1.2rem" }}>
          <b> Home</b>
        </div>
        <div onClick={() => navigate("/profile")} style={{ cursor: "pointer", fontSize: "1.2rem" }}>
          <b> My Books</b>
        </div>

                  {user.id_reader === "8888" && (
        <div onClick={() => navigate("/admin")} style={{ cursor: "pointer", fontSize: "1.2rem" }}>
          <b> Admin</b>
        </div>
          )}

        </div>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
            navigate("/");
          }}
          style={logoutButtonStyle}
        >
          Logout
        </button>
      </header>


      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "40px" }}>
        

        <section>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "30px" }}>My Collections</h1>
          {listData?.me?.lists.map((list) => (
            <div
              key={list.id_list}
              style={{
                marginBottom: "40px",
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "15px",
                border: "1px solid #dee2e6"
              }}
            >
              <h2 style={{ 
                borderBottom: "3px solid #007bff", 
                paddingBottom: "10px", 
                marginBottom: "25px",
                textTransform: "uppercase"
              }}>
                {list.name}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {list.books.map((book) => (
                  <div key={book.id_book} style={rowStyle} onClick={() => handleOpenBook(book.id_book)}>
                    <img src={book.cover_art} alt="" style={thumbnailStyle} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{book.title}</h3>
                      <p style={{ margin: "0", color: "#555" }}>{book.author.name}</p>
                    </div>
                    <button
                      onClick={(e) => handleRemoveFromList(list.id_list, book.id_book, e)}
                      style={removeButtonStyle}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {list.books.length === 0 && <p style={{color: "#888"}}>No books in this collection.</p>}
              </div>
            </div>
          ))}
        </section>


        <section>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "30px" }}>My Reviews</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {reviewData?.user_reviews.map((rev) => (
              <div
                key={rev.book.id_book}
                style={{...rowStyle, flexDirection: "column", alignItems: "flex-start", gap: "15px"}}
                onClick={() => handleOpenBook(rev.book.id_book)}
              >
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "1.4rem", margin: 0 }}>
                    {rev.book.title}
                  </h4>
                  <span style={{color: "#f39c12", fontWeight: "bold", fontSize: "1.3rem"}}>⭐ {rev.score}</span>
                </div>
                
                <p style={{ 
                  fontStyle: "italic", 
                  fontSize: "1.1rem", 
                  color: "#444",
                  background: "#f1f1f1",
                  padding: "12px",
                  borderRadius: "8px",
                  width: "100%",
                  margin: 0,
                  boxSizing: "border-box",
                  borderLeft: "4px solid #28a745"
                }}>
                  "{rev.description || "No comment."}"
                </p>
                
                <button
                  onClick={(e) => handleDeleteReview(rev.book.id_book, e)}
                  style={{...removeButtonStyle, alignSelf: "flex-end", padding: "8px 15px"}}
                >
                  Delete Review
                </button>
              </div>
            ))}
            {reviewData?.user_reviews.length === 0 && <p>No reviews yet.</p>}
          </div>
        </section>
      </div>

      <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
}


const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 30px",
  marginBottom: "40px",
  background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
  borderRadius: "12px",
  border: "1px solid #dee2e6",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const homeButtonStyle = {
  padding: "10px 20px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold"
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  padding: "15px",
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "box-shadow 0.2s",
};

const thumbnailStyle = {
  width: "80px",
  height: "120px",
  objectFit: "cover",
  borderRadius: "6px",
};

const removeButtonStyle = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "bold"
};

const logoutButtonStyle = {
  padding: "10px 20px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "100px",
  fontSize: "1.5rem"
};

export default ProfilePage;