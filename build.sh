#!/bin/bash
# สร้าง sitemap.xml + robots.txt  ใช้: ./build.sh https://your-domain.com
D=${1:-${SITE_URL:-https://example.com}}; cd "$(dirname "$0")"
{ echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in *.html; do u="$D/$f"; [ "$f" = index.html ] && u="$D/"; echo "<url><loc>$u</loc><lastmod>$(date +%F)</lastmod></url>"; done
  echo '</urlset>'; } > sitemap.xml
printf 'User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' "$D" > robots.txt
