const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// GET /api/clients - Tous les clients (avec inscriptions dynamiques)
router.get('/', async (req, res) => {
  try {
    // 1. Récupérer tous les clients de la table Client avec leurs relations
    const clientsFromTable = await prisma.client.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        inscriptions: {
          include: {
            campagne: { select: { id: true, title: true, prix: true } }
          }
        },
        _count: {
          select: { inscriptions: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Récupérer les Users qui ont des inscriptions mais pas de Client associé
    const usersWithInscriptions = await prisma.user.findMany({
      where: {
        inscriptions: { some: {} }
      },
      include: {
        inscriptions: {
          include: {
            campagne: { select: { id: true, title: true, prix: true } }
          }
        },
        client: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 3. Fusionner les deux listes (éviter les doublons)
    const allClients = []
    const addedIds = new Set()

    // Ajouter les clients de la table Client (avec données enrichies)
    clientsFromTable.forEach(client => {
      const inscriptionsCount = client._count?.inscriptions || client.inscriptions?.length || 0
      const revenusTotal = client.inscriptions?.reduce((sum, i) => sum + (i.prixTotal || i.campagne?.prix || 0), 0) || 0
      
      allClients.push({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        type: client.type || 'particulier',
        sector: client.sector,
        status: client.status || 'active',
        fcmToken: client.fcmToken,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        inscriptionsCount: inscriptionsCount,
        usersCount: client._count?.users || client.users?.length || 0,
        revenusTotal: revenusTotal,
        inscriptions: client.inscriptions || [],
        users: client.users || [],
        source: 'client_table'
      })
      addedIds.add(`client_${client.id}`)
    })

    // Ajouter les Users qui n'ont pas de Client associé (inscriptions via user direct)
    usersWithInscriptions.forEach(user => {
      // Si l'user a déjà un client associé qui est dans la liste, ne pas dupliquer
      if (user.clientId && addedIds.has(`client_${user.clientId}`)) {
        return
      }
      
      // Si l'user n'a pas de client, l'ajouter comme client virtuel
      if (!user.clientId) {
        const inscriptionsCount = user.inscriptions?.length || 0
        const revenusTotal = user.inscriptions?.reduce((sum, i) => sum + (i.prixTotal || i.campagne?.prix || 0), 0) || 0
        
        allClients.push({
          id: user.id,
          name: user.name || 'Utilisateur',
          email: user.email,
          phone: user.phone || '',
          type: user.type || 'particulier',
          sector: user.sector || '',
          status: user.status || 'active',
          fcmToken: null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          inscriptionsCount: inscriptionsCount,
          usersCount: 1,
          revenusTotal: revenusTotal,
          inscriptions: user.inscriptions || [],
          users: [{ id: user.id, name: user.name, email: user.email, role: user.role }],
          source: 'user_table'
        })
      }
    })

    console.log(`[CLIENTS] ${allClients.length} clients retournés (${clientsFromTable.length} depuis Client + ${usersWithInscriptions.length} depuis User)`)
    res.json(allClients)
  } catch (err) {
    console.error('[CLIENTS ERROR]', err)
    res.status(500).json({ error: err.message, clients: [] })
  }
})

// GET /api/clients/:id - Détail d'un client
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    
    // Essayer d'abord dans la table Client
    let client = await prisma.client.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        inscriptions: {
          include: {
            campagne: { select: { id: true, title: true, image: true, prix: true } }
          }
        },
        _count: { select: { inscriptions: true } }
      }
    })

    // Si pas trouvé, chercher dans User
    if (!client) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          inscriptions: {
            include: {
              campagne: { select: { id: true, title: true, image: true, prix: true } }
            }
          }
        }
      })
      
      if (user) {
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
          inscriptions: user.inscriptions || [],
          inscriptionsCount: user.inscriptions?.length || 0,
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