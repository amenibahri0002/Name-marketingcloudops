import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import "./Register.css"

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const contact = { name, email, phone }
    const API_URL = "https://techevent-app.onrender.com"

    try {
      const res = await fetch(API_URL + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      })

      if (!res.ok) {
        // si status HTTP non OK
        const errData = await res.json()
        throw new Error(errData.message || "Erreur serveur")
      }

      const data = await res.json()
      console.log("Réponse backend :", data)
      setSubmitted(true)

    } catch (err) {
      console.error("Erreur :", err)
      setError(err.message || "Erreur de connexion au serveur !")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="register">
        <Navbar />
        <div className="register-wrapper">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Inscription confirmée !</h2>
            <p>Merci <strong>{name}</strong>, votre place est réservée.</p>
            <p className="success-detail">Confirmation à <strong>{email}</strong></p>
            <Link to="/">
              <button className="btn btn-secondary" style={{ marginTop: "24px" }}>
                Retour
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register">
      <Navbar />
      <div className="register-wrapper">
        <div className="register-info">
          <span className="tag tag-accent">Conference IA 2026</span>
          <h1 className="register-title">Réservez<br />votre place</h1>
          <div className="register-event-card">
            <div className="event-line">
              <span className="event-label">Date</span>
              <span>20 Mai 2026</span>
            </div>
            <div className="event-line">
              <span className="event-label">Lieu</span>
              <span>Palais des Congrès, Tunis</span>
            </div>
            <div className="event-line">
              <span className="event-label">Tarif</span>
              <span className="price-highlight">50 TND <small>Early Bird</small></span>
            </div>
            <div className="event-line">
              <span className="event-label">Inclus</span>
              <span>Déjeuner + Cocktail</span>
            </div>
          </div>
          <p className="register-note">Il reste <strong>47 places</strong> au tarif Early Bird.</p>
        </div>

        <div className="register-form-card" id="register-form">
          <h2>Vos informations</h2>
          <p className="form-subtitle">Remplissez le formulaire pour confirmer</p>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="field">
              <label>Nom complet</label>
              <input
                type="text"
                placeholder="Ex : Nom Prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Adresse email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Téléphone</label>
              <input
                type="tel"
                placeholder="+216 XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={"btn btn-primary submit-btn" + (loading ? " loading" : "")}
              disabled={loading}
            >
              {loading ? "Traitement..." : "Confirmer l'inscription"}
            </button>
          </form>
          <p className="form-legal">Remboursement possible jusqu'au 1er mai 2026.</p>
        </div>
      </div>
    </div>
  )
}

export default Register