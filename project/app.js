const express = require("express");
const app = express();
const hostname = 'localhost';
const port = 3000;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate")
const passport = require("passport")
const User = require("./models/user.js")
const LocalStrategy = require("passport-local")

const session = require("express-session")
const flash = require("connect-flash")

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")))
app.engine("ejs", ejsmate)

const sessionOptions = {
  secret : "mysecret",
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 100,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
}
app.get("/", (req, res) => {
  res.send("Hi, I am Home");
});

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.curruser = req.user
  next()
})

// app.get("/demouser",async (req,res) => {
//   let fakeuser = new User({
//     email : "abhaykumar@gmail.com",
//     username : "abhaykumar"
//   })
//   let reguser = await User.register(fakeuser,"helloworld")
//   res.send(reguser)
// })

app.use("/listings",listingRouter)    // listing file
app.use("/listings/:id/reviews",reviewRouter)  // reviews file
app.use("/",userRouter)

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"))
})

app.use((err, req, res, next) => {
  let { status = 500, message = "SomeThing Went Wrong " } = err
  // res.status(status).send(message)
  res.render("listings/error.ejs", { message, status })
})


app.listen(port, hostname, () => {
console.log(`Server running at http://${hostname}:${port}/`);
});



// // first type

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsmate = require("ejs-mate")

// const Listing = require("./models/listing.js");
// const wrapAsync = require("./utils/wrapAsync.js")
// const ExpressError = require("./utils/ExpressError.js")
// const { listingSchema, reviewSchema } = require("./schema.js")
// const Review = require("./models/review.js")

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "/public")))
// app.engine("ejs", ejsmate)

// app.get("/", (req, res) => {
//   res.send("Hi, I am Home");
// });

// const validateListing = (req,res,next) => {
//   let { error } = listingSchema.validate(req.body)
//   if (error) {
//     let errmsg = error.details.map((e) => e.message).join(",")
//     throw new ExpressError(400,errmsg)
//   }else{
//     next()
//   }
// }

// const validateReview = (req, res, next) => {
//   let { error } = reviewSchema.validate(req.body)
//   if (error) {
//     let errmsg = error.details.map((e) => e.message).join(",")
//     throw new ExpressError(400, errmsg)
//   } else {
//     next()
//   }
// }

// //Index Route
// app.get("/listings",validateListing, wrapAsync (async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// }));

// //New Route
// app.get("/listings/new",validateListing , (req, res) => {
//   res.render("listings/new.ejs");
// });

// //Show Route
// app.get("/listings/:id",validateListing, wrapAsync (async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id).populate("reviews");
//   res.render("listings/show.ejs", { listing });
// }));

// //Create Route
// app.post("/listings",validateListing, wrapAsync (async (req, res, next) => {
//   const newListing = new Listing(req.body.listing);
//   await newListing.save();
//   res.redirect("/listings");
// }));

// //Edit Route
// app.get("/listings/:id/edit",validateListing, wrapAsync (async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// }));

// //Update Route
// app.put("/listings/:id",validateListing, wrapAsync (async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   res.redirect(`/listings/${id}`);
// }));

// //Delete Route
// app.delete("/listings/:id",validateListing, wrapAsync (async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// }));

// // app.get("/testListing", async (req, res) => {
// //   let sampleListing = new Listing({
// //     title: "My New Villa",
// //     description: "By the beach",
// //     price: 1200,
// //     location: "Calangute, Goa",
// //     country: "India",
// //   });

// //   await sampleListing.save();
// //   console.log("sample was saved");
// //   res.send("successful testing");
// // });

// // add reviews
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//   let listing = await Listing.findById(req.params.id)
//   let newreviews = new Review(req.body.review)

//   listing.reviews.push(newreviews)

//   await newreviews.save()
//   await listing.save()

//   res.redirect(`/listings/${listing._id}`)
// }))

// // delete reviews

// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {

//   let { id, reviewId } = req.params;

//   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
//   await Review.findByIdAndDelete(reviewId)

//   res.redirect(`/listings/${id}`)
// }))

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not found"))
// })

// app.use((err, req, res, next) => {
//   let { status = 500, message = "SomeThing Went Wrong " } = err
//   // res.status(status).send(message)
//   res.render("listings/error.ejs", { message, status })
// })

// app.listen(3000, () => {
//   console.log("server is listening to port 3000");
// });