import * as storageService from '../services/storage.service.js';

export async function removeNovelFiles(writerSlug, novelSlug, episodes) {
  console.log("removeNovelFiles: writerSlug:", writerSlug, "novelSlug:", novelSlug);
  // Remove the folder prefix
  const pdfPath = storageService.buildPdfPath({ 
    writerSlug, 
    novelSlug, 
    episodeNumber: 1, 
    originalName: '' 
  });
  console.log("removeNovelFiles: pdfPath:", pdfPath);
  const prefix = pdfPath.split('/').slice(0, 3).join('/');
  console.log("removeNovelFiles: prefix:", prefix);
  await storageService.deleteFolder(prefix);
  console.log("removeNovelFiles: folder deleted");
  // Also remove individual files if any
  for (const episode of episodes) {
    if (episode.pdfPath) {
      console.log("removeNovelFiles: deleting episode.pdfPath:", episode.pdfPath);
      await storageService.deleteFile(episode.pdfPath);
    }
  }
  console.log("removeNovelFiles: done");
}
