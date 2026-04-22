# Guía: Búsqueda Web con DuckDuckGo Sin API Key

## Objetivo

Implementar un sistema de búsqueda web similar al de este proyecto, usando DuckDuckGo **sin API Key** mediante scraping del HTML público.

---

## Requisitios

```bash
pip install ddgs>=9.5.5 httpx
```

---

## Implementación Minimal

### Paso 1: Instalación de Dependencias

```python
# Requiere solo una librería:
# - ddgs: wrapper para hacer scraping de DuckDuckGo
# - httpx: cliente HTTP async (opcional, si necesitas async)
pip install "ddgs>=9.5.5,<10.0.0" httpx
```

### Paso 2: Código Básico de Búsqueda

```python
import asyncio
from ddgs import DDGS

def search_duckduckgo_sync(query: str, max_results: int = 5):
    """
    Búsqueda básica síncrona.
    Retorna lista de diccionarios con: title, href, body
    """
    ddgs = DDGS(timeout=10)
    results = ddgs.text(query, max_results=max_results)
    return results

# Ejemplo de uso
results = search_duckduckgo_sync("python tutorial")
for r in results:
    print(f"{r['title']}\n{r['href']}\n{r['body']}\n")
```

### Paso 3: Versión Async (Recomendada)

```python
import asyncio
from ddgs import DDGS

async def search_duckduckgo(query: str, max_results: int = 5, timeout: float = 15.0):
    """
    Búsqueda asíncrona con timeout.
    
    Importante: ddgs es síncrono y bloqueante, por eso se usa
    asyncio.to_thread() para no bloquear el event loop.
    """
    try:
        ddgs = DDGS(timeout=10)
        
        # Ejecutar en thread pool para no bloquear async loop
        raw = await asyncio.wait_for(
            asyncio.to_thread(ddgs.text, query, max_results=max_results),
            timeout=timeout,
        )
        
        if not raw:
            return []
        
        # Normalizar formato de resultados
        items = [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "content": r.get("body", "")
            }
            for r in raw
        ]
        
        return items
        
    except asyncio.TimeoutError:
        return {"error": "Timeout"}
    except Exception as e:
        return {"error": str(e)}

# Ejemplo de uso async
async def main():
    results = await search_duckduckgo("python async tutorial", max_results=5)
    for r in results:
        print(f"{r['title']}\n  {r['url']}\n  {r['content']}\n")

asyncio.run(main())
```

---

## Implementación Completa (Con Formateo)

### Estructura de Proyecto Recomendada

```
mi_proyecto/
├── search.py          # Módulo de búsqueda
├── main.py            # Uso del módulo
└── requirements.txt
```

### search.py

