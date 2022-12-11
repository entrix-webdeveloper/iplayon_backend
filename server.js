const app = require("./app");
app.set("port", process.env.PORT || 5000);

// app.listen(app.get("port"), function() {
//     console.log(
//         "App is running, server is listening on port ",
//         app.get("port")
//     );
// });

//For avoiding Heroku $PORT error
app.get("/setHerokuPort", function(request, response) {
    var result = "App is running";``
    response.send(result);
}).listen(app.get("port"), function() {
    console.log(
        "App is running, server is listening on port ",
        app.get("port")
    );
});