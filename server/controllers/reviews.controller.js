import * as firestoreService from '../services/firestore.service.js';

export async function createReview(req, res) {
  const { rating, reviewText, reviewerName } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    return;
  }

  const novel = await firestoreService.getNovelById(req.params.id);

  if (!novel) {
    res.status(404).json({ message: 'Novel not found.' });
    return;
  }

  const review = await firestoreService.createReview(req.params.id, { rating, reviewerName, reviewText });
  res.status(201).json({ review });
}

export async function listReviews(req, res) {
  const reviews = await firestoreService.listReviewsByNovel(req.params.id);
  res.json({ reviews });
}
