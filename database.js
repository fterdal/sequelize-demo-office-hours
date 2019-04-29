const Sequelize = require('sequelize')

const db = new Sequelize('postgres://localhost:5432/menu', {
  logging: false,
})

const Food = db.define('food', {
  name: Sequelize.STRING,
})

const Ingredient = db.define('ingredient', {
  name: Sequelize.STRING,
  vegetarian: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
})

// MANY TO MANY RELATIONSHIP
Food.belongsToMany(Ingredient, { through: 'food_ingredient' })
Ingredient.belongsToMany(Food, { through: 'food_ingredient' })

const fakeFoods = [
  { name: 'pizza' },
  { name: 'hot dog' },
  { name: 'salad' },
]

const fakeIngredients = [
  { name: 'dough', vegetarian: true },
  { name: 'sausage' },
  { name: 'lettuce', vegetarian: true },
  { name: 'mustard', vegetarian: true },
]

async function connect () {
  await db.sync({ force: true })
  const [ pizza, hotDog, salad ] = await Food.bulkCreate(fakeFoods, { returning: true })
  const [ dough, sausage, lettuce, mustard ] = await Ingredient.bulkCreate(fakeIngredients, { returning: true })
  // console.log('MAGIC PIZZA', pizza.__proto__)
  await Promise.all([
    pizza.addIngredient(dough),
    pizza.addIngredient(sausage),
    hotDog.addIngredient(sausage),
    mustard.addFood(hotDog),
  ])
  db.close()
}
connect()
