import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";
import "./inventory.css";

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [filtroNome, setFiltroNome] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");

    const fetchItems = () => {
        api.get("/items").then((r) => setItems(r.data));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const categorias = [...new Set(items.map((i) => i.categoria))];

    const updateMin = async (id, value) => {
        try {
            await axios.put(`http://localhost:4000/items/${id}/min`, {
                quantidade_minima: Number(value),
            });
            fetchItems();
        } catch (err) {
            console.error("Erro ao atualizar mínima:", err);
        }
    };

    const filtrados = items.filter((i) => {
        const matchNome = i.nome.toLowerCase().includes(filtroNome.toLowerCase());
        const matchCategoria = filtroCategoria ? i.categoria === filtroCategoria : true;
        return matchNome && matchCategoria;
    });

    return (
        <div className="inventory-container">
            <h2 className="title">Inventário</h2>

            {/* FILTROS */}
            <div className="filter-box">
                <input
                    type="text"
                    placeholder="Buscar pelo nome..."
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                    className="search-input"
                />

                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="select"
                >
                    <option value="">Todas categorias</option>
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* TABELA */}
            <table className="inv-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Qtd</th>
                        <th>Qtd. Mínima</th>
                        <th>Local</th>
                        <th>Características</th>
                        <th>Código</th>
                    </tr>
                </thead>

                <tbody>
                    {filtrados.map((i) => (
                        <tr
                            key={i.id}
                            className={
                                i.quantidade_atual <= i.quantidade_minima
                                    ? "alert-row"
                                    : ""
                            }
                        >
                            <td>{i.nome}</td>
                            <td>{i.categoria}</td>

                            <td>
                                {i.quantidade_atual}
                                {i.quantidade_atual <= i.quantidade_minima && (
                                    <span className="alert-text">⚠ Comprar!</span>
                                )}
                            </td>

                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={i.quantidade_minima}
                                    onChange={(e) => updateMin(i.id, e.target.value)}
                                    className="min-input"
                                />
                            </td>

                            <td>{i.local}</td>
                            <td>{i.caracteristicas}</td>
                            <td>{i.codigo_barras}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
