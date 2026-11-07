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

      <h3>22. Jardunaldia</h3>

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
