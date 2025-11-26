import React, { useState } from "react";
import api from "../api";

export default function AddItem() {
    const [nome, setNome] = useState("");
    const [categoria, setCategoria] = useState("selecione");
    const [quantidade, setQuantidade] = useState(1);
    const [codigoBarras, setCodigoBarras] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [caracteristicas, setCaracteristicas] = useState("");
    const [local, setLocal] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem("");

        try {
            const response = await api.post("/items", {
                nome,
                categoria,
                quantidade: Number(quantidade),
                caracteristicas,
                local,
            });

            setCodigoBarras(response.data.barcode);
            setMensagem("✅ Item adicionado com sucesso!");

            setNome("");
            setQuantidade(1);
            setCaracteristicas("");
            setLocal("");
            setCategoria("selecione");
        } catch (error) {
            console.error(error);
            setMensagem("❌ Erro ao salvar item.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 40,
                paddingBottom: 40,
                background: "#f4f6f8",
                minHeight: "100vh",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 480,
                    background: "white",
                    padding: 30,
                    borderRadius: 12,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    animation: "fadeIn 0.3s ease",
                }}
            >
                <h2 style={{ marginBottom: 20, textAlign: "center" }}>
                    Adicionar Item ao Estoque
                </h2>

                <form onSubmit={handleSubmit}>

                    <label style={labelStyle}>Nome da peça:</label>
                    <input
                        style={inputStyle}
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

                    <label style={labelStyle}>Categoria:</label>
                    <select
                        style={inputStyle}
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        <option value="selecione">Selecione</option>
                        <option value="laboratorio">Laboratório</option>
                        <option value="odontológico">Odontológico</option>
                        <option value="hospitalar">Hospitalar</option>
                        <option value="eletrônico">Eletrônico</option>
                        <option value="uso geral">Uso Geral</option>
                        <option value="mecânico">Mecânico</option>
                        <option value="pneumático">Pneumático</option>
                        <option value="elétrico">Elétrico</option>
                    </select>

                    <label style={labelStyle}>Quantidade:</label>
                    <input
                        style={inputStyle}
                        type="number"
                        value={quantidade}
                        min="1"
                        onChange={(e) => setQuantidade(e.target.value)}
                    />

                    <label style={labelStyle}>Local:</label>
                    <input
                        style={inputStyle}
                        type="text"
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        required
                    />

                    <label style={labelStyle}>Características:</label>
                    <input
                        style={inputStyle}
                        type="text"
                        value={caracteristicas}
                        onChange={(e) => setCaracteristicas(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            marginTop: 15,
                            borderRadius: 8,
                            background: loading ? "#9ca3af" : "#1e40af",
                            color: "white",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 16,
                            fontWeight: "bold",
                            transition: "0.2s",
                        }}
                    >
                        {loading ? "Salvando..." : "Adicionar Item"}
                    </button>
                </form>

                {mensagem && (
                    <div
                        style={{
                            marginTop: 20,
                            padding: 10,
                            borderRadius: 8,
                            background: mensagem.includes("Erro")
                                ? "#fee2e2"
                                : "#dcfce7",
                            color: mensagem.includes("Erro")
                                ? "#991b1b"
                                : "#14532d",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        {mensagem}
                    </div>
                )}

                {codigoBarras && (
                    <div style={{ marginTop: 20, textAlign: "center" }}>
                        <h3>Código de Barras Gerado:</h3>
                        <img
                            src={`http://localhost:4000/barcodes/${codigoBarras}`}
                            alt="barcode"
                            style={{
                                background: "#fff",
                                padding: 10,
                                borderRadius: 8,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// estilos
const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: 6,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 15,
};

const labelStyle = {
    fontWeight: "bold",
    marginTop: 10,
};
