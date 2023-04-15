
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
	console.log('MongoDB Connected!');
} catch (err) {
  console.log(err.message);
}

const db = mongoClient.db();

const app = express();
app.use(express.json());

/* Products Routes */
app.post('/participants', async (req, res) => {
  
    const {name} = req.body;
    const novoModelo = {name,lastStatus: Date.now()}

    // verificacoes com joi
    const useSchema = joi.object({name: joi.string().required()})

    const validacao = useSchema.validate(req.body);
    if(validacao.error) return res.status(422).send(validacao.error.details);
    
    try {

        const existeNome = await db.collection('participants').findOne({name: req.body.name});
        // se nao existir retorna nulo e nao entra no if
        if(existeNome) return res.status(409).send("usuario ja cadastrado");
        
        await db.collection('participants').insertOne(novoModelo);
        // res.send("Participante adicionado com sucesso")
        // montar mensagem de post na colleciton mensagem
        const mensagemEntrou = { 
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }

        // realizar post na collection mensagem
        await db.collection('messages').insertOne(mensagemEntrou);
        res.send("mensagem e participante criados com sucesso")
        // res.sendStatus(201);

    } catch (error) {
        
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/participants', async (req, res) => {

  try {
    const participants = await db.collection('participants').find().toArray()
    if (!participants) {
      return res.sendStatus(404);
    }

    res.send(participants);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/messages', async (req, res) => {

    try {
      const messages = await db.collection('messages').find().toArray()
      if (!messages) {
        return res.sendStatus(404);
      }
  
      res.send(messages);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });



// app.post('/products', async (req, res) => {
//   const product = req.body;

//   const userSchema = joi.object({
//     name: joi.string().required(),
//     sku: joi.number().required(),
//     price: joi.number().required()
//   })

//   const validacao = userSchema.validate(product, {abortEarly: false})
//   if (validacao.error) {
//     const errors = validacao.error.details.map((detail) => detail.message);
//     return res.status(422).send(errors);
//   }

//   try {
//     await db.collection('products').insertOne(product)
//     res.sendStatus(201);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// app.put('/customers/:id', async (req, res) => {
//   const id = req.params.id;
//   const {name, sku, price} = req.body;
//   const useSchema = joi.object({
//     name: joi.string(),
//     sku: joi.number(),
//     price: joi.number()
//   })

//   const validacao = useSchema.validate(req.body, {abortEarly: false});

//   if(validacao.error){
//     const errors = validacao.error.details.map((detail) => detail.message);
//     return res.status(422).send(errors);  
//   }

//   try {
//     await db.collection("customers").updateOne(
//       {_id: new ObjectId(id)},
//       {$set: {
//         name, sku, price
//       }}
//     )

//     res.send("editado com sucesso")
//   }catch(err){
//     res.status(422).send(err)
//   }
// })

// app.delete('/products/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     await db.collection('products').deleteOne({ _id: new ObjectId(id) })

//     res.sendStatus(200);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// /* Customers Routes */
// app.get('/customers', async (req, res) => {
//   try {
//     const customers = await db.collection('customers').find().toArray();
//     res.send(customers);
//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// });

// app.get('/customers/:id', async (req, res) => {
//   try {
//     const id = req.params.id;

//     const customer = await db.collection('customers').findOne({ _id: new ObjectId(id) });

//     if (!customer) {
//       return res.sendStatus(404);
//     }

//     res.send(customer);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

// app.post('/customers', async (req, res) => {
//   try {
//     const customer = req.body;

//     await db.collection('customers').insertOne(customer);

//     res.sendStatus(201);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });


// app.delete('/customers/:id', async (req, res) => {
//   try {
//     const id = req.params.id;

//     await db.collection('customers').deleteOne({ _id: new ObjectId(id) });

//     res.sendStatus(200);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

app.listen(5000, () => {
  console.log('Server is litening on port 5000.');
});
