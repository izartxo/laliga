import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

const pgdk = 34;

const equipos = [
  { id: "gdk", nombre: "Galdakao", logo: "/logos/gdk.png" },
  { id: "gernika", nombre: "Gernika", logo: "/logos/gernika.png" },
  { id: "arratia", nombre: "Arratia", logo: "/logos/arratia.png" },
  { id: "alluitz", nombre: "Alluitz", logo: "/logos/alluitz.png" },
  { id: "anboto", nombre: "Anboto", logo: "/logos/anboto.png" },
  { id: "bermeo", nombre: "Bermeo", logo: "/logos/bermeo.png" },
  { id: "lekeitio", nombre: "Lekeitio", logo: "/logos/lekeitio.png" },
  { id: "amore", nombre: "Amorebieta", logo: "/logos/amore.png" },
  { id: "abadino", nombre: "Abadino", logo: "/logos/abadino.png" },
  { id: "ondarroa", nombre: "Ondarroa", logo: "/logos/ondarroa.png" },
  { id: "ermua", nombre: "Ermua", logo: "/logos/ermua.png" }
];


// const partidosJ19 = [
//   { id: "p1", local: "alluitz", visitante: "lekeitio" },
//   { id: "p2", local: "arratia", visitante: "ondarroa" },
//   { id: "p3", local: "abadino", visitante: "gdk" },
//   { id: "p4", local: "gernika", visitante: "ermua" }
// ];

const partidosJ20 = [
  { id: "p5", local: "amore", visitante: "alluitz" },
  { id: "p6", local: "gdk", visitante: "arratia" },
  { id: "p7", local: "ermua", visitante: "abadino" }
  
];

const partidosJ21 = [
  { id: "p8", local: "alluitz", visitante: "ondarroa" },
  { id: "p9", local: "bermeo", visitante: "gdk" },
  { id: "p10", local: "arratia", visitante: "ermua" },
  { id: "p11", local: "abadino", visitante: "gernika" }
];

const partidosJ22 = [
  // { id: "p12", local: "gdk", visitante: "alluitz" },
  { id: "p13", local: "ermua", visitante: "bermeo" },
  { id: "p14", local: "gernika", visitante: "arratia" }
  
];

const partidosApl = [
  { id: "p15", local: "ermua", visitante: "gdk" }
  
];

const calcularClasificacion = (equipos, partidos) => {
  const tabla = {};

  equipos.forEach(e => {
    if (e.id == "gdk"){
      tabla[e.id] = { ...e, puntos: 40 };  
    } else if (e.id == "gernika"){
      tabla[e.id] = { ...e, puntos: 45 };
    } else if (e.id == "ermua"){
      tabla[e.id] = { ...e, puntos: 38 };
    } else if (e.id == "arratia"){
      tabla[e.id] = { ...e, puntos: 37 };  
    } else if (e.id == "alluitz"){
      tabla[e.id] = { ...e, puntos: 34 };  
    } 
    else{
      tabla[e.id] = { ...e, puntos: 0 };
    }
  });

  partidos.forEach(p => {
    if (!p.resultado) return;

    if (p.resultado === "1") {
      tabla[p.local].puntos += 3;
    } else if (p.resultado === "2") {
      tabla[p.visitante].puntos += 3;
    } else if (p.resultado === "X") {
      tabla[p.local].puntos += 1;
      tabla[p.visitante].puntos += 1;
    }
  });

  return Object.values(tabla).sort((a, b) => b.puntos - a.puntos);
};

