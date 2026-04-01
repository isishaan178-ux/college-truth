export function verifyAdmin(request: Request): boolean {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return false
  return auth.split(' ')[1] === process.env.ADMIN_PASSWORD
}

export function unauthorizedResponse() {
  return Response.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}
