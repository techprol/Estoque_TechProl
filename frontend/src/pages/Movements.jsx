import React, { useEffect, useState } from 'react';
import api from '../api';
import './movements.css';

export default function Movements() {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        api.get('/movements').then(r => setRows(r.data));
    }, []);

    return (
        <div style={{
            width: "100%",
            maxWidth: "100%",
            padding: "20px",
            display: "flex",
            justifyContent: "center"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "1400px",   // <<< AQUI EXPANDE DE VERDADE
                background: "white",
                padding: "25px",
                borderRadius: "14px",
                border: "1px solid #e6e6e6",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
            }}>
                <h2 style={{
                    fontSize: "26px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    Movimentações
                </h2>

                <div style={{ overflowX: "auto" }}>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Data Hora</th>
                                <th>Tipo</th>
                                <th>Item</th>
                                <th>Código</th>
                                <th>Quantidade</th>
                                <th>Responsável</th>
                                <th>Observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id}>
                                    <td>{r.data_hora}</td>
                                    <td className={r.tipo === "entrada" ? "entrada" : "saida"}>
                                        {r.tipo}
                                    </td>
                                    <td>{r.item_nome}</td>
                                    <td>{r.codigo_barras}</td>
                                    <td>{r.quantidade}</td>
                                    <td>{r.realizado_por}</td>
                                    <td>{r.observacao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
