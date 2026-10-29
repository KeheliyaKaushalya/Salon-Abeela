require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const Inventory = require('./models/Inventory');

const services = [
  { name:'Haircut & Styling',    price:45,  duration:'60 min',  category:'Hair',    icon:'✂',  description:'Precision cuts tailored to your face shape.' },
  { name:'Hair Coloring',        price:120, duration:'120 min', category:'Hair',    icon:'🎨', description:'Rich tones, vibrant hues, flawless color.' },
  { name:'Highlights & Balayage',price:180, duration:'150 min', category:'Hair',    icon:'✨', description:'Natural sun-kissed looks by specialists.' },
  { name:'Keratin Treatment',    price:250, duration:'180 min', category:'Hair',    icon:'💎', description:'Smooth, frizz-free transformation.' },
  { name:'Hair Extensions',      price:300, duration:'240 min', category:'Hair',    icon:'💇', description:'Volume and length, seamlessly applied.' },
  { name:'Bridal Hair',          price:200, duration:'120 min', category:'Bridal',  icon:'👰', description:'Complete bridal beauty for your special day.' },
  { name:'Facial & Skincare',    price:85,  duration:'75 min',  category:'Skin',    icon:'💆', description:'Rejuvenating treatments for glowing skin.' },
  { name:'Manicure',             price:35,  duration:'45 min',  category:'Nails',   icon:'💅', description:'Immaculate nail care with premium products.' },
  { name:'Pedicure',             price:45,  duration:'60 min',  category:'Nails',   icon:'🦶', description:'Relaxing foot treatment and nail polish.' },
  { name:'Waxing',               price:40,  duration:'30 min',  category:'Body',    icon:'🌿', description:'Smooth skin with gentle wax technique.' },
  { name:'Eyebrow Threading',    price:15,  duration:'20 min',  category:'Face',    icon:'✏', description:'Precision threading for perfect brows.' },
  { name:'Makeup Application',   price:95,  duration:'90 min',  category:'Makeup',  icon:'💄', description:'Professional makeup for any occasion.' },
  { name:'Full Spa Package',     price:380, duration:'300 min', category:'Package', icon:'🌸', description:'Complete head-to-toe luxury treatment.' },
];

const inventoryItems = [
  { name:'Wella Color Cream',       category:'Hair Color', stock:24, minStock:10, price:18.50, unit:'box',    supplier:'Wella' },
  { name:'Keratin Treatment Kit',   category:'Treatment',  stock:5,  minStock:8,  price:85.00, unit:'kit',    supplier:'BrazilianBlowout' },
  { name:'OPI Nail Polish Set',     category:'Nails',      stock:42, minStock:15, price:12.00, unit:'bottle', supplier:'OPI' },
  { name:'Facial Serum',            category:'Skincare',   stock:3,  minStock:10, price:45.00, unit:'bottle', supplier:'La Roche-Posay' },
  { name:'Pro Hair Shampoo',        category:'Hair Care',  stock:18, minStock:12, price:22.00, unit:'bottle', supplier:'Kerastase' },
  { name:'Wax Strips',              category:'Waxing',     stock:120,minStock:50, price:0.50,  unit:'strip',  supplier:'Veet' },
  { name:'Threading Thread',        category:'Threading',  stock:30, minStock:20, price:2.00,  unit:'spool',  supplier:'Local' },
  { name:'Makeup Foundation Set',   category:'Makeup',     stock:8,  minStock:5,  price:55.00, unit:'set',    supplier:'MAC' },
];

const seed = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Inventory.deleteMany();

    await User.create([
      { name:'Abeela Admin', email:'admin@salonabeela.com', password:'admin123', role:'admin', phone:'+94112345678', gender:'Female' },
      { name:'Demo User',    email:'user@example.com',      password:'user1234',  role:'user',  phone:'+94771234567', gender:'Female' },
      { name:'Sara Perera',  email:'sara@example.com',      password:'user1234',  role:'user',  phone:'+94779876543', gender:'Female' },
    ]);
    console.log('✅ Users seeded');

    await Service.insertMany(services);
    console.log('✅ Services seeded');

    await Inventory.insertMany(inventoryItems);
    console.log('✅ Inventory seeded');

    console.log('\n🌸 Seed complete!');
    console.log('Admin:  admin@salonabeela.com / admin123');
    console.log('User:   user@example.com / user1234');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
  process.exit(0);
};

seed();
