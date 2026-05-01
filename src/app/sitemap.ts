import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://saigaishi-navi.vercel.app';
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/db-expansion`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/internal-links`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/revenue`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/seo-checklist`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/admin/update-monitor`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/ads-policy`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/disasters`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/disclaimer`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/lessons`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/school-navi`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/school-navi/coast-guard`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/school-navi/fire`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/school-navi/police`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/school-navi/sdf`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/stats`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/tags`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }
  ];
}
