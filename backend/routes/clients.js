// backend/routes/clients.js - CORRIGÉ
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// GET /api/clients - Tous les clients (avec inscriptions dynamiques)
router.get('/', async (req, res) => {
  try {
    // 1. Récupérer tous les clients avec leurs users
    const clientsFromTable = await prisma.client.findMany({
      include: {
        users: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Récupérer TOUTES les inscriptions (pour compter par client via userId)
    const allInscriptions = await prisma.inscription.findMany({
      include: {
        campagne: { select: { id: true, title: true, prix: true } }
      }
    })

    // 3. Récupérer les Users sans Client
    const usersWithInscriptions = await prisma.user.findMany({
      where: {
        clientId: null,
        inscription: { some: {} }
      },
      include: {
        inscription: {
          include: {
            campagne: { select: { id: true, title: true, prix: true } }
          }
        }
      }
    })

    // 4. Fusionner et compter
    const allClients = []

    clientsFromTable.forEach(client => {
      // Récupérer les IDs des users de ce client
      const userIds = client.users?.map(u => u.id) || []
      
      // Filtrer les inscriptions qui ont userId dans cette liste
      const clientInscriptions = allInscriptions.filter(i => 
        userIds.includes(i.userId)
      )
      
      const inscriptionsCount = clientInscriptions.length
      const revenusTotal = clientInscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0)

      allClients.push({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        type: client.type || 'particulier',
        sector: client.sector,
        status: client.status || 'active',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        inscriptionsCount: inscriptionsCount,
        usersCount: client.users?.length || 0,
        revenusTotal: revenusTotal,
        users: client.users || [],
        source: 'client_table'
      })
    })

    // Ajouter les users sans client
    usersWithInscriptions.forEach(user => {
      const userInscriptions = user.inscription || []
      allClients.push({
        id: user.id,
        name: user.name || 'Utilisateur',
        email: user.email,
        phone: user.phone || '',
        type: user.type || 'particulier',
        sector: user.sector || '',
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        inscriptionsCount: userInscriptions.length,
        usersCount: 1,
        revenusTotal: userInscriptions.reduce((sum, i) => sum + (i.prixTotal || 0), 0),
        users: [{ id: user.id, name: user.name, email: user.email }],
        source: 'user_table'
      })
    })

    console.log(`[CLIENTS] ${allClients.length} clients retournés`)
    res.json(allClients)
  } catch (err) {
    console.error('[CLIENTS ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/clients/:id - Détail d'un client
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    let client = await prisma.client.findUnique({
      where: { id },
      include: {
        users: true,
        inscription: {
          include: {
            campagne: { select: { id: true, title: true, image: true, prix: true } }
          }
        }
      }
    })

    if (!client) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          inscription: {
            include: {
              campagne: { select: { id: true, title: true, image: true, prix: true } }
            }
          }
        }
      })

      if (user) {
        const userInscriptions = user.inscription || []
        client = {
          id: user.id,
          name: user.name || 'Utilisateur',
          email: user.email,
          phone: user.phone || '',
          type: user.type || 'particulier',
          sector: user.sector || '',
          status: user.status || 'active',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          inscription: userInscriptions,
          inscriptionsCount: userInscriptions.length,
          users: [{ id: user.id, name: user.name, email: user.email }],
          source: 'user_table'
        }
      }
    }

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' })
    }

    res.json(client)
  } catch (err) {
    console.error('[CLIENT DETAIL ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/clients - Créer un client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, type, sector } = req.body
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || '',
        type: type || 'particulier',
        sector: sector || '',
        status: 'active'
      }
    })
    res.status(201).json(client)
  } catch (err) {
    console.error('[CREATE CLIENT ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/clients/:id - Modifier un client
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { name, email, phone, type, sector, status } = req.body
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(type !== undefined && { type }),
        ...(sector !== undefined && { sector }),
        ...(status !== undefined && { status })
      }
    })
    res.json(client)
  } catch (err) {
    console.error('[UPDATE CLIENT ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/clients/:id - Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.client.delete({ where: { id } })
    res.json({ message: 'Client supprimé' })
  } catch (err) {
    console.error('[DELETE CLIENT ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router