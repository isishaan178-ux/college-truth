import { timingSafeEqual } from 'crypto'

export function verifyAdmin(request: Request): boolean {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return false
  const token = auth.split(' ')[1]
  const secret = process.env.ADMIN_SECRET
  if (!secret || token.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(secret))
}

export function unauthorizedResponse() {
  return Response.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}
