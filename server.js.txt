const express = require("express")

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.send("BOT 7MOBILIDADE ONLINE 🚀")
})

// AQUI depois vamos colocar webhook WhatsApp

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT)
})