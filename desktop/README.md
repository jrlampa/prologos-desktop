# PRÓLOGOS Desktop (Windows)

App desktop baseado em **Electron**, empacotando:
- UI React (`../frontend`)
- API local Express (`../server`)
- SQLite (`../backend/prologos_mvp.db` como seed; cópia para `userData`)

## Pré-requisitos (dev)

- Node 20+ (recomendado) e npm

> Observação: o `better-sqlite3` é módulo nativo. Para rodar localmente no Windows fora do Docker, você pode precisar do **Visual Studio Build Tools** (C++). Para o instalador, o `electron-builder` faz `rebuild` via `install-app-deps`.

## Rodar em dev

No diretório `desktop/`:

```bash
npm install
npm run build:frontend
npm run dev
```

## Build do instalador (Windows)

```bash
npm install
npm run build
```

O instalador sai em `desktop/dist/`.

## Variáveis de ambiente

- `GROQ_API_KEY`: habilita dossiê/parecer.
- `DATAJUD_API_KEY`: habilita clonagem via DataJud no desktop.

