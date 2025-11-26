import React, { useState } from "react";
import api from "../api";
import "./outgoing.css";

export default function Outgoing() {
    const [codigo, setCodigo] = useState("");
    const [quantidade, setQuantidade] = useState(1);
    const [responsavel, setResponsavel] = useState("");
    const [obs, setObservacao] = useState("");

    const submit = async () => {
        try {
            await api.post("/movements", {
                codigo_barras: codigo,
                tipo: "saida",
                quantidade: Number(quantidade),
                realizado_por: responsavel,
                observacao: obs,
            });

            alert("Saída registrada com sucesso!");

            setCodigo("");
            setQuantidade(1);
            setResponsavel("");
            setObservacao("");
        } catch (err) {
            alert(err?.response?.data?.error || "Erro ao registrar saída");
        }
    };

    return (
        <div className="page-container">
            <div className="card">
                <h2>Dar baixa (Saída)</h2>

                <div className="form-group">
                    <label>Código de barras</label>
                    <input
                        placeholder="Escaneie ou digite o código"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                    />
                </div>

                <div className="form-group">
                    <label>Quantidade</label>
                    <input
                        type="number"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Responsável</label>
                    <input
                        placeholder="Nome de quem realizou"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Observação</label>
                    <input
                        placeholder="Descrição opcional"
                        value={obs}
                        onChange={(e) => setObservacao(e.target.value)}
                    />
                </div>

                <button className="btn" onClick={submit}>
                    Registrar saída
                </button>

                <p className="tip">
                    💡 Dica: com leitor USB, deixe o foco no campo do código e apenas
                    escaneie.
                </p>
            </div>
        </div>
    );
}
