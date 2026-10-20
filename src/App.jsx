import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // State quản lý dữ liệu form nhập sản phẩm mới
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    description: ''
  });

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

  // 2. Xử lý khi gửi Form thêm sản phẩm mới
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('Vui lòng điền đầy đủ Tên, Giá và Link ảnh sản phẩm!');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, {
        ...newProduct,
        price: Number(newProduct.price)
      });
      alert('Thêm sản phẩm mới thành công!');
      setNewProduct({ name: '', price: '', image: '', description: '' });
      setShowAddForm(false);
      fetchProducts(); // Tải lại danh sách sản phẩm ngay lập tức
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      alert('Lỗi khi thêm sản phẩm!');
    }
  };

  // 3. Xử lý Thêm vào giỏ hàng
  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải cửa hàng...</h2>;
  }

  return (
    <div style={{ padding: '20px 40px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header / Thanh điều hướng */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0 }}>🛒 Cửa Hàng Trực Tuyến</h1>
        <div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '15px', fontWeight: 'bold' }}
          >
            {showAddForm ? '✕ Đóng Form' : '+ Thêm Sản Phẩm Mới'}
          </button>
          
          <span style={{ fontSize: '18px', fontWeight: 'bold', background: '#eee', padding: '8px 15px', borderRadius: '20px' }}>
            🛍️ Giỏ hàng: <span style={{ color: '#e44d26' }}>{cart.length}</span> món
          </span>
        </div>
      </header>

      {/* Form Nhập Sản Phẩm Mới (Ẩn / Hiện) */}
      {showAddForm && (
        <form onSubmit={handleAddProduct} style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <h3>Thêm Sản Phẩm Mới Về Cửa Hàng</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Tên sản phẩm *" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="number" 
              placeholder="Giá tiền (VNĐ) *" 
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" 
              placeholder="URL Hình ảnh (https://...) *" 
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: 'span 2' }}
            />
            <textarea 
              placeholder="Mô tả sản phẩm" 
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: 'span 2', height: '60px' }}
            />
          </div>
          <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Lưu Sản Phẩm
          </button>
        </form>
      )}

      {/* Danh Sách Sản Phẩm */}
      <h2 style={{ marginTop: '30px' }}>Danh Sách Sản Phẩm Hiện Có</h2>
      {products.length === 0 ? (
        <p>Chưa có sản phẩm nào trong cửa hàng.</p>
      ) : (
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
              <button 
                onClick={() => addToCart(item)}
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🛒 Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;