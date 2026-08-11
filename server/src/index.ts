import app from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`CarRada server listening on http://localhost:${PORT}`);
});
