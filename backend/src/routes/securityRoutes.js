import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import {
  getLoginActivity,
  getUserLoginHistory,
  getUserActivity,
  getGlobalActivity,
  getSessions,
  getUserSessions,
  forceLogoutSession,
  logoutAllSessions,
} from '../controllers/securityController.js'

const router = Router()

router.use(requireAuth)

// Login Activity
router.get('/login-activity', requirePermission('activity.view'), getLoginActivity)
router.get('/users/:id/login-history', requirePermission('activity.view'), getUserLoginHistory)

// Per-user + global activity/audit
router.get('/users/:id/activity', requirePermission('activity.view'), getUserActivity)
router.get('/activity', requirePermission('activity.view'), getGlobalActivity)

// Active session detection
router.get('/sessions', requirePermission('sessions.view'), getSessions)
router.get('/users/:id/sessions', requirePermission('sessions.view'), getUserSessions)

// Force logout / session revocation
router.delete('/sessions/:sessionId', requirePermission('sessions.force_logout'), forceLogoutSession)
router.post('/users/:id/sessions/logout-all', requirePermission('sessions.force_logout'), logoutAllSessions)

export default router
