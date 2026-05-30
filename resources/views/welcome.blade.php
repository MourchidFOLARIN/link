<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="theme-color" content="#0f172a">
    <meta name="description" content="ExellenceLink est le gestionnaire de liens intelligent développé par Mourchid FOLARIN pour Excellence Team. Organisez, prévisualisez et partagez vos liens préférés en toute sécurité.">
    <meta name="keywords" content="Mourchid FOLARIN, Excellence Team, ExellenceLink, gestionnaire de liens, raccourcisseur de liens, partage de liens, outils web">
    <meta name="author" content="Mourchid FOLARIN">
    <meta name="application-name" content="ExellenceLink">
    <meta name="apple-mobile-web-app-title" content="ExellenceLink">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://exellenceteam.alwaysdata.net/">
    <meta property="og:title" content="ExellenceLink - Par Mourchid FOLARIN & Excellence Team">
    <meta property="og:description" content="Découvrez ExellenceLink, le gestionnaire de liens intelligent officiel développé par Mourchid FOLARIN pour Excellence Team.">
    <meta property="og:image" content="https://exellenceteam.alwaysdata.net/logo.jpeg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://exellenceteam.alwaysdata.net/">
    <meta property="twitter:title" content="ExellenceLink - Par Mourchid FOLARIN & Excellence Team">
    <meta property="twitter:description" content="Découvrez ExellenceLink, le gestionnaire de liens intelligent officiel développé par Mourchid FOLARIN pour Excellence Team.">
    <meta property="twitter:image" content="https://exellenceteam.alwaysdata.net/logo.jpeg">

    <!-- Données structurées Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ExellenceLink",
      "url": "https://exellenceteam.alwaysdata.net",
      "description": "ExellenceLink est le gestionnaire de liens intelligent officiel développé par Mourchid FOLARIN pour Excellence Team.",
      "author": {
        "@type": "Person",
        "name": "Mourchid FOLARIN",
        "jobTitle": "Développeur & Fondateur",
        "sameAs": [
          "https://github.com/MourchidFOLARIN"
        ]
      },
      "creator": {
        "@type": "Organization",
        "name": "Excellence Team",
        "url": "https://exellenceteam.alwaysdata.net"
      }
    }
    </script>

    <title>ExellenceLink - Par Mourchid FOLARIN & Excellence Team</title>
    <link rel="manifest" href="/build/manifest.webmanifest">
    <link rel="icon" href="/logo.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/logo.svg">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased bg-slate-950 text-slate-100">
    <div id="app"></div>
</body>
</html>
