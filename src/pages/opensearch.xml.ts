import type { APIRoute } from 'astro';

/**
 * OpenSearch Description Document.
 * Allows browsers to discover and register Suvy as a search engine.
 */
export const GET: APIRoute = async ({ url }) => {
  const baseUrl = `${url.protocol}//${url.host}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                       xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>Suvy</ShortName>
  <Description>Search with Suvy — a personal and private search engine</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" method="get"
       template="${baseUrl}/search?q={searchTerms}"/>
  <Url type="application/x-suggestions+json" method="get"
       template="${baseUrl}/api/suggest?q={searchTerms}"/>
  <moz:SearchForm>${baseUrl}/</moz:SearchForm>
</OpenSearchDescription>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
