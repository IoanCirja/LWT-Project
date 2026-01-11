import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_BOOKS_ADMIN, 
  ADD_BOOK_MUTATION, 
  UPDATE_BOOK_MUTATION, 
  DELETE_BOOK_MUTATION 
} from './mutations';
import { useNavigate } from 'react-router-dom';

function AdminPage({ user }) {
  const navigate = useNavigate();
  const [editingBookId, setEditingBookId] = useState(null);
  
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    cover_art: '', 
    no_pages: '', 
    publishing_date: '', 
    id_author: ''
  });

  const { data, loading, refetch } = useQuery(GET_BOOKS_ADMIN, { 
    variables: { page: 1, count: 20 } 
  });
  
  const [addBook] = useMutation(ADD_BOOK_MUTATION);
  const [updateBook] = useMutation(UPDATE_BOOK_MUTATION);
  const [deleteBook] = useMutation(DELETE_BOOK_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const input = {
      title: form.title,
      description: form.description,
      cover_art: form.cover_art,
      no_pages: parseInt(form.no_pages) || 0,
      publishing_date: form.publishing_date,
      id_author: form.id_author 
    };

    try {
      if (editingBookId) {
        await updateBook({ 
          variables: { 
            id_book: editingBookId, 
            input, 
            id_reader: user.id_reader 
          } 
        });
      } else {
        await addBook({ 
          variables: { 
            input, 
            id_reader: user.id_reader 
          } 
        });
      }
      
      setForm({ title: '', description: '', cover_art: '', no_pages: '', publishing_date: '', id_author: '' });
      setEditingBookId(null);
      refetch();
    } catch (err) { 
        console.error(err);
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book.id_book);
    setForm({
      title: book.title,
      description: book.description || '',
      cover_art: book.cover_art || '',
      no_pages: book.no_pages || '',
      publishing_date: book.publishing_date || '',
      id_author: book.author.id_author 
    });
    window.scrollTo(0, 0); 
  };

  const handleDelete = async (id_book) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook({ variables: { id_book, id_reader: user.id_reader } });
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div style={centerStyle}>Loading administration data...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={backButtonStyle}>← Back to Explorer</button>
      <h1>Book Administration Panel</h1>

      <div style={adminLayout}>
        <div style={formContainer}>
          <h3>{editingBookId ? `Edit Book ID: ${editingBookId}` : 'Add New Book'}</h3>
          <p style={{ fontSize: '0.8rem', color: '#dc3545' }}>
            {editingBookId ? "* Title and Author cannot be modified after the book is created." : ""}
          </p>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
              style={editingBookId ? {...inputStyle, backgroundColor: '#e9ecef'} : inputStyle} 
              disabled={!!editingBookId}
            />
            
            <label style={labelStyle}>Author ID</label>
            <input 
              value={form.id_author} 
              onChange={e => setForm({...form, id_author: e.target.value})} 
              required 
              style={editingBookId ? {...inputStyle, backgroundColor: '#e9ecef'} : inputStyle} 
              disabled={!!editingBookId}
            />
            
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, height: '100px'}} />
            
            <label style={labelStyle}>Cover Image URL</label>
            <input value={form.cover_art} onChange={e => setForm({...form, cover_art: e.target.value})} style={inputStyle} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Pages</label>
                <input type="number" value={form.no_pages} onChange={e => setForm({...form, no_pages: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Publishing Date</label>
                <input type="text" placeholder="YYYY-MM-DD" value={form.publishing_date} onChange={e => setForm({...form, publishing_date: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit" style={saveButtonStyle}>
                {editingBookId ? 'Update Book' : 'Add to Database'}
              </button>
              {editingBookId && (
                <button type="button" onClick={() => { setEditingBookId(null); setForm({title:'', description:'', cover_art:'', no_pages:'', publishing_date:'', id_author:''}) }} style={cancelButtonStyle}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={listContainer}>
          <h3>Book List</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#eee' }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Author</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.books?.books.map(book => (
                  <tr key={book.id_book} style={trStyle}>
                    <td style={tdStyle}>{book.id_book}</td>
                    <td style={tdStyle}><b>{book.title}</b></td>
                    <td style={tdStyle}>{book.author.name}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(book)} style={editBtnStyle}>Edit</button>
                      <button onClick={() => handleDelete(book.id_book)} style={deleteBtnStyle}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const adminLayout = { display: 'flex', gap: '30px', marginTop: '20px' };
const formContainer = { flex: '1', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' };
const listContainer = { flex: '1.5' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: '#666', fontWeight: 'bold' };
const saveButtonStyle = { background: '#28a745', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const cancelButtonStyle = { background: '#6c757d', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' };
const backButtonStyle = { background: '#f8f9fa', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.9rem', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '10px', fontSize: '0.85rem', borderBottom: '1px solid #eee' };
const trStyle = { transition: 'background 0.2s' };
const editBtnStyle = { background: '#ffc107', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' };
const deleteBtnStyle = { background: '#dc3545', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' };
const centerStyle = { display: 'flex', justifyContent: 'center', padding: '50px' };

export default AdminPage;