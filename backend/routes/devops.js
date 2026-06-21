const express = require('express')
const router  = express.Router()
const axios   = require('axios')
const { authenticate :authMiddleware } = require('../middleware/auth')

const VERCEL_TOKEN    = process.env.VERCEL_TOKEN
const VERCEL_PROJECT  = process.env.VERCEL_PROJECT_ID
const RENDER_KEY      = process.env.RENDER_API_KEY
const RENDER_MKT      = process.env.RENDER_SERVICE_ID_MARKETING
const RENDER_TECH     = process.env.RENDER_SERVICE_ID_TECHEVENT
const GH_TOKEN        = process.env.GITHUB_TOKEN
const GH_OWNER        = process.env.GITHUB_OWNER  || 'amenibahri0002'
const GH_REPO         = process.env.GITHUB_REPO   || 'Name-marketingcloudops'

/* ── helper fetch avec timeout ── */
async function safeFetch(fn) {
  try { return await fn() }
  catch (e) { return null }
}

/* ─────────────────────────────────────────
   GET /api/devops/vercel
   Derniers déploiements Vercel
───────────────────────────────────────── */
router.get('/vercel', authMiddleware, async (req, res) => {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT) {
    return res.status(503).json({ error: 'VERCEL_TOKEN ou VERCEL_PROJECT_ID manquant' })
  }
  const data = await safeFetch(() =>
    axios.get(`https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT}&limit=10`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      timeout: 8000,
    })
  )
  if (!data) return res.status(503).json({ error: 'Vercel API indisponible' })

  const deployments = data.data.deployments.map(d => ({
    id:        d.uid,
    url:       d.url ? `https://${d.url}` : null,
    state:     d.state,          // READY | ERROR | BUILDING | CANCELED
    target:    d.target,         // production | preview
    createdAt: d.createdAt,
    buildTime: d.buildingAt && d.ready ? d.ready - d.buildingAt : null,
    branch:    d.meta?.githubCommitRef || 'main',
    commit:    d.meta?.githubCommitMessage || '',
    commitSha: d.meta?.githubCommitSha?.slice(0, 7) || '',
    author:    d.meta?.githubCommitAuthorName || '',
  }))

  res.json({ deployments })
})

/* ─────────────────────────────────────────
   GET /api/devops/render
   Statut des services Render
───────────────────────────────────────── */
router.get('/render', authMiddleware, async (req, res) => {
  if (!RENDER_KEY) {
    return res.status(503).json({ error: 'RENDER_API_KEY manquant' })
  }

  const headers = { Authorization: `Bearer ${RENDER_KEY}`, Accept: 'application/json' }

  const [mkt, tech] = await Promise.all([
    safeFetch(() => axios.get(`https://api.render.com/v1/services/${RENDER_MKT}`, { headers, timeout: 8000 })),
    safeFetch(() => axios.get(`https://api.render.com/v1/services/${RENDER_TECH}`, { headers, timeout: 8000 })),
  ])

  const [mktDeploys, techDeploys] = await Promise.all([
    safeFetch(() => axios.get(`https://api.render.com/v1/services/${RENDER_MKT}/deploys?limit=5`, { headers, timeout: 8000 })),
    safeFetch(() => axios.get(`https://api.render.com/v1/services/${RENDER_TECH}/deploys?limit=5`, { headers, timeout: 8000 })),
  ])

  const formatService = (svc, deploys) => {
    if (!svc) return null
    const s = svc.data
    return {
      id:          s.id,
      name:        s.name,
      status:      s.suspended === 'suspended' ? 'suspended' : s.serviceDetails?.lastDeployStatus || 'unknown',
      url:         s.serviceDetails?.url || null,
      region:      s.serviceDetails?.region || null,
      plan:        s.serviceDetails?.plan || null,
      createdAt:   s.createdAt,
      updatedAt:   s.updatedAt,
      deploys:     deploys?.data?.map(d => ({
        id:        d.deploy.id,
        status:    d.deploy.status,   // live | build_failed | deactivated | created
        createdAt: d.deploy.createdAt,
        finishedAt:d.deploy.finishedAt,
        commitId:  d.deploy.commit?.id?.slice(0, 7) || '',
        commitMsg: d.deploy.commit?.message || '',
      })) || [],
    }
  }

  res.json({
    services: {
      marketing: formatService(mkt, mktDeploys),
      techevent: formatService(tech, techDeploys),
    }
  })
})

