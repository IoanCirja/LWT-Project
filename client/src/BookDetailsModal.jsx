import React from "react";

const BookDetailsModal = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div
        style={{ ...modalContentStyle, maxWidth: "1000px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={closeXButtonStyle}>
          ✕
        </button>

        <div style={containerStyle}>
          <div style={sidebarStyle}>
            <img
              src={book.cover_art}
              alt={book.title}
              style={largeCoverStyle}
            />

            <div style={metaCardStyle}>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "1.8rem" }}>
                {book.title}
              </h2>
              <p
                style={{
                  color: "#007bff",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: "0 0 10px 0",
                }}
              >
                {book.author.name}
              </p>

              <div style={ratingBadgeStyle}>
                ⭐ {book.avg_score ? book.avg_score.toFixed(1) : "N/A"}
              </div>

              <div style={detailsGridStyle}>
                <div style={detailItemStyle}>
                  <small>Pagini</small>
                  <span>{book.no_pages || "—"}</span>
                </div>
                <div style={detailItemStyle}>
                  <small>Publicată</small>
                  <span>{book.publishing_date || "—"}</span>
                </div>
              </div>

              {book.genres && book.genres.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <small style={labelStyle}>Genuri</small>
                  <div style={genreContainerStyle}>
                    {book.genres.map((g) => (
                      <span key={g.id_genre} style={genreTagStyle}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={mainContentStyle}>
            <section>
              <h3 style={sectionHeaderStyle}>Descriere</h3>
              <p style={descriptionTextStyle}>
                {book.description || "No description available for this book."}
              </p>
            </section>

            <section
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <h3 style={sectionHeaderStyle}>
                Recenzii Utilizatori ({book.reviews?.length || 0})
              </h3>
              <div style={reviewsListContainerStyle}>
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((rev, idx) => (
                    <div key={idx} style={reviewCardStyle}>
                      <div style={reviewHeaderStyle}>
                        <span style={reviewerNameStyle}>
                          @{rev.reader.username}
                        </span>
                        <div style={starsStyle}>
                          {"★".repeat(rev.score)}
                          {"☆".repeat(5 - rev.score)}
                        </div>
                      </div>
                      <p style={reviewTextStyle}>
                        {rev.description || (
                          <em style={{ color: "#aaa" }}>No comment.</em>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={emptyReviewsStyle}>
                    No reviews yet. Be the first to add one!
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  backdropFilter: "blur(4px)",
};

const modalContentStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "40px",
  position: "relative",
  maxHeight: "90vh",
  overflowY: "hidden",
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
};

const containerStyle = {
  display: "flex",
  gap: "40px",
  height: "100%",
  maxHeight: "calc(90vh - 80px)",
  flexDirection: window.innerWidth < 800 ? "column" : "row",
};

const sidebarStyle = {
  flex: "0 0 300px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const largeCoverStyle = {
  width: "100%",
  borderRadius: "12px",
  objectFit: "cover",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
};

const metaCardStyle = {
  textAlign: "left",
  background: "#f8f9fa",
  padding: "20px",
  borderRadius: "12px",
};

const mainContentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "30px",
  overflowY: "auto",
  paddingRight: "10px",
};

const sectionHeaderStyle = {
  fontSize: "1.4rem",
  color: "#222",
  borderBottom: "2px solid #007bff",
  paddingBottom: "8px",
  marginBottom: "15px",
  fontWeight: "600",
};

const descriptionTextStyle = {
  fontSize: "1.1rem",
  lineHeight: "1.6",
  color: "#444",
  margin: 0,
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginTop: "15px",
};

const detailItemStyle = {
  display: "flex",
  flexDirection: "column",
  borderLeft: "3px solid #dee2e6",
  paddingLeft: "10px",
};

const labelStyle = {
  textTransform: "uppercase",
  fontSize: "0.75rem",
  color: "#888",
  fontWeight: "bold",
};

const genreContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  marginTop: "8px",
};

const genreTagStyle = {
  background: "#e7f1ff",
  color: "#007bff",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: "500",
};

const ratingBadgeStyle = {
  display: "inline-block",
  padding: "5px 15px",
  background: "#fff3cd",
  color: "#856404",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "1.2rem",
};

const reviewsListContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const reviewCardStyle = {
  padding: "15px",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "10px",
};

const reviewHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const reviewerNameStyle = { fontWeight: "bold", color: "#333" };

const starsStyle = { color: "#f39c12", letterSpacing: "2px" };

const reviewTextStyle = { margin: 0, color: "#555", lineHeight: "1.4" };

const closeXButtonStyle = {
  position: "absolute",
  top: "15px",
  right: "20px",
  background: "none",
  border: "none",
  fontSize: "1.8rem",
  cursor: "pointer",
  color: "#aaa",
};

const emptyReviewsStyle = {
  textAlign: "center",
  padding: "40px",
  color: "#aaa",
  background: "#fdfdfd",
  border: "2px dashed #eee",
  borderRadius: "12px",
};

export default BookDetailsModal;
