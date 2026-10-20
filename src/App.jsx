import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Quản lý trạng thái Đăng nhập từ LocalStorage
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // State Form Đăng Nhập
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // State Form Sản Phẩm (Dùng chung cho cả Thêm và Sửa)
  const [editingId, setEditingId] = useState(null); // Nếu null -> Thêm mới, nếu có ID -> Sửa
  const [productForm, setProductForm] = useState({ name: '', price: '', image: '', description: '' });

  // 1. Lấy danh sách sản phẩm từ API Backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Xử lý Đăng Nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, loginForm);
      const { token, user } = response.data;

      // Lưu thông tin vào State và LocalStorage
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      alert(`Đăng nhập thành công! Chào mừng ${user.username}`);
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  // 3. Xử lý Đăng Xuất
  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowAddForm(false);
    alert('Đã đăng xuất tài khoản!');
  };

  // 4. Xử lý Thêm mới HOẶC Cập nhật sản phẩm (Dành cho Admin)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.image) {
      alert('Vui lòng điền đầy đủ Tên, Giá và Hình ảnh!');
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      if (editingId) {
        // Gọi API PUT để cập nhật
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, {
          ...productForm,
          price: Number(productForm.price)
        }, config);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        // Gọi API POST để thêm mới
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, {
          ...productForm,
          price: Number(productForm.price)
        }, config);
        alert('Thêm sản phẩm thành công!');
      }

      // Reset form
      setProductForm({ name: '', price: '', image: '', description: '' });
      setEditingId(null);
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // 5. Bật chế độ Sửa sản phẩm
  const handleStartEdit = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Xử lý Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã xóa sản phẩm!');
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa sản phẩm!');
    }
  };

  // 7. Thêm vào giỏ hàng
  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải cửa hàng...</h2>;

  return (
    <div style={{ padding: '20px 40px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0 }}>🛒 Cửa Hàng Trực Tuyến</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '16px', background: '#eee', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
            🛍️ Giỏ hàng: <span style={{ color: '#e44d26' }}>{cart.length}</span>
          </span>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                👤 {user.username} {user.isAdmin && <span style={{ color: 'red', fontSize: '12px' }}>(Admin)</span>}
              </span>
              
              {user.isAdmin && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setProductForm({ name: '', price: '', image: '', description: '' });
                    setShowAddForm(!showAddForm);
                  }}
                  style={{ padding: '8px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {showAddForm ? '✕ Đóng Form' : '+ Thêm Sản Phẩm'}
                </button>
              )}

              <button 
                onClick={handleLogout}
                style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔑 Đăng Nhập
            </button>
          )}
        </div>
      </header>

      {/* Modal Đăng Nhập */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '320px', position: 'relative' }}>
            <h2 style={{ marginTop: 0 }}>Đăng Nhập Admin</h2>
            <form onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Email (admin@gmail.com)" 
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
              <input 
                type="password" 
                placeholder="Mật khẩu (123)" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Xác Nhận
                </button>
                <button type="button" onClick={() => setShowLoginModal(false)} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Quản Lý Sản Phẩm (Thêm / Sửa) */}
      {showAddForm && user?.isAdmin && (
        <form onSubmit={handleSaveProduct} style={{ background: '#f9f9f9', border: '2px solid #007bff', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <h3>{editingId ? '✏️ Chỉnh Sửa Sản Phẩm' : '➕ Thêm Sản Phẩm Mới'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Tên sản phẩm *" 
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="number" 
              placeholder="Giá tiền (VNĐ) *" 
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            {/* Upload & Nén Ảnh */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Chọn ảnh từ máy (Tự động nén):</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;
                        let width = img.width;
                        let height = img.height;
                        if (width > MAX_WIDTH) {
                          height *= MAX_WIDTH / width;
                          width = MAX_WIDTH;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        setProductForm((prev) => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.7) }));
                      };
                      img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {productForm.image && (
                <img src={productForm.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }} />
              )}
            </div>

            <textarea 
              placeholder="Mô tả sản phẩm" 
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: 'span 2', height: '60px' }}
            />
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingId ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Danh Sách Sản Phẩm */}
      <h2 style={{ marginTop: '30px' }}>Danh Sách Sản Phẩm</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px', marginTop: '20px' }}>
        {products.map((item) => (
          <div key={item._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }} />
              <h3 style={{ fontSize: '18px', margin: '12px 0 5px' }}>{item.name}</h3>
              <p style={{ color: '#e44d26', fontWeight: 'bold', fontSize: '18px', margin: '5px 0' }}>
                {item.price ? item.price.toLocaleString() : 0} VNĐ
              </p>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>{item.description}</p>
            </div>

            <div>
              <button 
                onClick={() => addToCart(item)}
                style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🛒 Thêm vào giỏ
              </button>

              {/* Nút Sửa & Xóa chỉ hiển thị khi Đăng nhập với quyền Admin */}
              {user?.isAdmin && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button 
                    onClick={() => handleStartEdit(item)}
                    style={{ flex: 1, padding: '6px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(item._id)}
                    style={{ flex: 1, padding: '6px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;