export default function Tabla() {
  const [partidos, setPartidos] = useState({});
  const [selecciones, setSelecciones] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "partidos"), snap => {
      const data = {};
      snap.docs.forEach(d => {
        data[d.id] = d.data();
      });

      setPartidos(data);
      setSelecciones(data); // para marcar radios ya guardados
    });

    return () => unsub();
  }, []);

  const clasificacion = calcularClasificacion(
    equipos,
    Object.values(partidos)
  );

  const handleSeleccion = async (partido, valor) => {
    // actualizar estado local
    setSelecciones(prev => ({
      ...prev,
      [partido.id]: {
        ...partido,
        resultado: valor
      }
    }));

    // 🔥 clave: actualizar SIEMPRE el mismo partido
    await setDoc(doc(db, "partidos", partido.id), {
      local: partido.local,
      visitante: partido.visitante,
      resultado: valor
    });
  };

  return (
    <div>
      <h2>Sailkapena</h2>

    <ul>
    {clasificacion.map((e, i) => (
      <li key={e.id} style={{ marginBottom: 10 }}>
        {i + 1}

        <img
        src={e.logo}
        alt={e.nombre}
        style={{
          width: 25,
          height: 25,
          margin: "0 10px",
          verticalAlign: "middle"
        }}
        />

        {e.nombre} - {e.puntos} pts
      </li>
    ))}
    </ul>

      <h3>20. Jardunaldia</h3>

      {partidosJ20.map(partido => {
        const resultadoActual = selecciones[partido.id]?.resultado;

        return (
          <div key={partido.id} style={{ marginBottom: 20 }}>
            <strong>
              {partido.local} vs {partido.visitante}
            </strong>

            <div>
              {["1", "X", "2"].map(op => (
                <label key={op} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`partido-${partido.id}`}
                    value={op}
                    checked={resultadoActual === op}
                    onChange={() => handleSeleccion(partido, op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <h3>21. Jardunaldia</h3>

      {partidosJ21.map(partido => {
        const resultadoActual = selecciones[partido.id]?.resultado;

        return (
          <div key={partido.id} style={{ marginBottom: 20 }}>
            <strong>
              {partido.local} vs {partido.visitante}
            </strong>

            <div>
              {["1", "X", "2"].map(op => (
                <label key={op} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`partido-${partido.id}`}
                    value={op}
                    checked={resultadoActual === op}
                    onChange={() => handleSeleccion(partido, op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <h3>22.jardunaldia</h3>

      {partidosJ22.map(partido => {
        const resultadoActual = selecciones[partido.id]?.resultado;

        return (
          <div key={partido.id} style={{ marginBottom: 20 }}>
            <strong>
              {partido.local} vs {partido.visitante}
            </strong>

            <div>
              {["1", "X", "2"].map(op => (
                <label key={op} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`partido-${partido.id}`}
                    value={op}
                    checked={resultadoActual === op}
                    onChange={() => handleSeleccion(partido, op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <h3>Jornada Aplazada</h3>

      {partidosApl.map(partido => {
        const resultadoActual = selecciones[partido.id]?.resultado;

        return (
          <div key={partido.id} style={{ marginBottom: 20 }}>
            <strong>
              {partido.local} vs {partido.visitante}
            </strong>

            <div>
              {["1", "X", "2"].map(op => (
                <label key={op} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`partido-${partido.id}`}
                    value={op}
                    checked={resultadoActual === op}
                    onChange={() => handleSeleccion(partido, op)}
                  />
                  {op}
                </label>
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
}

// const calcularClasificacion = (equipos, partidos) => {
//   const tabla = {};

//   equipos.forEach(e => {
//     tabla[e.id] = { ...e, puntos: 0 };
//   });

//   partidos.forEach(p => {
//     if (p.resultado === "1") {
//       tabla[p.local].puntos += 3;
//     } else if (p.resultado === "2") {
//       tabla[p.visitante].puntos += 3;
//     } else if (p.resultado === "X") {
//       tabla[p.local].puntos += 1;
//       tabla[p.visitante].puntos += 1;
//     }
//   });

//   return Object.values(tabla).sort((a, b) => b.puntos - a.puntos);
// };

// export default function Tabla() {
//   const [partidos, setPartidos] = useState([]);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "partidos"), snap => {
//       const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setPartidos(data);
//     });

//     return () => unsub();
//   }, []);

//   const clasificacion = calcularClasificacion(equipos, partidos);

//   const crearPartido = async (local, visitante, resultado) => {
//     await addDoc(collection(db, "partidos"), {
//       local,
//       visitante,
//       resultado
//     });
//   };

//   return (
//     <div>
//       <h2>Clasificación</h2>

//       <ul>
//         {clasificacion.map((e, i) => (
//           <li key={e.id}>
//             #{i + 1} - {e.nombre} - {e.puntos} pts
//           </li>
//         ))}
//       </ul>

//       <h3>Simular partido</h3>

//       <button onClick={() => crearPartido("alluitz", "lekeitio", "1")}>
//         Alluitz vs Lekeitio → 1
//       </button>
//       <br/>
//       <button onClick={() => crearPartido("alluitz", "lekeitio", "X")}>
//         Madrid vs Barça → X
//       </button>
//       <br/>
//       <button onClick={() => crearPartido("alluitz", "lekeitio", "2")}>
//         Madrid vs Barça → 2
//       </button>
//     </div>
//   );
// }
