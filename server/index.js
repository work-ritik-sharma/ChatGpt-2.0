import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import env from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import {Configuration, OpenAIApi} from 'openai'


const app = express()

env.config()

app.use(cors())
app.use(bodyParser.json())


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Allow only 5 requests per minute
  });
  app.use(limiter);


// Configure open api
const configuration = new Configuration({
    organization: "org-vFWhjD9gNwH8sbPUuxKxZEkO",
    apiKey: "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" 
})
const openai = new OpenAIApi(configuration)


// listeninng


// dummy route to test
app.get("/", (req, res) => {
    res.send("Hello World!")
})


//post route for making requests
app.post('/', async (req, res) => {
    const { message } = req.body;
  
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${message}`,
        max_tokens: 100,
        temperature: 0.5,
      });
      res.json({ message: response.data.choices[0].text });
    } catch (e) {
      if (e.response && e.response.status === 429) {
        const retryAfter = e.response.headers['retry-after'];
        if (retryAfter) {
          const waitTime = parseInt(retryAfter, 10) * 1000; // Convert to milliseconds
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          // Retry the request after the wait time
          return app.post(req, res);
        }
      }
      console.log(e);
      res.status(400).send(e);
    }
  });
  


app.listen("3080", ()=>console.log("listening on port 3080"))