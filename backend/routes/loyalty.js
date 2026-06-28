import express from 'express';
import { getLoyalty, setLoyalty } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

async function requireLoyalty(email, next) {
  const loyalty = await getLoyalty(email);
  if (!loyalty) {
    next(new ApiError('Loyalty profile not found', 404));
    return null;
  }
  return loyalty;
}

router.get('/', asyncHandler(async (req, res) => {
  const loyalty = await getLoyalty(req.user.email);
  res.json({ success: true, data: loyalty });
}));

router.put('/coins', asyncHandler(async (req, res, next) => {
  const { coins } = req.body;
  if (coins == null || isNaN(coins)) return next(new ApiError('Valid coins value required', 400));

  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  loyalty.coins = parseInt(coins);
  const data = await setLoyalty(req.user.email, loyalty);
  res.json({ success: true, data, message: `Coins updated to ${data.coins}` });
}));

router.put('/coins/add', asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return next(new ApiError('Valid amount required', 400));

  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  loyalty.coins += parseInt(amount);
  const data = await setLoyalty(req.user.email, loyalty);
  res.json({ success: true, data, message: `+${amount} coins awarded. Total: ${data.coins}` });
}));

router.put('/coins/spend', asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount)) return next(new ApiError('Valid amount required', 400));

  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  const coinAmount = parseInt(amount);
  if (loyalty.coins < coinAmount) {
    return next(new ApiError(`Insufficient coins. Available: ${loyalty.coins}`, 400));
  }

  loyalty.coins -= coinAmount;
  const data = await setLoyalty(req.user.email, loyalty);
  res.json({ success: true, data, message: `Spent ${amount} coins. Remaining: ${data.coins}` });
}));

router.put('/quests/:questId/complete', asyncHandler(async (req, res, next) => {
  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  const questIdx = loyalty.quests.findIndex((q) => q.id === req.params.questId);
  if (questIdx === -1) return next(new ApiError(`Quest '${req.params.questId}' not found`, 404));

  const quest = loyalty.quests[questIdx];
  if (quest.status === 'claimed') {
    return res.json({ success: true, data: loyalty, message: 'Quest already claimed' });
  }

  if (quest.status === 'locked') {
    loyalty.quests[questIdx] = {
      ...quest,
      status: 'completable',
      progressText: '1/1 completed - Reward available!'
    };
  }

  const data = await setLoyalty(req.user.email, loyalty);
  res.json({ success: true, data, message: `Quest '${quest.title}' is now completable` });
}));

router.put('/quests/:questId/claim', asyncHandler(async (req, res, next) => {
  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  const questIdx = loyalty.quests.findIndex((q) => q.id === req.params.questId);
  if (questIdx === -1) return next(new ApiError(`Quest '${req.params.questId}' not found`, 404));

  const quest = loyalty.quests[questIdx];
  if (quest.status !== 'completable') {
    return next(new ApiError(`Quest is not ready to claim. Status: ${quest.status}`, 400));
  }

  loyalty.coins += quest.reward;
  loyalty.quests[questIdx] = {
    ...quest,
    status: 'claimed',
    progressText: `Claimed +${quest.reward} Coins!`
  };

  const data = await setLoyalty(req.user.email, loyalty);
  res.json({
    success: true,
    data,
    message: `Quest claimed! +${quest.reward} coins awarded. Total: ${data.coins}`
  });
}));

router.post('/coupons', asyncHandler(async (req, res, next) => {
  const { code, cost } = req.body;
  if (!code) return next(new ApiError('Coupon code is required', 400));

  const loyalty = await requireLoyalty(req.user.email, next);
  if (!loyalty) return;

  if (loyalty.unlockedCoupons.includes(code)) {
    return next(new ApiError(`Coupon '${code}' is already unlocked`, 409));
  }

  if (cost) {
    const coinCost = parseInt(cost);
    if (loyalty.coins < coinCost) {
      return next(new ApiError(`Insufficient coins. Need ${coinCost}, have ${loyalty.coins}`, 400));
    }
    loyalty.coins -= coinCost;
  }

  loyalty.unlockedCoupons.push(code);
  const data = await setLoyalty(req.user.email, loyalty);
  res.status(201).json({ success: true, data, message: `Coupon '${code}' unlocked successfully` });
}));

export default router;
