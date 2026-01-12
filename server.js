
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// A Hostinger define a porta dinamicamente via process.env.PORT
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos do frontend (se estiverem na mesma pasta)
app.use(express.static(path.join(__dirname, 'public_html')));

// Inicializar banco de dados se não existir
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ 
    users: [], 
    shops: [], 
    appointments: [], 
    customers: [], 
    finances: [] 
  }));
}

// Helpers para ler/escrever no arquivo
const getData = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveData = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Auth Middleware (Simplificado: usa o ID do usuário como token)
const auth = (req, res, next) => {
  const db = getData();
  const token = req.headers.authorization?.split(' ')[1];
  const user = db.users.find(u => u.id === token);
  if (!user) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  req.user = user;
  next();
};

// --- ROTAS DA API ---

// 1. Registro
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const db = getData();
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
  }
  const newUser = { 
    id: 'u' + Date.now(), 
    name, 
    email, 
    password, 
    role: 'BARBER', 
    barbershopId: null, 
    commission: 0.5 
  };
  db.users.push(newUser);
  saveData(db);
  res.json({ token: newUser.id });
});

// 2. Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = getData();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ token: user.id });
  } else {
    res.status(400).json({ message: 'E-mail ou senha incorretos.' });
  }
});

// 3. Sincronização de Dados (Sync)
app.get('/api/sync', auth, (req, res) => {
  const db = getData();
  const user = req.user;
  const shop = db.shops.find(s => s.id === user.barbershopId);
  const team = db.users.filter(u => u.barbershopId === user.barbershopId);
  const teamIds = team.map(t => t.id);

  res.json({
    user,
    barbershop: shop || null,
    team,
    appointments: db.appointments.filter(a => teamIds.includes(a.barberId)),
    customers: db.customers.filter(c => teamIds.includes(c.responsibleBarberId)),
    finances: db.finances.filter(f => teamIds.includes(f.barberId))
  });
});

// 4. Criar Barbearia
app.post('/api/barbershop', auth, (req, res) => {
  const db = getData();
  const shopId = 'shop_' + Date.now();
  const newShop = {
    ...req.body,
    id: shopId,
    ownerId: req.user.id,
    inviteCode: Math.random().toString(36).substring(7).toUpperCase()
  };
  db.shops.push(newShop);
  // Atualiza o usuário para ser OWNER
  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  db.users[userIdx].barbershopId = shopId;
  db.users[userIdx].role = 'OWNER';
  saveData(db);
  res.json(newShop);
});

// 5. Entrar em Barbearia (Join)
app.post('/api/barbershop/join', auth, (req, res) => {
  const { code } = req.body;
  const db = getData();
  const shop = db.shops.find(s => s.inviteCode === code.toUpperCase());
  if (!shop) return res.status(404).json({ message: 'Código de convite inválido.' });

  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  db.users[userIdx].barbershopId = shop.id;
  db.users[userIdx].role = 'BARBER';
  saveData(db);
  res.json({ success: true });
});

// 6. Criar Cliente
app.post('/api/customers', auth, (req, res) => {
  const db = getData();
  const newCustomer = {
    ...req.body,
    id: 'c' + Date.now(),
    responsibleBarberId: req.user.id,
    lastVisit: new Date().toISOString(),
    totalSpent: 0
  };
  db.customers.push(newCustomer);
  saveData(db);
  res.json(newCustomer);
});

// 7. Agendamentos (com check de colisão)
app.post('/api/appointments', auth, (req, res) => {
  const db = getData();
  const { customerId, time } = req.body;

  const collision = db.appointments.find(a => 
    a.customerId === customerId && 
    a.time === time && 
    a.status !== 'CANCELLED'
  );

  if (collision) {
    return res.status(400).json({ message: 'Este cliente já possui um agendamento para este horário.' });
  }

  const newApp = {
    ...req.body,
    id: 'a' + Date.now(),
    barberId: req.user.id,
    status: req.body.status || 'PENDING'
  };
  db.appointments.push(newApp);
  saveData(db);
  res.json(newApp);
});

// 8. Finalizar Agendamento e Gerar Financeiro
app.post('/api/appointments/:id/complete', auth, (req, res) => {
  const db = getData();
  const appIdx = db.appointments.findIndex(a => a.id === req.params.id);
  if (appIdx === -1) return res.status(404).json({ message: 'Agendamento não encontrado.' });
  
  const app = db.appointments[appIdx];
  db.appointments[appIdx].status = 'COMPLETED';

  // Registrar finança
  const barber = db.users.find(u => u.id === app.barberId);
  const commission = barber?.commission || 0.5;
  const barberAmount = app.price * commission;
  const houseAmount = app.price - barberAmount;

  const finance = {
    id: 'f' + Date.now(),
    barberId: app.barberId,
    amount: app.price,
    houseAmount,
    barberAmount,
    date: new Date().toISOString(),
    description: `${app.serviceName}`
  };
  db.finances.push(finance);

  // Atualizar gasto do cliente
  const custIdx = db.customers.findIndex(c => c.id === app.customerId);
  if (custIdx !== -1) {
    db.customers[custIdx].totalSpent = (db.customers[custIdx].totalSpent || 0) + app.price;
    db.customers[custIdx].lastVisit = new Date().toISOString();
  }

  saveData(db);
  res.json({ success: true });
});

// 9. Atualizar Comissão
app.patch('/api/barbers/:id/commission', auth, (req, res) => {
  const { commission } = req.body;
  const db = getData();
  const barberIdx = db.users.findIndex(u => u.id === req.params.id);
  if (barberIdx === -1) return res.status(404).json({ message: 'Barbeiro não encontrado.' });

  db.users[barberIdx].commission = commission;
  saveData(db);
  res.json({ success: true });
});

// Fallback para o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor BarberPro rodando na porta ${PORT}`);
});
