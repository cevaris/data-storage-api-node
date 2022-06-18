import { app } from './src/app';

if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000
  app.listen((port), () => {
    console.log(`App listening at http://localhost:${port}`)
  })
}
