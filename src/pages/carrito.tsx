import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useCarrito } from "../context/carritoContext";
import { formatCurrency } from "../utils/formatCurrency";
import { useState, useEffect } from "react";

export default function Carrito() {
  const [stockDisponible, setStockDisponible] = useState<
    Record<number, number>
  >({});

  const { items, updateQty, removeItem, clearCart } = useCarrito();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;
  const navigate = useNavigate();

  const finalizarCompra = async () => {
    if (items.length === 0) return;

    // se crea el array de items que muestra qué se compró
    const payload = {
      items: items.map((i) => ({
        mueble: i.id,
        cantidad: i.quantity,
      })),
    };

    // se mandan esos items en el payload
    // axios intercepta y, si lo encuentra, inyecta el token en el header
    try {
      await api.post("/pedidos", payload);

      clearCart();

      alert("Pedido creado con éxito");

      navigate("/pedidos");
    } catch (err: any) {
      console.error("Error al crear pedido", err.config?.url);
      if (err.response?.status === 401) {
        alert("Debes iniciar sesión para realizar una compra");
        navigate("/login");
      } else {
        alert(err.response?.data?.message || "Error al crear pedido");
      }
    }
  };

  useEffect(() => {
    if (items.length === 0) return;
    const fetchStock = async () => {
      const stocks: Record<number, number> = {};
      await Promise.all(
        items.map(async (item) => {
          const res = await api.get(`/muebles/${item.id}`);
          stocks[item.id] = res.data.data.stock;
        }),
      );
      setStockDisponible(stocks);
    };
    fetchStock();
  }, [items.length]);

  return (
    <section className="max-w-4xl mx-auto bg-gray-50 p-4 rounded-2xl shadow-lg mt-10 sm:my-6 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
        Carrito de Compras
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-600">Tu carrito está vacío.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col bg-white rounded-xl shadow p-4 gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {formatCurrency(item.price)}
                </p>
                {stockDisponible[item.id] !== undefined && (
                  <p
                    className={`text-sm ${item.quantity > stockDisponible[item.id] ? "text-red-500" : "text-gray-500"}`}
                  >
                    Stock disponible: {stockDisponible[item.id]}
                  </p>
                )}
              </div>

              <div
                className="flex flex-col gap-2 sm:flex-row
                                sm:items-center sm:gap-6"
              >
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 font-medium text-sm">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    max={stockDisponible[item.id] ?? item.quantity}
                    onChange={(e) => {
                      const max = stockDisponible[item.id] ?? Infinity;
                      const val = Math.min(Number(e.target.value), max);
                      updateQty(item.id, val);
                    }}
                    className="w-16 text-center border
                                    rounded-md border-gray-300 text-gray-700
                                    focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {stockDisponible[item.id] !== undefined &&
                  item.quantity > stockDisponible[item.id] && (
                    <p className="text-red-500 text-xs">
                      Stock disponible: {stockDisponible[item.id]}
                    </p>
                  )}

                <div className="text-right font-bold text-gray-800 w-10 sm:w-auto">
                  {formatCurrency(item.price * item.quantity)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-white hover:underline self-start sm:self-auto"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 text-right space-y-1 sm:space-y-2">
        <p className="text-gray-700 text-sm sm:text-base">
          Subtotal:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(subtotal)}
          </span>
        </p>
        <p className="text-gray-700 text-sm sm:text-base">
          Envío:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(shipping)}
          </span>
        </p>
        <p className="text-xl font-bold text-gray-900">
          Total: {formatCurrency(total)}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium w-full sm:w-auto"
          >
            Continuar comprando
          </button>
          <button
            onClick={finalizarCompra}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium w-full sm:w-auto"
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </section>
  );
}
