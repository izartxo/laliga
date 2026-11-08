import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const calendario = [
  ["gernika", "gdk"], ["gdk", "santutxu"], ["athletic", "gdk"],
  ["gdk", "arratia"], ["gdk", "oiz"], ["ermua", "gdk"],
  ["gdk", "indautxu"], ["danok", "gdk"], ["alluitz", "lekeitio"],
  ["gdk", "baskauri"], ["mugarra", "gdk"], ["gdk", "amore"]
];
const fijos = { "j1-p1": "2", "j2-p1": "2", "j3-p1": "1" };

function adminDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    }) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }
  const { nombre, resultados } = req.body || {};
  if (typeof nombre !== "string") return res.status(400).json({ error: "Introduce un nombre válido." });
  const limpio = nombre.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (limpio.length < 2 || limpio.length > 60 || /[\u0000-\u001f\/]/.test(limpio)) {
    return res.status(400).json({ error: "El nombre debe tener entre 2 y 60 caracteres válidos." });
  }
  if (!resultados || typeof resultados !== "object" || Array.isArray(resultados)) {
    return res.status(400).json({ error: "Faltan resultados." });
  }
  const validos = {};
  let puntos = 0;
  for (let i = 0; i < calendario.length; i++) {
    const id = `j${i + 1}-p1`;
    const r = resultados[id];
    if (!["1", "X", "2"].includes(r) || (fijos[id] && r !== fijos[id])) {
      return res.status(400).json({ error: `Resultado incorrecto en jornada ${i + 1}.` });
    }
    validos[id] = r;
    const [local, visitante] = calendario[i];
    if (local === "gdk" || visitante === "gdk") {
      if (r === "X") puntos += 1;
      else if ((r === "1" && local === "gdk") || (r === "2" && visitante === "gdk")) puntos += 3;
    }
  }
  const clave = Buffer.from(limpio.toLocaleLowerCase("es"), "utf8").toString("hex");
  try {
    const db = adminDb();
    const ref = db.collection("pronosticos").doc(clave);
    // La transacción evita duplicados incluso con envíos simultáneos.
    const creado = await db.runTransaction(async tx => {
      const existente = await tx.get(ref);
      if (existente.exists) return false;
      tx.create(ref, {
        nombre: limpio,
        resultados: validos,
        puntos,
        creadoEn: FieldValue.serverTimestamp(),
        estadoCorreo: "pendiente"
      });
      return true;
    });
    if (!creado) return res.status(409).json({ error: "Este nombre ya está registrado. Elige otro nombre." });

    // Resend requiere verificar un dominio remitente propio en producción.
    const texto = [
      `Participante: ${limpio}`,
      `Puntos previstos del Galdakao: ${puntos}`,
      "",
      ...calendario.map(([local, visitante], i) =>
        `Jornada ${i + 1}: ${local} vs ${visitante} = ${validos[`j${i + 1}-p1`]}`)
    ].join("\n");
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: ["viasda@gmail.com"],
        subject: `Pronóstico Galdakao - ${limpio}`,
        text: texto
      })
    });
    if (!respuesta.ok) {
      console.error("Error de envío Resend", respuesta.status, await respuesta.text());
      return res.status(502).json({ error: "Los resultados se han registrado, pero el correo no se ha podido enviar. Contacta con el administrador; no vuelvas a registrarte con otro nombre." });
    }
    await ref.update({ estadoCorreo: "enviado", enviadoEn: FieldValue.serverTimestamp() });
    return res.status(200).json({ ok: true, puntos });
  } catch (error) {
    console.error("Error al registrar pronóstico", error);
    return res.status(500).json({ error: "No se ha podido completar el registro. Comprueba la configuración del servidor." });
  }
}
