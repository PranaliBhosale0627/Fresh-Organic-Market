import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/loyalty - Get all loyalty data (coins, quests, coupons)
router.get('/', (req, res) => {
  const email = req.user.email;
  res.json({ success: true, data: db.loyalties[email] });
});

// PUT /api/loyalty/coins - Update coin balance
router.put('/coins', (req, res, next) => {
  const { coins } = req.body;
  if (coins == null || isNaN(coins)) return next(new ApiError('Valid coins value required', 400));

  const email = req.user.email;
  db.loyalties[email].coins = parseInt(coins);
  res.json({ success: true, data: db.loyalties[email], message: `Coins updated to ${db.loyalties[email].coins}` });
});

// PUT /api/loyalty/coins/add - Add coins to balance
router.put('/coins/add', (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return next(new ApiError('Valid amount required', 400));

  const email = req.user.email;
  db.loyalties[email].coins += parseInt(amount);
  res.json({ success: true, data: db.loyalties[email], message: `+${amount} coins awarded. Total: ${db.loyalties[email].coins}` });
});

// PUT /api/loyalty/coins/spend - Spend coins
router.put('/coins/spend', (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return next(new ApiError('Valid amount required', 400));
  
  const email = req.user.email;
  if (db.loyalties[email].coins < parseInt(amount)) {
    return next(new ApiError(`Insufficient coins. Available: ${db.loyalties[email].coins}`, 400));
  }

  db.loyalties[email].coins -= parseInt(amount);
  res.json({ success: true, data: db.loyalties[email], message: `Spent ${amount} coins. Remaining: ${db.loyalties[email].coins}` });
});

// PUT /api/loyalty/quests/:questId/complete - Mark a quest as completable
router.put('/quests/:questId/complete', (req, res, next) => {
  const email = req.user.email;
  const questIdx = db.loyalties[email].quests.findIndex(q => q.id === req.params.questId);
  if (questIdx === -1) return next(new ApiError(`Quest '${req.params.questId}' not found`, 404));

  const quest = db.loyalties[email].quests[questIdx];
  if (quest.status === 'claimed') {
    return res.json({ success: true, data: db.loyalties[email], message: 'Quest already claimed' });
  }
  if (quest.status === 'locked') {
    db.loyalties[email].quests[questIdx] = {
      ...quest,
      status: 'completable',
      progressText: '1/1 completed - Reward available!'
    };
  }

  res.json({ success: true, data: db.loyalties[email], message: `Quest '${quest.title}' is now completable` });
});

// PUT /api/loyalty/quests/:questId/claim - Claim a quest reward
router.put('/quests/:questId/claim', (req, res, next) => {
  const email = req.user.email;
  const questIdx = db.loyalties[email].quests.findIndex(q => q.id === req.params.questId);
  if (questIdx === -1) return next(new ApiError(`Quest '${req.params.questId}' not found`, 404));

  const quest = db.loyalties[email].quests[questIdx];
  if (quest.status !== 'completable') {
    return next(new ApiError(`Quest is not ready to claim. Status: ${quest.status}`, 400));
  }

  // Award coins
  db.loyalties[email].coins += quest.reward;
  db.loyalties[email].quests[questIdx] = {
    ...quest,
    status: 'claimed',
    progressText: `Claimed +${quest.reward} Coins!`
  };

  res.json({
    success: true,
    data: db.loyalties[email],
    message: `Quest claimed! +${quest.reward} coins awarded. Total: ${db.loyalties[email].coins}`
  });
});

// POST /api/loyalty/coupons - Unlock a coupon code
router.post('/coupons', (req, res, next) => {
  const { code, cost } = req.body;
  if (!code) return next(new ApiError('Coupon code is required', 400));

  const email = req.user.email;
  if (db.loyalties[email].unlockedCoupons.includes(code)) {
    return next(new ApiError(`Coupon '${code}' is already unlocked`, 409));
  }

  // Deduct coin cost if provided
  if (cost) {
    const coinCost = parseInt(cost);
    if (db.loyalties[email].coins < coinCost) {
      return next(new ApiError(`Insufficient coins. Need ${coinCost}, have ${db.loyalties[email].coins}`, 400));
    }
    db.loyalties[email].coins -= coinCost;
  }

  db.loyalties[email].unlockedCoupons.push(code);
  res.status(201).json({
    success: true,
    data: db.loyalties[email],
    message: `Coupon '${code}' unlocked successfully`
  });
});

export default router;
