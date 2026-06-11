import './loadEnv.js';
import { createClient } from '@sanity/client';

export const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '6992crjl';
export const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
export const SANITY_API_VERSION = '2024-01-01';

function getSanityToken() {
  const token = process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;
  const trimmed = token?.trim();
  return trimmed || undefined;
}

function createReadClient() {
  const token = getSanityToken();
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token,
    useCdn: !token,
  });
}

export const readClient = createReadClient();

export function writeClient() {
  const token = process.env.SANITY_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error('SANITY_WRITE_TOKEN is not configured on the server');
  }
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token,
    useCdn: false,
  });
}

const articleFields = `{
  "id": _id,
  title,
  "slug": slug.current,
  description,
  published,
  publishedAt,
  "createdAt": _createdAt,
  "pdfUrl": pdf.asset->url,
  "pdfFile": pdf.asset->originalFilename
}`;

export function mapArticle(doc) {
  if (!doc) return null;
  return {
    id: doc.id || doc._id,
    slug: doc.slug?.current || doc.slug,
    title: doc.title,
    description: doc.description || '',
    pdfUrl: doc.pdfUrl || '',
    pdfFile: doc.pdfFile || '',
    published: Boolean(doc.published),
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt || doc._createdAt,
  };
}

export function mapVideo(doc) {
  if (!doc) return null;
  return {
    id: doc.id || doc._id,
    title: doc.title,
    description: doc.description || '',
    youtubeUrl: doc.youtubeUrl,
    videoId: doc.videoId,
    published: Boolean(doc.published),
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt || doc._createdAt,
  };
}

export async function getPublishedArticles() {
  const docs = await readClient.fetch(
    `*[_type == "article" && published == true] | order(publishedAt desc) ${articleFields}`
  );
  return docs.map(mapArticle);
}

export async function getArticleBySlug(slug) {
  const doc = await readClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] ${articleFields}`,
    { slug }
  );
  const article = mapArticle(doc);
  if (!article || !article.published) return null;
  return article;
}

export async function getAllArticles() {
  const docs = await readClient.fetch(
    `*[_type == "article"] | order(_createdAt desc) ${articleFields}`
  );
  return docs.map(mapArticle);
}

export async function getPublishedVideos() {
  const docs = await readClient.fetch(
    `*[_type == "video" && published == true] | order(publishedAt desc) {
      "id": _id,
      title,
      description,
      youtubeUrl,
      videoId,
      published,
      publishedAt,
      "createdAt": _createdAt
    }`
  );
  return docs.map(mapVideo);
}

export async function getAllVideos() {
  const docs = await readClient.fetch(
    `*[_type == "video"] | order(_createdAt desc) {
      "id": _id,
      title,
      description,
      youtubeUrl,
      videoId,
      published,
      publishedAt,
      "createdAt": _createdAt
    }`
  );
  return docs.map(mapVideo);
}

export async function slugExists(slug) {
  const count = await readClient.fetch(
    `count(*[_type == "article" && slug.current == $slug])`,
    { slug }
  );
  return count > 0;
}

export async function createArticle({ title, slug, description, published, pdfBuffer, filename }) {
  const client = writeClient();
  const asset = await client.assets.upload('file', pdfBuffer, {
    filename,
    contentType: 'application/pdf',
  });

  const now = new Date().toISOString();
  const doc = await client.create({
    _type: 'article',
    title,
    slug: { _type: 'slug', current: slug },
    description: description || '',
    published,
    publishedAt: now,
    pdf: {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    },
  });

  return mapArticle({
    ...doc,
    slug: { current: slug },
    pdfUrl: asset.url,
    pdfFile: filename,
    createdAt: now,
  });
}

export async function updateArticle(id, { title, description, published }) {
  const client = writeClient();
  const patch = client.patch(id);
  if (title?.trim()) patch.set({ title: title.trim() });
  if (description !== undefined) patch.set({ description: description.trim() });
  if (published !== undefined) {
    patch.set({ published });
    if (published) patch.set({ publishedAt: new Date().toISOString() });
  }
  await patch.commit();
  const doc = await client.fetch(`*[_id == $id][0] ${articleFields}`, { id });
  return mapArticle(doc);
}

export async function deleteArticle(id) {
  const client = writeClient();
  const doc = await client.fetch(`*[_id == $id][0]{ pdf { asset->{ _id } } }`, { id });
  await client.delete(id);
  const assetId = doc?.pdf?.asset?._id;
  if (assetId) {
    try {
      await client.delete(assetId);
    } catch {
      /* asset may already be removed */
    }
  }
}

export async function createVideo({ title, description, youtubeUrl, videoId, published }) {
  const client = writeClient();
  const now = new Date().toISOString();
  const doc = await client.create({
    _type: 'video',
    title,
    description: description || '',
    youtubeUrl,
    videoId,
    published,
    publishedAt: now,
  });
  return mapVideo({ ...doc, createdAt: now });
}

export async function updateVideo(id, { title, description, youtubeUrl, videoId, published }) {
  const client = writeClient();
  const patch = client.patch(id);
  if (title?.trim()) patch.set({ title: title.trim() });
  if (description !== undefined) patch.set({ description: description.trim() });
  if (youtubeUrl) patch.set({ youtubeUrl: youtubeUrl.trim() });
  if (videoId) patch.set({ videoId });
  if (published !== undefined) {
    patch.set({ published });
    if (published) patch.set({ publishedAt: new Date().toISOString() });
  }
  await patch.commit();
  const doc = await client.fetch(
    `*[_id == $id][0] {
      "id": _id,
      title,
      description,
      youtubeUrl,
      videoId,
      published,
      publishedAt,
      "createdAt": _createdAt
    }`,
    { id }
  );
  return mapVideo(doc);
}

export async function deleteVideo(id) {
  const client = writeClient();
  await client.delete(id);
}
