import crypto from "node:crypto";

const DEFAULT_BASE = "https://api-publica.datajud.cnj.jus.br";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let _lastCall = 0;
async function throttle(minIntervalMs) {
  const ms = Number(minIntervalMs) || 0;
  if (ms <= 0) return;
  const now = Date.now();
  const wait = (_lastCall + ms) - now;
  if (wait > 0) await sleep(wait);
  _lastCall = Date.now();
}

export function detectarTribunalInteligente(numeroProcesso) {
  const num = String(numeroProcesso || "").replace(/\D/g, "");
  if (num.length < 20) {
    return {
      apiUrl: `${DEFAULT_BASE}/api_publica_tjsp/_search`,
      tribunal: { nome: "TJSP", estado: "SP" },
    };
  }

  const jDigit = num[13];
  const trDigits = num.slice(14, 16);

  const mapaEstaduais = {
    "26": { api: "tjsp", estado: "SP" },
    "19": { api: "tjrj", estado: "RJ" },
    "13": { api: "tjmg", estado: "MG" },
    "21": { api: "tjrs", estado: "RS" },
    "16": { api: "tjpr", estado: "PR" },
    "05": { api: "tjba", estado: "BA" },
  };

  if (jDigit === "8" && mapaEstaduais[trDigits]) {
    const { api, estado } = mapaEstaduais[trDigits];
    return {
      apiUrl: `${DEFAULT_BASE}/api_publica_${api}/_search`,
      tribunal: { nome: `TJ${estado}`, estado },
    };
  }

  return {
    apiUrl: `${DEFAULT_BASE}/api_publica_tjsp/_search`,
    tribunal: { nome: "TJSP", estado: "SP" },
  };
}

export function extrairTeorDecisao(source) {
  const movimentos = Array.isArray(source?.movimentos) ? source.movimentos : [];
  if (!movimentos.length) return null;

  const palavras = ["julgamento", "sentença", "sentenca", "decisão", "decisao", "mérito", "merito"];
  let texto = "";

  for (const mov of movimentos) {
    const nome = String(mov?.nome || "").toLowerCase();
    if (!palavras.some((p) => nome.includes(p))) continue;

    const comps = Array.isArray(mov?.complementosTabelados) ? mov.complementosTabelados : [];
    for (const c of comps) {
      const desc = String(c?.descricao || "");
      if (desc.length > 50) {
        const dt = String(mov?.dataHora || "").slice(0, 10);
        texto += `[${dt}] ${desc} | `;
      }
    }
    if (texto.length > 100) break;
  }

  return texto || null;
}

export function montarPayloadLote(hits, tribunal) {
  const first = hits?.[0]?._source || {};
  const nomeVara = (first?.orgaoJulgador?.nome || "Vara Desconhecida").toString();
  const juizNome = `Juízo da ${nomeVara}`;

  const seen = new Set();
  const decisoes = [];
  let comTeor = 0;

  for (const h of hits || []) {
    const source = h?._source || {};
    const numero = (source?.numeroProcesso || "").toString().trim();
    if (!numero || seen.has(numero)) continue;
    seen.add(numero);

    const teor = extrairTeorDecisao(source);
    const tema = (source?.assuntos?.[0]?.nome || "Geral").toString();
    const texto_decisao = `Assunto: ${tema}. ${teor || ""}`.trim();
    if (teor) comTeor += 1;

    const dataAjuiz = source?.dataAjuizamento;
    const data_decisao =
      typeof dataAjuiz === "string" ? (dataAjuiz.includes("T") ? dataAjuiz.split("T")[0] : dataAjuiz) : null;

    decisoes.push({
      numero_processo: numero,
      texto_decisao,
      tema,
      data_decisao,
      resultado: "Aguardando Análise",
    });
  }

  return {
    tribunal,
    juiz: { nome: juizNome, vara: nomeVara },
    decisoes,
    stats: { processos: decisoes.length, com_teor: comTeor },
  };
}

function makeCacheKey(apiUrl, payload) {
  const raw = `${apiUrl}|${JSON.stringify(payload)}`;
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export async function datajudSearch({
  apiUrl,
  payload,
  apiKey,
  cacheGet,
  cacheSet,
  cacheTtlSeconds = 7 * 24 * 3600,
  timeoutMs = 20000,
  minIntervalMs = 350,
  maxRetries = 5,
  backoffFactor = 0.7,
}) {
  if (!apiKey) throw new Error("DATAJUD_API_KEY não configurada.");

  const cacheKey = makeCacheKey(apiUrl, payload);
  if (cacheGet) {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
  }

  let lastErr = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await throttle(minIntervalMs);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `APIKey ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.status === 429 || (res.status >= 500 && res.status <= 504)) {
        const retryAfter = Number(res.headers.get("retry-after") || "0");
        const delay =
          retryAfter > 0
            ? retryAfter * 1000
            : Math.max(500, backoffFactor * 1000 * Math.pow(2, attempt));
        lastErr = new Error(`DataJud falhou (${res.status})`);
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`DataJud falhou (${res.status}): ${txt.slice(0, 500)}`);
      }

      const data = await res.json();
      if (cacheSet) await cacheSet(cacheKey, data, cacheTtlSeconds);
      return data;
    } catch (e) {
      lastErr = e;
      const delay = Math.max(500, backoffFactor * 1000 * Math.pow(2, attempt));
      await sleep(delay);
    } finally {
      clearTimeout(t);
    }
  }

  throw lastErr || new Error("Falha ao chamar DataJud.");
}

export async function clonarPerfilJuizPayload(numeroProcessoRef, { apiKey, cacheGet, cacheSet, progressCb } = {}) {
  const numeroLimpo = String(numeroProcessoRef || "").replace(/\D/g, "");
  const { apiUrl, tribunal } = detectarTribunalInteligente(numeroLimpo);

  const payloadRef = { query: { match: { numeroProcesso: numeroLimpo } } };
  progressCb?.(10, "Buscando processo de referência no DataJud…");
  const refJson = await datajudSearch({ apiUrl, payload: payloadRef, apiKey, cacheGet, cacheSet });
  const hits = refJson?.hits?.hits || [];
  if (!hits.length) {
    return { sucesso: false, msg: "Processo não encontrado." };
  }

  const processoRef = hits[0]._source || {};
  const orgaoCod = processoRef?.orgaoJulgador?.codigo;
  const orgaoNome = processoRef?.orgaoJulgador?.nome;
  if (!orgaoCod) return { sucesso: false, msg: "Processo encontrado, mas sem orgaoJulgador.codigo." };

  progressCb?.(45, "Buscando histórico do órgão julgador no DataJud…");
  const payloadHist = {
    size: 50,
    query: { match: { "orgaoJulgador.codigo": orgaoCod } },
    sort: [{ dataAjuizamento: "desc" }],
  };
  const histJson = await datajudSearch({ apiUrl, payload: payloadHist, apiKey, cacheGet, cacheSet });
  const hitsHist = histJson?.hits?.hits || [];

  progressCb?.(80, "Normalizando payload…");
  const lote = montarPayloadLote(hitsHist, tribunal);
  progressCb?.(100, "Concluído.");

  return {
    sucesso: true,
    msg: `${lote.stats.processos} processos coletados.`,
    numero_processo_ref: numeroLimpo,
    tribunal: lote.tribunal,
    juiz: lote.juiz,
    orgao: { codigo: String(orgaoCod), nome: orgaoNome ? String(orgaoNome) : null },
    decisoes: lote.decisoes,
    stats: lote.stats,
  };
}

