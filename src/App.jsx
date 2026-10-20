import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Cửa Hàng Trực Tuyến</h1>
      {products.length === 0 ? (
        <p>Chưa có sản phẩm nào hoặc đang tải...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {products.map((item) => (
            <div key={item._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <h3>{item.name}</h3>
              <p style={{ color: 'red', fontWeight: 'bold' }}>{item.price.toLocaleString()} VNĐ</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;