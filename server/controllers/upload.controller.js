import * as storageService from '../services/storage.service.js';

export async function removeNovelFiles(writerSlug, novelSlug, episodes) {
  // Remove the folder prefix
  const prefix = storageService.buildPdfPath({ 
    writerSlug, 
    novelSlug, 
    episodeNumber: 1, 
    originalName: '' 
  }).split('/').slice(0, 3).join('/');
  await storageService.deleteFolder(prefix);
  // Also remove individual files if any
  for (const episode of episodes) {
    if (episode.pdfPath) {
      await storageService.deleteFile(episode.pdfPath);
    }
  }
}