/* ─────────────────────────────────────────
   GET /api/devops/github
   Commits + GitHub Actions runs
───────────────────────────────────────── */
router.get('/github', authMiddleware, async (req, res) => {
  if (!GH_TOKEN) {
    return res.status(503).json({ error: 'GITHUB_TOKEN manquant' })
  }

  const headers = {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const [commitsRes, runsRes, repoRes] = await Promise.all([
    safeFetch(() => axios.get(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/commits?per_page=10`, { headers, timeout: 8000 })),
    safeFetch(() => axios.get(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs?per_page=10`, { headers, timeout: 8000 })),
    safeFetch(() => axios.get(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`, { headers, timeout: 8000 })),
  ])

  const commits = commitsRes?.data?.map(c => ({
    sha:     c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    author:  c.commit.author.name,
    date:    c.commit.author.date,
    url:     c.html_url,
  })) || []

  const runs = runsRes?.data?.workflow_runs?.map(r => ({
    id:          r.id,
    name:        r.name,
    status:      r.status,      // completed | in_progress | queued
    conclusion:  r.conclusion,  // success | failure | cancelled | null
    branch:      r.head_branch,
    commitMsg:   r.head_commit?.message?.split('\n')[0] || '',
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
    duration:    r.updated_at && r.created_at
      ? Math.round((new Date(r.updated_at) - new Date(r.created_at)) / 1000)
      : null,
    url:         r.html_url,
  })) || []

  const repo = repoRes?.data ? {
    name:        repoRes.data.name,
    description: repoRes.data.description,
    stars:       repoRes.data.stargazers_count,
    forks:       repoRes.data.forks_count,
    language:    repoRes.data.language,
    updatedAt:   repoRes.data.updated_at,
    url:         repoRes.data.html_url,
    defaultBranch: repoRes.data.default_branch,
  } : null

  res.json({ commits, runs, repo })
})

/* ─────────────────────────────────────────
   GET /api/devops/summary
   Résumé global pour le dashboard
───────────────────────────────────────── */
router.get('/summary', authMiddleware, async (req, res) => {
  const headers_gh = {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: 'application/vnd.github+json',
  }
  const headers_render = {
    Authorization: `Bearer ${RENDER_KEY}`,
  }

  const [vercelRes, runsRes, mktRes] = await Promise.all([
    VERCEL_TOKEN ? safeFetch(() => axios.get(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT}&limit=1`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }, timeout: 6000 }
    )) : null,
    GH_TOKEN ? safeFetch(() => axios.get(
      `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs?per_page=1`,
      { headers: headers_gh, timeout: 6000 }
    )) : null,
    RENDER_KEY ? safeFetch(() => axios.get(
      `https://api.render.com/v1/services/${RENDER_MKT}`,
      { headers: headers_render, timeout: 6000 }
    )) : null,
  ])

  const lastDeploy   = vercelRes?.data?.deployments?.[0]
  const lastRun      = runsRes?.data?.workflow_runs?.[0]
  const renderStatus = mktRes?.data?.suspended === 'suspended' ? 'suspended' : 'live'

  res.json({
    vercel: {
      lastDeployState: lastDeploy?.state || null,
      lastDeployAt:    lastDeploy?.createdAt || null,
      url:             lastDeploy?.url ? `https://${lastDeploy.url}` : null,
    },
    github: {
      lastRunStatus:     lastRun?.status || null,
      lastRunConclusion: lastRun?.conclusion || null,
      lastRunAt:         lastRun?.created_at || null,
      branch:            lastRun?.head_branch || 'main',
    },
    render: {
      status: renderStatus,
    },
  })
})

module.exports = router;