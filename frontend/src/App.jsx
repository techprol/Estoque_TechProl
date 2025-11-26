import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AddItem from './pages/AddItem';
import Inventory from './pages/Inventory';
import Outgoing from './pages/Outgoing';
import Movements from './pages/Movements';
import Incoming from './pages/Incoming';

export default function App() {
    return (
        <div style={{
            fontFamily: "Arial, sans-serif",
            background: "#f4f6f8",
            minHeight: "100vh",
            padding: "0",
            margin: "0"
        }}>

            {/* NAVBAR */}
            <nav style={{
                background: "#1e40af",
                padding: "15px 25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}>
                <h2 style={{ margin: 0 }}>Sistema de Estoque</h2>

                <div style={{ display: "flex", gap: "15px" }}>
                    <Link style={linkStyle} to="/">Adicionar Peça</Link>
                    <Link style={linkStyle} to="/inventory">Inventário</Link>
                    <Link style={linkStyle} to="/incoming">Reposição (Entrada)</Link>
                    <Link style={linkStyle} to="/outgoing">Dar Baixa (Saída)</Link>
                    <Link style={linkStyle} to="/movements">Movimentações</Link>
                </div>
            </nav>

            {/* CONTEÚDO */}
            <div style={{
                padding: "25px",
                maxWidth: "1100px",
                margin: "0 auto",
            }}>
                <Routes>
                    <Route path="/" element={<AddItem />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/incoming" element={<Incoming />} />
                    <Route path="/outgoing" element={<Outgoing />} />
                    <Route path="/movements" element={<Movements />} />
                </Routes>
            </div>
        </div>
    );
}

const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    padding: "6px 12px",
    borderRadius: "6px",
    transition: "0.2s",
};

linkStyle[':hover'] = {
    background: "rgba(255,255,255,0.2)"
};
