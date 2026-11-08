import { useState } from "react";

const equipos = [
  { id: "gdk", nombre: "Galdakao 2015 zuria", logo: "/logos/gdk.png" },
  { id: "gernika", nombre: "Gernika 2015 R" },
  { id: "arratia", nombre: "Arratia 15R" },
  { id: "mugarra", nombre: "Cultural Mugarra 15" },
  { id: "oiz", nombre: "Cultural Oiz 2015" },
  { id: "danok", nombre: "Danok bat 2015 B" },
  { id: "santutxu", nombre: "Santutxu 15 Urdina" },
  { id: "amore", nombre: "Amorebieta 15R" },
  { id: "indautxu", nombre: "Indautxu 2015R" },
  { id: "athletic", nombre: "Athletic B - 2016" },
  { id: "ermua", nombre: "Ermua Blues" },
  { id: "baskauri", nombre: "Baskauri FE 2015 A" }
];

// Jornada 9 se conserva exactamente como en el fichero original; revisar equipos.
const calendario = [
  ["gernika", "gdk"], ["gdk", "santutxu"],
  ["athletic", "gdk"], ["gdk", "arratia"],
  ["gdk", "oiz"], ["ermua", "gdk"],
  ["gdk", "indautxu"], ["danok", "gdk"],
  ["alluitz", "lekeitio"], ["gdk", "baskauri"],
  ["mugarra", "gdk"], ["gdk", "amore"]
];
const fijos = { "j1-p1": "2", "j2-p1": "2", "j3-p1": "1" };
const jornadas = calendario.map(([local, visitante], i) => ({
  id: `j${i + 1}-p1`, numero: i + 1, local, visitante
}));
const nombreEquipo = id => equipos.find(e => e.id === id)?.nombre ?? id;
const puntosPartido = (p, resultado) => {
  if (p.local !== "gdk" && p.visitante !== "gdk") return 0;
  if (resultado === "X") return 1;
  return (resultado === "1" && p.local === "gdk") ||
    (resultado === "2" && p.visitante === "gdk") ? 3 : 0;
};

export default function Tabla() {
  const [selecciones, setSelecciones] = useState({});
  const [nombre, setNombre] = useState("");
  const [confirmacion, setConfirmacion] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [completado, setCompletado] = useState(false);

  const resultados = Object.fromEntries(jornadas.map(p => [p.id, fijos[p.id] ?? selecciones[p.id] ?? null]));
  const completos = jornadas.every(p => resultados[p.id] !== null);
  const puntos = jornadas.reduce((total, p) => total + puntosPartido(p, resultados[p.id]), 0);

  const cambiar = (id, valor) => {
    if (fijos[id] || completado) return;
    setSelecciones(prev => ({ ...prev, [id]: valor }));
    setConfirmacion(false);
    setAceptado(false);
    setMensaje("");
  };

  const enviar = async () => {
    if (!confirmacion || !aceptado || !completos || !nombre.trim() || enviando || completado) return;
    setEnviando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/enviar-pronostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), resultados })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se ha podido registrar el pronóstico.");
      setCompletado(true);
      setMensaje("Pronóstico registrado y correo enviado correctamente.");
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h2>Galdakao - Aurreikusitako puntuak</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 15, background: "#f0f4f8", borderRadius: 8, color: "#222" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logos/gdk.png" alt="Galdakao" width="40" height="40" />
          <strong>Galdakao 2015 zuria</strong>
        </span>
        <strong style={{ fontSize: 24 }}>{puntos} pts</strong>
      </div>

      {jornadas.map(p => (
        <div key={p.id} style={{ marginTop: 20, padding: 12, background: fijos[p.id] ? "#f0f0f0" : "transparent", color: fijos[p.id] ? "#222" : "inherit", borderRadius: 6 }}>
          <h3>{p.numero}. Jardunaldia {fijos[p.id] ? "🔒" : ""}</h3>
          <strong>{nombreEquipo(p.local)} vs {nombreEquipo(p.visitante)}</strong>
          <div style={{ marginTop: 8 }}>
            {["1", "X", "2"].map(op => (
              <label key={op} style={{ marginRight: 16 }}>
                <input type="radio" name={p.id} value={op} checked={resultados[p.id] === op} disabled={Boolean(fijos[p.id]) || completado} onChange={() => cambiar(p.id, op)} /> {op}
              </label>
            ))}
          </div>
        </div>
      ))}

      <section style={{ marginTop: 28, padding: 16, border: "1px solid #aaa", borderRadius: 8 }}>
        <h3>Registrar pronósticos</h3>
        <label htmlFor="nombre-participante">Nombre o apodo</label>
        <div><input id="nombre-participante" value={nombre} disabled={completado} maxLength={60} onChange={e => { setNombre(e.target.value); setConfirmacion(false); setAceptado(false); setMensaje(""); }} placeholder="Tu nombre" style={{ padding: 8, marginTop: 8, width: "100%", maxWidth: 360 }} /></div>
        <p>El nombre debe ser único. Si ya existe, te pediremos que elijas otro.</p>
        {!confirmacion && !completado && (
          <button type="button" disabled={!nombre.trim() || !completos} onClick={() => { setConfirmacion(true); setMensaje(""); }}>
            Revisar resultados
          </button>
        )}
        {confirmacion && !completado && (
          <div style={{ marginTop: 18 }}>
            <h4>Confirma tu pronóstico</h4>
            <p><strong>Participante:</strong> {nombre.trim()}</p>
            <p><strong>Puntos del Galdakao:</strong> {puntos}</p>
            <ol>{jornadas.map(p => <li key={p.id}>{nombreEquipo(p.local)} - {nombreEquipo(p.visitante)}: <strong>{resultados[p.id]}</strong></li>)}</ol>
            <label><input type="checkbox" checked={aceptado} onChange={e => setAceptado(e.target.checked)} /> He revisado mis resultados y estoy de acuerdo con enviarlos.</label>
            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <button type="button" onClick={() => { setConfirmacion(false); setAceptado(false); }}>Modificar</button>
              <button type="button" disabled={!aceptado || enviando} onClick={enviar}>{enviando ? "Enviando..." : "Confirmar y enviar"}</button>
            </div>
          </div>
        )}
        {mensaje && <p role="status">{mensaje}</p>}
      </section>
    </div>
  );
}
