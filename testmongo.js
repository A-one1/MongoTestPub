const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri =
  "mongodb+srv://test:test@sample415.v6mmlhp.mongodb.net/?retryWrites=true&w=majority&appName=sample415";

// --- This is the standard stuff to get it to work on the browser
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

app.listen(port);
app.use(cookieParser());

console.log("Server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get("/", function (req, res) {
  var outstring = " ";
  const mymessage = req.query;
  if (mymessage.message) {
    outstring += `<p style="color:red;background-color:yellow;"><b><center>${mymessage.message} </center></b> </p>`;
  }
  mycookies = req.cookies;

  outstring += "Default endpoint starting on date: " + Date.now() + "\n";
  //T4. link references
  outstring += '<p> <a href="/getcookie">View cookies</a>';
  outstring += '<p> <a href="/clearcookie">Clear cookies</a><br><br>';
  outstring += `<b> Cookie Status: </b>`;

  console.log("asdas", mycookies);

  if (Object.keys(mycookies).length != 0) {
    outstring += "EXISTS <br>";
  } else {
    outstring += "NOT FOUND";
    outstring += `
    
    <style>
  
    form {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 5px;
    }
    input {
      margin-bottom: 10px;
    }
  </style>
  <div style=" display: flex;
    justify-content: center;
    align-items: center;
    height: 40vh;
    font-size: 20px;">
  <div id="loginForm">
    <form action="/login" method="post">
     <p><b><center> Login  </center></b></p>
      Username: <input type="text" name="username"><br>
      Password: <input type="password" name="password"><br>
      <input type="submit" value="Login">
    </form>
    Don't have an account? <button onclick="showRegisterForm()">Sign up here</button>
  </div>
  
  <div id="registerForm" style="display: none;">
    <form action="/register" method="post">
    <p><b><center> Register  </center></b></p>
    <span style="font-size:13px;">  Username and Password should be atleast 5 characters long</span><br><br>
    Username: <input type="text" name="username"><br>
      Password: <input type="password" name="password"><br>
      <input type="submit" value="Register">
    </form>
    Already have an account? <button onclick="showLoginForm()">Login here</button>
  </div>
  </div>
  
  <script>
    function showRegisterForm() {
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("registerForm").style.display = "block";
    }
    function showLoginForm() {
      document.getElementById("registerForm").style.display = "none";
      document.getElementById("loginForm").style.display = "block";
    }
  </script>
  
`;
  }

  res.send(outstring);
});

app.get("/getcookie", function (req, res) {
   //T4 REF-1 link references

  outstring = '<p> <a href="/">GO TO HOME</a><br>';
  outstring += '<p> <a href="/clearcookie">Clear cookies</a><br><br>';

  console.log("Cookies: ", req.cookies);

  console.log("Signed Cookies: ", req.signedCookies);

  mycookies = JSON.stringify(req.cookies);
  outstring += `<p> Signed COokies: ${mycookies}</a>`;

  res.send(outstring);
});

//T5. Clearing all cookies
app.get("/clearcookie", function (req, res) {
   //T4 REF-2 link references

  outstring = '<p> <a href="/">GO TO HOME</a><br>';
  outstring += '<p> <a href="/getcookie">View cookies</a><br><br>';

  for (var c in req.cookies) {
    res.clearCookie(c);
  }
  outstring +=
    "Cookie deleted " +
    req.params.cookiename +
    " All cookies have been deleted";

  res.send(outstring);
});

app.get("/say/:name", function (req, res) {
  res.send("Hello " + req.params.name + "!");
});

// Route to access database:
app.post("/login", function (req, res) {
  const client = new MongoClient(uri);
  const username = req.body.username;
  const password = req.body.password;
  console.log("Looking for: " + username, password);

  //T1. Creating user credentials as records, id and password
  async function run() {
    try {
      const database = client.db("sample415");
      const user_collection = database.collection("user_cred");

      const user = await user_collection.findOne({
        id: username,
        password: password,
      });

      console.log("this is the user ", user);

      if (user) {
        //T3.2 Successful login creates cookie
        res.cookie("auth", "valid", { maxAge: 30000 }); // Set cookie to expire in 1 minute
        res.redirect(
          "/?message=Login successful. You can view the cookie. Expires in 60 second"
        );
      } else {
        //T3.1 unsucessful login
        res.redirect("/?message=Invalid credentials. ");
      }
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);

});

  //T2. registering user
  app.post("/register", function (req, res) {
    const client = new MongoClient(uri);
    const username = req.body.username;
    const password = req.body.password;

    async function run() {
      try {
        await client.connect();
        const database = client.db("sample415");
        const user_collection = database.collection("user_cred");

        // Check if the user already exists
        const user = await user_collection.findOne({ id: username });
        if (user) {
          res.redirect("/?message=User already exists.");
        } else {
          // If the user does not exist, insert the new user into the database
          const newUser = { id: username, password: password };
          const result = await user_collection.insertOne(newUser);
          console.log(
            `New user created with the following id: ${result.insertedId}`
          );
          res.redirect(
            "/?message=Registration successful. You can now log in."
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        await client.close();
      }
    }
    run().catch(console.dir);
  });




