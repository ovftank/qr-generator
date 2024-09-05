import { createWriteStream } from "fs";
import path from "path";
import { SitemapStream } from "sitemap";
import { fileURLToPath } from "url";

// Tạo __dirname thay thế
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Các route của ứng dụng
const routes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/qr", changefreq: "weekly", priority: 0.8 },
  { url: "/images", changefreq: "weekly", priority: 0.8 },
  { url: "/settings", changefreq: "weekly", priority: 0.6 },
];

const sitemapPath = path.resolve(__dirname, "dist", "sitemap.xml");
const writeStream = createWriteStream(sitemapPath);

const sitemap = new SitemapStream({ hostname: "https://app.ovfteam.com" });

sitemap.pipe(writeStream);

routes.forEach((route) => {
  console.log("Writing route:", route);
  sitemap.write(route);
});

sitemap.end();

writeStream.on("finish", () => {
  console.log("Sitemap created successfully!");
});

writeStream.on("error", (err) => {
  console.error("Error writing sitemap:", err);
});
