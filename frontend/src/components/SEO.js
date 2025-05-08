// src/components/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url, image }) => {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": url,
    "headline": title,
    "description": description,
    "keywords": keywords,
    ...(image && { image: image })
  };

  return (
    <Helmet htmlAttributes={{ lang: 'tr' }}>
      {/* Sayfa Başlığı */}
      <title>{title}</title>

      {/* Meta Etiketleri */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Etiketleri */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:site_name" content="Kampanya360" />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card Meta Etiketleri */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:site" content="@kampanya360" />

      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
};

export default SEO;