```python
"""
Módulo de búsqueda web usando DuckDuckGo (sin API Key)
"""
import asyncio
import re
import html
from typing import Any

from ddgs import DDGS


def strip_tags(text: str) -> str:
    """Remove HTML tags and decode entities."""
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', '', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return html.unescape(text).strip()


def normalize(text: str) -> str:
    """Normalize whitespace."""
    text = re.sub(r'[ \t]+', ' ', text)
    return re.sub(r'\n{3,}', '\n\n', text).strip()


def format_results(query: str, items: list[dict[str, Any]], n: int) -> str:
    """Formatear resultados como texto legible."""
    if not items:
        return f"No results for: {query}"
    
    lines = [f"Results for: {query}\n"]
    for i, item in enumerate(items[:n], 1):
        title = normalize(strip_tags(item.get("title", "")))
        snippet = normalize(strip_tags(item.get("content", "")))
        lines.append(f"{i}. {title}\n   {item.get('url', '')}")
        if snippet:
            lines.append(f"   {snippet}")
    
    return "\n".join(lines)


class DuckDuckGoSearch:
    """
    Cliente de búsqueda DuckDuckGo sin API Key.
    
    Uso:
        search = DuckDuckGoSearch()
        results = await search.search("query", max_results=5)
        print(results)
    """
    
    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout
    
    async def search(self, query: str, max_results: int = 5) -> str:
        """
        Ejecutar búsqueda y retornar resultados formateados.
        
        Args:
            query: Término de búsqueda
            max_results: Número de resultados (1-10)
            
        Returns:
            String formateado con resultados o mensaje de error
        """
        try:
            ddgs = DDGS(timeout=10)
            
            raw = await asyncio.wait_for(
                asyncio.to_thread(ddgs.text, query, max_results=max_results),
                timeout=self.timeout,
            )
            
            if not raw:
                return f"No results for: {query}"
            
            items = [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "content": r.get("body", "")
                }
                for r in raw
            ]
            
            return format_results(query, items, max_results)
            
        except asyncio.TimeoutError:
            return "Error: Search timeout"
        except Exception as e:
            return f"Error: Search failed ({e})"
    
    async def search_raw(self, query: str, max_results: int = 5) -> list[dict]:
        """
        Ejecutar búsqueda y retornar resultados crudos (sin formatear).
        
        Returns:
            Lista de diccionarios: [{"title": "", "url": "", "content": ""}, ...]
        """
        try:
            ddgs = DDGS(timeout=10)
            
            raw = await asyncio.wait_for(
                asyncio.to_thread(ddgs.text, query, max_results=max_results),
                timeout=self.timeout,
            )
            
            if not raw:
                return []
            
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "content": r.get("body", "")
                }
                for r in raw
            ]
            
        except Exception as e:
            return []
```

### main.py

```python
import asyncio
from search import DuckDuckGoSearch

async def main():
    search = DuckDuckGoSearch(timeout=15.0)
    
    # Buscar y obtener resultado formateado
    result = await search.search("best python async tutorial 2024", max_results=5)
    print(result)
    print("\n" + "="*50 + "\n")
    
    # Buscar y obtener datos crudos
    raw_results = await search.search_raw("machine learning python", max_results=3)
    for r in raw_results:
        print(f"Title: {r['title']}")
        print(f"URL: {r['url']}")
        print(f"Content: {r['content'][:100]}...")
        print("-" * 30)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Explicación Técnica Detallada

### ¿Cómo funciona ddgs internamente?

La librería `ddgs` no usa ninguna API oficial. Funciona así:

1. **Request HTTP** a `https://duckduckgo.com/html/` (endpoint público del HTML)
2. **Parámetros**: `?q=<query>&b=<start_index>`
3. **Parsing del HTML respuesta** usando BeautifulSoup o similar
4. **Extrae**: título, URL, descripción (snippet)

```python
#近似 equivalente a lo que hace ddgs internamente:
import httpx

async def ddgs_manual(query: str):
    url = "https://duckduckgo.com/html/"
    params = {"q": query}
    
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        # Luego parsea el HTML de r.text
        # y extrae elementos .result__a, .result__snippet, etc.
```

### ¿Por qué no necesita API Key?

- DuckDuckGo **no requiere autenticación** para búsquedas básicas
- El endpoint `/html/` es público y permite acceso sin rate limiting agresivo
- Es el mismo contenido que ves al visitar duckduckgo.com en un navegador

### Limitaciones conocidas

| Limitación | Descripción |
|------------|-------------|
| Rate limiting | Si haces demasiadas requests, DuckDuckGo puede bloquear tu IP |
| No concurrentes | ddgs no es thread-safe, múltiples búsquedas deben serializarse |
| HTML parsing | Si DuckDuckGo cambia su HTML, la librería puede dejar de funcionar |
| Sin imágenes | Este método solo devuelve resultados de texto |

---

## Patrón de Serialización (Para Múltiples Búsquedas)

Si necesitas hacer múltiples búsquedas concurrentes, debes serializar las de DuckDuckGo:

