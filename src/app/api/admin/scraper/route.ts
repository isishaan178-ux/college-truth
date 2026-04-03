import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

const GITHUB_REPO = 'isishaan178-ux/college-truth'
const WORKFLOW_FILE = 'scraper.yml'

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    const body = await request.json().catch(() => ({}))
    const scraper = body.scraper || 'all'

    const token = process.env.GITHUB_PAT
    if (!token) {
      return Response.json(
        { success: false, error: 'GitHub PAT not configured' },
        { status: 500 }
      )
    }

    // Trigger GitHub Actions workflow via API
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { scraper },
        }),
      }
    )

    if (res.status === 204) {
      return Response.json({
        success: true,
        message: `Scraper "${scraper}" triggered successfully. It will run in the background on GitHub Actions.`,
      })
    }

    const errorText = await res.text()
    console.error('GitHub Actions trigger error:', res.status, errorText)
    return Response.json(
      { success: false, error: 'Failed to trigger scraper' },
      { status: 502 }
    )
  } catch (error: any) {
    console.error('Scraper trigger error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET — check latest workflow run status
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    const token = process.env.GITHUB_PAT
    if (!token) {
      return Response.json(
        { success: false, error: 'GitHub PAT not configured' },
        { status: 500 }
      )
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, error: 'Failed to fetch workflow status' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const runs = (data.workflow_runs || []).map((run: any) => ({
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      trigger: run.event,
      url: run.html_url,
    }))

    return Response.json({ success: true, data: runs })
  } catch (error: any) {
    console.error('Scraper status error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
