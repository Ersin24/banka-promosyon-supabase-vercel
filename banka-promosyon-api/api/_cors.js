// CORS middleware
export function allowCors(handler) {
    return async (req, res) => {
      res.setHeader("Access-Control-Allow-Credentials", true);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
      res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");
  
      if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
      }
  
      return await handler(req, res);
    };
  }
  