```python
import asyncio

class SearchManager:
    """Gestor de búsquedas con serialización para DuckDuckGo."""
    
    def __init__(self):
        self._ddg_lock = asyncio.Lock()  # Semáforo para serializar
    
    async def search(self, query: str, provider: str = "duckduckgo"):
        if provider == "duckduckgo":
            async with self._ddg_lock:  # Serializar búsquedas DDG
                return await self._search_duckduckgo(query)
        else:
            return await self._search_other(query, provider)
    
    async def _search_duckduckgo(self, query: str):
        # Tu código de búsqueda DuckDuckGo
        pass
    
    async def _search_other(self, query: str, provider: str):
        # Búsquedas a otros providers pueden ser concurrentes
        pass
```

---

## Integración con FastAPI

```python
from fastapi import FastAPI
import asyncio
from search import DuckDuckGoSearch

app = FastAPI()
search_client = DuckDuckGoSearch()

@app.get("/search")
async def search(q: str, limit: int = 5):
    result = await search_client.search(q, max_results=limit)
    return {"query": q, "results": result}
```

---

## Integración con Discord/Telegram Bot

```python
import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from search import DuckDuckGoSearch

search_client = DuckDuckGoSearch()

async def search_handler(update: Update, context):
    query = update.message.text
    result = await search_client.search(query)
    await update.message.reply_text(result)

# Configurar el bot...
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, search_handler))
```

---

## Troubleshooting

### Error: "ddgs module not found"

```bash
pip install ddgs
```

### Error: "Timeout" o no retorna resultados

- Verifica conexión a internet
- Intenta con un timeout mayor
- Considera usar proxy si estás en una red restringida

### Error: "Too many requests"

- Implementa delay entre búsquedas
- Usa un proxy HTTP
- Considera cambiar a otro provider (Brave, Tavily, Jina)

---

## Código Completo de Referencia

```python
#!/usr/bin/env python3
"""
Búsqueda web con DuckDuckGo sin API Key.
Minimal, async, con timeout y manejo de errores.
"""

import asyncio
import html
import re
from typing import Any
from ddgs import DDGS


def _strip_tags(text: str) -> str:
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', '', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return html.unescape(text).strip()


def _normalize(text: str) -> str:
    text = re.sub(r'[ \t]+', ' ', text)
    return re.sub(r'\n{3,}', '\n\n', text).strip()


async def search(
    query: str,
    max_results: int = 5,
    timeout: float = 15.0
) -> str:
    """
    Búsqueda en DuckDuckGo.
    
    Args:
        query: Término de búsqueda
        max_results: Resultados a retornar (1-10)
        timeout: Timeout en segundos
        
    Returns:
        String formateado con resultados o error
    """
    if not query or not query.strip():
        return "Error: Query vacía"
    
    max_results = max(1, min(max_results, 10))
    
    try:
        ddgs = DDGS(timeout=10)
        
        raw = await asyncio.wait_for(
            asyncio.to_thread(ddgs.text, query.strip(), max_results=max_results),
            timeout=timeout,
        )
        
        if not raw:
            return f"No results for: {query}"
        
        lines = [f"Results for: {query}\n"]
        for i, r in enumerate(raw[:max_results], 1):
            title = _normalize(_strip_tags(r.get("title", "")))
            body = _normalize(_strip_tags(r.get("body", "")))
            href = r.get("href", "")
            lines.append(f"{i}. {title}\n   {href}")
            if body:
                lines.append(f"   {body}")
        
        return "\n".join(lines)
        
    except asyncio.TimeoutError:
        return f"Error: Timeout después de {timeout}s"
    except Exception as e:
        return f"Error: {type(e).__name__} - {e}"


if __name__ == "__main__":
    async def test():
        print(await search("openai gpt-4"))
    
    asyncio.run(test())
```

---

## Referencias

- **ddgs library**: https://github.com/deedy5/ddgs
- **PyPI**: https://pypi.org/project/ddgs/
- **DuckDuckGo HTML**: https://duckduckgo.com/html/