import React, { useState } from "react";
import api from "../api";
import "./incoming.css";

export default function Incoming() {
    const [codigo, setCodigo] = useState("");
    const [quantidade, setQuantidade] = useState(1);
    const [responsavel, setResponsavel] = useState("");
    const [obs, setObs] = useState("");

    async function registrar() {
        try {
            await api.post("/movements", {
                codigo_barras: codigo,
                tipo: "entrada",
                quantidade: Number(quantidade),
                realizado_por: responsavel,
                obs,
            });

            alert("Entrada registrada com sucesso!");
            setCodigo("");
            setQuantidade(1);
            // mantemos obs e responsável
        } catch (err) {
            alert(err.response?.data?.error || "Erro ao registrar entrada");
        }
    }

    return (
        <div className="incoming-container">
            <h2 className="title">Entrada de Estoque</h2>

            <div className="card">
                <label>Código de barras:</label>
                <input
                    className="input"
                    placeholder="Escaneie ou digite..."
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                />

                <label>Quantidade:</label>
                <input
                    className="input"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />

                <label>Responsável:</label>
                <input
                    className="input"
                    placeholder="Quem está registrando?"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                />

                <label>Observação:</label>
                <input
                    className="input"
                    placeholder="Opcional"
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                />

                <button className="button" onClick={registrar}>
                    Registrar Entrada
                </button>
            </div>
        </div>
    );
}
