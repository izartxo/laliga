
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

const equipos = [
  { id: "gdk", nombre: "Galdakao 2015 zuria", logo: "/logos/gdk.png" },
  { id: "gernika", nombre: "Gernika 2015 R", logo: "/logos/gernika.png" },
  { id: "arratia", nombre: "Arratia 15R", logo: "/logos/arratia.png" },
  { id: "mugarra", nombre: "Cultural Mugarra 15", logo: "/logos/alluitz.png" },
  { id: "oiz", nombre: "Cultural Oiz 2015", logo: "/logos/anboto.png" },
  { id: "danok", nombre: "Danok bat 2015 B", logo: "/logos/danok.png" },
  { id: "santutxu", nombre: "Santutxu 15 Urdina", logo: "/logos/santutxu.png" },
  { id: "amore", nombre: "Amorebieta 15R", logo: "/logos/amore.png" },
  { id: "indautxu", nombre: "Indautxu 2015R", logo: "/logos/indautxu.png" },
  { id: "athletic", nombre: "Athletic B - 2016", logo: "/logos/athletic.png" },
  { id: "ermua", nombre: "Ermua Blues", logo: "/logos/ermua.png" },
  { id: "baskauri", nombre: "Baskauri FE 2015 A", logo: "/logos/baskauri.png" }
];

// Partidos de las 12 jornadas
const partidosJ1 = [
  { id: "p1", local: "gernika", visitante: "gdk" }
];

const partidosJ2 = [
  { id: "p1", local: "gdk", visitante: "santutxu" }
];

const partidosJ3 = [
  { id: "p1", local: "athletic", visitante: "gdk" }
];

const partidosJ4 = [
  { id: "p1", local: "gdk", visitante: "arratia" }
];

const partidosJ5 = [
  { id: "p1", local: "gdk", visitante: "oiz" }
];

const partidosJ6 = [
  { id: "p1", local: "ermua", visitante: "gdk" }
];

const partidosJ7 = [
  { id: "p1", local: "gdk", visitante: "indautxu" }
];

const partidosJ8 = [
  { id: "p1", local: "danok", visitante: "gdk" }
];

const partidosJ9 = [
  { id: "p1", local: "alluitz", visitante: "lekeitio" }
];

const partidosJ10 = [
  { id: "p1", local: "gdk", visitante: "baskauri" }
];

const partidosJ11 = [
  { id: "p1", local: "mugarra", visitante: "gdk" }
];

const partidosJ12 = [
  { id: "p1", local: "gdk", visitante: "amore" }
];

// Generar jornadas con identificadores únicos
const jornadas = [
  partidosJ1,
  partidosJ2,
  partidosJ3,
  partidosJ4,
  partidosJ5,
  partidosJ6,
  partidosJ7,
  partidosJ8,
  partidosJ9,
  partidosJ10,
  partidosJ11,
  partidosJ12
].map((partidos, indice) => ({
  numero: indice + 1,
  partidos: partidos.map((partido, i) => ({
    ...partido,
    id: `j${indice + 1}-p${i + 1}`
  }))
}));

// Resultados reales de las tres primeras jornadas
const resultadosFijos = {
  "j1-p1": "2", // Gernika - Galdakao: gana Galdakao
  "j2-p1": "2", // Galdakao - Santutxu: gana Santutxu
  "j3-p1": "1"  // Athletic - Galdakao: gana Athletic
};

// Calcular puntos del Galdakao
const calcularPuntosGaldakao = selecciones => {
  let puntos = 3; // Victoria de la primera jornada

  jornadas
    .filter(jornada => jornada.numero > 3)
    .forEach(jornada => {
      jornada.partidos.forEach(partido => {
        const resultado = selecciones[partido.id]?.resultado;

        if (!resultado) return;

        if (resultado === "X") {
          if (
            partido.local === "gdk" ||
            partido.visitante === "gdk"
          ) {
            puntos += 1;
          }
        } else if (
          (resultado === "1" && partido.local === "gdk") ||
          (resultado === "2" && partido.visitante === "gdk")
        ) {
          puntos += 3;
        }
      });
    });

  return puntos;
};

export default function Tabla() {
  const [selecciones, setSelecciones] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "partidos"), snap => {
      const data = {};

      snap.docs.forEach(d => {
        data[d.id] = d.data();
      });

      setSelecciones(data);
    });

    return () => unsub();
  }, []);

  const puntosGaldakao = calcularPuntosGaldakao(selecciones);

  const handleSeleccion = async (partido, valor) => {
    // No permitir modificar resultados fijos
    if (resultadosFijos[partido.id]) return;

    // Actualizar inmediatamente en pantalla
    setSelecciones(prev => ({
      ...prev,
      [partido.id]: {
        ...partido,
        resultado: valor
      }
    }));

    // Guardar el resultado en Firebase
    try {
      await setDoc(doc(db, "partidos", partido.id), {
        local: partido.local,
        visitante: partido.visitante,
        resultado: valor
      });
    } catch (error) {
      console.error("Error al guardar el resultado:", error);
    }
  };

  return (
    <div>
      <h2>Galdakao - Aurreikusitako puntuak</h2>

      {/* Puntuación del Galdakao */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px",
          backgroundColor: "#f0f4f8",
          borderRadius: "8px",
          marginBottom: "25px",
          color: "#222"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/logos/gdk.png"
            alt="Galdakao"
            style={{
              width: 40,
              height: 40,
              marginRight: 12
            }}
          />
          <strong>Galdakao 2015 zuria</strong>
        </div>

        <strong style={{ fontSize: 24 }}>
          {puntosGaldakao} pts
        </strong>
      </div>

      {/* Jornadas */}
      {jornadas.map(jornada => (
        <div key={jornada.numero}>
          <h3>{jornada.numero}. Jardunaldia</h3>

          {jornada.partidos.map(partido => {
            const bloqueado = Boolean(
              resultadosFijos[partido.id]
            );

            const resultadoActual = bloqueado
              ? resultadosFijos[partido.id]
              : selecciones[partido.id]?.resultado;

            const nombreLocal =
              equipos.find(e => e.id === partido.local)?.nombre
              ?? partido.local;

            const nombreVisitante =
              equipos.find(e => e.id === partido.visitante)?.nombre
              ?? partido.visitante;

            return (
              <div
                key={partido.id}
                style={{
                  marginBottom: 20,
                  padding: 12,
                  backgroundColor: bloqueado
                    ? "#f0f0f0"
                    : "transparent",
                  borderRadius: 6,
                  color: bloqueado ? "#333" : "inherit"
                }}
              >
                <strong>
                  {nombreLocal} vs {nombreVisitante}
                </strong>

                {bloqueado && (
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: "#666"
                    }}
                  >
                    🔒 Emaitza finkoa
                  </span>
                )}

                <div style={{ marginTop: 8 }}>
                  {["1", "X", "2"].map(op => (
                    <label
                      key={op}
                      style={{
                        marginRight: 15,
                        opacity: bloqueado ? 0.7 : 1
                      }}
                    >
                      <input
                        type="radio"
                        name={`partido-${partido.id}`}
                        value={op}
                        checked={resultadoActual === op}
                        disabled={bloqueado}
                        onChange={() =>
                          handleSeleccion(partido, op)
                        }
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
