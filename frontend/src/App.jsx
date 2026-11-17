import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productoActivo, setProductoActivo] = useState(null);
  const [recomendados, setRecomendados] = useState([]);

  // Cargar datos iniciales
  const cargarDatos = async () => {
    const resProd = await axios.get(`${API_URL}/productos/`);
    const resCat = await axios.get(`${API_URL}/categorias/`);
    setProductos(resProd.data);
    setCategorias(resCat.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado y búsqueda
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === '' || prod.categoria === parseInt(categoriaSeleccionada);
    return coincideNombre && coincideCategoria;
  });

  // Ver detalle y cargar recomendaciones
  const verDetalle = async (producto) => {
    setProductoActivo(producto);
    const resRec = await axios.get(`${API_URL}/productos/${producto.id}/recomendados/`);
    setRecomendados(resRec.data);
  };

  // Gestión de inventario: Comprar producto
  const manejarCompra = async (id) => {
    try {
      await axios.post(`${API_URL}/productos/${id}/comprar/`, { cantidad: 1 });
      alert('¡Compra realizada! Inventario actualizado.');
      cargarDatos(); // Recargar stock
      setProductoActivo(null);
    } catch (error) {
      alert('No hay suficiente stock disponible.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wide">TechStore Perú</h1>
          <span className="text-sm bg-blue-900 px-3 py-1 rounded-full">Envíos a todo el país</span>
        </div>
      </header>

      {/* Banner de Marketing / Promociones */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-4 px-4 shadow">
        <p className="font-bold text-lg">🔥 ¡CYBER DÍAS! Aprovecha hasta 30% de descuento en productos seleccionados 🔥</p>
      </div>

      {/* Contenedor Principal */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        
        {/* Barra de Búsqueda y Filtrado */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Grilla Responsiva de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
              <div className="relative">
                <img
                  src={prod.imagen_url || 'https://via.placeholder.com/300x200?text=Producto'}
                  alt={prod.nombre}
                  className="w-full h-48 object-cover"
                />
                {prod.descuento_porcentaje > 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    -{prod.descuento_porcentaje}% OFF
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-blue-600 font-semibold uppercase">{prod.categoria_nombre}</span>
                  <h2 className="text-lg font-bold text-gray-800 mt-1">{prod.nombre}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{prod.descripcion}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      {prod.descuento_porcentaje > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">S/ {prod.precio}</span>
                      )}
                      <span className="text-xl font-bold text-gray-900">S/ {prod.precio_final}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${prod.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {prod.stock > 0 ? `Stock: ${prod.stock}` : 'Agotado'}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => verDetalle(prod)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 rounded-lg transition"
                    >
                      Ver y Recomendar
                    </button>
                    <button
                      onClick={() => manejarCompra(prod.id)}
                      disabled={prod.stock === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 rounded-lg transition"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalle + Sistema de Recomendación */}
        {productoActivo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{productoActivo.nombre}</h2>
                <button onClick={() => setProductoActivo(null)} className="text-gray-500 hover:text-black text-xl font-bold">✕</button>
              </div>
              <p className="text-gray-600 mt-2">{productoActivo.descripcion}</p>
              <p className="text-xl font-bold text-blue-700 mt-3">Precio: S/ {productoActivo.precio_final} (Disponibles: {productoActivo.stock})</p>

              {/* Sección de Productos Recomendados */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">✨ Productos recomendados para ti:</h3>
                {recomendados.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay otros productos en esta categoría aún.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recomendados.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-2 text-center bg-gray-50">
                        <img src={rec.imagen_url || 'https://via.placeholder.com/150'} alt={rec.nombre} className="w-full h-24 object-cover rounded mb-2" />
                        <p className="font-semibold text-sm truncate">{rec.nombre}</p>
                        <p className="text-blue-600 font-bold text-sm">S/ {rec.precio_final}</p>
                        <button
                          onClick={() => verDetalle(rec)}
                          className="mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Ver producto
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;